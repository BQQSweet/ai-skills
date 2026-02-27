"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FridgeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FridgeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../common/prisma.service");
const ai_service_1 = require("../../ai/ai.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
let FridgeService = FridgeService_1 = class FridgeService {
    prisma;
    aiService;
    config;
    logger = new common_1.Logger(FridgeService_1.name);
    constructor(prisma, aiService, config) {
        this.prisma = prisma;
        this.aiService = aiService;
        this.config = config;
    }
    async recognizeLabel(imageBase64) {
        const prompt = `你是一个食品标签识别专家。请仔细分析这张图片。
首先判断图片中是否包含食材、食品或其包装标签。
如果【不包含】食品或食材，请严格返回如下 JSON 并在 error 字段中写明原因：
{
  "is_food": false,
  "error": "未识别到食材，请对准食品标签或食材拍照"
}

如果包含，请提取以下信息并以 JSON 格式返回。如果某个字段无法从图片中识别出来，请根据常识以合理的值填充。

必须返回严格合法的 JSON 对象，不要有任何额外文本、注释或 markdown 标志。正确识别时的 JSON 结构如下：
{
  "is_food": true,
  "name": "食材名称（例：澳洲和牛）",
  "category": "分类，只能是以下之一：肉禽 / 果蔬 / 海鲜 / 乳制品 / 调味 / 主食 / 零食 / 饮品 / 其他",
  "quantity": 数量数字（例：500）,
  "unit": "单位（例：克、个、袋、盒、瓶）",
  "production_date": "生产日期 YYYY-MM-DD 格式，无法识别则为 null",
  "expire_date": "过期日期 YYYY-MM-DD 格式，如果只有保质期天数则根据生产日期推算"
}`;
        try {
            const result = await this.aiService.vision(imageBase64, prompt);
            this.logger.log(`AI recognition raw result: ${result}`);
            let parsed;
            try {
                parsed = JSON.parse(result);
            }
            catch {
                const jsonMatch = result.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[0]);
                }
                else {
                    throw new Error('无法从 AI 响应中提取 JSON');
                }
            }
            if (parsed.is_food === false) {
                throw new Error(parsed.error || '未识别到有效食材');
            }
            return parsed;
        }
        catch (error) {
            this.logger.error(`Label recognition error: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('食材识别失败：' + error.message);
        }
    }
    async getUserGroupId(userId) {
        const membership = await this.prisma.groupMember.findFirst({
            where: { user_id: userId },
            select: { group_id: true },
        });
        if (!membership) {
            throw new common_1.BadRequestException('您还没有加入任何家庭组');
        }
        return membership.group_id;
    }
    async addItem(groupId, dto) {
        let photoUrl = dto.photo_url || null;
        if (dto.photo_base64) {
            const uploadDir = path.join(process.cwd(), 'uploads', 'fridge');
            fs.mkdirSync(uploadDir, { recursive: true });
            const fileName = `${(0, crypto_1.randomUUID)()}.jpg`;
            fs.writeFileSync(path.join(uploadDir, fileName), Buffer.from(dto.photo_base64, 'base64'));
            const port = this.config.get('PORT') || 3000;
            photoUrl = `/uploads/fridge/${fileName}`;
            this.logger.log(`Saved fridge item photo: ${photoUrl}`);
        }
        const existing = await this.prisma.fridgeItem.findFirst({
            where: {
                group_id: groupId,
                name: dto.name,
                expire_date: new Date(dto.expire_date),
                deleted_at: null,
            },
        });
        if (existing) {
            return this.prisma.fridgeItem.update({
                where: { id: existing.id },
                data: {
                    quantity: existing.quantity + (dto.quantity || 1),
                    ...(photoUrl && { photo_url: photoUrl }),
                    ...(dto.expire_date && {
                        expire_date: new Date(dto.expire_date),
                        status: this.calcStatus(new Date(dto.expire_date)),
                    }),
                },
            });
        }
        return this.prisma.fridgeItem.create({
            data: {
                group: { connect: { id: groupId } },
                name: dto.name,
                category: dto.category,
                quantity: dto.quantity,
                unit: dto.unit,
                expire_date: new Date(dto.expire_date),
                production_date: dto.production_date
                    ? new Date(dto.production_date)
                    : null,
                photo_url: photoUrl,
                source: dto.source || 'scan',
                status: this.calcStatus(new Date(dto.expire_date)),
            },
        });
    }
    async listItems(groupId) {
        return this.prisma.fridgeItem.findMany({
            where: {
                group_id: groupId,
                deleted_at: null,
            },
            orderBy: { expire_date: 'asc' },
        });
    }
    async clearExpired(groupId) {
        const result = await this.prisma.fridgeItem.updateMany({
            where: {
                group_id: groupId,
                expire_date: { lt: new Date() },
                deleted_at: null,
            },
            data: { deleted_at: new Date() },
        });
        return { cleared: result.count };
    }
    async deleteItem(id) {
        return this.prisma.fridgeItem.update({
            where: { id },
            data: { deleted_at: new Date() },
        });
    }
    calcStatus(expireDate) {
        const now = new Date();
        const diffDays = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0)
            return 'expired';
        if (diffDays <= 3)
            return 'expiring';
        return 'fresh';
    }
};
exports.FridgeService = FridgeService;
exports.FridgeService = FridgeService = FridgeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService,
        config_1.ConfigService])
], FridgeService);
//# sourceMappingURL=fridge.service.js.map