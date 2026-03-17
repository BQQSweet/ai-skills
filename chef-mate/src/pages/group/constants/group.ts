import type { GroupRole } from "@/types/group";

export const groupRoleLabels: Record<GroupRole, string> = {
  owner: "组长",
  admin: "管理员",
  member: "成员",
};

export const groupRoleTones: Record<GroupRole, "primary" | "info" | "neutral"> = {
  owner: "primary",
  admin: "info",
  member: "neutral",
};
