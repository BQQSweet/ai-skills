import { defineStore } from "pinia";
import { ref } from "vue";
import type { FeedItem } from "@/types/feed";
import * as feedApi from "@/services/feed";

export const useFeedStore = defineStore("feed", () => {
  /** 动态列表 */
  const feedList = ref<FeedItem[]>([]);

  /** 是否正在加载 */
  const loading = ref(false);

  /** 是否还有更多 */
  const hasMore = ref(true);

  /**
   * 获取家庭动态列表
   */
  async function fetchFeedList(groupId: string, refresh = false) {
    loading.value = true;
    try {
      const offset = refresh ? 0 : feedList.value.length;
      const response = await feedApi.getFeedList({
        groupId,
        limit: 20,
        offset,
      });

      if (refresh) {
        feedList.value = response.items;
      } else {
        feedList.value.push(...response.items);
      }

      hasMore.value = response.hasMore;
      return response.items;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 添加新动态（本地）
   */
  function addFeedItem(item: FeedItem) {
    feedList.value.unshift(item);
  }

  /**
   * 清空动态列表
   */
  function clearFeed() {
    feedList.value = [];
    hasMore.value = true;
  }

  return {
    feedList,
    loading,
    hasMore,
    fetchFeedList,
    addFeedItem,
    clearFeed,
  };
});
