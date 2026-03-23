<template>
  <view
    class="rounded-[36rpx] border border-white/75 bg-white/72 p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.16)] backdrop-blur-[18px]"
  >
    <view class="flex items-end justify-between gap-4">
      <view>
        <text class="block text-[24px] italic leading-none text-slate-900 text-notoserifsc">
          正在深度解析...
        </text>
        <text class="mt-3 block text-sm leading-6 text-slate-500">
          {{
            selectedFile
              ? `当前文件：${selectedFile.name}`
              : "任务已提交，正在为你分析视频内容。"
          }}
        </text>
      </view>
      <view class="text-right">
        <text class="block text-3xl font-black text-[#ff9d0a]">
          {{ progressValue }}%
        </text>
        <text class="mt-1 block text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
          {{ stageLabel }}
        </text>
      </view>
    </view>

    <view class="mt-6 h-2 overflow-hidden rounded-full bg-[#ff9d0a]/10">
      <view
        class="h-full rounded-full bg-[linear-gradient(90deg,#ffb648_0%,#ff8f3c_55%,#ef7c42_100%)] transition-all duration-500"
        :style="{ width: `${progressValue}%` }"
      ></view>
    </view>

    <view class="mt-6 grid grid-cols-4 gap-3">
      <view
        v-for="step in stageSteps"
        :key="step.key"
        class="flex flex-col items-center gap-2 text-center"
      >
        <view
          class="h-3 w-3 rounded-full transition-all"
          :class="step.dotClass"
        ></view>
        <text class="block text-[11px] font-bold" :class="step.labelClass">
          {{ step.label }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type {
  VideoRecipeJobStatus,
  VideoRecipePageState,
  VideoRecipeSelectedFile,
} from "@/types/recipe";

const props = defineProps<{
  status: VideoRecipePageState;
  job: VideoRecipeJobStatus | null;
  selectedFile: VideoRecipeSelectedFile | null;
}>();

const progressValue = computed(() => {
  if (props.status === "uploading") {
    return 8;
  }
  return props.job?.progress || 0;
});

const stageLabel = computed(() => {
  if (props.status === "uploading") {
    return "上传中";
  }

  const map = {
    validating: "校验任务",
    extracting: "抽取关键帧",
    transcribing: "转写语音",
    analyzing: "生成食谱",
    saving: "保存结果",
  } as const;

  return props.job ? map[props.job.stage] : "准备中";
});

const stageSteps = computed(() => {
  const stage = props.job?.stage || "validating";
  const activeIndex =
    props.status === "uploading"
      ? 0
      : stage === "validating" || stage === "extracting"
        ? 1
        : stage === "transcribing"
          ? 2
          : 3;

  return [
    { key: "upload", label: "上传", icon: "upload_file" },
    { key: "extract", label: "抽帧", icon: "movie_edit" },
    { key: "transcribe", label: "转写", icon: "graphic_eq" },
    { key: "analyze", label: "生成", icon: "menu_book" },
  ].map((item, index) => {
    const isCompleted =
      props.status === "done" || props.status === "failed"
        ? index < activeIndex
        : index < activeIndex;
    const isActive =
      props.status !== "done" && props.status !== "failed" && index === activeIndex;

    return {
      ...item,
      dotClass: isActive || isCompleted
        ? "bg-[#ff9d0a] ring-4 ring-[#ff9d0a]/20"
        : "bg-slate-300/50",
      labelClass: isActive || isCompleted
        ? "text-slate-900"
        : "text-slate-400",
    };
  });
});
</script>
