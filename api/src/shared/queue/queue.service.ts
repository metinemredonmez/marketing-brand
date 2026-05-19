import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import type { Queue, JobsOptions } from "bullmq";
import {
  QUEUE_AI,
  QUEUE_MAIL,
  QUEUE_NEWSLETTER,
  QUEUE_SOCIAL,
} from "./queue.constants";
import type { MailJobData } from "./processors/mail.processor";
import type { AiJobData } from "./processors/ai.processor";
import type { SocialJobData } from "./processors/social.processor";

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(QUEUE_AI) private readonly aiQueue: Queue<AiJobData>,
    @InjectQueue(QUEUE_MAIL) private readonly mailQueue: Queue<MailJobData>,
    @InjectQueue(QUEUE_NEWSLETTER)
    private readonly newsletterQueue: Queue,
    @InjectQueue(QUEUE_SOCIAL) private readonly socialQueue: Queue<SocialJobData>,
  ) {}

  /** Mail'i queue üzerinden gönder — retry'lı, async */
  enqueueMail(data: MailJobData, opts?: JobsOptions) {
    return this.mailQueue.add("send-mail", data, {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      ...opts,
    });
  }

  /** AI üretim job'u — uzun süren, paralel */
  enqueueAi(data: AiJobData, opts?: JobsOptions) {
    return this.aiQueue.add("ai-gen", data, opts);
  }

  /** Sosyal medya post'unu zamanlanmış gönderim */
  enqueueSocial(postId: string, scheduledAt?: Date) {
    const delay = scheduledAt
      ? Math.max(0, scheduledAt.getTime() - Date.now())
      : 0;
    return this.socialQueue.add(
      "publish",
      { postId },
      { delay, attempts: 5 },
    );
  }

  /** Newsletter job — günlük cron veya manuel */
  enqueueNewsletter(jobName: string, data: Record<string, unknown>) {
    return this.newsletterQueue.add(jobName, data);
  }

  /** Repeatable cron job kurmak için (her gün 08:30, vb.) */
  async registerCron(
    queue: "ai" | "mail" | "newsletter" | "social",
    jobName: string,
    cronPattern: string,
    data: Record<string, unknown> = {},
  ) {
    const q =
      queue === "ai"
        ? this.aiQueue
        : queue === "mail"
          ? this.mailQueue
          : queue === "newsletter"
            ? this.newsletterQueue
            : this.socialQueue;
    return q.add(jobName, data, {
      repeat: { pattern: cronPattern, tz: "Europe/Istanbul" },
      jobId: `cron:${jobName}`,
    });
  }

  async clearAllCrons() {
    for (const q of [
      this.aiQueue,
      this.mailQueue,
      this.newsletterQueue,
      this.socialQueue,
    ]) {
      const repeatables = await q.getRepeatableJobs();
      for (const r of repeatables) {
        await q.removeRepeatableByKey(r.key);
      }
    }
  }
}
