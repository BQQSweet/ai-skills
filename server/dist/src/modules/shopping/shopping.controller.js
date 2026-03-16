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
exports.ShoppingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shopping_service_1 = require("./shopping.service");
const shopping_dto_1 = require("./dto/shopping.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ShoppingController = class ShoppingController {
    shoppingService;
    constructor(shoppingService) {
        this.shoppingService = shoppingService;
    }
    async createShoppingList(groupId, userId, dto) {
        return this.shoppingService.createShoppingList(groupId, userId, dto);
    }
    async getShoppingLists(groupId, userId) {
        return this.shoppingService.getShoppingLists(groupId, userId);
    }
    async getShoppingListDetail(listId, userId) {
        return this.shoppingService.getShoppingListDetail(listId, userId);
    }
    async addShoppingItem(listId, userId, dto) {
        return this.shoppingService.addShoppingItem(listId, userId, dto);
    }
    async updateShoppingItem(itemId, userId, dto) {
        return this.shoppingService.updateShoppingItem(itemId, userId, dto);
    }
    async deleteShoppingItem(itemId, userId) {
        return this.shoppingService.deleteShoppingItem(itemId, userId);
    }
    async claimShoppingItem(itemId, userId) {
        return this.shoppingService.claimShoppingItem(itemId, userId);
    }
    async markAsPurchased(itemId, userId) {
        return this.shoppingService.markAsPurchased(itemId, userId);
    }
    async completeShoppingList(listId, userId) {
        return this.shoppingService.completeShoppingList(listId, userId);
    }
    async clearPurchased(groupId, userId) {
        return this.shoppingService.clearPurchased(groupId, userId);
    }
};
exports.ShoppingController = ShoppingController;
__decorate([
    (0, common_1.Post)(':groupId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '创建购物清单' }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, shopping_dto_1.CreateShoppingListDto]),
    __metadata("design:returntype", Promise)
], ShoppingController.prototype, "createShoppingList", null);
__decorate([
    (0, common_1.Get)(':groupId'),
    (0, swagger_1.ApiOperation)({ summary: '获取家庭组购物清单列表' }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShoppingController.prototype, "getShoppingLists", null);
__decorate([
    (0, common_1.Get)('list/:listId'),
    (0, swagger_1.ApiOperation)({ summary: '获取购物清单详情' }),
    __param(0, (0, common_1.Param)('listId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShoppingController.prototype, "getShoppingListDetail", null);
__decorate([
    (0, common_1.Post)('list/:listId/item'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '添加购物清单项' }),
    __param(0, (0, common_1.Param)('listId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, shopping_dto_1.AddShoppingItemDto]),
    __metadata("design:returntype", Promise)
], ShoppingController.prototype, "addShoppingItem", null);
__decorate([
    (0, common_1.Put)('item/:itemId'),
    (0, swagger_1.ApiOperation)({ summary: '更新购物清单项' }),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, shopping_dto_1.UpdateShoppingItemDto]),
    __metadata("design:returntype", Promise)
], ShoppingController.prototype, "updateShoppingItem", null);
__decorate([
    (0, common_1.Delete)('item/:itemId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: '删除购物清单项' }),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShoppingController.prototype, "deleteShoppingItem", null);
__decorate([
    (0, common_1.Put)('item/:itemId/claim'),
    (0, swagger_1.ApiOperation)({ summary: '领取购物任务' }),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShoppingController.prototype, "claimShoppingItem", null);
__decorate([
    (0, common_1.Put)('item/:itemId/purchase'),
    (0, swagger_1.ApiOperation)({ summary: '标记为已购买' }),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShoppingController.prototype, "markAsPurchased", null);
__decorate([
    (0, common_1.Put)('list/:listId/complete'),
    (0, swagger_1.ApiOperation)({ summary: '完成购物清单' }),
    __param(0, (0, common_1.Param)('listId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShoppingController.prototype, "completeShoppingList", null);
__decorate([
    (0, common_1.Delete)(':groupId/purchased'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: '清空已购买项' }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShoppingController.prototype, "clearPurchased", null);
exports.ShoppingController = ShoppingController = __decorate([
    (0, swagger_1.ApiTags)('shopping'),
    (0, common_1.Controller)('api/shopping'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [shopping_service_1.ShoppingService])
], ShoppingController);
//# sourceMappingURL=shopping.controller.js.map