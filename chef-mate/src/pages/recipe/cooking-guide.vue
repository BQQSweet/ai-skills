<template>
  <view
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    class="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark steam-gradient overflow-hidden font-display text-white"
  >
    <!-- Header Navigation -->
    <view
      class="flex items-center justify-between p-6 pt-[calc(env(safe-area-inset-top)+20px)] w-full box-border z-20"
    >
      <view
        @click="exitGuide"
        class="flex items-center gap-1 text-white/60 hover:text-white transition-colors cursor-pointer"
      >
        <text class="material-symbols-outlined text-2xl">close</text>
        <text class="text-lg font-medium">退出</text>
      </view>

      <view class="flex flex-col items-center gap-2">
        <text class="text-primary text-xl font-bold tracking-widest"
          >{{ currentStepIndex + 1 }} / {{ totalSteps }}</text
        >
        <view class="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <view
            class="h-full bg-primary rounded-full transition-all duration-300"
            :style="{ width: progressPercent + '%' }"
          ></view>
        </view>
      </view>

      <view
        @click="prevStep"
        class="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors cursor-pointer opacity-0"
        :class="{ 'opacity-100': currentStepIndex > 0 }"
      >
        <text class="material-symbols-outlined text-2xl">chevron_left</text>
        <text class="text-lg font-bold">上一步</text>
      </view>
    </view>

    <!-- Main Content Area -->
    <view
      class="flex-1 w-full z-20 overflow-hidden px-6 flex flex-col justify-center"
    >
      <!-- Instruction Card -->
      <view
        class="w-full bg-white dark:bg-surface-dark rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-2xl shadow-primary/10 relative overflow-hidden shrink-0 mt-4 h-[40vh]"
      >
        <!-- Instruction Text -->
        <text
          class="text-[#1a1a1a] dark:text-white text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6"
        >
          步骤 {{ currentStepIndex + 1 }}：{{ currentStep?.instruction }}
        </text>

        <!-- Voice Feedback Icon -->
        <view
          class="flex items-center gap-4 bg-primary/10 px-6 py-3 rounded-full transition-opacity"
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
        <template v-if="currentStep?.duration_min">
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
      <!-- Voice Control Button -->
      <view
        @contextmenu.prevent="() => {}"
        @pointerdown.stop="startVoiceRecording"
        @pointerup.stop="stopVoiceRecording"
        @pointercancel.stop="stopVoiceRecording"
        @touchend.stop="stopVoiceRecording"
        @touchcancel.stop="stopVoiceRecording"
        class="flex-1 select-none bg-surface-dark dark:bg-surface-dark border-2 border-primary text-primary hover:bg-primary/10 text-xl font-black py-4 rounded-xl shadow-xl shadow-primary/10 transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer relative overflow-hidden"
        :class="{
          'bg-primary text-background-dark border-transparent': isRecording,
        }"
      >
        <view
          v-if="isRecording"
          class="absolute inset-0 bg-white/20 animate-pulse"
        ></view>
        <text class="material-symbols-outlined text-2xl z-10">{{
          isRecording ? "mic" : "mic_none"
        }}</text>
        <text class="z-10">{{ isRecording ? "松开发送" : "长按说话" }}</text>
      </view>

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

    <up-toast ref="uToastRef"></up-toast>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue";
import { useRecipeStore } from "@/stores/recipe";
import { getStepTts, parseCommandIntent } from "@/services/recipe";

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

// Timer logic
const timerSeconds = ref(0);
const maxTimerSeconds = ref(0);
const isTimerRunning = ref(false);
let timerInterval: any = null;

const radius = 120;
const dashArray = 2 * Math.PI * radius; // 753.98
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

const audioCache = ref<Record<number, string>>({});

