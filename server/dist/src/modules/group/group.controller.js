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
exports.GroupController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const group_service_1 = require("./group.service");
const group_dto_1 = require("./dto/group.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const group_guard_1 = require("../../common/guards/group.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let GroupController = class GroupController {
    groupService;
    constructor(groupService) {
        this.groupService = groupService;
    }
    async createGroup(userId, dto) {
        return this.groupService.createGroup(userId, dto);
    }
    async joinGroup(userId, dto) {
        return this.groupService.joinByInviteCode(userId, dto);
    }
    async getMyGroups(userId) {
        return this.groupService.getMyGroups(userId);
    }
    async getGroupDetail(groupId, userId) {
        return this.groupService.getGroupDetail(groupId, userId);
    }
    async getGroupMembers(groupId, userId) {
        return this.groupService.getGroupMembers(groupId, userId);
    }
    async refreshInviteCode(groupId, userId) {
        return this.groupService.refreshInviteCode(groupId, userId);
    }
    async leaveGroup(groupId, userId) {
        return this.groupService.leaveGroup(groupId, userId);
    }
    async disbandGroup(groupId, userId) {
        return this.groupService.disbandGroup(groupId, userId);
    }
};
exports.GroupController = GroupController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '创建家庭组' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, group_dto_1.CreateGroupDto]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "createGroup", null);
__decorate([
    (0, common_1.Post)('join'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '通过邀请码加入家庭组' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, group_dto_1.JoinGroupDto]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "joinGroup", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: '获取我的家庭组列表' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getMyGroups", null);
__decorate([
    (0, common_1.Get)(':groupId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, group_guard_1.GroupGuard),
    (0, swagger_1.ApiOperation)({ summary: '获取家庭组详情' }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getGroupDetail", null);
__decorate([
    (0, common_1.Get)(':groupId/members'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, group_guard_1.GroupGuard),
    (0, swagger_1.ApiOperation)({ summary: '获取家庭组成员列表' }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getGroupMembers", null);
__decorate([
    (0, common_1.Put)(':groupId/invite-code'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, group_guard_1.GroupGuard),
    (0, swagger_1.ApiOperation)({ summary: '刷新邀请码（仅组长）' }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "refreshInviteCode", null);
__decorate([
    (0, common_1.Delete)(':groupId/members/me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, group_guard_1.GroupGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '退出家庭组（普通成员）' }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "leaveGroup", null);
__decorate([
    (0, common_1.Delete)(':groupId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, group_guard_1.GroupGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '解散家庭组（仅组长且仅剩本人）' }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "disbandGroup", null);
exports.GroupController = GroupController = __decorate([
    (0, swagger_1.ApiTags)('group'),
    (0, common_1.Controller)('api/group'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [group_service_1.GroupService])
], GroupController);
//# sourceMappingURL=group.controller.js.map