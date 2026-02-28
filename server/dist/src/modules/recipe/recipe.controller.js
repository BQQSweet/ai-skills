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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipeController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const recipe_service_1 = require("./recipe.service");
const recipe_dto_1 = require("./dto/recipe.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const admin_guard_1 = require("../../common/guards/admin.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let RecipeController = class RecipeController {
    recipeService;
    constructor(recipeService) {
        this.recipeService = recipeService;
    }
    async create(dto, userId) {
        return this.recipeService.create(dto, userId);
    }
    async findAll(query) {
        return this.recipeService.findAll(query);
    }
    async recommend(userId) {
        return this.recipeService.recommend(userId);
    }
    async generateAiRecipe(body, userId) {
        return this.recipeService.generateAiRecipe(body, userId);
    }
    async askStep(body) {
        return this.recipeService.askStepQuestion(body);
    }
    async generateVoice(body) {
        if (!body.text) {
            throw new common_1.BadRequestException('text is required');
        }
        return { audioBase64: await this.recipeService.generateTts(body.text) };
    }
    async parseIntent(body) {
        if (!body.text) {
            throw new common_1.BadRequestException('text is required');
        }
        return this.recipeService.parseCommandIntent(body.text);
    }
    async processVoiceCommand(file) {
        return this.recipeService.processVoiceCommand(file);
    }
    async findOne(id) {
        return this.recipeService.findOne(id);
    }
    async update(id, dto) {
        return this.recipeService.update(id, dto);
    }
    async remove(id) {
        return this.recipeService.remove(id);
    }
};
exports.RecipeController = RecipeController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: '创建食谱（管理员）' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recipe_dto_1.CreateRecipeDto, String]),
    __metadata("design:returntype", Promise)
], RecipeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '分页查询食谱列表' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recipe_dto_1.QueryRecipeDto]),
    __metadata("design:returntype", Promise)
], RecipeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('recommend'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: '首页基于时间的菜谱推荐' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecipeController.prototype, "recommend", null);
__decorate([
    (0, common_1.Post)('ai-generate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: '基于给定食材生成 AI 食谱' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RecipeController.prototype, "generateAiRecipe", null);
__decorate([
    (0, common_1.Post)('ask-step'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: '针对某一个烹饪步骤向 AI 提问' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecipeController.prototype, "askStep", null);
__decorate([
    (0, common_1.Post)('tts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: '将给定的步骤文本转换为语音 (返回 Base64)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecipeController.prototype, "generateVoice", null);
__decorate([
    (0, common_1.Post)('parse-intent'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: '解析本地语音识别的文本指令意图' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                text: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecipeController.prototype, "parseIntent", null);
__decorate([
    (0, common_1.Post)('voice-command'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: '处理语音流，提取控制意图' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecipeController.prototype, "processVoiceCommand", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取食谱详情' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecipeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: '更新食谱（管理员）' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, recipe_dto_1.UpdateRecipeDto]),
    __metadata("design:returntype", Promise)
], RecipeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: '删除食谱（管理员）' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecipeController.prototype, "remove", null);
exports.RecipeController = RecipeController = __decorate([
    (0, swagger_1.ApiTags)('recipe'),
    (0, common_1.Controller)('api/recipe'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [recipe_service_1.RecipeService])
], RecipeController);
//# sourceMappingURL=recipe.controller.js.map