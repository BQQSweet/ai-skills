/**
 * 分页加载组合式函数
 */
import { ref } from 'vue';
import type { PaginatedData } from '@/types/api';

interface UsePaginationOptions<T> {
  /** 请求函数，接收 page 和 pageSize */
  fetchFn: (page: number, pageSize: number) => Promise<PaginatedData<T>>;
  /** 每页数量，默认 10 */
  pageSize?: number;
}

export function usePagination<T>(options: UsePaginationOptions<T>) {
  const { fetchFn, pageSize = 10 } = options;

  const list = ref<T[]>([]) as { value: T[] };
  const page = ref(1);
  const total = ref(0);
  const loading = ref(false);
  const finished = ref(false);

  /** 加载数据（首次或下拉刷新） */
  async function refresh() {
    page.value = 1;
    finished.value = false;
    loading.value = true;

    try {
      const res = await fetchFn(1, pageSize);
      list.value = res.list;
      total.value = res.total;
      finished.value = res.list.length >= res.total;
    } finally {
      loading.value = false;
    }
  }

  /** 加载更多（触底加载） */
  async function loadMore() {
    if (loading.value || finished.value) return;

    loading.value = true;
    page.value++;

    try {
      const res = await fetchFn(page.value, pageSize);
      list.value.push(...res.list);
      total.value = res.total;
      finished.value = list.value.length >= res.total;
    } finally {
      loading.value = false;
    }
  }

  return {
    list,
    page,
    total,
    loading,
    finished,
    refresh,
    loadMore,
  };
}
