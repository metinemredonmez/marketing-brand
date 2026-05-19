import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Anthropic from "@anthropic-ai/sdk";
import {
  AiCompletionInput,
  AiCompletionOutput,
  AiProvider,
} from "./ai-provider.interface";

/**
 * Anthropic pricing (Mayıs 2026 itibariyle yaklaşık, env override önerilir):
 *   claude-sonnet-4.6:  $3 / 1M input, $15 / 1M output
 *   claude-haiku-4.5:   $1 / 1M input, $5 / 1M output
 *   claude-opus-4.7:    $15 / 1M input, $75 / 1M output
 */
const PRICING_PER_1M: Record<string, { in: number; out: number }> = {
  "claude-haiku-4-5": { in: 1.0, out: 5.0 },
  "claude-sonnet-4-6": { in: 3.0, out: 15.0 },
  "claude-opus-4-7": { in: 15.0, out: 75.0 },
};

@Injectable()
export class AnthropicProvider implements AiProvider {
  readonly name = "anthropic" as const;
  private readonly logger = new Logger(AnthropicProvider.name);
  private readonly client: Anthropic | null;

  constructor(private readonly config: ConfigService) {
    const key = config.get<string>("ANTHROPIC_API_KEY");
    if (key) {
      this.client = new Anthropic({ apiKey: key });
      this.logger.log("🧠 Anthropic Claude aktif");
    } else {
      this.client = null;
      this.logger.warn("Anthropic yapılandırılmadı");
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async complete(input: AiCompletionInput): Promise<AiCompletionOutput> {
    if (!this.client) throw new Error("Anthropic yapılandırılmamış");
    const model = input.model ?? "claude-haiku-4-5";

    const started = Date.now();
    const response = await this.client.messages.create({
      model,
      system: input.systemPrompt,
      messages: [{ role: "user", content: input.userPrompt }],
      max_tokens: input.maxTokens ?? 2000,
      temperature: input.temperature ?? 0.5,
    });
    const durationMs = Date.now() - started;

    const output = response.content
      .filter((c) => c.type === "text")
      .map((c) => (c as { type: "text"; text: string }).text)
      .join("\n");

    const promptTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const pricing = PRICING_PER_1M[model] ?? PRICING_PER_1M["claude-haiku-4-5"];
    const costUsd =
      (promptTokens / 1_000_000) * pricing.in +
      (outputTokens / 1_000_000) * pricing.out;

    return { output, model, promptTokens, outputTokens, costUsd, durationMs };
  }
}
