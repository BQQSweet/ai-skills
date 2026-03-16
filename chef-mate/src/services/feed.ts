/**
 * 家庭动态相关 API
 */
import { get } from "./request";
import type { FeedResponse, GetFeedParams } from "@/types/feed";

/** 获取家庭动态列表 */
export function getFeedList(params: GetFeedParams): Promise<FeedResponse> {
  const { groupId, ...query } = params;
  return get<FeedResponse>(`/api/feed/${groupId}`, query);
}
