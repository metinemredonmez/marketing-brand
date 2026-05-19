import { Module } from "@nestjs/common";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";
import { OpenAiProvider } from "./providers/openai.provider";
import { AnthropicProvider } from "./providers/anthropic.provider";

@Module({
  providers: [AiService, OpenAiProvider, AnthropicProvider],
  controllers: [AiController],
  exports: [AiService, OpenAiProvider, AnthropicProvider],
})
export class AiModule {}
