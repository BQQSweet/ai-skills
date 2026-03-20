import { BASE_URL } from "@/utils/env";

function getTrimmedMediaUrl(value?: string | null): string {
  const mediaUrl = value?.trim();
  return mediaUrl || "";
}

export function resolveMediaUrl(value?: string | null): string | undefined {
  const mediaUrl = getTrimmedMediaUrl(value);
  if (!mediaUrl) {
    return undefined;
  }

  if (/^https?:\/\//i.test(mediaUrl)) {
    return mediaUrl;
  }

  const normalizedBaseUrl = BASE_URL.replace(/\/$/, "");
  if (mediaUrl.startsWith("/uploads/")) {
    return `${normalizedBaseUrl}${mediaUrl}`;
  }

  if (mediaUrl.startsWith("uploads/")) {
    return `${normalizedBaseUrl}/${mediaUrl}`;
  }

  return mediaUrl;
}
