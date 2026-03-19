import { BASE_URL } from "@/utils/env";
import defaultAvatar from "@/static/svgs/default_avatar.svg";

function getTrimmedAvatarUrl(value?: string | null): string {
  const avatarUrl = value?.trim();
  return avatarUrl || "";
}

export function normalizeAvatarValue(value?: string | null): string | undefined {
  const avatarUrl = getTrimmedAvatarUrl(value);
  return avatarUrl || undefined;
}

export function resolveAvatarUrl(value?: string | null): string {
  const avatarUrl = getTrimmedAvatarUrl(value);
  if (!avatarUrl) {
    return defaultAvatar;
  }

  const normalizedBaseUrl = BASE_URL.replace(/\/$/, "");
  if (avatarUrl.startsWith("/uploads/")) {
    return `${normalizedBaseUrl}${avatarUrl}`;
  }

  if (avatarUrl.startsWith("uploads/")) {
    return `${normalizedBaseUrl}/${avatarUrl}`;
  }

  return avatarUrl;
}
