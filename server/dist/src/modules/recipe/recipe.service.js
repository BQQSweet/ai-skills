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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let RecipeService = class RecipeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
};
exports.RecipeService = RecipeService;
exports.RecipeService = RecipeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecipeService);
//# sourceMappingURL=recipe.service.js.map