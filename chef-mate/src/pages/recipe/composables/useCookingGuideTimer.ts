import { computed, onUnmounted, ref, watch, type ComputedRef, type Ref } from "vue";
import { useTimer } from "@/composables/useTimer";
import { TIMER_ALERT_SOUND } from "../constants/cooking-guide";

interface ToastValue {
  show?: (options: { type: string; message: string }) => void;
}

export function useCookingGuideTimer(options: {
  toastRef: Ref<ToastValue | null>;
  currentStep: ComputedRef<{ duration_min?: number; timer_required?: boolean } | undefined>;
  currentStepIndex: Ref<number>;
  progressPercent: ComputedRef<number>;
  nextStep: () => void;
}) {
  const showTimerEndModal = ref(false);
  let alertAudio: HTMLAudioElement | null = null;

  function playAlertSound() {
    if (typeof Audio === "undefined") return;
    alertAudio = new Audio();
    alertAudio.src = TIMER_ALERT_SOUND;
    alertAudio.loop = true;
    alertAudio.play().catch((error) => {
      console.log("Alert sound play failed:", error);
    });
  }

  function stopAlertSound() {
    if (!alertAudio) return;
    alertAudio.pause();
    alertAudio.currentTime = 0;
    alertAudio = null;
  }

  const timer = useTimer(options.toastRef as Ref<any>, {
    onTimerEnd: () => {
      showTimerEndModal.value = true;
      playAlertSound();
      uni.vibrateShort({ success: () => {} });
    },
  });

  const showTimer = computed(
    () => Boolean(options.currentStep.value?.timer_required && options.currentStep.value?.duration_min),
  );

  watch(
    options.currentStep,
    (step) => {
      timer.clearTimer();
      timer.setupTimer(step?.duration_min);
    },
    { immediate: true },
  );

  function handleTimerEndNext() {
    stopAlertSound();
    showTimerEndModal.value = false;
    options.nextStep();
  }

  function handleDelayTimer() {
    stopAlertSound();
    showTimerEndModal.value = false;
    timer.timerSeconds.value += 60;
    timer.maxTimerSeconds.value += 60;
    if (!timer.isTimerRunning.value) {
      timer.toggleTimer();
    }
  }

  onUnmounted(() => {
    timer.clearTimer();
    stopAlertSound();
  });

  return {
    ...timer,
    showTimerEndModal,
    showTimer,
    handleTimerEndNext,
    handleDelayTimer,
  };
}
