import { PrismaService } from '@/common/prisma.service';
import { CreateGroupDto, JoinGroupDto } from './dto/group.dto';
export declare class GroupService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getActiveGroupById;
    private generateInviteCode;
    createGroup(userId: string, dto: CreateGroupDto): Promise<{
        id: string;
        name: string;
        inviteCode: string;
        ownerId: string;
        role: string;
        memberCount: number;
        createdAt: Date;
    }>;
    joinByInviteCode(userId: string, dto: JoinGroupDto): Promise<{
        id: string;
        name: string;
        inviteCode: string;
        role: string;
    }>;
    getMyGroups(userId: string): Promise<{
        id: string;
        name: string;
        inviteCode: string;
        role: string;
        memberCount: number;
        members: {
            id: string;
            nickname: string;
            avatarUrl: string | null;
            role: string;
        }[];
        createdAt: Date;
    }[]>;
    getGroupDetail(groupId: string, userId: string): Promise<{
        id: string;
        name: string;
        inviteCode: string;
        ownerId: string;
        role: string;
        memberCount: number;
        members: {
            id: string;
            nickname: string;
            avatarUrl: string | null;
            phone: string;
            role: string;
        }[];
        createdAt: Date;
    }>;
    getGroupMembers(groupId: string, userId: string): Promise<{
        id: string;
        name: string;
        inviteCode: string;
        ownerId: string;
        role: string;
        memberCount: number;
        members: {
            id: string;
            nickname: string;
            avatarUrl: string | null;
            role: string;
        }[];
        createdAt: Date;
    }>;
    refreshInviteCode(groupId: string, userId: string): Promise<{
        inviteCode: string;
    }>;
    leaveGroup(groupId: string, userId: string): Promise<{
        success: boolean;
    }>;
    disbandGroup(groupId: string, userId: string): Promise<{
        success: boolean;
    }>;
}
