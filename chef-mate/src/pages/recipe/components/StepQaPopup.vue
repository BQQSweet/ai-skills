<template>
  <up-popup
    v-model:show="show"
    mode="bottom"
    round="24"
    :closeable="true"
    :safeAreaInsetBottom="false"
    zIndex="10075"
  >
    <view class="bg-card w-full h-[65vh] flex flex-col pt-4 relative">
      <view
        class="px-5 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0 pr-10"
      >
        <text class="text-lg font-bold text-slate-800 dark:text-white block mt-2">
          疑问解答
        </text>
        <text class="text-xs text-slate-500 line-clamp-1 mt-1">
          针对当前操作：{{ activeStep?.instruction }}
        </text>
      </view>

      <scroll-view
        scroll-y
        class="flex-1 px-5 pt-4 pb-20"
        :scroll-top="scrollTop"
      >
        <view
          v-if="!activeQaHistory || activeQaHistory.length === 0"
          class="flex flex-col items-center justify-center h-full opacity-60 pb-10"
        >
          <text class="material-symbols-outlined text-4xl mb-2 text-ai-purple">
            smart_toy
          </text>
          <text class="text-sm text-center text-slate-500">
            对这一步有任何疑惑都可以问我哦<br />比如："西红柿要切多大块？"
          </text>
        </view>

        <view v-else class="flex flex-col gap-4">
          <view
            v-for="(msg, idx) in activeQaHistory"
            :key="idx"
            class="flex flex-col"
            :class="msg.role === 'user' ? 'items-end' : 'items-start'"
          >
            <view
              class="max-w-[85%] rounded-2xl p-3 text-sm"
              :class="
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'
              "
            >
              {{ msg.content }}
            </view>
          </view>
          <view v-if="isAsking" class="flex flex-col items-start">
            <view
              class="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm p-3 flex gap-1 items-center"
            >
              <view
                class="w-2 h-2 rounded-full bg-ai-purple animate-bounce"
                style="animation-delay: 0s"
              ></view>
              <view
                class="w-2 h-2 rounded-full bg-ai-purple animate-bounce"
                style="animation-delay: 0.2s"
              ></view>
              <view
                class="w-2 h-2 rounded-full bg-ai-purple animate-bounce"
                style="animation-delay: 0.4s"
              ></view>
            </view>
          </view>
        </view>
      </scroll-view>

      <view
        class="absolute bottom-0 left-0 right-0 px-4 py-4 bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800 pb-safe flex items-center gap-3 z-[10080]"
      >
        <input
          v-model="questionInputModel"
          class="flex-1 bg-slate-100 dark:bg-slate-800 h-10 rounded-full px-4 text-sm"
          placeholder="输入你的问题..."
          :disabled="isAsking"
          @confirm="$emit('submit')"
          confirm-type="send"
          :adjust-position="true"
          :cursor-spacing="20"
        />
        <button
          @click="$emit('submit')"
          :disabled="!questionInput.trim() || isAsking"
          class="m-0 w-10 h-10 rounded-full bg-ai-purple text-white flex items-center justify-center disabled:opacity-50 transition-opacity after:hidden border-none shrink-0"
        >
          <text
            class="material-symbols-outlined text-[20px]"
            :style="{ fontVariationSettings: '\'FILL\' 1' }"
            >send</text
          >
        </button>
      </view>
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  show: boolean;
  activeStep: any;
  activeQaHistory: { role: "user" | "ai"; content: string }[];
  questionInput: string;
  isAsking: boolean;
  scrollTop: number;
}>();

const emit = defineEmits<{
  "update:show": [value: boolean];
  "update:questionInput": [value: string];
  submit: [];
}>();

const questionInputModel = computed({
  get: () => props.questionInput,
  set: (value: string) => emit("update:questionInput", value),
});

const show = computed({
  get: () => props.show,
  set: (value: boolean) => emit("update:show", value),
});
</script>
