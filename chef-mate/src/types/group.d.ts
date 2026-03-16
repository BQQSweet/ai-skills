export type GroupRole = "owner" | "admin" | "member";

/** 家庭组基本信息 */
export interface GroupInfo {
  id: string;
  name: string;
  inviteCode: string;
  ownerId?: string;
  role: GroupRole;
  memberCount?: number;
  members?: GroupMemberInfo[];
  createdAt?: string;
}

/** 组成员信息 */
export interface GroupMemberInfo {
  id: string;
  nickname: string;
  avatarUrl?: string;
  phone?: string;
  role: GroupRole;
}

/** 登录响应中的组简要信息 */
export interface GroupBrief {
  groupId: string;
  name: string;
  inviteCode: string;
  role: GroupRole;
}

/** 创建家庭组请求 */
export interface CreateGroupParams {
  name: string;
}

/** 加入家庭组请求 */
export interface JoinGroupParams {
  inviteCode: string;
}
