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
exports.ShoppingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let ShoppingService = class ShoppingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createShoppingList(groupId, userId, dto) {
        await this.verifyGroupMembership(groupId, userId);
        const shoppingList = await this.prisma.shoppingList.create({
            data: {
                group_id: groupId,
                title: dto.title,
                created_by: userId,
                recipe_id: dto.recipeId,
                source: dto.source || 'manual',
            },
            include: {
                items: true,
            },
        });
        await this.createFeed(groupId, userId, 'shopping_added', dto.title, shoppingList.id);
        return shoppingList;
    }
    async getShoppingLists(groupId, userId) {
        await this.verifyGroupMembership(groupId, userId);
        return this.prisma.shoppingList.findMany({
            where: {
                group_id: groupId,
                deleted_at: null,
            },
            include: {
                items: {
                    where: {
                        list: {
                            deleted_at: null,
                        },
                    },
                    orderBy: {
                        created_at: 'asc',
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });
    }
    async getShoppingListDetail(listId, userId) {
        const list = await this.prisma.shoppingList.findUnique({
            where: { id: listId },
            include: {
                items: {
                    orderBy: {
                        created_at: 'asc',
                    },
                },
            },
        });
        if (!list || list.deleted_at) {
            throw new common_1.NotFoundException('购物清单不存在');
        }
        await this.verifyGroupMembership(list.group_id, userId);
        return list;
    }
    async addShoppingItem(listId, userId, dto) {
        const list = await this.prisma.shoppingList.findUnique({
            where: { id: listId },
        });
        if (!list || list.deleted_at) {
            throw new common_1.NotFoundException('购物清单不存在');
        }
        await this.verifyGroupMembership(list.group_id, userId);
        const item = await this.prisma.shoppingItem.create({
            data: {
                list_id: listId,
                name: dto.name,
                category: dto.category,
                quantity: dto.quantity,
                unit: dto.unit,
                note: dto.note,
                added_by: userId,
            },
        });
        await this.createFeed(list.group_id, userId, 'shopping_added', dto.name, item.id);
        return item;
    }
    async updateShoppingItem(itemId, userId, dto) {
        const item = await this.prisma.shoppingItem.findUnique({
            where: { id: itemId },
            include: {
                list: true,
            },
        });
        if (!item) {
            throw new common_1.NotFoundException('购物清单项不存在');
        }
        await this.verifyGroupMembership(item.list.group_id, userId);
        return this.prisma.shoppingItem.update({
            where: { id: itemId },
            data: dto,
        });
    }
    async deleteShoppingItem(itemId, userId) {
        const item = await this.prisma.shoppingItem.findUnique({
            where: { id: itemId },
            include: {
                list: true,
            },
        });
        if (!item) {
            throw new common_1.NotFoundException('购物清单项不存在');
        }
        await this.verifyGroupMembership(item.list.group_id, userId);
        await this.prisma.shoppingItem.delete({
            where: { id: itemId },
        });
    }
    async claimShoppingItem(itemId, userId) {
        const item = await this.prisma.shoppingItem.findUnique({
            where: { id: itemId },
            include: {
                list: true,
            },
        });
        if (!item) {
            throw new common_1.NotFoundException('购物清单项不存在');
        }
        await this.verifyGroupMembership(item.list.group_id, userId);
        const updated = await this.prisma.shoppingItem.update({
            where: { id: itemId },
            data: {
                assigned_to: userId,
                status: 'claimed',
            },
        });
        return updated;
    }
    async markAsPurchased(itemId, userId) {
        const item = await this.prisma.shoppingItem.findUnique({
            where: { id: itemId },
            include: {
                list: true,
            },
        });
        if (!item) {
            throw new common_1.NotFoundException('购物清单项不存在');
        }
        await this.verifyGroupMembership(item.list.group_id, userId);
        const updated = await this.prisma.shoppingItem.update({
            where: { id: itemId },
            data: {
                is_bought: true,
                bought_at: new Date(),
                purchased_by: userId,
                status: 'purchased',
            },
        });
        await this.createFeed(item.list.group_id, userId, 'shopping_purchased', item.name, itemId);
        return updated;
    }
    async completeShoppingList(listId, userId) {
        const list = await this.prisma.shoppingList.findUnique({
            where: { id: listId },
        });
        if (!list || list.deleted_at) {
            throw new common_1.NotFoundException('购物清单不存在');
        }
        await this.verifyGroupMembership(list.group_id, userId);
        return this.prisma.shoppingList.update({
            where: { id: listId },
            data: {
                status: 'completed',
            },
        });
    }
    async clearPurchased(groupId, userId) {
        await this.verifyGroupMembership(groupId, userId);
        const lists = await this.prisma.shoppingList.findMany({
            where: {
                group_id: groupId,
                status: 'active',
                deleted_at: null,
            },
            select: {
                id: true,
            },
        });
        const listIds = lists.map((l) => l.id);
        await this.prisma.shoppingItem.deleteMany({
            where: {
                list_id: { in: listIds },
                is_bought: true,
            },
        });
    }
    async verifyGroupMembership(groupId, userId) {
        const membership = await this.prisma.groupMember.findFirst({
            where: {
                group_id: groupId,
                user_id: userId,
            },
        });
        if (!membership) {
            throw new common_1.ForbiddenException('您不是该家庭组成员');
        }
        return membership;
    }
    async createFeed(groupId, userId, actionType, target, targetId) {
        await this.prisma.feed.create({
            data: {
                group_id: groupId,
                user_id: userId,
                action_type: actionType,
                target,
                target_id: targetId,
            },
        });
    }
};
exports.ShoppingService = ShoppingService;
exports.ShoppingService = ShoppingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShoppingService);
//# sourceMappingURL=shopping.service.js.map