import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../../shared/prisma/prisma.service";
import { OpenAiProvider } from "../../ai/providers/openai.provider";
import { AnthropicProvider } from "../../ai/providers/anthropic.provider";
import { AiProvider } from "../../ai/providers/ai-provider.interface";
import {
  BRAND_PROMPTS,
  BRAND_SYSTEM_PROMPT,
  BrandGenerationType,
} from "./brand-prompts";

export interface BrandGenerateInput {
  brandAccountId: string;
  generationType: BrandGenerationType;
  vars: Record<string, string>;
  provider?: "openai" | "anthropic";
  createdById?: string;
}

@Injectable()
export class BrandAiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly openai: OpenAiProvider,
    private readonly anthropic: AnthropicProvider,
  ) {}

  async generate(input: BrandGenerateInput) {
    const template = BRAND_PROMPTS[input.generationType];
    if (!template) {
      throw new BadRequestException(
        `Bilinmeyen üretim tipi: ${input.generationType}`,
      );
    }

    // Aylık bütçe kontrolü (editöryel ile ortak — opsiyonel ayrı bütçe ileride)
    await this.assertWithinBudget();

    const providerName =
      input.provider ??
      (this.config.get<string>("DEFAULT_AI_PROVIDER", "openai") as
        | "openai"
        | "anthropic");
    const provider = this.pickProvider(providerName);
    if (!provider.isConfigured()) {
      throw new ServiceUnavailableException(
        `AI provider yapılandırılmamış: ${providerName}`,
      );
    }

    const userPrompt = template.buildUserMessage(input.vars);

    const result = await provider.complete({
      systemPrompt: BRAND_SYSTEM_PROMPT,
      userPrompt,
      temperature: template.temperature,
      responseFormat: template.responseFormat,
    });

    let data: unknown;
    if (template.responseFormat === "json") {
      try {
        data = JSON.parse(result.output);
      } catch {
        const cleaned = result.output
          .replace(/^```json\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();
        data = JSON.parse(cleaned);
      }
    } else {
      data = result.output;
    }

    // ai_generations'a logla (article_id boş, brand context)
    const log = await this.prisma.aiGeneration.create({
      data: {
        generationType: `brand.${input.generationType}`,
        prompt: userPrompt.slice(0, 10000),
        output: result.output.slice(0, 50000),
        model: result.model,
        provider: providerName,
        promptTokens: result.promptTokens,
        outputTokens: result.outputTokens,
        costUsd: result.costUsd,
        durationMs: result.durationMs,
        status: "success",
        createdById: input.createdById,
      },
    });

    return {
      generationId: log.id,
      type: input.generationType,
      data,
      raw: result.output,
      model: result.model,
      provider: providerName,
      costUsd: result.costUsd,
      durationMs: result.durationMs,
    };
  }

  // Helpers (AiService'tan kopya)
  private pickProvider(name: "openai" | "anthropic"): AiProvider {
    return name === "anthropic" ? this.anthropic : this.openai;
  }

  private async assertWithinBudget() {
    const budget = this.config.get<number>("AI_MONTHLY_BUDGET_USD", 500);
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const result = await this.prisma.aiGeneration.aggregate({
      where: { createdAt: { gte: start }, status: "success" },
      _sum: { costUsd: true },
    });
    const spent = Number(result._sum.costUsd ?? 0);
    if (spent >= budget) {
      throw new ServiceUnavailableException(
        `Aylık AI bütçesi aşıldı ($${spent.toFixed(2)} / $${budget})`,
      );
    }
  }
}
