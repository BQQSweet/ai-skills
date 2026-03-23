<template>
  <view
    class="overflow-hidden rounded-[36rpx] border border-white/75 bg-white/72 p-5 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.16)] backdrop-blur-[18px]"
  >
    <view class="grid grid-cols-2 gap-3">
      <button
        class="m-0 flex flex-col items-center justify-center gap-2 rounded-[28rpx] border border-white/25 bg-[#ff9d0a] px-4 py-5 text-center shadow-[0_14px_34px_-20px_rgba(255,157,10,0.75)] transition-transform after:hidden active:scale-[0.98]"
        @click="$emit('pick-local')"
      >
        <text class="material-symbols-outlined text-[30px] text-white"
          >video_library</text
        >
        <text class="text-sm font-bold tracking-[0.08em] text-white"
          >本地视频</text
        >
      </button>
      <view
        class="flex flex-col items-center justify-center gap-2 rounded-[28rpx] border border-slate-200/70 bg-white/40 px-4 py-5 text-center opacity-70"
      >
        <text class="material-symbols-outlined text-[30px] text-slate-400"
          >link</text
        >
        <text class="text-sm font-semibold text-slate-400">视频链接</text>
        <text
          class="rounded-full bg-slate-900/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500"
        >
          即将开启
        </text>
      </view>
    </view>

    <!-- <button
      class="mt-4 m-0 flex w-full flex-col items-center justify-center gap-4 rounded-[32rpx] border-2 border-dashed border-[#ff9d0a]/25 bg-[linear-gradient(180deg,#fffaf2_0%,#fff4e3_100%)] px-5 py-9 text-center shadow-[0_16px_36px_-28px_rgba(15,23,42,0.16)] after:hidden active:scale-[0.995]"
      @click="$emit('pick-local')"
    >
      <view
        class="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_16px_30px_-18px_rgba(255,157,10,0.4)]"
      >
        <text class="material-symbols-outlined text-[46px] text-[#ff9d0a]">
          cloud_upload
        </text>
      </view>
      <view>
        <text class="block text-lg font-bold text-slate-900">
          点击选择做菜视频
        </text>
        <text class="mt-1.5 block text-sm leading-6 text-slate-500">
          支持 MP4 / MOV，最大 500MB，最长 30 分钟
        </text>
      </view>
    </button> -->

    <view class="mt-4 rounded-[28rpx] bg-[#fff7eb] p-4">
      <view class="flex items-center flex-col justify-between gap-4">
        <view class="min-w-0 flex-1">
          <text
            class="block text-[11px] font-black uppercase tracking-[0.22em] text-[#c46f18]/70"
          >
            生成策略
          </text>
          <text class="mt-2 block text-sm leading-6 text-slate-500">
            严格模式尽量只保留视频中确认到的步骤；允许补全会在此基础上补少量 AI
            推断步骤。
          </text>
        </view>
        <view class="rounded-full bg-white/90 p-1">
          <view class="flex gap-1">
            <button
              class="m-0 rounded-full border-none px-4 py-2 text-xs font-semibold after:hidden"
              :class="
                mode === 'strict'
                  ? 'bg-[#ff9d0a] text-white shadow-[0_10px_18px_-12px_rgba(255,157,10,0.8)]'
                  : 'bg-transparent text-slate-500'
              "
              @click="$emit('update:mode', 'strict')"
            >
              严格模式
            </button>
            <button
              class="m-0 rounded-full border-none px-4 py-2 text-xs font-semibold after:hidden"
              :class="
                mode === 'assisted'
                  ? 'bg-[#ff9d0a] text-white shadow-[0_10px_18px_-12px_rgba(255,157,10,0.8)]'
                  : 'bg-transparent text-slate-500'
              "
              @click="$emit('update:mode', 'assisted')"
            >
              允许补全
            </button>
          </view>
        </view>
      </view>
    </view>

    <view
      v-if="selectedFile"
      class="mt-4 rounded-[28rpx] border border-[#ff9d0a]/10 bg-white p-4 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.2)]"
    >
      <view class="flex items-center justify-between gap-4">
        <view class="min-w-0 flex-1">
          <text
            class="block text-[11px] font-black uppercase tracking-[0.22em] text-[#c46f18]/70"
          >
            已选文件
          </text>
          <text class="mt-2 block truncate text-base font-bold text-slate-900">
            {{ selectedFile.name }}
          </text>
          <text class="mt-1 block text-xs leading-5 text-slate-500">
            {{
              `${formatDuration(selectedFile.duration)} · ${formatFileSize(selectedFile.size)}`
            }}
          </text>
        </view>
        <view
          class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[20rpx] bg-[#fff7eb] text-[#d97706]"
        >
          <image
            v-if="resolvedCoverUrl"
            :src="resolvedCoverUrl"
            class="h-full w-full"
            mode="aspectFill"
          />
          <text v-else class="material-symbols-outlined text-[28px]">
            video_file
          </text>
        </view>
      </view>
      <view class="mt-4 flex items-center justify-between gap-3">
        <text class="text-xs leading-5 text-slate-400">
          选错文件也没关系，开始解析前都可以重新选择。
        </text>
        <button
          class="m-0 flex h-9 w-9 items-center justify-center rounded-full border-none bg-[#ff5252]/8 text-[#ff5252] after:hidden disabled:opacity-40"
          :disabled="status === 'uploading' || status === 'processing'"
          @click="$emit('clear-file')"
        >
          <text class="material-symbols-outlined text-[20px]">cancel</text>
        </button>
      </view>
    </view>

    <view
      class="mt-4 flex items-center justify-between rounded-[28rpx] border border-slate-200/70 bg-slate-50/75 px-4 py-3 opacity-75"
    >
      <view class="min-w-0 flex-1">
        <text class="block text-sm font-semibold text-slate-700">
          视频链接（即将支持）
        </text>
        <text class="mt-1 block text-xs leading-5 text-slate-400">
          首版先支持本地文件。平台分享链接解析会在后续版本提供。
        </text>
      </view>
      <text class="material-symbols-outlined text-[22px] text-slate-300">
        link_off
      </text>
    </view>

    <view class="mt-5 flex gap-3">
      <button
        class="m-0 flex-1 rounded-full border border-[#f0b46a] bg-white px-4 py-3 text-sm font-semibold text-[#b45309] after:hidden active:bg-[#fff7eb]"
        @click="$emit('pick-local')"
      >
        选择本地视频
      </button>
      <button
        class="m-0 flex-[1.2] rounded-full border-none bg-[#ff9d0a] px-4 py-3 text-sm font-semibold tracking-[0.04em] text-white shadow-[0_18px_28px_-18px_rgba(255,157,10,0.9)] transition-all duration-300 after:hidden active:translate-y-[1px] active:scale-[0.985] disabled:bg-[#ffd8a1] disabled:text-white/90"
        :disabled="!canSubmit"
        @click="$emit('submit')"
      >
        {{ status === "uploading" ? "上传中..." : "开始解析" }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { resolveMediaUrl } from "@/utils/media";
import type {
  VideoRecipeMode,
  VideoRecipePageState,
  VideoRecipeSelectedFile,
} from "@/types/recipe";

const props = defineProps<{
  coverUrl?: string;
  status: VideoRecipePageState;
  selectedFile: VideoRecipeSelectedFile | null;
  canSubmit: boolean;
  mode: VideoRecipeMode;
}>();

defineEmits<{
  "pick-local": [];
  "clear-file": [];
  submit: [];
  "update:mode": [mode: VideoRecipeMode];
}>();

const resolvedCoverUrl = computed(() => resolveMediaUrl(props.coverUrl));

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(size / 1024, 1).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(duration: number) {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
</script>
