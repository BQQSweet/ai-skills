<template>
  <view
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    class="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark steam-gradient overflow-hidden font-display text-white"
  >
    <!-- Header Navigation -->
    <CookingHeader
      :current-step="currentStepIndex + 1"
      :total-steps="totalSteps"
      :progress-percent="progressPercent"
      :can-go-prev="currentStepIndex > 0"
      @exit="exitGuide"
      @prev="prevStep"
    />

    <!-- Main Content Area -->
    <view
      class="flex-1 w-full z-20 overflow-hidden px-6 flex flex-col justify-center"
    >
      <!-- Instruction Card -->
      <view
        class="w-full bg-white dark:bg-surface-dark rounded-xl p-6 flex flex-col items-center text-center shadow-2xl shadow-primary/10 relative overflow-hidden shrink-0 mt-4 h-[40vh]"
      >
        <!-- Scrollable Instruction Text -->
        <view class="flex-1 w-full overflow-y-auto flex items-center justify-center mb-4">
          <text
            class="text-[#1a1a1a] dark:text-white text-3xl md:text-5xl font-black leading-tight tracking-tight"
          >
            步骤 {{ currentStepIndex + 1 }}：{{ currentStep?.instruction }}
          </text>
        </view>

        <!-- Voice Feedback Icon -->
        <view
          class="flex items-center gap-4 bg-primary/10 px-6 py-3 rounded-full transition-opacity shrink-0"
          :class="isVoicePlaying ? 'opacity-100' : 'opacity-50'"
        >
          <view
            class="voice-wave h-6"
            :class="{ 'is-playing': isVoicePlaying }"
          >
            <view class="wave-bar h-3"></view>
            <view class="wave-bar h-5"></view>
            <view class="wave-bar h-4"></view>
            <view class="wave-bar h-6"></view>
            <view class="wave-bar h-3"></view>
          </view>
          <text class="text-primary font-bold text-lg">
            {{ isVoicePlaying ? "正在为您朗读..." : "语音助手就绪" }}
          </text>
        </view>

        <!-- Subtle Decorative Element -->
        <view
          class="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none"
        ></view>
      </view>

      <!-- Timer & Control Section -->
      <view
        class="w-full flex-1 flex flex-col items-center justify-center min-h-0"
      >
        <template v-if="currentStep?.timer_required && currentStep?.duration_min">
          <!-- Giant Circular Timer -->
          <view
            class="relative flex items-center justify-center transform scale-90"
          >
            <!-- Progress Ring (SVG via CSS or View approximation in uni-app) -->
            <view
              class="w-56 h-56 relative rounded-full border-8 border-white/5 flex items-center justify-center"
            >
              <svg
                class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
              >
                <circle
                  class="text-primary transition-all duration-1000 linear"
                  cx="112"
                  cy="112"
                  fill="transparent"
                  r="104"
                  stroke="currentColor"
                  :stroke-dasharray="dashArray"
                  :stroke-dashoffset="dashOffset"
                  stroke-width="8"
                  stroke-linecap="round"
                ></circle>
              </svg>

              <!-- Timer Text & Play Button Container -->
              <view
                class="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10"
              >
                <text
                  class="text-5xl font-black tracking-tighter text-white font-mono"
                  >{{ formattedTime }}</text
                >
                <view
                  @click="toggleTimer"
                  class="mt-2 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40 active:scale-95 transition-transform cursor-pointer"
                >
                  <text
                    class="material-symbols-outlined text-background-dark text-4xl"
                    :style="{ fontVariationSettings: '\'FILL\' 1' }"
                    >{{ isTimerRunning ? "pause" : "play_arrow" }}</text
                  >
                </view>
              </view>
            </view>
          </view>
        </template>
        <template v-else>
          <view class="flex flex-col items-center justify-center opacity-50">
            <text class="material-symbols-outlined text-5xl mb-2"
              >check_circle</text
            >
            <text>此步骤无需计时</text>
          </view>
        </template>
      </view>
    </view>

    <!-- Fixed Bottom Action Bar -->
    <view
      class="p-6 pb-[calc(env(safe-area-inset-bottom)+20px)] w-full box-border z-20 shrink-0 flex gap-4"
    >
      <!-- Next Step Button -->
      <view
        @click="nextStep"
        class="flex-1 bg-primary hover:bg-primary/90 text-background-dark text-xl font-black py-4 rounded-xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
      >
        <text>{{ isLastStep ? "完成烹饪" : "下一步" }}</text>
        <text class="material-symbols-outlined text-2xl font-bold">{{
          isLastStep ? "done_all" : "arrow_forward"
        }}</text>
      </view>
    </view>

    <!-- Background Steam/Smoke Effect (Visual Decoration) -->
    <view
      class="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 overflow-hidden z-0"
    >
      <view
        class="absolute top-[20%] -left-[10%] w-[120%] h-[60%] bg-gradient-to-b from-transparent via-white/5 to-transparent blur-3xl transform rotate-12"
      ></view>
      <view
        class="absolute top-[40%] -right-[10%] w-[100%] h-[40%] bg-gradient-to-t from-transparent via-primary/5 to-transparent blur-3xl transform -rotate-6"
      ></view>
    </view>

    <!-- Timer End Modal -->
    <view
      v-if="showTimerEndModal"
      class="absolute inset-0 z-50 flex flex-col px-6 pb-12 pt-16"
      style="background: radial-gradient(circle at center, #FF9F0A 0%, #0a0a0a 100%)"
    >
      <!-- Header -->
      <view class="flex justify-center mb-8">
        <view class="flex flex-col items-center gap-2">
          <text class="text-white/80 text-lg font-bold tracking-widest uppercase">
            第{{ currentStepIndex + 1 }}步完成
          </text>
          <view class="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
            <view
              class="h-full bg-white rounded-full transition-all duration-300"
              :style="{ width: progressPercent + '%' }"
            ></view>
          </view>
        </view>
      </view>

      <!-- Main Content -->
      <view class="flex-1 flex flex-col items-center justify-center text-center">
        <view class="mb-12">
          <text class="text-6xl font-black text-white">
            🎉 时间到！
          </text>
        </view>

        <view class="w-full bg-white rounded-3xl p-8 shadow-2xl mb-12 transform scale-105">
          <text class="text-gray-500 text-sm font-bold tracking-widest mb-2 uppercase">
            立即执行
          </text>
          <text class="text-background-dark text-4xl font-black leading-tight block mt-2">
            {{ currentStep?.instruction }}
          </text>
          <view class="mt-6 flex justify-center">
            <text class="material-symbols-outlined text-primary text-5xl animate-bounce">
              soup_kitchen
            </text>
          </view>
        </view>
      </view>

      <!-- Footer Actions -->
      <view class="mt-auto">
        <view
          @click="handleTimerEndNext"
          class="w-full bg-primary text-background-dark text-2xl font-black py-7 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer animate-pulse"
        >
          <text>下一步</text>
          <text class="material-symbols-outlined text-3xl font-bold">arrow_forward</text>
        </view>
        <view
          @click="handleDelayTimer"
          class="w-full mt-6 text-white/60 font-bold text-lg text-center cursor-pointer"
        >
          延时 1 分钟
        </view>
      </view>

      <!-- Floating Particles -->
      <view class="absolute inset-0 pointer-events-none overflow-hidden">
        <view class="absolute w-3 h-3 bg-white rounded-sm opacity-60 animate-bounce" style="top: 15%; left: 10%;"></view>
        <view class="absolute w-4 h-4 bg-primary rounded-sm opacity-60 animate-bounce" style="top: 25%; right: 15%; animation-delay: 1s;"></view>
        <view class="absolute w-2 h-2 bg-white rounded-sm opacity-60 animate-bounce" style="bottom: 30%; left: 20%; animation-delay: 2s;"></view>
        <view class="absolute w-5 h-5 border-2 border-primary bg-transparent rounded-sm opacity-60 animate-bounce" style="top: 50%; right: 10%; animation-delay: 1.5s;"></view>
        <view class="absolute w-3 h-3 bg-white rounded-full opacity-60 animate-bounce" style="bottom: 15%; right: 25%; animation-delay: 0.5s;"></view>
      </view>
    </view>

    <up-toast ref="uToastRef"></up-toast>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, onMounted } from "vue";
