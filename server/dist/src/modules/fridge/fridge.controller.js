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
exports.FridgeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fridge_service_1 = require("./fridge.service");
const create_fridge_item_dto_1 = require("./dto/create-fridge-item.dto");
const recognize_label_dto_1 = require("./dto/recognize-label.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let FridgeController = class FridgeController {
    fridgeService;
    constructor(fridgeService) {
        this.fridgeService = fridgeService;
    }
    async recognizeLabel(dto) {
        return this.fridgeService.recognizeLabel(dto.image);
    }
    async addItem(dto, req) {
        const groupId = await this.fridgeService.getUserGroupId(req.user.id);
        return this.fridgeService.addItem(groupId, dto);
    }
    async listItems(req) {
        const groupId = await this.fridgeService.getUserGroupId(req.user.id);
        return this.fridgeService.listItems(groupId);
    }
    async clearExpired(req) {
        const groupId = await this.fridgeService.getUserGroupId(req.user.id);
        return this.fridgeService.clearExpired(groupId);
    }
    async deleteItem(id) {
        return this.fridgeService.deleteItem(id);
    }
};
exports.FridgeController = FridgeController;
__decorate([
    (0, common_1.Post)('recognize'),
    (0, swagger_1.ApiOperation)({ summary: 'AI 识别食材标签图片' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recognize_label_dto_1.RecognizeLabelDto]),
    __metadata("design:returntype", Promise)
], FridgeController.prototype, "recognizeLabel", null);
__decorate([
    (0, common_1.Post)('items'),
    (0, swagger_1.ApiOperation)({ summary: '添加食材到冰箱' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_fridge_item_dto_1.CreateFridgeItemDto, Object]),
    __metadata("design:returntype", Promise)
], FridgeController.prototype, "addItem", null);
__decorate([
    (0, common_1.Get)('items'),
    (0, swagger_1.ApiOperation)({ summary: '查询冰箱食材列表' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FridgeController.prototype, "listItems", null);
__decorate([
    (0, common_1.Delete)('items/expired'),
    (0, swagger_1.ApiOperation)({ summary: '一键清理过期食材' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FridgeController.prototype, "clearExpired", null);
__decorate([
    (0, common_1.Delete)('items/:id'),
    (0, swagger_1.ApiOperation)({ summary: '删除冰箱食材（软删除）' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FridgeController.prototype, "deleteItem", null);
exports.FridgeController = FridgeController = __decorate([
    (0, swagger_1.ApiTags)('fridge'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/fridge'),
    __metadata("design:paramtypes", [fridge_service_1.FridgeService])
], FridgeController);
//# sourceMappingURL=fridge.controller.js.map