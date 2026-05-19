import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { RedisService } from "../../shared/redis/redis.service";
import { OpenAiProvider } from "./providers/openai.provider";
import { AnthropicProvider } from "./providers/anthropic.provider";
import { AiProvider } from "./providers/ai-provider.interface";
import { PROMPTS, GenerationType } from "./prompts";
import { MARKARADAR_SYSTEM_PROMPT } from "./prompts/system.prompt";
import { createHash } from "crypto";

export interface GenerateInput {
  generationType: GenerationType;
  vars: Record<string, string>;
  articleId?: string;
  createdById?: string;
  /** "openai" veya "anthropic" — varsayılan: env'deki DEFAULT_AI_PROVIDER */
  provider?: "openai" | "anthropic";
  model?: string;
  useCache?: boolean;
}

export interface GenerateOutput {
  type: GenerationType;
  data: unknown;
  raw: string;
  model: string;
  provider: string;
  costUsd: number;
  durationMs: number;
  cached: boolean;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly cacheTtlSec = 7 * 24 * 3600; // 7 gün

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
    private readonly openai: OpenAiProvider,
    private readonly anthropic: AnthropicProvider,
  ) {}

  /** Bir generation tipi için AI çağrısı yap, sonucu logla ve döndür */
  async generate(input: GenerateInput): Promise<GenerateOutput> {
    const template = PROMPTS[input.generationType];
    if (!template) {
      throw new BadRequestException(
        `Bilinmeyen generation tipi: ${input.generationType}`,
      );
    }

    // Bütçe kontrolü
    await this.assertWithinBudget();

    // Cache anahtarı
    const cacheKey = this.buildCacheKey(input);
    if (input.useCache !== false) {
      const cached = await this.redis.get<GenerateOutput>(cacheKey);
      if (cached) {
        this.logger.debug(`AI cache HIT: ${cacheKey}`);
        return { ...cached, cached: true };
      }
    }

    // Provider seç
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

    let result;
    let errorMessage: string | undefined;
    try {
      result = await provider.complete({
        systemPrompt: MARKARADAR_SYSTEM_PROMPT,
        userPrompt,
        model: input.model,
        temperature: template.temperature,
        responseFormat: template.responseFormat,
      });
    } catch (err) {
      errorMessage = (err as Error).message;
      await this.logGeneration({
        input,
        provider: providerName,
        userPrompt,
        result: undefined,
        errorMessage,
      });
      throw err;
    }

    let data: unknown;
    if (template.responseFormat === "json") {
      try {
        data = JSON.parse(result.output);
      } catch {
        // Bazen modeller JSON'u markdown code fence ile sarıyor; temizle
        const cleaned = result.output
          .replace(/^```json\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();
        data = JSON.parse(cleaned);
      }
    } else {
      data = result.output;
    }

    // DB log
    await this.logGeneration({
      input,
      provider: providerName,
      userPrompt,
      result,
    });

    const output: GenerateOutput = {
      type: input.generationType,
      data,
      raw: result.output,
      model: result.model,
      provider: providerName,
      costUsd: result.costUsd,
      durationMs: result.durationMs,
      cached: false,
    };

    if (input.useCache !== false) {
      await this.redis.set(cacheKey, output, this.cacheTtlSec);
    }

    return output;
  }

  /**
   * Bir kaynak metinden 8 formatı toplu üretir.
   * Senkron (BullMQ olmadan) — uzun sürebilir, queue üzerinden çağrılması ideal.
   */
  async generateAll(opts: {
    sourceText: string;
    articleId?: string;
    createdById?: string;
    provider?: "openai" | "anthropic";
  }): Promise<Record<string, GenerateOutput>> {
    const baseVars = { source_text: opts.sourceText };
    const baseArgs = {
      articleId: opts.articleId,
      createdById: opts.createdById,
      provider: opts.provider,
    };

    // 1) Önce başlık + spot + body paralel
    const [title, spot, body] = await Promise.all([
      this.generate({ generationType: "title", vars: baseVars, ...baseArgs }),
      this.generate({ generationType: "spot", vars: baseVars, ...baseArgs }),
      this.generate({ generationType: "body", vars: baseVars, ...baseArgs }),
    ]);

    const bodyText =
      (body.data as { body?: string })?.body ?? opts.sourceText;
    const firstTitle =
      (title.data as { titles?: { text: string }[] })?.titles?.[0]?.text ??
      "Başlık";
    const firstSpot =
      (spot.data as { spots?: string[] })?.spots?.[0] ?? "";

    // 2) Sonra body'e bağımlı olanlar paralel
    const articleVars = { article_body: bodyText };
    const [
      summary,
      linkedinPost,
      instagramCarousel,
      reelsScript,
      seoMeta,
      coverPrompt,
    ] = await Promise.all([
      this.generate({
        generationType: "ai_summary",
        vars: articleVars,
        ...baseArgs,
      }),
      this.generate({
        generationType: "linkedin_post",
        vars: articleVars,
        ...baseArgs,
      }),
      this.generate({
        generationType: "instagram_carousel",
        vars: articleVars,
        ...baseArgs,
      }),
      this.generate({
        generationType: "reels_script",
        vars: articleVars,
        ...baseArgs,
      }),
      this.generate({
        generationType: "seo_meta",
        vars: { title: firstTitle, body: bodyText },
        ...baseArgs,
      }),
      this.generate({
        generationType: "cover_image_prompt",
        vars: { title: firstTitle, spot: firstSpot },
        ...baseArgs,
      }),
    ]);

    return {
      title,
      spot,
      body,
      ai_summary: summary,
      linkedin_post: linkedinPost,
      instagram_carousel: instagramCarousel,
      reels_script: reelsScript,
      seo_meta: seoMeta,
      cover_image_prompt: coverPrompt,
    };
  }

  // ─── Helpers ──────────────────────────────────────────────

  private pickProvider(name: "openai" | "anthropic"): AiProvider {
    return name === "anthropic" ? this.anthropic : this.openai;
  }

  private buildCacheKey(input: GenerateInput): string {
    const varsHash = createHash("md5")
      .update(JSON.stringify(input.vars))
      .digest("hex");
    return `ai:${input.generationType}:${input.provider ?? "auto"}:${varsHash}`;
  }

  private async logGeneration(args: {
    input: GenerateInput;
    provider: string;
    userPrompt: string;
    result?: {
      output: string;
      model: string;
      promptTokens: number;
      outputTokens: number;
      costUsd: number;
      durationMs: number;
    };
    errorMessage?: string;
  }) {
    await this.prisma.aiGeneration.create({
      data: {
        articleId: args.input.articleId ?? null,
        generationType: args.input.generationType,
        prompt: args.userPrompt.slice(0, 10000),
        output: args.result?.output.slice(0, 50000) ?? "",
        model: args.result?.model ?? "unknown",
        provider: args.provider,
        promptTokens: args.result?.promptTokens ?? 0,
        outputTokens: args.result?.outputTokens ?? 0,
        costUsd: args.result?.costUsd ?? 0,
        durationMs: args.result?.durationMs ?? 0,
        status: args.errorMessage ? "error" : "success",
        errorMessage: args.errorMessage,
        createdById: args.input.createdById ?? null,
      },
    });
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

  // ─── Reporting ────────────────────────────────────────────

  async monthlyUsage() {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const [total, byType, byProvider] = await Promise.all([
      this.prisma.aiGeneration.aggregate({
        where: { createdAt: { gte: start }, status: "success" },
        _sum: { costUsd: true, promptTokens: true, outputTokens: true },
        _count: true,
      }),
      this.prisma.aiGeneration.groupBy({
        by: ["generationType"],
        where: { createdAt: { gte: start }, status: "success" },
        _count: true,
        _sum: { costUsd: true },
      }),
      this.prisma.aiGeneration.groupBy({
        by: ["provider"],
        where: { createdAt: { gte: start }, status: "success" },
        _count: true,
        _sum: { costUsd: true },
      }),
    ]);

    const budget = this.config.get<number>("AI_MONTHLY_BUDGET_USD", 500);
    const spent = Number(total._sum.costUsd ?? 0);

    return {
      month: start.toISOString().slice(0, 7),
      totalGenerations: total._count,
      totalCostUsd: spent,
      budgetUsd: budget,
      remainingUsd: Math.max(0, budget - spent),
      totalPromptTokens: total._sum.promptTokens ?? 0,
      totalOutputTokens: total._sum.outputTokens ?? 0,
      byType,
      byProvider,
    };
  }
}