import { useRecipeStore } from "@/stores/recipe";
import { useTts } from "@/composables/useTts";
import { useTimer } from "@/composables/useTimer";
import { useVoiceCommand } from "@/composables/useVoiceCommand";

const recipeStore = useRecipeStore();
const recipe = computed(() => recipeStore.currentRecipe);
const steps = computed(() => recipe.value?.steps || []);
const totalSteps = computed(() => steps.value.length);

const currentStepIndex = ref(0);
const currentStep = computed(() => steps.value[currentStepIndex.value]);
const isLastStep = computed(
  () => currentStepIndex.value === totalSteps.value - 1,
);

const progressPercent = computed(() => {
  if (totalSteps.value === 0) return 0;
  return ((currentStepIndex.value + 1) / totalSteps.value) * 100;
});

const uToastRef = ref();

// ---- Timer End State ----
const showTimerEndModal = ref(false);
let alertAudio: HTMLAudioElement | null = null;

// 播放提示音（循环）
const playAlertSound = () => {
  alertAudio = new Audio();
  // 使用系统提示音或自定义音频
  alertAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXvzn0pBSh+zPDajzsKElyx6OyrWBUIQ5zd8sFuJAUuhM/z24k2CBhku+zooVARC0yl4fG5ZRwFNo3V7859KQUofsz';
  alertAudio.loop = true; // 循环播放
  alertAudio.play().catch(e => console.log('Alert sound play failed:', e));
};

