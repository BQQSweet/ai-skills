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
exports.GroupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let GroupService = class GroupService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getActiveGroupById(groupId) {
        const group = await this.prisma.group.findFirst({
            where: {
                id: groupId,
                deleted_at: null,
            },
        });
        if (!group) {
            throw new common_1.NotFoundException('家庭组不存在');
        }
        return group;
    }
    generateInviteCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    async createGroup(userId, dto) {
        let inviteCode;
        let attempts = 0;
        do {
            inviteCode = this.generateInviteCode();
            const existing = await this.prisma.group.findUnique({
                where: { invite_code: inviteCode },
            });
            if (!existing)
                break;
            attempts++;
        } while (attempts < 10);
        if (attempts >= 10) {
            throw new common_1.BadRequestException('生成邀请码失败，请重试');
        }
        const group = await this.prisma.$transaction(async (tx) => {
            const newGroup = await tx.group.create({
                data: {
                    name: dto.name,
                    invite_code: inviteCode,
                    owner_id: userId,
                },
            });
            await tx.groupMember.create({
                data: {
                    user_id: userId,
                    group_id: newGroup.id,
                    role: 'owner',
                },
            });
            return newGroup;
        });
        return {
            id: group.id,
            name: group.name,
            inviteCode: group.invite_code,
            ownerId: group.owner_id,
            role: 'owner',
            memberCount: 1,
            createdAt: group.created_at,
        };
    }
    async joinByInviteCode(userId, dto) {
        const group = await this.prisma.group.findFirst({
            where: {
                invite_code: dto.inviteCode,
                deleted_at: null,
            },
        });
        if (!group) {
            throw new common_1.NotFoundException('邀请码无效或已失效');
        }
        const existingMember = await this.prisma.groupMember.findUnique({
            where: {
                user_id_group_id: { user_id: userId, group_id: group.id },
            },
        });
        if (existingMember) {
            throw new common_1.ConflictException('你已经是该家庭组的成员');
        }
        await this.prisma.groupMember.create({
            data: {
                user_id: userId,
                group_id: group.id,
                role: 'member',
            },
        });
        return {
            id: group.id,
            name: group.name,
            inviteCode: group.invite_code,
            role: 'member',
        };
    }
    async getMyGroups(userId) {
        const memberships = await this.prisma.groupMember.findMany({
            where: { user_id: userId },
            include: {
                group: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        nickname: true,
                                        avatar_url: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        return memberships
            .filter((m) => m.group.deleted_at === null)
            .map((m) => ({
            id: m.group.id,
            name: m.group.name,
            inviteCode: m.group.invite_code,
            role: m.role,
            memberCount: m.group.members.length,
            members: m.group.members.map((mem) => ({
                id: mem.user.id,
                nickname: mem.user.nickname,
                avatarUrl: mem.user.avatar_url,
                role: mem.role,
            })),
            createdAt: m.group.created_at,
        }));
    }
    async getGroupDetail(groupId, userId) {
        const group = await this.prisma.group.findFirst({
            where: {
                id: groupId,
                deleted_at: null,
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                nickname: true,
                                avatar_url: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
        });
        if (!group) {
            throw new common_1.NotFoundException('家庭组不存在');
        }
        const currentMember = group.members.find((member) => member.user_id === userId);
        return {
            id: group.id,
            name: group.name,
            inviteCode: group.invite_code,
            ownerId: group.owner_id,
            role: currentMember?.role || 'member',
            memberCount: group.members.length,
            members: group.members.map((m) => ({
                id: m.user.id,
                nickname: m.user.nickname,
                avatarUrl: m.user.avatar_url,
                phone: m.user.phone,
                role: m.role,
            })),
            createdAt: group.created_at,
        };
    }
    async getGroupMembers(groupId, userId) {
        const group = await this.prisma.group.findFirst({
            where: {
                id: groupId,
                deleted_at: null,
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                nickname: true,
                                avatar_url: true,
                            },
                        },
                    },
                },
            },
        });
        if (!group) {
            throw new common_1.NotFoundException('家庭组不存在');
        }
        const currentMember = group.members.find((member) => member.user_id === userId);
        return {
            id: group.id,
            name: group.name,
            inviteCode: group.invite_code,
            ownerId: group.owner_id,
            role: currentMember?.role || 'member',
            memberCount: group.members.length,
            members: group.members.map((m) => ({
                id: m.user.id,
                nickname: m.user.nickname,
                avatarUrl: m.user.avatar_url,
                role: m.role,
            })),
            createdAt: group.created_at,
        };
    }
    async refreshInviteCode(groupId, userId) {
        const group = await this.getActiveGroupById(groupId);
        if (group.owner_id !== userId) {
            throw new common_1.BadRequestException('只有组长可以刷新邀请码');
        }
        let newCode;
        let attempts = 0;
        do {
            newCode = this.generateInviteCode();
            const existing = await this.prisma.group.findUnique({
                where: { invite_code: newCode },
            });
            if (!existing)
                break;
            attempts++;
        } while (attempts < 10);
        const updated = await this.prisma.group.update({
            where: { id: groupId },
            data: { invite_code: newCode },
        });
        return { inviteCode: updated.invite_code };
    }
    async leaveGroup(groupId, userId) {
        await this.getActiveGroupById(groupId);
        const membership = await this.prisma.groupMember.findUnique({
            where: {
                user_id_group_id: { user_id: userId, group_id: groupId },
            },
        });
        if (!membership) {
            throw new common_1.NotFoundException('家庭组成员关系不存在');
        }
        if (membership.role === 'owner') {
            throw new common_1.BadRequestException('组长不能退出家庭组，请解散家庭组');
        }
        await this.prisma.groupMember.delete({
            where: {
                user_id_group_id: { user_id: userId, group_id: groupId },
            },
        });
        return { success: true };
    }
    async disbandGroup(groupId, userId) {
        const group = await this.getActiveGroupById(groupId);
        if (group.owner_id !== userId) {
            throw new common_1.BadRequestException('只有组长可以解散家庭组');
        }
        const memberCount = await this.prisma.groupMember.count({
            where: { group_id: groupId },
        });
        if (memberCount > 1) {
            throw new common_1.BadRequestException('请先让其他成员退出后再解散家庭组');
        }
        await this.prisma.$transaction([
            this.prisma.group.update({
                where: { id: groupId },
                data: { deleted_at: new Date() },
            }),
            this.prisma.groupMember.deleteMany({
                where: { group_id: groupId },
            }),
        ]);
        return { success: true };
    }
};
exports.GroupService = GroupService;
exports.GroupService = GroupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroupService);
//# sourceMappingURL=group.service.js.map