<template>
  <view class="scan-camera">
    <!-- #ifdef APP-PLUS -->
    <!-- App 端：不使用 camera 组件，直接调用系统相机拍照 -->
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <!-- H5 端：使用 u-popup -->
    <u-popup
      :show="show"
      mode="bottom"
      @close="close"
      :customStyle="{ height: '100vh', backgroundColor: '#000' }"
    >
      <view class="flex flex-col h-screen bg-black relative">
        <!-- Top Bar -->
        <view
          class="absolute top-0 left-0 right-0 z-20 px-5 pt-14 pb-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent"
        >
          <view class="text-white active:opacity-70" @click="close">
            <text class="material-symbols-outlined text-[28px]"
              >arrow_back</text
            >
          </view>
          <text class="text-white font-bold text-lg">扫描食材标签</text>
          <view class="w-7"></view>
        </view>

        <!-- H5 Camera Area -->
        <view class="flex-1 flex items-center justify-center relative">
          <view
            v-if="!capturedImage"
            class="flex flex-col items-center justify-center gap-4"
          >
            <view class="p-6 bg-white/10 rounded-full">
              <text
                class="material-symbols-outlined text-white/70 text-[48px]"
                :style="{ fontVariationSettings: '\'FILL\' 1' }"
                >photo_camera</text
              >
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

          <!-- Scan Frame Overlay -->
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

        <!-- Hint -->
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

        <!-- Bottom Controls -->
        <view
          class="absolute bottom-0 left-0 right-0 z-20 pb-safe px-5 bg-gradient-to-t from-black/80 to-transparent"
        >
          <view class="flex items-center justify-center py-8">
            <button
              class="w-[72px] h-[72px] rounded-full bg-white border-4 border-white/30 flex items-center justify-center m-0 p-0 after:hidden active:scale-90 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              :class="isCapturing ? 'opacity-60' : ''"
              :disabled="isCapturing"
              @click="handleCapture"
            >
              <view
                v-if="isCapturing"
                class="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"
              ></view>
              <text
                v-else
                class="material-symbols-outlined text-primary text-[36px]"
                :style="{ fontVariationSettings: '\'FILL\' 1' }"
                >photo_camera</text
              >
            </button>
          </view>
        </view>
      </view>
    </u-popup>
    <!-- #endif -->

    <!-- Editor Popup (opened after recognition) -->
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
import { ref, watch } from "vue";
import { recognizeLabel } from "@/services/fridge";
import ScanResultEditor from "./ScanResultEditor.vue";
import type { RecognizedFridgeData } from "@/types/fridge";

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits(["update:show", "added"]);

// #ifdef APP-PLUS
// App 端：show 变为 true 时，直接调用系统相机/相册
watch(
  () => props.show,
  (val) => {
    if (val) {
      handleCapture();
    }
  },
);
// #endif

const uToastRef = ref();
const isCapturing = ref(false);
const capturedImage = ref("");
const showEditor = ref(false);
const recognizedData = ref<RecognizedFridgeData | null>(null);
const imageBase64 = ref("");

const close = () => {
  capturedImage.value = "";
  emit("update:show", false);
};

const onCameraError = (e: any) => {
  console.error("Camera error:", e);
  uToastRef.value?.show({ message: "相机启动失败", type: "error" });
};

const handleCapture = async () => {
  isCapturing.value = true;
  try {
    // 获取图片
    const imagePath = await getImage();
    if (!imagePath) {
      isCapturing.value = false;
      // #ifdef APP-PLUS
      // App-Plus 模式下无 UI，直接调用系统级相机。如果取消必须重置 show 为 false，否则再次点击无反应
      emit("update:show", false);
      // #endif
      return;
    }
    capturedImage.value = imagePath;

    // 转 Base64
    const base64 = await imageToBase64(imagePath);
    imageBase64.value = base64;

    // 调用 AI 识别
    uToastRef.value?.show({ message: "AI 正在识别中...", type: "loading" });
    const result = await recognizeLabel(base64);
    recognizedData.value = result as any;

    // 关闭相机，打开编辑弹窗
    emit("update:show", false);
    showEditor.value = true;
  } catch (e: any) {
    uToastRef.value?.show({ message: e.message || "识别失败", type: "error" });
    // #ifdef APP-PLUS
    emit("update:show", false);
    // #endif
  } finally {
    isCapturing.value = false;
  }
};

/** 获取图片路径 */
const getImage = (): Promise<string> => {
  return new Promise((resolve) => {
    chooseImageFallback(resolve);
  });
};

const chooseImageFallback = (resolve: (path: string) => void) => {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["camera", "album"],
    success: (res) => resolve(res.tempFilePaths[0]),
    fail: () => resolve(""),
  });
};

/** 将图片路径转为 Base64 */
const imageToBase64 = (path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // #ifdef APP-PLUS
    plus.io.resolveLocalFileSystemURL(path, (entry: any) => {
      entry.file((file: any) => {
        const reader = new plus.io.FileReader();
        reader.onloadend = (e: any) => {
          const base64 = e.target.result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = () => reject(new Error("读取文件失败"));
        reader.readAsDataURL(file);
      });
    });
    // #endif

    // #ifdef H5
    fetch(path)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.split(",")[1];
          resolve(base64);
        };
        reader.onerror = () => reject(new Error("读取文件失败"));
        reader.readAsDataURL(blob);
      })
      .catch(reject);
    // #endif
  });
};

const onItemAdded = () => {
  capturedImage.value = "";
  recognizedData.value = null;
  imageBase64.value = "";
  emit("added");
};
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
