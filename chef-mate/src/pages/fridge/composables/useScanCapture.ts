import { ref, watch } from "vue";
import { recognizeLabel } from "@/services/fridge";
import type { RecognizedFridgeData } from "@/types/fridge";

export function useScanCapture(options: {
  show: () => boolean;
  emit: (event: "update:show" | "added", ...args: any[]) => void;
  toastRef: { value?: any };
}) {
  const isCapturing = ref(false);
  const capturedImage = ref("");
  const showEditor = ref(false);
  const recognizedData = ref<RecognizedFridgeData | null>(null);
  const imageBase64 = ref("");

  watch(
    () => options.show(),
    (val) => {
      if (val) {
        void handleCapture();
      }
    },
  );

  function close() {
    capturedImage.value = "";
    options.emit("update:show", false);
  }

  async function handleCapture() {
    isCapturing.value = true;
    try {
      const imagePath = await getImage();
      if (!imagePath) {
        isCapturing.value = false;
        options.emit("update:show", false);
        return;
      }
      capturedImage.value = imagePath;

      const base64 = await imageToBase64(imagePath);
      imageBase64.value = base64;

      options.toastRef.value?.show({
        message: "AI 正在识别中...",
        type: "loading",
      });
      const result = await recognizeLabel(base64);
      recognizedData.value = result as any;

      options.emit("update:show", false);
      showEditor.value = true;
    } catch (e: any) {
      options.toastRef.value?.show({
        message: e.message || "识别失败",
        type: "error",
      });
      options.emit("update:show", false);
    } finally {
      isCapturing.value = false;
    }
  }

  function getImage(): Promise<string> {
    return new Promise((resolve) => {
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["camera", "album"],
        success: (res) => resolve(res.tempFilePaths[0]),
        fail: () => resolve(""),
      });
    });
  }

  function imageToBase64(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
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
    });
  }

  function onItemAdded() {
    capturedImage.value = "";
    recognizedData.value = null;
    imageBase64.value = "";
    options.emit("added");
  }

  return {
    isCapturing,
    capturedImage,
    showEditor,
    recognizedData,
    imageBase64,
    close,
    handleCapture,
    onItemAdded,
  };
}