const isVoicePlaying = ref(false);
const innerAudioContext = uni.createInnerAudioContext();
innerAudioContext.onPlay(() => {
  isVoicePlaying.value = true;
});
innerAudioContext.onEnded(() => {
  isVoicePlaying.value = false;
});
innerAudioContext.onError((res) => {
  console.error("Audio Play Error:", res);
  isVoicePlaying.value = false;
});

const playStepAudio = async (stepIndex: number, text: string) => {
  if (!text) return;
  isVoicePlaying.value = true; // Set to true early to show loading state if needed
  try {
    if (audioCache.value[stepIndex]) {
      // 命中缓存直接播放
      if (currentStepIndex.value === stepIndex) {
        innerAudioContext.src =
          "data:audio/mp3;base64," + audioCache.value[stepIndex];
        innerAudioContext.play();
      }
    } else {
      const res = await getStepTts(text);
      if (res?.audioBase64) {
        audioCache.value[stepIndex] = res.audioBase64;
        // 确保用户还在当前步骤才播放
        if (currentStepIndex.value === stepIndex) {
          innerAudioContext.src = "data:audio/mp3;base64," + res.audioBase64;
          innerAudioContext.play();
        }
      } else {
        if (currentStepIndex.value === stepIndex) isVoicePlaying.value = false;
      }
    }
  } catch (err) {
    console.error("Failed to generate TTS", err);
    if (currentStepIndex.value === stepIndex) isVoicePlaying.value = false;
  }
};

const prefetchNextStepAudio = async (currentIndex: number) => {
  const nextIndex = currentIndex + 1;
  if (nextIndex < totalSteps.value) {
    const nextText = steps.value[nextIndex]?.instruction;
    if (nextText && !audioCache.value[nextIndex]) {
      try {
        const res = await getStepTts(nextText);
        if (res?.audioBase64) {
          audioCache.value[nextIndex] = res.audioBase64;
        }
      } catch (err) {
        console.error("Failed to prefetch next TTS", err);
      }
    }
  }
};

const setupTimerForCurrentStep = () => {
  clearInterval(timerInterval);
  isTimerRunning.value = false;

  if (currentStep.value) {
    playStepAudio(currentStepIndex.value, currentStep.value.instruction || "");
    prefetchNextStepAudio(currentStepIndex.value);
  }

  if (currentStep.value?.duration_min) {
    const totalSecs = Math.round(currentStep.value.duration_min * 60);
    maxTimerSeconds.value = totalSecs;
    timerSeconds.value = totalSecs;
  } else {
    maxTimerSeconds.value = 0;
    timerSeconds.value = 0;
  }
};

watch(
  currentStepIndex,
  () => {
    setupTimerForCurrentStep();
  },
  { immediate: true },
);

const toggleTimer = () => {
  if (!maxTimerSeconds.value || timerSeconds.value === 0) return;

  if (isTimerRunning.value) {
    clearInterval(timerInterval);
    isTimerRunning.value = false;
  } else {
    isTimerRunning.value = true;
    timerInterval = setInterval(() => {
      if (timerSeconds.value > 0) {
        timerSeconds.value--;
      } else {
        clearInterval(timerInterval);
        isTimerRunning.value = false;
        uToastRef.value?.show({
          type: "success",
          message: "时间到！",
        });
        // 播放提示音 (可选)
      }
    }, 1000);
  }
};

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

// ------------------- Gesture Controls -------------------

const startX = ref(0);
const startY = ref(0);
const SWIPE_THRESHOLD = 50;

const handleTouchStart = (e: any) => {
  if (e.touches && e.touches.length > 0) {
    startX.value = e.touches[0].clientX;
    startY.value = e.touches[0].clientY;
  }
};

const handleTouchEnd = (e: any) => {
  if (e.changedTouches && e.changedTouches.length > 0) {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const diffX = endX - startX.value;
    const diffY = endY - startY.value;

    // Check if it's mostly a horizontal swipe
    if (
      Math.abs(diffX) > Math.abs(diffY) &&
      Math.abs(diffX) > SWIPE_THRESHOLD
    ) {
      if (diffX > 0) {
        // Swipe Right -> Prev
        prevStep();
      } else {
        // Swipe Left -> Next
        nextStep();
      }
    }
  }
};

