import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { randomBytes, createHash } from "crypto";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { EmailService } from "../../shared/mail/email.service";
import { QueueService } from "../../shared/queue/queue.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

const REFRESH_TTL_DAYS = 30;
const VERIFY_TTL_HOURS = 24;
const RESET_TTL_HOURS = 1;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
    private readonly queue: QueueService,
  ) {}

  // ───────────────────────────────────── Register / Login

  async register(dto: RegisterDto, ctx?: { ip?: string; userAgent?: string }) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException("Bu e-posta zaten kayıtlı");

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
      },
      select: { id: true, email: true, fullName: true, role: true },
    });

    // Verification mail (best-effort)
    this.sendVerificationEmail(user.id, user.email, user.fullName).catch(
      (err) =>
        this.logger.warn(`Verification mail gönderilemedi: ${err.message}`),
    );

    const tokens = await this.issueTokens(user.id, user.email, user.role, ctx);
    return { user, ...tokens };
  }

  async login(dto: LoginDto, ctx?: { ip?: string; userAgent?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Geçersiz kimlik bilgileri");
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Geçersiz kimlik bilgileri");

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.issueTokens(
      user.id,
      user.email,
      user.role,
      ctx,
    );
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      ...tokens,
    };
  }

  // ───────────────────────────────────── Refresh token rotation

  async refresh(
    refreshToken: string,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token gerekli");
    }
    let payload: { sub: string; email: string; role: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get<string>("JWT_REFRESH_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Geçersiz refresh token");
    }

    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, userId: payload.sub, revokedAt: null },
    });
    if (!stored) {
      // Re-use detected — tüm token'ları revoke et (güvenlik)
      await this.prisma.refreshToken.updateMany({
        where: { userId: payload.sub, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException(
        "Refresh token geçersiz (yeniden kullanım tespit edildi)",
      );
    }
    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token süresi doldu");
    }

    // Rotate: eski'yi revoke et, yenisini ver
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(payload.sub, payload.email, payload.role, ctx);
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) return { ok: true };
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { ok: true };
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { ok: true };
  }

  // ───────────────────────────────────── Email verification

  async sendVerificationEmail(
    userId: string,
    email: string,
    fullName: string,
  ) {
    const { token, hash } = this.generateToken();
    const expiresAt = new Date(Date.now() + VERIFY_TTL_HOURS * 3600 * 1000);

    await this.prisma.verificationToken.create({
      data: {
        userId,
        tokenHash: hash,
        type: "email_verify",
        expiresAt,
      },
    });

    const webUrl =
      this.config.get<string>("WEB_URL") ?? "http://localhost:3003";
    const link = `${webUrl}/auth/verify?token=${token}`;

    await this.queue.enqueueMail({
      to: email,
      subject: "MarkaRadar — E-posta adresini doğrula",
      html: this.verifyEmailHtml(fullName, link),
      text: `Merhaba ${fullName},\n\nE-posta adresini doğrulamak için: ${link}\n\nBu link 24 saat geçerlidir.`,
    });
  }

  async verifyEmail(token: string) {
    const hash = this.hashToken(token);
    const record = await this.prisma.verificationToken.findFirst({
      where: { tokenHash: hash, type: "email_verify", usedAt: null },
    });
    if (!record) throw new BadRequestException("Geçersiz token");
    if (record.expiresAt < new Date()) {
      throw new BadRequestException("Token süresi doldu");
    }

    await this.prisma.$transaction([
      this.prisma.verificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      }),
    ]);
    return { ok: true };
  }

  // ───────────────────────────────────── Password reset

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Enumeration koruması — user yoksa bile success dön
    if (!user) {
      return { ok: true };
    }

    const { token, hash } = this.generateToken();
    const expiresAt = new Date(Date.now() + RESET_TTL_HOURS * 3600 * 1000);

    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hash,
        type: "password_reset",
        expiresAt,
      },
    });

    const webUrl =
      this.config.get<string>("WEB_URL") ?? "http://localhost:3003";
    const link = `${webUrl}/auth/reset-password?token=${token}`;

    await this.queue.enqueueMail({
      to: email,
      subject: "MarkaRadar — Şifre sıfırlama",
      html: this.resetEmailHtml(user.fullName, link),
      text: `Merhaba ${user.fullName},\n\nŞifre sıfırlamak için: ${link}\n\nBu link 1 saat geçerlidir.`,
    });

    return { ok: true };
  }

  async resetPassword(token: string, newPassword: string) {
    if (newPassword.length < 8) {
      throw new BadRequestException("Şifre en az 8 karakter olmalı");
    }
    const hash = this.hashToken(token);
    const record = await this.prisma.verificationToken.findFirst({
      where: { tokenHash: hash, type: "password_reset", usedAt: null },
    });
    if (!record) throw new BadRequestException("Geçersiz token");
    if (record.expiresAt < new Date()) {
      throw new BadRequestException("Token süresi doldu");
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.$transaction([
      this.prisma.verificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      // Tüm aktif refresh token'ları revoke et (şifre değişti, herkes login olsun)
      this.prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    return { ok: true };
  }

  // ───────────────────────────────────── Token verification (gateway için)

  async verifyAccessToken(token: string) {
    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.config.get<string>("JWT_SECRET"),
      });
      return { id: payload.sub, email: payload.email, role: payload.role };
    } catch {
      return null;
    }
  }

  // ───────────────────────────────────── Private helpers

  private async issueTokens(
    userId: string,
    email: string,
    role: string,
    ctx?: { ip?: string; userAgent?: string },
  ) {
    const payload = { sub: userId, email, role };
    const accessToken = await this.jwt.signAsync(payload);
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.config.get<string>("JWT_REFRESH_EXPIRES_IN", "30d"),
    });

    // Refresh token DB'ye kaydet (rotation için)
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(
      Date.now() + REFRESH_TTL_DAYS * 24 * 3600 * 1000,
    );
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        userAgent: ctx?.userAgent?.slice(0, 500),
        ipAddress: ctx?.ip?.slice(0, 45),
      },
    });

    return { accessToken, refreshToken };
  }

  private generateToken(): { token: string; hash: string } {
    const token = randomBytes(32).toString("hex");
    const hash = this.hashToken(token);
    return { token, hash };
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private verifyEmailHtml(name: string, link: string): string {
    return `
<!doctype html>
<html><body style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0f172a;">
  <h1 style="color: #0a1f4a; font-size: 22px;">MarkaRadar'a Hoş Geldin</h1>
  <p>Selam ${name},</p>
  <p>E-posta adresini doğrulamak için aşağıdaki butona tıkla:</p>
  <p style="margin: 24px 0;">
    <a href="${link}" style="background: #1e40af; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">E-posta'yı doğrula</a>
  </p>
  <p style="font-size: 13px; color: #64748b;">Veya bu linki tarayıcına kopyala: <br><a href="${link}" style="color:#1e40af;">${link}</a></p>
  <p style="font-size: 13px; color: #64748b;">Bu link 24 saat geçerlidir.</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
  <p style="font-size: 12px; color: #94a3b8;">MarkaRadar · Türkiye'nin AI-native pazarlama medyası</p>
</body></html>`;
  }

  private resetEmailHtml(name: string, link: string): string {
    return `
<!doctype html>
<html><body style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0f172a;">
  <h1 style="color: #0a1f4a; font-size: 22px;">Şifre Sıfırlama</h1>
  <p>Selam ${name},</p>
  <p>Hesabın için şifre sıfırlama talebi aldık. Devam etmek için:</p>
  <p style="margin: 24px 0;">
    <a href="${link}" style="background: #1e40af; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">Şifremi sıfırla</a>
  </p>
  <p style="font-size: 13px; color: #64748b;">Veya: <a href="${link}" style="color:#1e40af;">${link}</a></p>
  <p style="font-size: 13px; color: #64748b;">Bu link 1 saat geçerli. Sen talep etmediysen bu maili dikkate alma.</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
  <p style="font-size: 12px; color: #94a3b8;">MarkaRadar</p>
</body></html>`;
  }
}
