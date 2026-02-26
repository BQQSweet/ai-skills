<template>
  <div class="container">
    <a-card class="general-card" :title="isEdit ? '编辑食谱' : '新增食谱'">
      <template #extra>
        <a-space>
          <a-button type="outline" status="success" @click="handleOpenAiModal">
            <template #icon><icon-robot /></template>
            AI 一键生成
          </a-button>
          <a-button @click="handleBack">取消</a-button>
          <a-button
            type="primary"
            :loading="submitLoading"
            @click="handleSubmit"
          >
            {{ isEdit ? "保存修改" : "创建食谱" }}
          </a-button>
        </a-space>
      </template>

      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        layout="vertical"
        style="max-width: 800px"
      >
        <a-row :gutter="16">
          <a-col :span="16">
            <a-form-item field="title" label="食谱标题">
              <a-input v-model="formData.title" placeholder="请输入食谱标题" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="status" label="状态">
              <a-select v-model="formData.status">
                <a-option value="published">上架</a-option>
                <a-option value="draft">草稿</a-option>
                <a-option value="archived">下架</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item field="description" label="描述">
          <a-textarea
            v-model="formData.description"
            placeholder="请输入食谱描述"
            :max-length="500"
            show-word-limit
            :auto-size="{ minRows: 2, maxRows: 5 }"
          />
        </a-form-item>

        <a-form-item field="cover_url" label="封面图 URL">
          <a-input
            v-model="formData.cover_url"
            placeholder="请输入封面图链接"
          />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="difficulty" label="难度">
              <a-select v-model="formData.difficulty" placeholder="请选择难度">
                <a-option value="简单">简单</a-option>
                <a-option value="中等">中等</a-option>
                <a-option value="困难">困难</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="cook_time" label="烹饪时间（分钟）">
              <a-input-number
                v-model="formData.cook_time"
                :min="1"
                :max="600"
                placeholder="分钟"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="servings" label="份量（人份）">
              <a-input-number
                v-model="formData.servings"
                :min="1"
                :max="20"
                placeholder="人份"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item field="tags" label="标签">
          <a-input-tag
            v-model="formData.tags"
            placeholder="输入标签后按回车添加"
            allow-clear
          />
        </a-form-item>

        <!-- 食材列表 -->
        <a-form-item label="食材列表">
          <div style="width: 100%">
            <a-space
              v-for="(item, index) in formData.ingredients"
              :key="index"
              style="margin-bottom: 8px; width: 100%"
              align="start"
            >
              <a-input
                v-model="item.name"
                placeholder="食材名"
                style="width: 150px"
              />
              <a-input-number
                v-model="item.quantity"
                placeholder="数量"
                :min="0"
                style="width: 100px"
              />
              <a-input
                v-model="item.unit"
                placeholder="单位"
                style="width: 80px"
              />
              <a-checkbox v-model="item.optional">可选</a-checkbox>
              <a-button
                type="text"
                status="danger"
                size="small"
                @click="removeIngredient(index)"
              >
                <template #icon><icon-delete /></template>
              </a-button>
            </a-space>
            <a-button type="dashed" long @click="addIngredient">
              <template #icon><icon-plus /></template>
              添加食材
            </a-button>
          </div>
        </a-form-item>

        <!-- 步骤列表 -->
        <a-form-item label="烹饪步骤">
          <div style="width: 100%">
            <a-card
              v-for="(step, index) in formData.steps"
              :key="index"
              style="margin-bottom: 8px"
              size="small"
              :title="`步骤 ${index + 1}`"
            >
              <template #extra>
                <a-button
                  type="text"
                  status="danger"
                  size="small"
                  @click="removeStep(index)"
                >
                  <template #icon><icon-delete /></template>
                </a-button>
              </template>
              <a-textarea
                v-model="step.instruction"
                placeholder="请描述步骤操作"
                :auto-size="{ minRows: 1, maxRows: 3 }"
              />
              <a-row :gutter="8" style="margin-top: 8px">
                <a-col :span="12">
                  <a-input-number
                    v-model="step.duration_min"
                    :min="0"
                    placeholder="耗时（分钟）"
                    style="width: 100%"
                  />
                </a-col>
                <a-col :span="12">
                  <a-checkbox v-model="step.timer_required">
                    需要计时器
                  </a-checkbox>
                </a-col>
              </a-row>
            </a-card>
            <a-button type="dashed" long @click="addStep">
              <template #icon><icon-plus /></template>
              添加步骤
            </a-button>
          </div>
        </a-form-item>
      </a-form>
    </a-card>

    <a-modal
      v-model:visible="aiModalVisible"
      title="🤖 AI 一键生成食谱"
      @ok="handleGenerateAi"
      @cancel="handleCloseAiModal"
      :ok-loading="aiGenerating"
    >
      <a-form layout="vertical">
        <a-form-item
          label="你想做什么菜？"
          :help="
            aiGenerating
              ? 'AI 正在努力思考中，请稍候...'
              : '例如：低脂水煮鱼、家常番茄炒蛋'
          "
        >
          <a-textarea
            v-model="aiPrompt"
            placeholder="描述你想做的菜品、忌口或特定材料..."
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import {
  createRecipe,
  updateRecipe,
  getRecipeDetail,
  generateRecipeAi,
} from "@/api/recipe";

