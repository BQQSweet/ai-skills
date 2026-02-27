<template>
  <view
    class="bg-white dark:bg-surface-dark rounded-3xl p-1 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 relative overflow-hidden mb-6 transition-all"
    :class="isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'"
  >
    <view
      class="absolute -top-10 -right-10 w-32 h-32 bg-[#8B5CF6]/20 blur-[30px] rounded-full pointer-events-none"
    ></view>

    <!-- Recipe Image Header -->
    <view class="relative h-64 w-full rounded-2xl overflow-hidden group">
      <image
        class="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105"
        src="/static/images/https---www-recraft-ai-styles-c9620e40-3b4d-4afa-a.png"
        mode="aspectFill"
      ></image>
      <view
        class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"
      ></view>

      <view class="absolute bottom-4 left-4 flex gap-2">
        <view
          class="flex items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10"
        >
          <text class="material-symbols-outlined text-white text-[16px]"
            >schedule</text
          >
          <text class="text-xs font-bold text-white"
            >{{ recipe.cook_time || 15 }} 分钟</text
          >
        </view>
        <view
          class="flex items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10"
        >
          <text class="material-symbols-outlined text-primary text-[16px]"
            >local_fire_department</text
          >
          <text class="text-xs font-bold text-white"
            >难度：{{ recipe.difficulty || "未知" }}</text
          >
        </view>
      </view>
    </view>

    <!-- Recipe Info -->
    <view class="p-5">
      <view class="flex justify-between items-start mb-3">
        <text
          class="text-2xl font-bold text-slate-800 dark:text-white font-display tracking-tight leading-tight flex-1"
        >
          {{ recipe.title }}
        </text>
        <view
          class="flex items-center gap-1 text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-2.5 py-1 rounded-lg shrink-0 ml-3"
        >
          <text
            class="material-symbols-outlined text-[16px]"
            :style="{ fontVariationSettings: '\'FILL\' 1' }"
            >group</text
          >
          <text class="text-xs font-bold">{{ recipe.servings || 2 }} 人份</text>
        </view>
      </view>

      <text
        class="block text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6"
      >
        {{ recipe.description }}
      </text>

      <!-- Tags Grid -->
      <view
        class="flex flex-wrap gap-2 py-4 border-y border-slate-100 dark:border-slate-700"
        v-if="recipe.tags && recipe.tags.length"
      >
        <view
          v-for="tag in recipe.tags"
          :key="tag"
          class="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium"
        >
          # {{ tag }}
        </view>
      </view>

      <!-- Start Cooking Button -->
      <view class="mt-6" @click="startCooking">
        <view
          class="w-full bg-slate-50 dark:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center gap-3 transition-colors"
        >
          <view
            class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary"
          >
            <text class="material-symbols-outlined text-[28px]">menu_book</text>
          </view>
          <view class="flex flex-col items-center text-center">
            <text class="text-slate-800 dark:text-white font-bold text-base"
              >查看完整烹饪步骤并开始</text
            >
            <text class="text-slate-400 text-xs mt-1.5"
              >共 {{ recipe.steps?.length || 0 }} 个详细步骤 · 包含 AI
              实时辅助</text
            >
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useRecipeStore } from "@/stores/recipe";

const props = defineProps<{
  recipe: any;
  isLoading: boolean;
}>();

const startCooking = () => {
  if (props.isLoading || !props.recipe) return;
  useRecipeStore().setCurrentRecipe(props.recipe);
  uni.navigateTo({
    url: "/pages/recipe/cooking-steps",
  });
};
</script>
