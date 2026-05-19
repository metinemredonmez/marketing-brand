import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";
import { IsEmail, IsString, MinLength } from "class-validator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";
import { Audit } from "../../common/decorators/audit.decorator";

class RequestResetDto {
  @IsEmail() email!: string;
}

class ResetPasswordDto {
  @IsString() token!: string;
  @IsString() @MinLength(8) password!: string;
}

class VerifyEmailDto {
  @IsString() token!: string;
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Throttle({ auth: { limit: 5, ttl: 60_000 } })
  @Audit({
    action: "user.register",
    resource: "user",
    resourceIdFrom: "result.id",
  })
  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto, this.ctx(req));
    this.setCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user };
  }

  @Throttle({ auth: { limit: 5, ttl: 60_000 } })
  @Audit({ action: "user.login", resource: "user" })
  @HttpCode(200)
  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto, this.ctx(req));
    this.setCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user };
  }

  @HttpCode(200)
  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.["mr_refresh"] as string | undefined;
    const result = await this.authService.refresh(
      refreshToken ?? "",
      this.ctx(req),
    );
    this.setCookies(res, result.accessToken, result.refreshToken);
    return { ok: true };
  }

  @HttpCode(200)
  @Post("logout")
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.["mr_refresh"] as string | undefined;
    await this.authService.logout(refreshToken);
    res.clearCookie("mr_access");
    res.clearCookie("mr_refresh");
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post("logout-all")
  async logoutAll(
    @CurrentUser() user: CurrentUserPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(user.id);
    res.clearCookie("mr_access");
    res.clearCookie("mr_refresh");
    return { ok: true };
  }

  @HttpCode(200)
  @Post("verify-email")
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Throttle({ auth: { limit: 5, ttl: 60_000 } })
  @HttpCode(200)
  @Post("forgot-password")
  forgotPassword(@Body() dto: RequestResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Throttle({ auth: { limit: 5, ttl: 60_000 } })
  @HttpCode(200)
  @Post("reset-password")
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  // ─── helpers ──────────────────────────────────────────────

  private ctx(req: Request) {
    return {
      ip:
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        undefined,
      userAgent: req.headers["user-agent"] as string | undefined,
    };
  }

  private setCookies(res: Response, access: string, refresh: string) {
    const isProd = this.config.get<string>("NODE_ENV") === "production";
    // COOKIE_SECURE override — IP + self-signed cert demo'da "false" yap
    // (Default: production'da true)
    const secureOverride = this.config.get<string>("COOKIE_SECURE");
    const secure =
      secureOverride === "false"
        ? false
        : secureOverride === "true"
          ? true
          : isProd;
    // Domain boş string ise atla (cookie current host'a set olur)
    const rawDomain = this.config.get<string>("COOKIE_DOMAIN");
    const domain = rawDomain && rawDomain.trim() !== "" ? rawDomain : undefined;
    const base = {
      httpOnly: true,
      secure,
      sameSite: "lax" as const,
      ...(domain ? { domain } : {}),
      path: "/",
    };
    res.cookie("mr_access", access, { ...base, maxAge: 15 * 60 * 1000 });
    res.cookie("mr_refresh", refresh, {
      ...base,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
}
