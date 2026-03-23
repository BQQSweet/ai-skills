import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import OpenAI from 'openai';
import { basename } from 'path';
import FormData = require('form-data');
import type {
  OcrTextEntry,
  OcrTextSpan,
  TimelineCandidateStep,
  TimelineRecipeStep,
  VideoFrameOcrPayload,
  VideoRecipeMetadata,
} from '@/modules/recipe/video/video-recipe.types';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;
  private visionClient: OpenAI;

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

    // Vision 模型可能使用不同的 API Key 和 Base URL（如阿里云 DashScope）
    const visionApiKey = this.config.get<string>('AI_VISION_API_KEY') || apiKey;
    const visionBaseURL =
      this.config.get<string>('AI_VISION_BASE_URL') || baseURL;

    if (visionApiKey && visionBaseURL) {
      this.visionClient = new OpenAI({
        apiKey: visionApiKey,
        baseURL: visionBaseURL,
      });
      this.logger.log(
        `AI Vision Service initialized with base URL: ${visionBaseURL}`,
      );
    } else {
      this.visionClient = this.openai; // fallback to main client
    }
  }

  /**
   * AI 生成食谱
   * 通过 prompt 调用 DeepSeek，返回结构化的食谱数据
   */
  async generateRecipe(options: {
    prompt?: string;
    taste?: string;
    dietary?: string;
    servings?: number;
  }): Promise<any> {
    if (!this.openai) {
      throw new BadRequestException('AI Service is not fully configured');
    }

    const modelOptions = this.config.get<string>('AI_MODEL') || 'deepseek-chat';
    this.logger.log(
      `Generating recipe with options: ${JSON.stringify(options)}`,
    );

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

    // 动态构建 User Prompt
    let userPromptContent = '请帮我生成一个菜谱。';
    if (options.prompt) userPromptContent += ` 具体要求是：${options.prompt}。`;
    if (options.taste) userPromptContent += ` 口味偏好是：${options.taste}。`;
    if (options.dietary)
      userPromptContent += ` 饮食偏好或忌口是：${options.dietary}。`;
    if (options.servings)
      userPromptContent += ` 建议适用人数是：${options.servings}人份。`;

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPromptContent },
        ],
        model: modelOptions,
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const responseContent = completion.choices[0].message.content;
      this.logger.debug(`AI Response: ${responseContent}`);
      return await this.parseJsonResponse(
        responseContent || '{}',
        'AI 菜谱生成',
      );
    } catch (error) {
      this.logger.error(
        `Failed to generate recipe: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('AI 菜谱生成失败，请稍后重试');
    }
  }

  async answerStepQuestion(dto: {
    recipeContext: string;
    stepInstruction: string;
    question: string;
  }): Promise<string> {
    if (!this.openai) {
      throw new BadRequestException('AI Service is not fully configured');
    }

    const modelOptions = this.config.get<string>('AI_MODEL') || 'deepseek-chat';

    const systemPrompt = `
      你是一个热心、专业的在线主厨助理。此刻用户正在照着菜谱做饭。
      请解答用户在当前烹饪步骤中遇到的疑问。
      你的回答需要：
      1. 简明扼要，直奔主题（用户正在厨房，时间紧迫）。
      2. 态度亲切鼓励。
    `;

    const userPromptContent = `
      我正在做的菜品/整个食谱的上下文是：
      ${dto.recipeContext}

      我当前正在操作的这一步是：
      ${dto.stepInstruction}

      我的问题是：
      ${dto.question}
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPromptContent },
        ],
        model: modelOptions,
        temperature: 0.6,
      });

      return (
        completion.choices[0].message.content ||
        '我暂时没有理解这个问题，能换个说法吗？'
      );
    } catch (error) {
      this.logger.error(
        `Failed to answer step question: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('AI 问答失败，请稍后重试');
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
    const model = this.config.get<string>('AI_VISION_MODEL') || 'qwen-vl-plus';
    const client = this.visionClient || this.openai;
    if (!client) {
      throw new BadRequestException('AI Vision Service is not configured');
    }
    try {
      const completion = await client.chat.completions.create({
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

  async analyzeVideoRecipe(options: {
    frames: string[];
    transcript?: string;
    frameTexts?: string[];
    fallbackTitle?: string;
  }): Promise<any> {
    const model = this.config.get<string>('AI_VISION_MODEL') || 'qwen-vl-plus';
    const client = this.visionClient || this.openai;

    if (!client) {
      throw new BadRequestException('AI Vision Service is not configured');
    }

    const transcript = (options.transcript || '').trim();
    const trimmedTranscript =
      transcript.length > 6000 ? `${transcript.slice(0, 6000)}...` : transcript;
    const mergedFrameText = (options.frameTexts || [])
      .map((item) => item.trim())
      .filter(Boolean)
      .join('\n');
    const trimmedFrameText =
      mergedFrameText.length > 4000
        ? `${mergedFrameText.slice(0, 4000)}...`
        : mergedFrameText;

    const textPrompt = `你是一个专业的美食视频分析助手。请根据视频关键帧和语音转写，生成一份可直接烹饪的结构化食谱 JSON。

要求：
1. 输出必须是一个合法 JSON 对象，不要输出 markdown 代码块。
2. 结合画面、字幕、叠字、配方文字和语音信息提取菜名、食材、份量、步骤、时间、火候和难度。
3. 如果信息不完整，可以基于烹饪常识做最小必要补全，但不要编造明显不合理的细节。
4. 如果转写、画面文字和画面内容冲突，以更具体、更明确的文本信息为准。
5. 如果无法确认封面图或营养信息，可返回 null。
6. 如果菜名不明确，可参考这个兜底标题：${options.fallbackTitle || '视频解析食谱'}。
7. 如果视频里没有说话，但画面出现了步骤字幕、配料表、调料比例、时长说明，必须尽量吸收这些文字，不要忽略。

JSON 结构：
{
  "title": "菜谱标题",
  "description": "一句话描述",
  "difficulty": "简单 或 中等 或 困难",
  "cook_time": 20,
  "servings": 2,
  "cover_url": null,
  "source_url": null,
  "tags": ["视频解析", "家常菜"],
  "ingredients": [
    { "name": "鸡腿", "quantity": 2, "unit": "个", "optional": false }
  ],
  "steps": [
    { "instruction": "鸡腿冷水下锅焯水。", "duration_min": 5, "timer_required": true }
  ],
  "nutrition": null
}

语音转写内容：
${trimmedTranscript || '无可用转写，请尽量依据画面和画面文字判断。'}

视频画面文字提取结果：
${trimmedFrameText || '未额外提取到明确画面文字，请直接从图片中识别字幕/叠字。'}`;

    try {
      const completion = await client.chat.completions.create({
        model,
        temperature: 0.2,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: textPrompt },
              ...options.frames.map((frame) => ({
                type: 'image_url' as const,
                image_url: {
                  url: frame,
                },
              })),
            ],
          },
        ],
      });

      const responseContent = completion.choices[0].message.content || '';
      return await this.parseJsonResponse(responseContent, '视频食谱解析');
    } catch (error) {
      this.logger.error(
        `Failed to analyze video recipe: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('视频食谱解析失败，请稍后重试');
    }
  }

  async extractVideoFrameTexts(
    frames: VideoFrameOcrPayload[],
  ): Promise<OcrTextEntry[]> {
    const model = this.config.get<string>('AI_VISION_MODEL') || 'qwen-vl-plus';
    const client = this.visionClient || this.openai;

    if (!client) {
      throw new BadRequestException('AI Vision Service is not configured');
    }

    if (!frames.length) {
      return [];
    }

    const collectedEntries: OcrTextEntry[] = [];

    for (let index = 0; index < frames.length; index += 1) {
      const frame = frames[index];
      const prompt = `你是一个做菜视频 OCR 助手。当前会给你同一帧视频的 1 张原图和若干张文字放大裁剪图。

识别目标：
1. 优先读取视频叠加字幕、步骤字幕、食材列表、配料比例、时间说明、封面标题。
2. 特别关注左侧、左上、底部这类带黑色描边的白色中文文字。
3. 如果同一条文字在原图和裁剪图里重复出现，只保留一次。
4. 忽略抖音号、平台 logo、水印、点赞评论 UI、昵称等与烹饪无关的文字。
5. 尽量逐行保留原文，不要意译，不要自己改写。
6. 哪怕只能看清局部，也尽量返回，例如“1勺生抽”“半勺老抽”“调碗料汁”这种碎片也要返回，不要因为不完整就忽略。
7. 配料字卡请按一行一条输出。

输出 JSON 结构：
{
  "texts": [
    "1勺生抽",
    "半勺老抽",
    "调碗料汁"
  ]
}`;

      try {
        const completion = await client.chat.completions.create({
          model,
          temperature: 0,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `${prompt}\n\n当前处理的是第 ${index + 1} 帧。第一张是原图，后续是同帧的文字放大裁剪图。`,
                },
                {
                  type: 'image_url' as const,
                  image_url: {
                    url: frame.originalFrame,
                  },
                },
                ...(frame.focusCrops || []).map((crop) => ({
                  type: 'image_url' as const,
                  image_url: {
                    url: crop,
                  },
                })),
              ],
            },
          ],
        });

        const responseContent = completion.choices[0].message.content || '';
        const parsed = await this.parseJsonResponse(
          responseContent,
          `视频第 ${index + 1} 帧文字提取`,
        );
        const frameTexts = Array.isArray(parsed?.texts) ? parsed.texts : [];

        const normalizedTexts = frameTexts
          .map((item: unknown) => (typeof item === 'string' ? item.trim() : ''))
          .filter(Boolean);

        if (normalizedTexts.length > 0) {
          collectedEntries.push({
            timeSec: frame.timeSec,
            texts: Array.from(new Set(normalizedTexts)),
          });
        }
      } catch (error) {
        this.logger.warn(
          `Failed to extract texts from video frame ${index + 1}: ${error.message}`,
        );
      }
    }

    return collectedEntries;
  }

  async extractSegmentTimelineSteps(options: {
    segmentStartSec: number;
    segmentEndSec: number;
    frames: Array<{ timeSec: number; image: string }>;
    ocrEntries: OcrTextEntry[];
  }): Promise<TimelineCandidateStep[]> {
    const model = this.config.get<string>('AI_VISION_MODEL') || 'qwen-vl-plus';
    const client = this.visionClient || this.openai;

    if (!client) {
      throw new BadRequestException('AI Vision Service is not configured');
    }

    const ocrTextBlock = options.ocrEntries.length
      ? options.ocrEntries
          .map(
            (entry) =>
              `${entry.timeSec.toFixed(2)}s: ${entry.texts.join(' | ')}`,
          )
          .join('\n')
      : '无';
    const strictOcrLines = options.ocrEntries
      .flatMap((entry) => entry.texts)
      .filter((text) =>
        /(切|调|搅|拌|放入|下锅|炒|煎|煮|焖|扣|翻炒|盛出|淋入|炒香|炒出汁水)/.test(text),
      );

    const prompt = `你是一个做菜视频分段步骤提取助手。请只根据当前时间段内的画面和该时间段的 OCR 字幕，提取这一段里明确发生的烹饪步骤。

规则：
1. 只提取当前时间段 ${options.segmentStartSec.toFixed(2)}s - ${options.segmentEndSec.toFixed(2)}s 内明确发生的步骤。
2. OCR 中已明确出现的动作字幕，不能改写、替换、同义转写，也不能把食材词换成别的食材。
3. 你的任务是补充 OCR 没明确写出的动作，不是重写 OCR 已确认步骤。
4. 不要补全当前时间段外的步骤。
5. 如果这一段没有明确步骤，返回空数组。
6. start_sec 和 end_sec 必须落在当前时间段内。
7. evidence_sources 只能使用 visual 或 ocr，且至少一个。
8. 结果顺序必须与这一段视频中的实际出现顺序一致。

OCR 文字：
${ocrTextBlock}

OCR 已确认动作字幕（若存在，禁止改写这些原文）：
${strictOcrLines.length ? strictOcrLines.join(' / ') : '无'}

输出 JSON：
{
  "steps": [
    {
      "instruction": "调碗料汁",
      "start_sec": ${options.segmentStartSec.toFixed(2)},
      "end_sec": ${Math.min(options.segmentEndSec, options.segmentStartSec + 2).toFixed(2)},
      "duration_min": 1,
      "timer_required": false,
      "evidence_sources": ["ocr"]
    }
  ]
}`;

    try {
      const completion = await client.chat.completions.create({
        model,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              ...options.frames.map((frame) => ({
                type: 'image_url' as const,
                image_url: {
                  url: frame.image,
                },
              })),
            ],
          },
        ],
      });

      const responseContent = completion.choices[0].message.content || '';
      const parsed = await this.parseJsonResponse(
        responseContent,
        `视频时间段 ${options.segmentStartSec.toFixed(2)}-${options.segmentEndSec.toFixed(2)} 步骤提取`,
      );

      return Array.isArray(parsed?.steps)
        ? parsed.steps
            .map((item: Record<string, unknown>) => ({
              instruction: String(item?.instruction || '').trim(),
              start_sec: Number(item?.start_sec || options.segmentStartSec),
              end_sec: Number(item?.end_sec || options.segmentEndSec),
              duration_min: Number(item?.duration_min || 1),
              timer_required: Boolean(item?.timer_required),
              evidence_sources: Array.isArray(item?.evidence_sources)
                ? item.evidence_sources
                    .map((source) => String(source))
                    .filter((source) => ['visual', 'ocr'].includes(source)) as Array<'visual' | 'ocr'>
                : ['visual'],
            }))
            .filter(
              (item: TimelineCandidateStep) => item.instruction.length > 0,
            )
        : [];
    } catch (error) {
      this.logger.error(
        `Failed to extract segment timeline steps: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('视频分段步骤提取失败');
    }
  }

  async generateVideoRecipeMetadata(options: {
    fallbackTitle: string;
    strictSteps: TimelineRecipeStep[];
    transcript?: string;
    ocrEntries?: OcrTextEntry[];
    ocrSpans?: OcrTextSpan[];
  }): Promise<VideoRecipeMetadata> {
    if (!this.openai) {
      throw new BadRequestException('AI Service is not fully configured');
    }

    const model = this.config.get<string>('AI_MODEL') || 'deepseek-chat';
    const strictStepText = options.strictSteps
      .map((step) => `${step.order}. ${step.instruction}`)
      .join('\n');
    const ocrTextBlock = (options.ocrSpans || [])
      .map((entry) => entry.texts.join(' | '))
      .filter(Boolean)
      .join('\n');
    const prompt = `你是一个做菜视频食谱整理助手。请根据已经确认的严格步骤、OCR 字幕和转写内容，生成食谱元信息与食材信息。

要求：
1. 不要新增或改写步骤，步骤列表已经在别处固定。
2. 重点补齐标题、描述、难度、人份、标签、食材清单、营养信息。
3. 如果无法确认营养信息，返回 null。
4. 标题不明确时使用兜底标题：${options.fallbackTitle}。

严格步骤：
${strictStepText || '暂无'}

OCR 文字：
${ocrTextBlock || '无'}

语音转写：
${(options.transcript || '').trim() || '无'}

输出 JSON：
{
  "title": "菜谱标题",
  "description": "一句话描述",
  "difficulty": "简单",
  "servings": 2,
  "cover_url": null,
  "source_url": null,
  "tags": ["视频解析"],
  "ingredients": [
    { "name": "土豆", "quantity": 2, "unit": "个", "optional": false }
  ],
  "nutrition": null
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const responseContent = completion.choices[0].message.content || '{}';
      return (await this.parseJsonResponse(
        responseContent,
        '视频食谱元信息生成',
      )) as VideoRecipeMetadata;
    } catch (error) {
      this.logger.error(
        `Failed to generate video recipe metadata: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('视频食谱元信息生成失败');
    }
  }

  async generateAssistedTimelineInsertions(options: {
    strictSteps: TimelineRecipeStep[];
    transcript?: string;
    ocrEntries?: OcrTextEntry[];
    ocrSpans?: OcrTextSpan[];
  }): Promise<
    Array<{
      insert_after_order: number;
      instruction: string;
      duration_min?: number;
      timer_required?: boolean;
    }>
  > {
    if (!this.openai) {
      throw new BadRequestException('AI Service is not fully configured');
    }

    const model = this.config.get<string>('AI_MODEL') || 'deepseek-chat';
    const strictStepText = options.strictSteps
      .map((step) => `${step.order}. ${step.instruction}`)
      .join('\n');
    const ocrTextBlock = (options.ocrSpans || [])
      .map((entry) => `${entry.startSec.toFixed(2)}s-${entry.endSec.toFixed(2)}s: ${entry.texts.join(' | ')}`)
      .join('\n');
    const prompt = `你是一个食谱补全助手。现有一份严格按视频证据确认的步骤列表，请只补充可能漏掉的桥接步骤、准备步骤或收尾步骤。

规则：
1. 严格步骤本身不能删除、改名、换序。
2. 只返回“需要插入的补全步骤”，不要返回完整步骤列表。
3. insert_after_order = 0 表示插在最前面。
4. 如果没有必要补全，返回空数组。
5. 插入步骤默认都视为 AI 推断步骤。

严格步骤：
${strictStepText || '暂无'}

OCR 文字：
${ocrTextBlock || '无'}

语音转写：
${(options.transcript || '').trim() || '无'}

输出 JSON：
{
  "insertions": [
    {
      "insert_after_order": 1,
      "instruction": "将调好的料汁放在一旁备用",
      "duration_min": 1,
      "timer_required": false
    }
  ]
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const responseContent = completion.choices[0].message.content || '{}';
      const parsed = await this.parseJsonResponse(
        responseContent,
        '视频步骤补全生成',
      );

      return Array.isArray(parsed?.insertions)
        ? parsed.insertions
            .map((item: Record<string, unknown>) => ({
              insert_after_order: Number(item?.insert_after_order || 0),
              instruction: String(item?.instruction || '').trim(),
              duration_min: Number(item?.duration_min || 2),
              timer_required: Boolean(item?.timer_required),
            }))
            .filter(
              (item: {
                insert_after_order: number;
                instruction: string;
                duration_min: number;
                timer_required: boolean;
              }) => item.instruction.length > 0,
            )
        : [];
    } catch (error) {
      this.logger.error(
        `Failed to generate assisted timeline insertions: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('视频步骤补全生成失败');
    }
  }

  /**
   * AI 生成语音 (TTS)
   * 调用火山引擎 / 豆包语音 API
   */
  async generateSpeech(text: string): Promise<string> {
    const appId = this.config.get<string>('AI_SPEECH_APP_ID');
    const token = this.config.get<string>('AI_SPEECH_ACCESS_TOKEN');
    const baseUrl = this.config.get<string>('AI_SPEECH_BASE_URL');

    if (!appId || !token || !baseUrl) {
      throw new BadRequestException('Speech Service is not fully configured');
    }

    try {
      // @ts-ignore
      const axios = require('axios');

      const payload = {
        user: {
          uid: 'chefmate_user',
        },
        req_params: {
          text: text,
          speaker: 'zh_female_santongyongns_saturn_bigtts',
          audio_params: {
            format: 'mp3',
          },
        },
      };

      const res = await axios.post(baseUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-App-Id': appId,
          'X-Api-Access-Key': token,
          'X-Api-Resource-Id': 'seed-tts-2.0',
        },
        responseType: 'arraybuffer',
      });

      const bufferStr = Buffer.from(res.data).toString('utf8');

      // The streaming response returns multiple JSON strings separated by newlines.
      // E.g. {"code":0,"data":"..."}\n{"code":0,"data":"..."}
      const lines = bufferStr.split('\n').filter((line) => line.trim() !== '');
      const audioBuffers: Buffer[] = [];

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.data) {
            audioBuffers.push(Buffer.from(parsed.data, 'base64'));
          }
        } catch (err) {
          // Ignore parse errors on incomplete boundary lines if any
        }
      }

      if (audioBuffers.length > 0) {
        return Buffer.concat(audioBuffers).toString('base64');
      }

      this.logger.error(`TTS API returned unexpected structure: ${bufferStr}`);
      throw new BadRequestException('语音生成异常，请稍后再试');
    } catch (error) {
      this.logger.error(
        `Failed to generate speech: ${error.message}`,
        error.response?.data || error.stack,
      );
      throw new BadRequestException('语音生成请求失败');
    }
  }

  /**
   * 语音转文字 (STT)
   * 调用 SiliconFlow (FunAudioLLM/SenseVoiceSmall) 进行录音转写
   */
  async transcribeAudio(file: Express.Multer.File): Promise<string> {
    return this.requestAudioTranscription({
      file: file.buffer,
      filename: file.originalname || 'audio.mp3',
      contentType: file.mimetype || 'audio/mpeg',
    });
  }

  async transcribeAudioFromPath(filePath: string): Promise<string> {
    return this.requestAudioTranscription({
      file: fs.createReadStream(filePath),
      filename: basename(filePath),
      contentType: 'audio/mpeg',
    });
  }

  private async requestAudioTranscription(options: {
    file: Buffer | fs.ReadStream;
    filename: string;
    contentType: string;
  }): Promise<string> {
    const apiKey = this.config.get<string>('AI_SILICONFLOW_API_KEY');
    const model =
      this.config.get<string>('AI_SILICONFLOW_MODEL') ||
      'FunAudioLLM/SenseVoiceSmall';
    const baseUrl =
      this.config.get<string>('AI_SILICONFLOW_BASE_URL') ||
      'https://api.siliconflow.cn/v1/audio/transcriptions';

    if (!apiKey) {
      throw new BadRequestException(
        'SiliconFlow API Key is not configured in .env',
      );
    }

    try {
      // @ts-ignore
      const axios = require('axios');
      const form = new FormData();

      form.append('file', options.file, {
        filename: options.filename,
        contentType: options.contentType,
      });
      form.append('model', model);

      const res = await axios.post(baseUrl, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (res.data && res.data.text) {
        // OpenAI standard format returns { "text": "transcription result" }
        return res.data.text;
      }

      this.logger.error(
        `SiliconFlow ASR returned unexpected format: ${JSON.stringify(res.data)}`,
      );
      throw new BadRequestException('语音识别返回格式异常');
    } catch (error) {
      this.logger.error(
        `Failed to transcribe audio: ${error.message}`,
        error.response?.data || error.stack,
      );
      throw new BadRequestException('语音识别请求失败');
    }
  }

  /**
   * 将经过转写的文本解析为受限控制意图
   */
  async parseCommandIntent(
    text: string,
  ): Promise<{ command: string; confidence: number; original_text: string }> {
    if (!this.openai) {
      throw new BadRequestException('AI Service is not fully configured');
    }

    const modelOptions = this.config.get<string>('AI_MODEL') || 'deepseek-chat';

    const systemPrompt = `
      你是一个专门解析厨房烹饪语音指令的智能助手。
      用户正在照着菜谱做菜时按住了语音按钮并说了一句话，这段话已被系统转为了文本。
      请分析用户的意图，并必须返回固定的 JSON 格式。返回的 command 必须是以下之一：
      - "NEXT" : 去下一页、进行下一步、完成、好的、跳过
      - "PREV" : 上一步、回退、看前面的
      - "START_TIMER" || "PAUSE_TIMER" : 开始计时、暂停计时、计时、停一下
      - "QUESTION" : 用户没有发出以上指令，而是在提问（如“豆瓣酱放多少？”）
      - "UNKNOWN" : 杂音、没有意义的短语、或者无法判断的意图

      输出 JSON 格式要求：
      {
        "command": "NEXT", // 必须在枚举值内
        "confidence": 0.95, // 置信度 0-1
        "original_text": "刚才用户说的完整原话"
      }
      请绝对不要包含 markdown 代码块和额外解释，只输出原始 JSON 即可。
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `用户的语音转写结果是：\n"${text}"` },
        ],
        model: modelOptions,
        response_format: { type: 'json_object' },
        temperature: 0.1, // 低温度，更稳定地提取指令
      });

      const responseContent = completion.choices[0].message.content;
      this.logger.debug(`Intent parsing response: ${responseContent}`);
      return JSON.parse(responseContent || '{}');
    } catch (error) {
      this.logger.error(
        `Failed to parse command intent: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('语义解析失败，请稍后重试');
    }
  }

  private async parseJsonResponse(responseContent: string, scene: string) {
    const direct = this.extractJsonCandidate(responseContent);

    if (direct) {
      try {
        return JSON.parse(direct);
      } catch {
        // fall through to repair flow
      }
    }

    if (!this.openai) {
      throw new BadRequestException(`${scene} 返回格式异常`);
    }

    try {
      const model = this.config.get<string>('AI_MODEL') || 'deepseek-chat';
      const completion = await this.openai.chat.completions.create({
        model,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              '你是一个 JSON 修复助手。请将用户给出的内容修正为一个合法 JSON 对象，只输出 JSON 对象本身。',
          },
          {
            role: 'user',
            content: responseContent,
          },
        ],
      });

      const repairedContent = completion.choices[0].message.content || '{}';
      return JSON.parse(repairedContent);
    } catch (error) {
      this.logger.error(
        `${scene} JSON repair failed: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`${scene} 返回格式异常`);
    }
  }

  private extractJsonCandidate(responseContent: string) {
    const trimmed = responseContent.trim();

    if (!trimmed) {
      return null;
    }

    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
      || (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      return trimmed;
    }

    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    return jsonMatch?.[0] || null;
  }
}
