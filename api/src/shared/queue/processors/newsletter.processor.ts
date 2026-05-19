import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import { NewsletterService } from "../../../modules/newsletter/newsletter.service";
import { QUEUE_NEWSLETTER } from "../queue.constants";

export interface NewsletterJobData {
  // boş — sadece job adıyla branch
}

@Processor(QUEUE_NEWSLETTER)
export class NewsletterProcessor extends WorkerHost {
  private readonly logger = new Logger(NewsletterProcessor.name);

  constructor(private readonly newsletter: NewsletterService) {
    super();
  }

  async process(job: Job<NewsletterJobData>): Promise<unknown> {
    if (job.name === "daily-digest") {
      try {
        const { issueId, subject } =
          await this.newsletter.composeDailyDigest();
        const { enqueued } = await this.newsletter.sendIssue(issueId);
        this.logger.log(
          `📨 Daily digest sent: "${subject}" → ${enqueued} aboneye gönderildi`,
        );
        return { issueId, enqueued };
      } catch (e) {
        this.logger.warn(`Daily digest skipped: ${(e as Error).message}`);
        return { skipped: true };
      }
    }
    return { unknownJob: job.name };
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job<NewsletterJobData>, err: Error) {
    this.logger.error(`newsletter ${job.name} failed: ${err.message}`);
  }
}