// ------------------- Voice Controls -------------------

const isRecording = ref(false);
const isWeb = uni.getSystemInfoSync().uniPlatform === "web";

// H5 Web Speech Recognition
let recognition: any = null;
let finalH5Transcript = "";

// A mapped function to convert stored setting string to Speech Recognition codes
const getWebSpeechLangCode = (pref: string) => {
  switch (pref) {
    case "cantonese":
      return "zh-HK";
    case "sichuan":
      return "zh-CN"; // Most browsers don't have separate dialect codes, default to mainland
    case "dongbei":
      return "zh-CN";
    case "henan":
      return "zh-CN";
    default:
      return "zh-CN";
  }
};

if (isWeb) {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    // Default config, real value injected on 'start'
    recognition.lang = getWebSpeechLangCode(
      recipeStore.speechLanguage || "zh-cn",
    );
    recognition.continuous = true; // Keep listening until explicit stop
    recognition.interimResults = true; // Get real-time text to avoid dropping
  }
}

// ==== Process Recognized Text ====
const processRecognizedText = async (text: string) => {
  if (!text.trim()) {
    uToastRef.value?.show({
      type: "warning",
      message: "未听清，请大声一点",
    });
    return;
  }

  // 1. FAST PATH: Local keyword matching (100% Offline execution)
  const cmdUpper = text.toUpperCase();
  if (
    cmdUpper.includes("下一步") ||
    cmdUpper.includes("完成") ||
    cmdUpper.includes("好的")
  ) {
    uToastRef.value?.show({ type: "success", message: `指令: 下一步` });
    nextStep();
    return;
  }
  if (cmdUpper.includes("上一步") || cmdUpper.includes("回退")) {
    uToastRef.value?.show({ type: "success", message: `指令: 上一步` });
    prevStep();
    return;
  }
  if (cmdUpper.includes("开始计时")) {
    if (!isTimerRunning.value) toggleTimer();
    uToastRef.value?.show({ type: "success", message: `指令: 开始计时` });
    return;
  }
  if (cmdUpper.includes("暂停")) {
    if (isTimerRunning.value) toggleTimer();
    uToastRef.value?.show({ type: "success", message: `指令: 暂停计时` });
    return;
  }

  // 2. SLOW PATH: Send complex sentences to Cloud NLP
  try {
    uni.showLoading({ title: "语义分析中..." });
    const result = await parseCommandIntent(text);
    uni.hideLoading();

    if (result && result.command) {
      uToastRef.value?.show({
        type: result.command === "UNKNOWN" ? "warning" : "success",
        message:
          result.command === "UNKNOWN" ? `未能识别: ${text}` : `解析指令成功`,
      });

      if (result.command === "UNKNOWN") {
        try {
          const errorMsg =
            "对不起，我没听明白。您可以直接说下一步，或者暂停计时。";
          const errTtsRes = await getStepTts(errorMsg);
          if (errTtsRes?.audioBase64) {
            isVoicePlaying.value = true;
            innerAudioContext.src =
              "data:audio/mp3;base64," + errTtsRes.audioBase64;
            innerAudioContext.play();
          }
        } catch (e) {
          console.error("Failed to play error TTS", e);
        }
        return;
      }

      switch (result.command) {
        case "NEXT":
          nextStep();
          break;
        case "PREV":
          prevStep();
          break;
        case "START_TIMER":
          if (!isTimerRunning.value) toggleTimer();
          break;
        case "PAUSE_TIMER":
          if (isTimerRunning.value) toggleTimer();
          break;
      }
    }
  } catch (e: any) {
    uni.hideLoading();
    uToastRef.value?.show({
      type: "error",
      message: e.message || "指令未能被识别",
    });
  }
};