// 停止提示音
const stopAlertSound = () => {
  if (alertAudio) {
    alertAudio.pause();
    alertAudio.currentTime = 0;
    alertAudio = null;
  }
};

// ---- Composables ----
const {
  isVoicePlaying,
  playStepAudio,
  prefetchNextStepAudio,
  prefetchPrevStepAudio,
  destroy: destroyTts,
} = useTts();

const {
  timerSeconds,
  maxTimerSeconds,
  isTimerRunning,
  dashArray,
  dashOffset,
  formattedTime,
  setupTimer,
  toggleTimer,
  clearTimer,
} = useTimer(uToastRef, {
  onTimerEnd: () => {
    // 倒计时结束
    showTimerEndModal.value = true;
    playAlertSound();
    // 震动提醒
    uni.vibrateShort({ success: () => {} });
  }
});

// ---- Step Navigation ----
const nextStep = () => {
  if (isLastStep.value) {
    uToastRef.value?.show({
      type: "success",
      message: "恭喜完成烹饪！",
      complete() {
        uni.navigateBack();
      },
    });
    return;
  }
  currentStepIndex.value += 1;
};

const prevStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value -= 1;
  }
};

// ---- Voice Command Processing ----
let lastProcessedCommand = "";
let lastProcessedTime = 0;
const PROCESS_COOLDOWN = 1500; // 1.5秒内不重复处理相同类型的命令

const processRecognizedText = (text: string) => {
  if (!text.trim()) {
    return;
  }

  const cmdUpper = text.toUpperCase();
  const now = Date.now();

  // 提取命令类型
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

  // 防抖：检查是否是重复命令
  if (commandType === lastProcessedCommand && now - lastProcessedTime < PROCESS_COOLDOWN) {
    console.log("[Guide] Duplicate command ignored:", commandType);
    return;
  }

  // 更新最后处理的命令和时间
  lastProcessedCommand = commandType;
  lastProcessedTime = now;

  // 执行命令
  switch (commandType) {
    case "NEXT":
      uToastRef.value?.show({ type: "success", message: "下一步" });
      nextStep();
      break;
    case "PREV":
      uToastRef.value?.show({ type: "success", message: "上一步" });
      prevStep();
      break;
    case "START":
      if (!isTimerRunning.value) {
        toggleTimer();
        uToastRef.value?.show({ type: "success", message: "开始计时" });
      }
      break;
    case "PAUSE":
      if (isTimerRunning.value) {
        toggleTimer();
        uToastRef.value?.show({ type: "success", message: "暂停计时" });
      }
      break;
    default:
      // 未识别的指令不给用户反馈，可能是杂音
      console.log("[Guide] Unrecognized command ignored:", text);
  }
};

