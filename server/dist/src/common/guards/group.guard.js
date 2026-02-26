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
exports.GroupGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let GroupGuard = class GroupGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const groupId = request.params.groupId || request.body.groupId || request.query.groupId;
        if (!groupId) {
            throw new common_1.ForbiddenException('缺少家庭组 ID');
        }
        const member = await this.prisma.groupMember.findUnique({
            where: {
                user_id_group_id: { user_id: user.id, group_id: groupId },
            },
        });
        if (!member) {
            throw new common_1.ForbiddenException('非组内成员，无权操作');
        }
        request.groupRole = member.role;
        return true;
    }
};
exports.GroupGuard = GroupGuard;
exports.GroupGuard = GroupGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroupGuard);
//# sourceMappingURL=group.guard.js.map