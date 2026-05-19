import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import { SocialService } from "../../../modules/social/social.service";
import { QUEUE_SOCIAL } from "../queue.constants";

export interface SocialJobData {
  postId: string;
}

@Processor(QUEUE_SOCIAL, { concurrency: 5 })
export class SocialProcessor extends WorkerHost {
  private readonly logger = new Logger(SocialProcessor.name);

  constructor(private readonly social: SocialService) {
    super();
  }

  async process(job: Job<SocialJobData>): Promise<void> {
    const post = await this.social.getById(job.data.postId);
    if (post.status === "published") {
      this.logger.warn(`Post zaten yayında: ${post.id}`);
      return;
    }

    // TODO: gerçek LinkedIn/IG/Twitter API çağrısı
    // Şimdilik: published olarak işaretle, externalId placeholder
    try {
      const externalId = `mock-${Date.now()}`;
      await this.social.markPublished(post.id, externalId);
      this.logger.log(
        `📱 social published: ${post.channel}/${post.format} → ${externalId}`,
      );
    } catch (err) {
      await this.social.markFailed(post.id, (err as Error).message);
      throw err;
    }
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job<SocialJobData>, err: Error) {
    this.logger.error(`social failed (${job.data.postId}): ${err.message}`);
  }
}