const route = useRoute();
const router = useRouter();
const formRef = ref();
const submitLoading = ref(false);

const aiModalVisible = ref(false);
const aiGenerating = ref(false);
const aiPrompt = ref("");

const handleOpenAiModal = () => {
  aiModalVisible.value = true;
};

const handleCloseAiModal = () => {
  aiModalVisible.value = false;
  aiPrompt.value = "";
};

const handleGenerateAi = async () => {
  if (!aiPrompt.value.trim()) {
    Message.warning("请输入你想做的菜品描述");
    return false;
  }

  aiGenerating.value = true;
  try {
    const res = await generateRecipeAi(aiPrompt.value);
    const result = res.data;

    // 回填表单数据
    formData.title = result.title || formData.title;
    formData.description = result.description || formData.description;
    formData.difficulty = ["简单", "中等", "困难"].includes(result.difficulty)
      ? result.difficulty
      : "中等";
    formData.cook_time = result.cook_time || formData.cook_time;
    formData.servings = result.servings || formData.servings;
    formData.tags = result.tags || formData.tags;

    if (result.ingredients && result.ingredients.length > 0) {
      formData.ingredients = result.ingredients;
    }

    if (result.steps && result.steps.length > 0) {
      // 保证 step 的必要字段完整性
      formData.steps = result.steps.map((s: any, idx: number) => ({
        order: idx + 1,
        instruction: s.instruction || "",
        duration_min: s.duration_min || 0,
        timer_required: s.timer_required || false,
      }));
    }

    Message.success("AI 生成成功，请核对并继续编辑");
    handleCloseAiModal();
    return true;
  } catch (err) {
    return false;
  } finally {
    aiGenerating.value = false;
  }
};

const isEdit = computed(() => !!route.params.id);

const formData = reactive({
  title: "",
  description: "",
  cover_url: "",
  difficulty: "简单",
  cook_time: 15,
  servings: 2,
  status: "published",
  tags: [] as string[],
  ingredients: [{ name: "", quantity: 1, unit: "个", optional: false }],
  steps: [
    { order: 1, instruction: "", duration_min: 0, timer_required: false },
  ],
});

const rules = {
  title: [{ required: true, message: "请输入食谱标题" }],
  difficulty: [{ required: true, message: "请选择难度" }],
  cook_time: [{ required: true, message: "请输入烹饪时间" }],
};

const addIngredient = () => {
  formData.ingredients.push({
    name: "",
    quantity: 1,
    unit: "个",
    optional: false,
  });
};

const removeIngredient = (index: number) => {
  formData.ingredients.splice(index, 1);
};

const addStep = () => {
  formData.steps.push({
    order: formData.steps.length + 1,
    instruction: "",
    duration_min: 0,
    timer_required: false,
  });
};

const removeStep = (index: number) => {
  formData.steps.splice(index, 1);
  // 重排 order
  formData.steps.forEach((s, i) => {
    s.order = i + 1;
  });
};

const handleSubmit = async () => {
  const errors = await formRef.value?.validate();
  if (errors) return;

  // 过滤空食材
  const ingredients = formData.ingredients.filter((i) => i.name.trim());
  // 过滤空步骤
  const steps = formData.steps.filter((s) => s.instruction.trim());

  if (ingredients.length === 0) {
    Message.warning("请至少添加一个食材");
    return;
  }
  if (steps.length === 0) {
    Message.warning("请至少添加一个步骤");
    return;
  }

  submitLoading.value = true;
  try {
    const payload = {
      ...formData,
      ingredients,
      steps,
    };

    if (isEdit.value) {
      await updateRecipe(route.params.id as string, payload);
      Message.success("食谱更新成功");
    } else {
      await createRecipe(payload);
      Message.success("食谱创建成功");
    }
    router.push({ name: "RecipeList" });
  } catch (err) {
    // interceptor will show error
  } finally {
    submitLoading.value = false;
  }
};

const handleBack = () => {
  router.back();
};

// 编辑模式：加载食谱详情
onMounted(async () => {
  if (isEdit.value) {
    try {
      const res = await getRecipeDetail(route.params.id as string);
      const data = res.data;
      formData.title = data.title;
      formData.description = data.description || "";
      formData.cover_url = data.cover_url || "";
      formData.difficulty = data.difficulty;
      formData.cook_time = data.cook_time;
      formData.servings = data.servings;
      formData.status = data.status;
      formData.tags = data.tags || [];
      formData.ingredients = (data.ingredients as any[]) || [];
      formData.steps = (data.steps as any[]) || [];
    } catch (err) {
      Message.error("加载食谱详情失败");
      router.back();
    }
  }
});
</script>

<style scoped>
.container {
  padding: 20px;
}
</style>
