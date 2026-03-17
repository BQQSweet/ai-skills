<template>
  <CmPageShell
    title="语音语言设置"
    :background-class="
      'relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark font-display text-slate-900 pb-50'
    "
    :header-class="
      'z-30 px-4 pt-6 pb-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md'
    "
    :use-scroll-view="false"
    :content-padding-class="'px-6 py-4'"
    :footer-class="
      'fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-background-dark/90 backdrop-blur-lg px-6 pt-4 pb-10 flex flex-col gap-3 border-t border-slate-50 dark:border-slate-800'
    "
    :header-offset-class="'pt-[72px]'"
    @back="goBack"
  >
    <template #left>
      <button
        @click="goBack"
        class="flex h-10 w-10 p-0 m-0 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 after:border-none"
      >
        <text
          class="material-symbols-outlined text-slate-600 dark:text-slate-300"
        >
          chevron_left
        </text>
      </button>
    </template>

      <view class="mb-6">
        <text
          class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1 block"
        >
          选择识别语种
        </text>
        <text class="text-xs text-slate-400 block">
          ChefMate 将使用选定的语言与您进行语音交互
        </text>
      </view>

      <view class="flex flex-col gap-3">
        <view
          v-for="opt in languageOptions"
          :key="opt.value"
          @click="selectLanguage(opt.value)"
          :class="[
            'relative flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all duration-200',
            selectedLanguage === opt.value
              ? 'border-primary bg-orange-50/50 dark:bg-orange-900/10 ring-1 ring-primary/20 shadow-[0_0_15px_rgba(255,159,10,0.1)]'
              : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700',
          ]"
        >
          <view class="flex flex-col">
            <text
              :class="[
                'text-base font-bold',
                selectedLanguage === opt.value
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-700 dark:text-slate-200',
              ]"
            >
              {{ opt.label }}
            </text>
            <text class="text-xs text-slate-400 mt-0.5">
              {{ opt.desc }}
            </text>
          </view>

          <view
            v-if="selectedLanguage === opt.value"
            class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white"
          >
            <text class="material-symbols-outlined text-sm font-bold"
              >check</text
            >
          </view>
          <view
            v-else
            class="h-6 w-6 rounded-full border-2 border-slate-100 dark:border-slate-700"
          ></view>
        </view>
      </view>

      <view class="mt-8 p-5 bg-primary/5 rounded-2xl border border-primary/10">
        <view class="flex items-center gap-2 mb-2">
          <text class="material-symbols-outlined text-primary text-lg"
            >lightbulb</text
          >
          <text class="text-sm font-bold text-primary">小贴士</text>
        </view>
        <text class="text-xs text-slate-500 leading-relaxed block">
          选择方言后，系统底层的语音识别和未来的语音合成将尽量切换为对应方言。对于普通
          H5 环境，最终效果取决于设备浏览器的支持度。
        </text>
      </view>
    <template #footer>
      <button
        @click="testVoiceRecognition"
        class="flex items-center justify-center gap-2 w-full h-14 bg-transparent rounded-full border-2 border-primary text-primary font-bold m-0 p-0 after:border-none active:bg-primary/5"
      >
        <text class="material-symbols-outlined text-xl">brand_awareness</text>
        语音测试
      </button>
      <button
        @click="saveSettings"
        class="flex items-center justify-center w-full h-14 rounded-full bg-primary text-white font-bold shadow-lg shadow-primary/25 m-0 p-0 after:border-none active:scale-[0.98] transition-transform"
      >
        确认保存
      </button>
    </template>
    <up-toast ref="uToastRef"></up-toast>
  </CmPageShell>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRecipeStore } from "@/stores/recipe";

const recipeStore = useRecipeStore();
const uToastRef = ref();

const languageOptions = [
  { value: "zh-cn", label: "普通话 (默认)", desc: "标准语音交互，识别率最高" },
  { value: "cantonese", label: "粤语", desc: "地道广味，老广煲汤助手" },
  { value: "sichuan", label: "四川话", desc: "亲切巴适，川菜大厨首选" },
  { value: "dongbei", label: "东北话", desc: "豪爽直爽，厨房气氛担当" },
  { value: "henan", label: "河南话", desc: "中原气派，厚重实在的声音" },
];

const selectedLanguage = ref("zh-cn");

onMounted(() => {
  // Initialize with the current store value or default payload
  selectedLanguage.value = recipeStore.speechLanguage || "zh-cn";
});

const selectLanguage = (val: string) => {
  selectedLanguage.value = val;
};

const testVoiceRecognition = () => {
  // In a real app we'd dispatch a quick test or open the voice recording modal right here
  uToastRef.value?.show({
    type: "default",
    message: "即将支持语音沙盒模拟测试",
  });
};

const saveSettings = () => {
  // Update Pinia state and persist to storage
  recipeStore.setSpeechLanguage(selectedLanguage.value);
  uToastRef.value?.show({
    type: "success",
    message: "语音设置已保存",
  });
  setTimeout(() => {
    uni.navigateBack();
  }, 1000);
};

const goBack = () => {
  uni.navigateBack();
};
</script>