// H5 Event Bindings
if (recognition) {
  recognition.onstart = () => {
    console.log("H5 SpeechRecognition: STARTED");
    finalH5Transcript = "";
  };

  recognition.onspeechend = () => {
    console.log("H5 SpeechRecognition: SPEECH END DETECTED");
  };

  recognition.onresult = (event: any) => {
    let interimTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalH5Transcript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    // Only logging the buffer, actual processing happens on stop()
    console.log("H5 buffer updated:", finalH5Transcript || interimTranscript);

    // Fallback: If we have a final result and not recording, process it
    if (!isRecording.value && finalH5Transcript) {
      processRecognizedText(finalH5Transcript);
      finalH5Transcript = "";
    }
  };

  recognition.onerror = (event: any) => {
    isRecording.value = false;
    console.error("H5 SpeechRecognition: ERROR", event.error);
    if (event.error !== "aborted") {
      uToastRef.value?.show({
        type: "error",
        message: `语音识别发生错误: ${event.error}`,
      });
    }
  };

  recognition.onend = () => {
    console.log("H5 SpeechRecognition: ENDED");
    if (isRecording.value && finalH5Transcript) {
      processRecognizedText(finalH5Transcript);
      finalH5Transcript = "";
    }
    isRecording.value = false;
  };
}

const startVoiceRecording = async () => {
  if (isWeb) {
    if (!recognition) {
      uToastRef.value?.show({
        type: "warning",
        message:
          "当前浏览器不支持 Web Speech API，推荐使用 iOS Safari 或 Chrome",
      });
      return;
    }
    // H5 Branch
    try {
      finalH5Transcript = "";
      recognition.lang = getWebSpeechLangCode(
        recipeStore.speechLanguage || "zh-cn",
      );
      recognition.start();
      isRecording.value = true;
    } catch (e) {
      console.warn(e);
      isRecording.value = false;
    }
  } else {
    // App Branch Native Plus SDK
    // @ts-ignore
    if (typeof plus !== "undefined" && plus.speech) {
      isRecording.value = true;
      uni.vibrateShort({ success: () => {} });

      let engineLang = "zh-cn";
      if (recipeStore.speechLanguage === "cantonese") engineLang = "cantonese";
      if (recipeStore.speechLanguage === "sichuan") engineLang = "lmz"; // iFlyTek Sichuanese code

      // @ts-ignore
      plus.speech.startRecognize(
        // @ts-ignore
        { engine: "iFly", language: engineLang },
        (res: string) => {
          isRecording.value = false;
          // App Native Callback returns the result string immediately
          console.log("plus.speech res:", res);
          processRecognizedText(res);
        },
        (e: any) => {
          isRecording.value = false;
          console.error("plus.speech err:", e);
          uToastRef.value?.show({ type: "error", message: "原生识别失败" });
        },
      );
    } else {
      uToastRef.value?.show({
        type: "warning",
        message: "非 App 环境或未开启 plus.speech 模块",
      });
    }
  }
};

const stopVoiceRecording = () => {
  if (isWeb) {
    if (isRecording.value && recognition) {
      recognition.stop();
      if (finalH5Transcript) {
        processRecognizedText(finalH5Transcript);
        finalH5Transcript = "";
      }
    }
  } else {
    // @ts-ignore
    if (isRecording.value && typeof plus !== "undefined" && plus.speech) {
      // @ts-ignore
      plus.speech.stopRecognize();
    }
  }
  isRecording.value = false;
};

const exitGuide = () => {
  uni.navigateBack();
};

onUnmounted(() => {
  clearInterval(timerInterval);
  window.removeEventListener("pointerup", stopVoiceRecording);
  window.removeEventListener("touchend", stopVoiceRecording);
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
  background-color: #0a0a0a;
}
.voice-wave {
  display: flex;
  align-items: center;
  gap: 3px;
}
.wave-bar {
  width: 3px;
  background-color: #ff9d0a;
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
