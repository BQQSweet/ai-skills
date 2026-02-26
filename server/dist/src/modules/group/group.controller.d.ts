import { GroupService } from './group.service';
import { CreateGroupDto, JoinGroupDto } from './dto/group.dto';
export declare class GroupController {
    private readonly groupService;
    constructor(groupService: GroupService);
    createGroup(userId: string, dto: CreateGroupDto): Promise<{
        id: string;
        name: string;
        inviteCode: string;
        ownerId: string;
        createdAt: Date;
    }>;
    joinGroup(userId: string, dto: JoinGroupDto): Promise<{
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
    getGroupDetail(groupId: string): Promise<{
        id: string;
        name: string;
        inviteCode: string;
        ownerId: string;
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
    refreshInviteCode(groupId: string, userId: string): Promise<{
        inviteCode: string;
    }>;
}
