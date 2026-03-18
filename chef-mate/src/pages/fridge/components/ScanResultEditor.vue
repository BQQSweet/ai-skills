<template>
  <view class="scan-result-editor">
    <u-popup
      :show="show"
      mode="bottom"
      @close="close"
      :customStyle="{ backgroundColor: '#FAFAFA' }"
      round="24rpx"
    >
      <view class="flex flex-col max-h-[85vh]">
        <view
          class="pt-6 px-5 pb-4 bg-white flex items-center justify-between rounded-t-2xl"
        >
          <view class="flex items-center gap-3">
            <view class="text-slate-800 active:opacity-70" @click="close">
              <text class="material-symbols-outlined leading-none">close</text>
            </view>
            <text class="text-lg font-bold text-slate-900">确认食材信息</text>
          </view>
          <view v-if="isLoading" class="flex items-center gap-1.5 text-primary">
            <text class="text-xs font-medium animate-pulse">识别中...</text>
          </view>
        </view>

        <scroll-view scroll-y class="flex-1 px-5 py-4" style="height: 60vh">
          <ScanResultFields
            :categories="categories"
            :form="form"
            @pick="openPicker"
          />
        </scroll-view>

        <view class="p-5 bg-white border-t border-slate-100 pb-safe">
          <button
            class="w-full m-0 border-none after:hidden bg-primary text-white h-[56px] flex justify-center items-center rounded-2xl font-bold text-[17px] shadow-[0_10px_15px_-3px_rgba(255,159,10,0.3)] active:scale-[0.98] transition-transform"
            :class="isSubmitting ? 'opacity-70' : ''"
            :disabled="isSubmitting"
            @click="handleSubmit"
          >
            {{ isSubmitting ? "添加中..." : "确认添加" }}
          </button>
        </view>
      </view>
    </u-popup>

    <ScanResultDatePicker
      :show="showDatePicker"
      :value="pickerValue"
      @confirm="onDatePickerConfirm"
      @cancel="showDatePicker = false"
    />

    <up-toast ref="uToastRef"></up-toast>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ScanResultDatePicker from "./ScanResultDatePicker.vue";
import ScanResultFields from "./ScanResultFields.vue";
import { useScanResultForm } from "../composables/useScanResultForm";
import type { RecognizedFridgeData } from "@/types/fridge";

const props = defineProps<{
  show: boolean;
  recognizedData: RecognizedFridgeData | null;
  imageBase64: string;
}>();

const emit = defineEmits(["update:show", "added"]);

const uToastRef = ref();
const {
  isLoading,
  isSubmitting,
  categories,
  form,
  showDatePicker,
  pickerValue,
  openPicker,
  onDatePickerConfirm,
  close,
  handleSubmit,
} = useScanResultForm({
  recognizedData: () => props.recognizedData,
  imageBase64: () => props.imageBase64,
  emit: (event, ...args) => emit(event, ...args),
  toastRef: uToastRef,
});
</script>
