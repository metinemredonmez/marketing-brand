export interface AiCompletionInput {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json";
}

export interface AiCompletionOutput {
  output: string;
  model: string;
  promptTokens: number;
  outputTokens: number;
  costUsd: number;
  durationMs: number;
}

export interface AiProvider {
  readonly name: "openai" | "anthropic" | "gemini";
  isConfigured(): boolean;
  complete(input: AiCompletionInput): Promise<AiCompletionOutput>;
}
