import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import { EmailService } from "../../mail/email.service";
import { QUEUE_MAIL } from "../queue.constants";

export interface MailJobData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

@Processor(QUEUE_MAIL)
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly email: EmailService) {
    super();
  }

  async process(job: Job<MailJobData>): Promise<void> {
    const { to, subject, html, text, replyTo } = job.data;
    await this.email.send({ to, subject, html, text, replyTo });
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job<MailJobData>) {
    this.logger.log(`✉️  mail sent: ${job.data.to}`);
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job<MailJobData>, err: Error) {
    this.logger.error(
      `mail failed (attempt ${job.attemptsMade}/${job.opts.attempts}): ${err.message}`,
    );
  }
}
