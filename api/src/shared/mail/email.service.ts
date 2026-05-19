import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { Resend } from "resend";

export interface MailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
}

export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  attachments?: MailAttachment[];
}

/**
 * EmailService — Resend (öncelik) veya SMTP (yedek/yerel) ile mail gönderir.
 *
 * Provider seçimi:
 *   1. RESEND_API_KEY varsa → Resend HTTP API
 *   2. SMTP_HOST + SMTP_PORT (+ SMTP_USER/PASS opsiyonel) → nodemailer
 *   3. Hiçbiri → log + throw
 *
 * Yerel geliştirmede MailHog kullanırsa SMTP_USER/PASS boş olabilir
 * (MailHog auth istemez).
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly from: string;
  private readonly provider: "resend" | "smtp" | "none";
  private readonly resend: Resend | null = null;
  private readonly transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const fromAddr =
      this.config.get<string>("MAIL_FROM") ?? "hello@markaradar.com";
    const fromName =
      this.config.get<string>("MAIL_FROM_NAME") ?? "MarkaRadar";
    this.from = `${fromName} <${fromAddr}>`;

    const resendKey = this.config.get<string>("RESEND_API_KEY");
    if (resendKey) {
      this.resend = new Resend(resendKey);
      this.provider = "resend";
      this.logger.log(`✉️  Resend aktif (from: ${this.from})`);
      return;
    }

    const host = this.config.get<string>("SMTP_HOST");
    const port = parseInt(this.config.get<string>("SMTP_PORT") ?? "587", 10);
    const user = this.config.get<string>("SMTP_USER");
    const pass = this.config.get<string>("SMTP_PASS");

    if (host) {
      const rejectUnauthorized =
        this.config.get<string>("SMTP_TLS_REJECT_UNAUTHORIZED") !== "false";
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: user && pass ? { user, pass } : undefined,
        tls: { rejectUnauthorized },
      });
      this.provider = "smtp";
      this.logger.log(
        `✉️  SMTP aktif: ${host}:${port} (from ${this.from})`,
      );
      return;
    }

    this.provider = "none";
    this.logger.warn(
      "Mail sağlayıcı yapılandırılmadı — gönderim denemesinde hata fırlatılır",
    );
  }

  isConfigured(): boolean {
    return this.provider !== "none";
  }

  async send(opts: SendMailOptions): Promise<void> {
    if (this.provider === "none") {
      this.logger.warn(
        `[mail-stub] Provider yok — gönderilmedi. To: ${opts.to} | Subject: ${opts.subject}`,
      );
      throw new Error(
        "Mail provider yapılandırılmamış (RESEND_API_KEY veya SMTP_HOST gerekli)",
      );
    }

    if (this.provider === "resend" && this.resend) {
      const payload: Record<string, unknown> = {
        from: this.from,
        to: opts.to,
        subject: opts.subject,
      };
      if (opts.html) payload.html = opts.html;
      if (opts.text) payload.text = opts.text;
      if (opts.replyTo) payload.replyTo = opts.replyTo;
      if (opts.attachments?.length) {
        payload.attachments = opts.attachments.map((a) => ({
          filename: a.filename,
          content: a.content,
          path: a.path,
          contentType: a.contentType,
        }));
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await this.resend.emails.send(payload as any);
      if (result.error) {
        throw new Error(`Resend hatası: ${result.error.message}`);
      }
      this.logger.log(`✉️  Resend → ${opts.to}: ${result.data?.id ?? "ok"}`);
      return;
    }

    if (this.provider === "smtp" && this.transporter) {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
        replyTo: opts.replyTo,
        attachments: opts.attachments,
      });
      this.logger.log(`✉️  SMTP → ${opts.to}: ${info.messageId}`);
      return;
    }
  }
}
