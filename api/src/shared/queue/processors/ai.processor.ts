import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import { AiService } from "../../../modules/ai/ai.service";
import { GenerationType } from "../../../modules/ai/prompts";
import { QUEUE_AI } from "../queue.constants";

export interface AiJobData {
  type: "single" | "generate_all";
  // single
  generationType?: GenerationType;
  vars?: Record<string, string>;
  // generate_all
  sourceText?: string;
  // common
  articleId?: string;
  createdById?: string;
  provider?: "openai" | "anthropic";
}

@Processor(QUEUE_AI, { concurrency: 2 })
export class AiProcessor extends WorkerHost {
  private readonly logger = new Logger(AiProcessor.name);

  constructor(private readonly ai: AiService) {
    super();
  }

  async process(job: Job<AiJobData>): Promise<unknown> {
    const d = job.data;
    if (d.type === "generate_all") {
      if (!d.sourceText) throw new Error("sourceText gerekli");
      return this.ai.generateAll({
        sourceText: d.sourceText,
        articleId: d.articleId,
        createdById: d.createdById,
        provider: d.provider,
      });
    }
    if (!d.generationType || !d.vars) {
      throw new Error("generationType + vars gerekli");
    }
    return this.ai.generate({
      generationType: d.generationType,
      vars: d.vars,
      articleId: d.articleId,
      createdById: d.createdById,
      provider: d.provider,
    });
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job<AiJobData>) {
    this.logger.log(`🧠 ai job done: ${job.data.type}`);
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job<AiJobData>, err: Error) {
    this.logger.error(`ai job failed: ${err.message}`);
  }
}
