<template>
  <view
    class="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark steam-gradient overflow-hidden font-display text-white"
    @touchstart="session.handleTouchStart"
    @touchend="session.handleTouchEnd"
  >
    <CookingHeader
      :current-step="session.currentStepIndex + 1"
      :total-steps="session.totalSteps"
      :progress-percent="session.progressPercent"
      :can-go-prev="session.currentStepIndex > 0"
      @exit="session.exitGuide"
      @prev="session.prevStep"
    />

    <view class="flex-1 w-full z-20 overflow-hidden px-6 flex flex-col justify-center">
      <CurrentStepHero
        :step-number="session.currentStepIndex + 1"
        :instruction="session.currentStep?.instruction || ''"
        :is-voice-playing="voice.isVoicePlaying"
      />

      <CookingTimer
        :show-timer="timer.showTimer"
        :formatted-time="timer.formattedTime"
        :is-running="timer.isTimerRunning"
        :dash-array="timer.dashArray"
        :dash-offset="timer.dashOffset"
        @toggle="timer.toggleTimer"
      />
    </view>

    <CookingGuideControls :is-last-step="session.isLastStep" @next="session.nextStep" />

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

    <TimerEndModal
      :show="timer.showTimerEndModal"
      :current-step="session.currentStepIndex + 1"
      :progress-percent="session.progressPercent"
      :instruction="session.currentStep?.instruction || ''"
      @next="timer.handleTimerEndNext"
      @delay="timer.handleDelayTimer"
    />

    <up-toast ref="uToastRef"></up-toast>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import CookingHeader from "./components/CookingHeader.vue";
import CookingGuideControls from "./components/CookingGuideControls.vue";
import CookingTimer from "./components/CookingTimer.vue";
import CurrentStepHero from "./components/CurrentStepHero.vue";
import TimerEndModal from "./components/TimerEndModal.vue";
import { useCookingGuideSession } from "./composables/useCookingGuideSession";
import { useCookingGuideTimer } from "./composables/useCookingGuideTimer";
import { useCookingGuideVoice } from "./composables/useCookingGuideVoice";

const uToastRef = ref<{
  show?: (options: { type: string; message: string; complete?: () => void }) => void;
} | null>(null);

const sessionState = useCookingGuideSession({ toastRef: uToastRef });
const timerState = useCookingGuideTimer({
  toastRef: uToastRef,
  currentStep: sessionState.currentStep,
  currentStepIndex: sessionState.currentStepIndex,
  progressPercent: sessionState.progressPercent,
  nextStep: sessionState.nextStep,
});
const voiceState = useCookingGuideVoice({
  toastRef: uToastRef,
  currentStepIndex: sessionState.currentStepIndex,
  currentStep: sessionState.currentStep,
  steps: sessionState.steps,
  nextStep: sessionState.nextStep,
  prevStep: sessionState.prevStep,
  toggleTimer: timerState.toggleTimer,
  isTimerRunning: timerState.isTimerRunning,
});

const session = reactive(sessionState);
const timer = reactive(timerState);
const voice = reactive(voiceState);
</script>

<style scoped>
.steam-gradient {
  background: radial-gradient(
    circle at 50% 120%,
    rgba(255, 157, 10, 0.08) 0%,
    rgba(10, 10, 10, 0) 70%
  );
  background-color: theme("colors.background.cooking");
}
</style>
