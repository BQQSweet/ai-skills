import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * AI 统一调用服务
 * 封装 OpenAI/DeepSeek SDK，提供普通调用、流式调用和视觉识别能力
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * 普通对话（等待完整响应）
   * TODO: implement with OpenAI SDK
   */
  async chat(
    messages: Array<{ role: string; content: string }>,
    options?: { temperature?: number; maxTokens?: number; jsonMode?: boolean },
  ): Promise<string> {
    this.logger.log('AI chat called (not implemented)');
    throw new Error('AI chat not implemented');
  }

  /**
   * 流式对话（SSE）
   * TODO: implement with OpenAI SDK stream
   */
  async *chatStream(
    messages: Array<{ role: string; content: string }>,
  ): AsyncGenerator<string> {
    this.logger.log('AI chatStream called (not implemented)');
    throw new Error('AI chatStream not implemented');
  }

  /**
   * 视觉识别（多模态）
   * TODO: implement with OpenAI Vision API
   */
  async vision(imageBase64: string, prompt: string): Promise<string> {
    this.logger.log('AI vision called (not implemented)');
    throw new Error('AI vision not implemented');
  }
}
