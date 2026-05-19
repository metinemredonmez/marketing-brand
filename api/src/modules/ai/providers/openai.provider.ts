import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import {
  AiCompletionInput,
  AiCompletionOutput,
  AiProvider,
} from "./ai-provider.interface";

/**
 * OpenAI pricing (Aralık 2025 / Mayıs 2026 — değişebilir, env'den override edilebilir):
 *   gpt-4o-mini:  $0.15 / 1M input,  $0.60 / 1M output
 *   gpt-4o:       $2.50 / 1M input,  $10.00 / 1M output
 */
const PRICING_PER_1M: Record<string, { in: number; out: number }> = {
  "gpt-4o-mini": { in: 0.15, out: 0.6 },
  "gpt-4o": { in: 2.5, out: 10.0 },
  "gpt-4.1": { in: 2.0, out: 8.0 },
  "gpt-4.1-mini": { in: 0.4, out: 1.6 },
};

@Injectable()
export class OpenAiProvider implements AiProvider {
  readonly name = "openai" as const;
  private readonly logger = new Logger(OpenAiProvider.name);
  private readonly client: OpenAI | null;

  constructor(private readonly config: ConfigService) {
    const key = config.get<string>("OPENAI_API_KEY");
    if (key) {
      this.client = new OpenAI({ apiKey: key });
      this.logger.log("🧠 OpenAI aktif");
    } else {
      this.client = null;
      this.logger.warn("OpenAI yapılandırılmadı (OPENAI_API_KEY yok)");
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async complete(input: AiCompletionInput): Promise<AiCompletionOutput> {
    if (!this.client) throw new Error("OpenAI yapılandırılmamış");
    const model =
      input.model ??
      this.config.get<string>("DEFAULT_AI_MODEL", "gpt-4o-mini");

    const started = Date.now();
    const response = await this.client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: input.systemPrompt },
        { role: "user", content: input.userPrompt },
      ],
      temperature: input.temperature ?? 0.5,
      max_tokens: input.maxTokens ?? 2000,
      response_format:
        input.responseFormat === "json"
          ? { type: "json_object" }
          : undefined,
    });
    const durationMs = Date.now() - started;

    const output = response.choices[0]?.message?.content ?? "";
    const promptTokens = response.usage?.prompt_tokens ?? 0;
    const outputTokens = response.usage?.completion_tokens ?? 0;
    const pricing = PRICING_PER_1M[model] ?? PRICING_PER_1M["gpt-4o-mini"];
    const costUsd =
      (promptTokens / 1_000_000) * pricing.in +
      (outputTokens / 1_000_000) * pricing.out;

    return { output, model, promptTokens, outputTokens, costUsd, durationMs };
  }
}
