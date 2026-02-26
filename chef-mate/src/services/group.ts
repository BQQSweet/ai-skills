/**
 * 家庭组相关 API
 */
import { get, post, put } from "./request";
import type {
  GroupInfo,
  CreateGroupParams,
  JoinGroupParams,
} from "@/types/group";

/** 创建家庭组 */
export function createGroup(params: CreateGroupParams): Promise<GroupInfo> {
  return post<GroupInfo>("/api/group", params);
}

/** 通过邀请码加入家庭组 */
export function joinGroup(params: JoinGroupParams): Promise<GroupInfo> {
  return post<GroupInfo>("/api/group/join", params);
}

/** 获取我的家庭组列表 */
export function getMyGroups(): Promise<GroupInfo[]> {
  return get<GroupInfo[]>("/api/group/my");
}

/** 获取家庭组详情 */
export function getGroupDetail(groupId: string): Promise<GroupInfo> {
  return get<GroupInfo>(`/api/group/${groupId}`);
}

/** 刷新邀请码 */
export function refreshInviteCode(
  groupId: string,
): Promise<{ inviteCode: string }> {
  return put<{ inviteCode: string }>(`/api/group/${groupId}/invite-code`);
}
