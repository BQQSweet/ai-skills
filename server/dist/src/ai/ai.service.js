"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = __importDefault(require("openai"));
let AiService = AiService_1 = class AiService {
    config;
    logger = new common_1.Logger(AiService_1.name);
    openai;
    visionClient;
    constructor(config) {
        this.config = config;
        const apiKey = this.config.get('AI_API_KEY');
        const baseURL = this.config.get('AI_BASE_URL');
        if (apiKey && baseURL) {
            this.openai = new openai_1.default({
                apiKey,
                baseURL,
            });
            this.logger.log(`AI Service initialized with base URL: ${baseURL}`);
        }
        else {
            this.logger.warn('AI Service initialized without API key or base URL');
        }
        const visionApiKey = this.config.get('AI_VISION_API_KEY') || apiKey;
        const visionBaseURL = this.config.get('AI_VISION_BASE_URL') || baseURL;
        if (visionApiKey && visionBaseURL) {
            this.visionClient = new openai_1.default({
                apiKey: visionApiKey,
                baseURL: visionBaseURL,
            });
            this.logger.log(`AI Vision Service initialized with base URL: ${visionBaseURL}`);
        }
        else {
            this.visionClient = this.openai;
        }
    }
    async generateRecipe(options) {
        if (!this.openai) {
            throw new common_1.BadRequestException('AI Service is not fully configured');
        }
        const modelOptions = this.config.get('AI_MODEL') || 'deepseek-chat';
        this.logger.log(`Generating recipe with options: ${JSON.stringify(options)}`);
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
        let userPromptContent = '请帮我生成一个菜谱。';
        if (options.prompt)
            userPromptContent += ` 具体要求是：${options.prompt}。`;
        if (options.taste)
            userPromptContent += ` 口味偏好是：${options.taste}。`;
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
            return JSON.parse(responseContent || '{}');
        }
        catch (error) {
            this.logger.error(`Failed to generate recipe: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('AI 菜谱生成失败，请稍后重试');
        }
    }
    async answerStepQuestion(dto) {
        if (!this.openai) {
            throw new common_1.BadRequestException('AI Service is not fully configured');
        }
        const modelOptions = this.config.get('AI_MODEL') || 'deepseek-chat';
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
            return (completion.choices[0].message.content ||
                '我暂时没有理解这个问题，能换个说法吗？');
        }
        catch (error) {
            this.logger.error(`Failed to answer step question: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('AI 问答失败，请稍后重试');
        }
    }
    async chat(messages, options) {
        const model = this.config.get('AI_MODEL') || 'deepseek-chat';
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
        }
        catch (e) {
            this.logger.error('AI chat error', e);
            throw e;
        }
    }
    async *chatStream(messages) {
        const model = this.config.get('AI_MODEL') || 'deepseek-chat';
        try {
            const stream = await this.openai.chat.completions.create({
                messages,
                model,
                stream: true,
            });
            for await (const chunk of stream) {
                yield chunk.choices[0]?.delta?.content || '';
            }
        }
        catch (e) {
            this.logger.error('AI chatStream error', e);
            throw e;
        }
    }
    async vision(imageBase64, prompt) {
        const model = this.config.get('AI_VISION_MODEL') || 'qwen-vl-plus';
        const client = this.visionClient || this.openai;
        if (!client) {
            throw new common_1.BadRequestException('AI Vision Service is not configured');
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
        }
        catch (e) {
            this.logger.error('AI vision error', e);
            throw e;
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map