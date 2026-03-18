<template>
  <view class="scan-camera">
    <u-popup
      :show="show"
      mode="bottom"
      @close="close"
      :customStyle="{ height: '100vh', backgroundColor: '#000' }"
    >
      <view class="flex flex-col h-screen bg-black relative">
        <ScanCameraHeader @close="close" />

        <view class="flex-1 flex items-center justify-center relative">
          <view
            v-if="!capturedImage"
            class="flex flex-col items-center justify-center gap-4"
          >
            <view class="p-6 bg-white/10 rounded-full">
              <text
                class="material-symbols-outlined text-white/70 text-[48px]"
                :style="{ fontVariationSettings: '\'FILL\' 1' }"
              >
                photo_camera
              </text>
            </view>
            <text class="text-white/60 text-sm">H5 环境暂不支持实时取景</text>
            <text class="text-white/40 text-xs">请点击下方按钮选择或拍照</text>
          </view>
          <image
            v-else
            :src="capturedImage"
            mode="aspectFit"
            class="w-full h-full"
          />

          <view
            class="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <view class="w-[280px] h-[200px] relative">
              <view
                class="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-primary rounded-tl-lg"
              ></view>
              <view
                class="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-primary rounded-tr-lg"
              ></view>
              <view
                class="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-primary rounded-bl-lg"
              ></view>
              <view
                class="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-primary rounded-br-lg"
              ></view>
              <view
                class="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-[scan_2s_ease-in-out_infinite]"
              ></view>
            </view>
          </view>
        </view>

        <view
          class="absolute left-0 right-0 z-20 flex justify-center"
          style="bottom: 180px"
        >
          <text
            class="text-white/70 text-sm bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm"
          >
            将食材标签对准扫描框
          </text>
        </view>

        <ScanCameraActions
          :is-capturing="isCapturing"
          @capture="handleCapture"
        />
      </view>
    </u-popup>

    <ScanResultEditor
      v-model:show="showEditor"
      :recognizedData="recognizedData"
      :imageBase64="imageBase64"
      @added="onItemAdded"
    />

    <up-toast ref="uToastRef"></up-toast>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ScanCameraActions from "./ScanCameraActions.vue";
import ScanCameraHeader from "./ScanCameraHeader.vue";
import ScanResultEditor from "./ScanResultEditor.vue";
import { useScanCapture } from "../composables/useScanCapture";

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits(["update:show", "added"]);

const uToastRef = ref();
const {
  isCapturing,
  capturedImage,
  showEditor,
  recognizedData,
  imageBase64,
  close,
  handleCapture,
  onItemAdded,
} = useScanCapture({
  show: () => props.show,
  emit: (event, ...args) => emit(event, ...args),
  toastRef: uToastRef,
});
</script>

<style scoped>
@keyframes scan {
  0%,
  100% {
    top: 10%;
  }
  50% {
    top: 85%;
  }
}
</style>