// ---- Voice Command (后台自动运行) ----
const { isListening, startListening, stopListening, cleanup: cleanupCommand } =
  useVoiceCommand({
    onCommand: processRecognizedText,
    onError: (msg: string) => uToastRef.value?.show({ type: "error", message: msg }),
    onUnsupported: (msg: string) => uToastRef.value?.show({ type: "warning", message: msg }),
  });

// ---- Step watcher: setup timer + TTS ----
watch(
  currentStepIndex,
  () => {
    clearTimer();

    // 暂停语音识别，避免TTS被识别
    const wasListening = isListening.value;
    if (wasListening) {
      stopListening();
    }

    if (currentStep.value) {
      playStepAudio(
        currentStepIndex.value,
        currentStep.value.instruction || "",
        () => currentStepIndex.value,
      );
      // 预加载下一步和上一步的语音
      prefetchNextStepAudio(currentStepIndex.value, steps.value);
      prefetchPrevStepAudio(currentStepIndex.value, steps.value);
    }
    setupTimer(currentStep.value?.duration_min);

    // TTS播放完成后重新启动语音识别
    if (wasListening) {
      setTimeout(() => {
        startListening();
      }, 5000); // 等待5秒（TTS播放时间）
    }
  },
  { immediate: true },
);

// 页面加载时自动启动语音识别
onMounted(() => {
  setTimeout(() => {
    startListening();
  }, 1000);
});

// ---- Gesture Controls ----
const startX = ref(0);
const startY = ref(0);
const SWIPE_THRESHOLD = 50;

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches?.length > 0) {
    startX.value = e.touches[0].clientX;
    startY.value = e.touches[0].clientY;
  }
};

const handleTouchEnd = (e: TouchEvent) => {
  if (e.changedTouches?.length > 0) {
    const diffX = e.changedTouches[0].clientX - startX.value;
    const diffY = e.changedTouches[0].clientY - startY.value;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > SWIPE_THRESHOLD) {
      diffX > 0 ? prevStep() : nextStep();
    }
  }
};

const exitGuide = () => {
  uni.navigateBack();
};

const handleTimerEndNext = () => {
  stopAlertSound();
  showTimerEndModal.value = false;
  nextStep();
};

const handleDelayTimer = () => {
  stopAlertSound();
  showTimerEndModal.value = false;
  // Add 1 minute (60 seconds) to current timer
  timerSeconds.value += 60;
  maxTimerSeconds.value += 60;
  // Restart timer if not running
  if (!isTimerRunning.value) {
    toggleTimer();
  }
};

onUnmounted(() => {
  clearTimer();
  destroyTts();
  cleanupCommand();
});
</script>

<style scoped>
.steam-gradient {
  background: radial-gradient(
    circle at 50% 120%,
    rgba(255, 157, 10, 0.08) 0%,
    rgba(10, 10, 10, 0) 70%
  );
  /* Fallback dark background */
  background-color: theme('colors.background.cooking');
}
.voice-wave {
  display: flex;
  align-items: center;
  gap: 3px;
}
.wave-bar {
  width: 3px;
  background-color: theme('colors.primary.DEFAULT');
  border-radius: 99px;
  animation: pulse 1.5s infinite ease-in-out alternate;
}
.wave-bar:nth-child(1) {
  animation-delay: 0.1s;
}
.wave-bar:nth-child(2) {
  animation-delay: 0.3s;
}
.wave-bar:nth-child(3) {
  animation-delay: 0s;
}
.wave-bar:nth-child(4) {
  animation-delay: 0.4s;
}
.wave-bar:nth-child(5) {
  animation-delay: 0.2s;
}

@keyframes pulse {
  0% {
    transform: scaleY(0.5);
  }
  100% {
    transform: scaleY(1.5);
  }
}
</style>
