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
var RecipeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const ai_service_1 = require("../../ai/ai.service");
let RecipeService = RecipeService_1 = class RecipeService {
    prisma;
    aiService;
    logger = new common_1.Logger(RecipeService_1.name);
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
    }
    async generateAiRecipe(params, userId) {
        let userTaste = params.taste;
        let userDietary = null;
        if (userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { taste_preference: true, dietary_preference: true },
            });
            if (user) {
                if (!userTaste)
                    userTaste = user.taste_preference;
                userDietary = user.dietary_preference;
            }
        }
        const { ingredients = [], mealType = '正餐', servings = 2 } = params;
        let prompt = ingredients.length > 0
            ? `请使用以下食材作为主要材料：${ingredients.join('、')}。`
            : '请随机给我推荐一道应季家常菜。';
        prompt += `这是一个适合【${mealType}】的菜谱。`;
        return this.aiService.generateRecipe({
            prompt,
            taste: userTaste || undefined,
            dietary: userDietary || undefined,
            servings: Number(servings),
        });
    }
    async askStepQuestion(dto) {
        return this.aiService.answerStepQuestion(dto);
    }
    async generateTts(text) {
        return this.aiService.generateSpeech(text);
    }
    async create(dto, userId) {
        return this.prisma.recipe.create({
            data: {
                title: dto.title,
                description: dto.description,
                ingredients: dto.ingredients,
                steps: dto.steps,
                nutrition: dto.nutrition,
                difficulty: dto.difficulty,
                cook_time: dto.cook_time,
                servings: dto.servings ?? 2,
                cover_url: dto.cover_url,
                source_type: dto.source_type ?? 'manual',
                tags: dto.tags ?? [],
                status: dto.status ?? 'published',
                created_by: userId,
            },
        });
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const pageSize = Number(query.pageSize) || 10;
        const skip = (page - 1) * pageSize;
        const where = {
            deleted_at: null,
        };
        if (query.keyword) {
            where.title = { contains: query.keyword, mode: 'insensitive' };
        }
        if (query.status) {
            where.status = query.status;
        }
        if (query.difficulty) {
            where.difficulty = query.difficulty;
        }
        const [list, total] = await Promise.all([
            this.prisma.recipe.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { created_at: 'desc' },
            }),
            this.prisma.recipe.count({ where }),
        ]);
        return { list, total, page, pageSize };
    }
    async findOne(id) {
        const recipe = await this.prisma.recipe.findUnique({
            where: { id },
        });
        if (!recipe || recipe.deleted_at) {
            throw new common_1.NotFoundException('食谱不存在');
        }
        return recipe;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.recipe.update({
            where: { id },
            data: {
                ...dto,
                ingredients: dto.ingredients ?? undefined,
                steps: dto.steps ?? undefined,
                nutrition: dto.nutrition ?? undefined,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.recipe.update({
            where: { id },
            data: { deleted_at: new Date() },
        });
    }
    async recommend(userId) {
        const currentHour = new Date().getHours();
        let mealTag = '';
        if (currentHour >= 5 && currentHour < 10) {
            mealTag = '早餐';
        }
        else if (currentHour >= 10 && currentHour < 14) {
            mealTag = '午餐';
        }
        else if (currentHour >= 14 && currentHour < 17) {
            mealTag = '下午茶';
        }
        else if (currentHour >= 17 && currentHour < 21) {
            mealTag = '晚餐';
        }
        else {
            mealTag = '夜宵';
        }
        let userTaste = null;
        let userDietary = null;
        if (userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { taste_preference: true, dietary_preference: true },
            });
            if (user) {
                userTaste = user.taste_preference;
                userDietary = user.dietary_preference;
            }
        }
        const preferenceTags = [mealTag, userTaste, userDietary].filter(Boolean);
        const recipes = await this.prisma.recipe.findMany({
            where: {
                status: 'published',
                deleted_at: null,
            },
            take: 50,
            orderBy: { created_at: 'desc' },
        });
        const ALL_MEAL_TAGS = ['早餐', '午餐', '下午茶', '晚餐', '夜宵'];
        const validRecipes = [];
        for (const recipe of recipes) {
            let score = 0;
            const tags = recipe.tags || [];
            const recipeMealTags = tags.filter((tag) => ALL_MEAL_TAGS.includes(tag));
            if (recipeMealTags.length > 0 && !recipeMealTags.includes(mealTag)) {
                continue;
            }
            if (tags.includes(mealTag))
                score += 10;
            if (userTaste && tags.includes(userTaste))
                score += 5;
            if (userDietary && tags.includes(userDietary))
                score += 5;
            score += Math.random() * 2;
            validRecipes.push({ ...recipe, _score: score });
        }
        validRecipes.sort((a, b) => b._score - a._score);
        return validRecipes.slice(0, 5).map((r) => {
            const { _score, ...rest } = r;
            return rest;
        });
    }
    async processVoiceCommand(file) {
        if (!file || !file.buffer) {
            throw new common_1.BadRequestException('未接收到有效的音频文件');
        }
        try {
            this.logger.log(`Received voice command audio, size: ${file.size} bytes`);
            const transcribedText = await this.aiService.transcribeAudio(file);
            this.logger.log(`Transcribed text: ${transcribedText}`);
            if (!transcribedText || transcribedText.trim() === '') {
                return { command: 'UNKNOWN', confidence: 1, original_text: '' };
            }
            const intent = await this.aiService.parseCommandIntent(transcribedText);
            return intent;
        }
        catch (error) {
            this.logger.error('Failed to process voice command', error);
            throw new common_1.BadRequestException('语音指令处理失败');
        }
    }
    async parseCommandIntent(text) {
        try {
            if (!text || text.trim() === '') {
                return { command: 'UNKNOWN', confidence: 1, original_text: '' };
            }
            return await this.aiService.parseCommandIntent(text);
        }
        catch (error) {
            this.logger.error('Failed to parse intent', error);
            throw new common_1.BadRequestException('文本意图解析失败');
        }
    }
};
exports.RecipeService = RecipeService;
exports.RecipeService = RecipeService = RecipeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], RecipeService);
//# sourceMappingURL=recipe.service.js.map