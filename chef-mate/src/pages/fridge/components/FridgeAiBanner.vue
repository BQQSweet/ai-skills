<template>
  <view>
    <!-- Entry Banner -->
    <view
      class="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#ffcc00] shadow-[0_0_20px_rgba(255,159,10,0.4)] p-4 flex items-center justify-between group active:scale-[0.98] transition-transform"
      @click="openPopup"
    >
      <view
        class="absolute inset-0 opacity-30"
        style="
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 200% 100%;
        "
      ></view>
      <view class="flex items-center gap-3 relative z-10">
        <view
          class="bg-white/20 p-2 rounded-xl backdrop-blur-md flex items-center justify-center"
        >
          <text
            class="material-symbols-outlined text-white text-2xl"
            :style="{ fontVariationSettings: '\'FILL\' 1' }"
            >magic_button</text
          >
        </view>
        <view>
          <text class="block text-white font-bold text-base leading-tight"
            >AI 灵感食谱</text
          >
          <text class="block text-white/80 text-xs mt-0.5"
            >用现有食材做道菜</text
          >
        </view>
      </view>
      <text class="material-symbols-outlined text-white relative z-10"
        >chevron_right</text
      >
    </view>

    <!-- Preferences Popup -->
    <up-popup
      v-model:show="showPopup"
      mode="bottom"
      round="24"
      :closeable="true"
      @close="showPopup = false"
    >
      <view class="p-5 pb-safe w-full bg-white dark:bg-surface-dark">
        <view class="text-center mb-6 mt-2">
          <text class="text-lg font-bold text-slate-800 dark:text-white"
            >定制专属灵感</text
          >
        </view>

        <!-- Meal Type -->
        <view class="mb-5">
          <view class="flex justify-between items-center mb-3">
            <text class="text-sm font-bold text-slate-700 dark:text-slate-200"
              >用餐场景</text
            >
            <text class="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded"
              >自动匹配当前时间</text
            >
          </view>
          <view class="flex flex-wrap gap-2">
            <view
              v-for="meal in mealOptions"
              :key="meal"
              @click="prefs.mealType = meal"
              class="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
              :class="
                prefs.mealType === meal
                  ? 'bg-primary text-white border-primary shadow-[0_4px_10px_rgba(255,159,10,0.3)]'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700'
              "
            >
              {{ meal }}
            </view>
          </view>
        </view>

        <!-- Taste -->
        <view class="mb-5">
          <text
            class="text-sm font-bold block text-slate-700 dark:text-slate-200 mb-3"
            >想要什么口味？（可选）</text
          >
          <view class="flex flex-wrap gap-2">
            <view
              v-for="taste in tasteOptions"
              :key="taste"
              @click="prefs.taste = taste === prefs.taste ? '' : taste"
              class="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
              :class="
                prefs.taste === taste
                  ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-[0_4px_10px_rgba(139,92,246,0.3)]'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700'
              "
            >
              {{ taste }}
            </view>
          </view>
        </view>

        <!-- Servings -->
        <view class="mb-8">
          <text
            class="text-sm font-bold block text-slate-700 dark:text-slate-200 mb-3"
            >用餐人数</text
          >
          <view
            class="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl w-max"
          >
            <view
              class="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center active:scale-95 touch-none"
              @click="prefs.servings > 1 && prefs.servings--"
            >
              <text
                class="material-symbols-outlined text-slate-600 dark:text-slate-300"
                >remove</text
              >
            </view>
            <text class="text-lg font-bold w-12 text-center"
              >{{ prefs.servings }} 人</text
            >
            <view
              class="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center active:scale-95 touch-none"
              @click="prefs.servings < 10 && prefs.servings++"
            >
              <text
                class="material-symbols-outlined text-slate-600 dark:text-slate-300"
                >add</text
              >
            </view>
          </view>
        </view>

        <button
          class="w-full bg-gradient-to-br mb-10 from-primary to-[#ffb340] text-white rounded-2xl h-14 font-bold text-base shadow-[0_4px_15px_rgba(255,159,10,0.25)] flex items-center justify-center gap-2 transform active:scale-[0.98] transition-transform m-0 after:hidden border-none"
          @click="confirmGenerate"
        >
          <text
            class="material-symbols-outlined text-[20px]"
            :style="{ fontVariationSettings: '\'FILL\' 1' }"
            >auto_awesome</text
          >
          开始生成食谱
        </button>
      </view>
    </up-popup>

    <up-toast ref="uToastRef"></up-toast>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

const props = defineProps<{
  ingredients?: string[];
}>();

const uToastRef = ref();
const showPopup = ref(false);

const mealOptions = ["早餐", "午餐", "下午茶", "晚餐", "夜宵"];
const tasteOptions = ["清淡", "减脂", "快手", "嗜辣", "酸甜", "浓郁"];

const prefs = reactive({
  mealType: "正餐",
  taste: "",
  servings: 2,
});

const calculateDefaultMealType = () => {
  const hour = new Date().getHours();
  // Simple heuristics
  if (hour >= 5 && hour < 10) return "早餐";
  if (hour >= 10 && hour < 14) return "午餐";
  if (hour >= 14 && hour < 17) return "下午茶";
  if (hour >= 17 && hour < 21) return "晚餐";
  return "夜宵";
};

const openPopup = () => {
  prefs.mealType = calculateDefaultMealType();
  showPopup.value = true;
};

const confirmGenerate = () => {
  showPopup.value = false;

  let queryObj: any = {};
  if (props.ingredients && props.ingredients.length > 0) {
    queryObj.ingredients = encodeURIComponent(
      JSON.stringify(props.ingredients),
    );
  }
  if (prefs.taste) {
    queryObj.taste = prefs.taste;
  }
  queryObj.mealType = prefs.mealType;
  queryObj.servings = prefs.servings;

  const queryString = Object.keys(queryObj)
    .map((key) => `${key}=${queryObj[key]}`)
    .join("&");

  uni.navigateTo({
    url: `/pages/fridge/ai-recipe${queryString ? "?" + queryString : ""}`,
  });
};
</script>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
