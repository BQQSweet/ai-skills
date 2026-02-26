import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('AI_API_KEY');
    const baseURL = this.config.get<string>('AI_BASE_URL');

    if (apiKey && baseURL) {
      this.openai = new OpenAI({
        apiKey,
        baseURL,
      });
      this.logger.log(`AI Service initialized with base URL: ${baseURL}`);
    } else {
      this.logger.warn('AI Service initialized without API key or base URL');
    }
  }

  /**
   * AI 生成食谱
   * 通过 prompt 调用 DeepSeek，返回结构化的食谱数据
   */
  async generateRecipe(prompt: string): Promise<any> {
    if (!this.openai) {
      throw new BadRequestException('AI Service is not fully configured');
    }

    const modelOptions = this.config.get<string>('AI_MODEL') || 'deepseek-chat';
    this.logger.log(`Generating recipe with prompt: ${prompt}`);

    const systemPrompt = `
      你是一个专业的厨师和全栈菜谱生成助手。
      请根据用户的输入，生成一份详细的菜谱。
      输出内容必须是合法的 JSON 格式字符串，不需要包含 markdown 标志 \`\`\`json \`\`\`，直接返回 JSON 对象本身。
      JSON 的结构如下：
      {
        "title": "菜谱标题（例：麻婆豆腐）",
        "description": "菜谱描述（介绍这道菜）",
        "difficulty": "简单 或 中等 或 困难",
        "cook_time": 烹饪总耗时数字（分钟，例：15）,
        "servings": 建议人份数字（例：2）,
        "tags": ["川菜", "特辣", "家常菜"],
        "ingredients": [
          { "name": "豆腐", "quantity": 1, "unit": "块", "optional": false },
          { "name": "牛肉末", "quantity": 100, "unit": "克", "optional": false },
          { "name": "香菜", "quantity": 1, "unit": "根", "optional": true }
        ],
        "steps": [
          { "instruction": "豆腐切块绰水备用。", "duration_min": 2, "timer_required": false },
          { "instruction": "锅中倒油，下入肉末炒香。", "duration_min": 3, "timer_required": false },
          { "instruction": "加入豆瓣酱炒出红油，放入豆腐，加水顿煮5分钟。", "duration_min": 5, "timer_required": true }
        ]
      }
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        model: modelOptions,
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const responseContent = completion.choices[0].message.content;
      if (!responseContent) {
        throw new Error('No content returned from AI');
      }

      // try to parse it
      return JSON.parse(responseContent);
    } catch (error) {
      this.logger.error(
        `AI generate recipe error: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('生成食谱失败：' + error.message);
    }
  }

  /**
   * 普通对话（等待完整响应）
   */
  async chat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: { temperature?: number; jsonMode?: boolean },
  ): Promise<string> {
    const model = this.config.get<string>('AI_MODEL') || 'deepseek-chat';
    try {
      const completion = await this.openai.chat.completions.create({
        messages,
        model,
        response_format: options?.jsonMode
          ? { type: 'json_object' }
          : undefined,
        temperature: options?.temperature || 0.7,
      });
      return completion.choices[0].message.content || '';
    } catch (e) {
      this.logger.error('AI chat error', e);
      throw e;
    }
  }

  /**
   * 流式对话（SSE）
   */
  async *chatStream(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  ): AsyncGenerator<string> {
    const model = this.config.get<string>('AI_MODEL') || 'deepseek-chat';
    try {
      const stream = await this.openai.chat.completions.create({
        messages,
        model,
        stream: true,
      });

      for await (const chunk of stream) {
        yield chunk.choices[0]?.delta?.content || '';
      }
    } catch (e) {
      this.logger.error('AI chatStream error', e);
      throw e;
    }
  }

  /**
   * 视觉识别（多模态）
   */
  async vision(imageBase64: string, prompt: string): Promise<string> {
    const model = this.config.get<string>('AI_VISION_MODEL') || 'deepseek-vl';
    // Deepseek VR doesn't officially support standard vision through the main /chat/completions endpoint yet as of standard SDK
    // This is a placeholder for standard OpenAI vision payload structure if deepseek-vl proxy uses it.
    try {
      const completion = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('http')
                    ? imageBase64
                    : `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
      });
      return completion.choices[0].message.content || '';
    } catch (e) {
      this.logger.error('AI vision error', e);
      throw e;
    }
  }
}
