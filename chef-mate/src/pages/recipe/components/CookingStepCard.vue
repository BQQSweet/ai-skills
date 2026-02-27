<template>
  <view
    class="bg-white dark:bg-surface-dark rounded-[16px] p-4 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-50 dark:border-slate-800 transition-all active:scale-[0.99] relative overflow-hidden group"
  >
    <!-- QA Badge (visible when there's history) -->
    <view
      v-if="hasQa"
      class="absolute top-3 right-3 bg-ai-purple/10 text-ai-purple px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer z-20"
      @click="$emit('ask')"
    >
      <text class="material-symbols-outlined text-[12px]"
        >tips_and_updates</text
      >
      AI 已解答
    </view>

    <view class="flex gap-4 relative z-10 w-full mt-2">
      <view class="relative shrink-0 flex flex-col items-center">
        <view
          class="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm relative overflow-hidden"
        >
          <image
            v-if="step.img_url"
            :src="step.img_url"
            class="w-full h-full object-cover absolute inset-0"
            mode="aspectFill"
          />
          <text v-else class="material-symbols-outlined text-3xl z-10">{{
            dynamicIcon
          }}</text>
        </view>
        <view
          class="absolute -top-2 -left-2 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md z-20"
        >
          {{ index }}
        </view>
      </view>

      <view class="flex-1 pb-1">
        <text class="font-bold text-slate-800 dark:text-white mb-1 block pr-12">
          第 {{ index }} 步<span v-if="step.title">：{{ step.title }}</span>
        </text>
        <text
          class="text-sm text-slate-500 dark:text-slate-400 leading-snug block"
        >
          {{ step.instruction }}
        </text>
        <view class="flex flex-wrap gap-2 mt-3">
          <button
            class="m-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-100 dark:border-slate-700 transition-colors active:bg-slate-200 after:hidden"
            @click="$emit('ask')"
          >
            <text class="material-symbols-outlined text-ai-purple text-sm"
              >chat_bubble</text
            >
            <text>有问题问 AI</text>
          </button>

          <button
            v-if="step.duration_min"
            class="m-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors active:opacity-70 text-primary border border-primary/20 bg-primary/5 after:hidden"
          >
            <text class="material-symbols-outlined text-sm">timer</text>
            <text>{{ formatDuration(step.duration_min) }}</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  step: any;
  index: number;
  isLast: boolean;
  hasQa: boolean;
}>();

defineEmits<{
  (e: "ask"): void;
}>();

const formatDuration = (min: number) => {
  if (!min) return "";
  const m = Math.floor(min);
  const s = Math.round((min - m) * 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

// 根据步骤文本动态推测合适的图标
const dynamicIcon = computed(() => {
  const text = props.step.instruction || "";

  if (/(切|剁|拍|削|刀)/.test(text)) return "content_cut"; // 刀工类 -> 剪刀/刀具代词
  if (/(洗|清|浸|泡)/.test(text)) return "water_drop"; // 水洗类
  if (/(煮|炖|熬|焯|烫|焖)/.test(text)) return "cooking"; // 炖煮类
  if (/(炒|煎|炸|爆|煸)/.test(text)) return "skillet"; // 煎炒类
  if (/(烤|烘)/.test(text)) return "microwave"; // 烤箱类
  if (/(拌|调|腌)/.test(text)) return "blender"; // 混合类
  if (/(装盘|盛|倒|出锅)/.test(text)) return "restaurant_menu"; // 上菜类

  // 默认兜底（当以上均未匹配时）
  return "restaurant";
});
</script>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
.bg-card {
  background-color: #ffffff;
}
@media (prefers-color-scheme: dark) {
  .bg-card {
    background-color: #1e1e1e;
  }
}
</style>
