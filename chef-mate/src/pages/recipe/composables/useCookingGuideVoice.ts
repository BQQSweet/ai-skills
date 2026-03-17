import { onMounted, onUnmounted, watch, type ComputedRef, type Ref } from "vue";
import { useTts } from "@/composables/useTts";
import { useVoiceCommand } from "@/composables/useVoiceCommand";
import type { RecipeStep } from "@/types/recipe";
import {
  GUIDE_PROCESS_COOLDOWN,
  GUIDE_TTS_RESUME_DELAY_MS,
} from "../constants/cooking-guide";

interface ToastValue {
  show?: (options: { type: string; message: string }) => void;
}

export function useCookingGuideVoice(options: {
  toastRef: Ref<ToastValue | null>;
  currentStepIndex: Ref<number>;
  currentStep: ComputedRef<RecipeStep | undefined>;
  steps: ComputedRef<RecipeStep[]>;
  nextStep: () => void;
  prevStep: () => void;
  toggleTimer: () => void;
  isTimerRunning: Ref<boolean>;
}) {
  const {
    isVoicePlaying,
    playStepAudio,
    prefetchNextStepAudio,
    prefetchPrevStepAudio,
    destroy,
  } = useTts();

  let lastProcessedCommand = "";
  let lastProcessedTime = 0;

  function showToast(type: string, message: string) {
    options.toastRef.value?.show?.({ type, message });
  }

  function processRecognizedText(text: string) {
    if (!text.trim()) return;

    const cmdUpper = text.toUpperCase();
    const now = Date.now();
    let commandType = "";

    if (cmdUpper.includes("下一步") || cmdUpper.includes("完成") || cmdUpper.includes("好的")) {
      commandType = "NEXT";
    } else if (cmdUpper.includes("上一步") || cmdUpper.includes("回退")) {
      commandType = "PREV";
    } else if (cmdUpper.includes("开始计时") || cmdUpper.includes("开始")) {
      commandType = "START";
    } else if (cmdUpper.includes("暂停计时") || cmdUpper.includes("暂停")) {
      commandType = "PAUSE";
    } else {
      commandType = "UNKNOWN";
    }

    if (
      commandType === lastProcessedCommand &&
      now - lastProcessedTime < GUIDE_PROCESS_COOLDOWN
    ) {
      return;
    }

    lastProcessedCommand = commandType;
    lastProcessedTime = now;

    switch (commandType) {
      case "NEXT":
        showToast("success", "下一步");
        options.nextStep();
        break;
      case "PREV":
        showToast("success", "上一步");
        options.prevStep();
        break;
      case "START":
        if (!options.isTimerRunning.value) {
          options.toggleTimer();
          showToast("success", "开始计时");
        }
        break;
      case "PAUSE":
        if (options.isTimerRunning.value) {
          options.toggleTimer();
          showToast("success", "暂停计时");
        }
        break;
      default:
        break;
    }
  }

  const voiceCommand = useVoiceCommand({
    onCommand: processRecognizedText,
    onError: (msg) => showToast("error", msg),
    onUnsupported: (msg) => showToast("warning", msg),
  });

  watch(
    options.currentStepIndex,
    () => {
      const wasListening = voiceCommand.isListening.value;
      if (wasListening) {
        voiceCommand.stopListening();
      }

      if (options.currentStep.value) {
        playStepAudio(
          options.currentStepIndex.value,
          options.currentStep.value.instruction || "",
          () => options.currentStepIndex.value,
        );
        prefetchNextStepAudio(options.currentStepIndex.value, options.steps.value);
        prefetchPrevStepAudio(options.currentStepIndex.value, options.steps.value);
      }

      if (wasListening) {
        setTimeout(() => {
          voiceCommand.startListening();
        }, GUIDE_TTS_RESUME_DELAY_MS);
      }
    },
    { immediate: true },
  );

  onMounted(() => {
    setTimeout(() => {
      voiceCommand.startListening();
    }, 1000);
  });

  onUnmounted(() => {
    destroy();
    voiceCommand.cleanup();
  });

  return {
    isVoicePlaying,
    isListening: voiceCommand.isListening,
  };
}
