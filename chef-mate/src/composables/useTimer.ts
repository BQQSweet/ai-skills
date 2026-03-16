import { ref, computed, type Ref } from "vue";

interface ToastInstance {
  show: (options: { type: string; message: string }) => void;
}

interface TimerOptions {
  onTimerEnd?: () => void;
}

export function useTimer(uToastRef: Ref<ToastInstance | undefined>, options?: TimerOptions) {
  const timerSeconds = ref(0);
  const maxTimerSeconds = ref(0);
  const isTimerRunning = ref(false);
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  const radius = 120;
  const dashArray = 2 * Math.PI * radius;
  const dashOffset = computed(() => {
    if (maxTimerSeconds.value === 0) return dashArray;
    const progress = 1 - timerSeconds.value / maxTimerSeconds.value;
    return dashArray * progress;
  });

  const formattedTime = computed(() => {
    const m = Math.floor(timerSeconds.value / 60);
    const s = timerSeconds.value % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  });

  const setupTimer = (durationMin?: number) => {
    clearTimer();
    if (durationMin) {
      const totalSecs = Math.round(durationMin * 60);
      maxTimerSeconds.value = totalSecs;
      timerSeconds.value = totalSecs;
    } else {
      maxTimerSeconds.value = 0;
      timerSeconds.value = 0;
    }
  };

  const toggleTimer = () => {
    if (!maxTimerSeconds.value) return;

    // 如果已经是0，不允许启动
    if (timerSeconds.value === 0 && !isTimerRunning.value) return;

    if (isTimerRunning.value) {
      if (timerInterval) clearInterval(timerInterval);
      isTimerRunning.value = false;
    } else {
      isTimerRunning.value = true;
      timerInterval = setInterval(() => {
        timerSeconds.value--;
        if (timerSeconds.value <= 0) {
          if (timerInterval) clearInterval(timerInterval);
          isTimerRunning.value = false;
          timerSeconds.value = 0; // 确保不会变成负数
          // 触发倒计时结束回调
          options?.onTimerEnd?.();
        }
      }, 1000);
    }
  };

  const clearTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    isTimerRunning.value = false;
  };

  return {
    timerSeconds,
    maxTimerSeconds,
    isTimerRunning,
    dashArray,
    dashOffset,
    formattedTime,
    setupTimer,
    toggleTimer,
    clearTimer,
  };
}
