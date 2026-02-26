<template>
  <div class="container">
    <a-card class="general-card" title="食谱列表">
      <template #extra>
        <a-button type="primary" @click="handleCreate">
          <template #icon><icon-plus /></template>
          新增食谱
        </a-button>
      </template>

      <!-- 搜索筛选 -->
      <a-row :gutter="16" style="margin-bottom: 16px">
        <a-col :span="8">
          <a-input
            v-model="searchForm.keyword"
            placeholder="搜索食谱名称"
            allow-clear
            @press-enter="fetchData"
          >
            <template #prefix><icon-search /></template>
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.status"
            placeholder="状态"
            allow-clear
            @change="fetchData"
          >
            <a-option value="published">已上架</a-option>
            <a-option value="draft">草稿</a-option>
            <a-option value="archived">已下架</a-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model="searchForm.difficulty"
            placeholder="难度"
            allow-clear
            @change="fetchData"
          >
            <a-option value="简单">简单</a-option>
            <a-option value="中等">中等</a-option>
            <a-option value="困难">困难</a-option>
          </a-select>
        </a-col>
        <a-col :span="2">
          <a-button type="primary" @click="fetchData">
            <template #icon><icon-search /></template>
            搜索
          </a-button>
        </a-col>
        <a-col :span="2">
          <a-button @click="resetSearch">重置</a-button>
        </a-col>
      </a-row>

      <!-- 表格 -->
      <a-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @page-change="handlePageChange"
      >
        <template #cover_url="{ record }">
          <a-image
            v-if="record.cover_url"
            :src="record.cover_url"
            width="60"
            height="40"
            fit="cover"
            style="border-radius: 4px"
          />
          <span v-else style="color: var(--color-text-3)">无封面</span>
        </template>

        <template #tags="{ record }">
          <a-space wrap>
            <a-tag
              v-for="tag in (record.tags || []).slice(0, 3)"
              :key="tag"
              size="small"
              color="orangered"
            >
              {{ tag }}
            </a-tag>
          </a-space>
        </template>

        <template #status="{ record }">
          <a-badge
            :status="statusMap[record.status]?.badge || 'default'"
            :text="statusMap[record.status]?.text || record.status"
          />
        </template>

        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-popconfirm
              content="确定要删除这个食谱吗？"
              @ok="handleDelete(record)"
            >
              <a-button type="text" status="danger" size="small">
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import {
  getRecipeList,
  deleteRecipe,
  RecipeItem,
  RecipeListQuery,
} from "@/api/recipe";

const router = useRouter();
const loading = ref(false);
const tableData = ref<RecipeItem[]>([]);

const searchForm = reactive<RecipeListQuery>({
  keyword: "",
  status: undefined,
  difficulty: undefined,
  page: 1,
  pageSize: 10,
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true,
});

const statusMap: Record<string, { badge: string; text: string }> = {
  published: { badge: "success", text: "已上架" },
  draft: { badge: "warning", text: "草稿" },
  archived: { badge: "default", text: "已下架" },
};

const columns = [
  { title: "封面", slotName: "cover_url", width: 100 },
  { title: "标题", dataIndex: "title", width: 200 },
  { title: "难度", dataIndex: "difficulty", width: 80 },
  {
    title: "烹饪时间",
    dataIndex: "cook_time",
    width: 100,
    render: ({ record }: any) => `${record.cook_time}分钟`,
  },
  { title: "份量", dataIndex: "servings", width: 80 },
  { title: "标签", slotName: "tags", width: 200 },
  { title: "状态", slotName: "status", width: 100 },
  { title: "操作", slotName: "actions", width: 150, fixed: "right" },
];

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getRecipeList({
      ...searchForm,
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
    tableData.value = res.data.list;
    pagination.total = res.data.total;
  } catch (err) {
    // interceptor will show error
  } finally {
    loading.value = false;
  }
};

const resetSearch = () => {
  searchForm.keyword = "";
  searchForm.status = undefined;
  searchForm.difficulty = undefined;
  pagination.current = 1;
  fetchData();
};

const handlePageChange = (page: number) => {
  pagination.current = page;
  fetchData();
};

const handleCreate = () => {
  router.push({ name: "RecipeCreate" });
};

const handleEdit = (record: RecipeItem) => {
  router.push({ name: "RecipeEdit", params: { id: record.id } });
};

const handleDelete = async (record: RecipeItem) => {
  try {
    await deleteRecipe(record.id);
    Message.success("删除成功");
    fetchData();
  } catch (err) {
    // interceptor will show error
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.container {
  padding: 20px;
}
</style>
