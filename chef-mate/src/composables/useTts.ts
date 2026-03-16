import { ref } from "vue";
import { getStepTts } from "@/services/recipe";
import type { RecipeStep } from "@/types/recipe";

export function useTts() {
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

  const playStepAudio = async (
    stepIndex: number,
    text: string,
    getCurrentIndex: () => number,
  ) => {
    if (!text) return;
    isVoicePlaying.value = true;
    try {
      if (audioCache.value[stepIndex]) {
        if (getCurrentIndex() === stepIndex) {
          innerAudioContext.src =
            "data:audio/mp3;base64," + audioCache.value[stepIndex];
          innerAudioContext.play();
        }
      } else {
        const res = await getStepTts(text);
        if (res?.audioBase64) {
          audioCache.value[stepIndex] = res.audioBase64;
          if (getCurrentIndex() === stepIndex) {
            innerAudioContext.src = "data:audio/mp3;base64," + res.audioBase64;
            innerAudioContext.play();
          }
        } else {
          if (getCurrentIndex() === stepIndex) isVoicePlaying.value = false;
        }
      }
    } catch (err) {
      console.error("Failed to generate TTS", err);
      if (getCurrentIndex() === stepIndex) isVoicePlaying.value = false;
    }
  };

  const prefetchNextStepAudio = async (
    currentIndex: number,
    steps: RecipeStep[],
  ) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) {
      const nextText = steps[nextIndex]?.instruction;
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

  const prefetchPrevStepAudio = async (
    currentIndex: number,
    steps: RecipeStep[],
  ) => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      const prevText = steps[prevIndex]?.instruction;
      if (prevText && !audioCache.value[prevIndex]) {
        try {
          const res = await getStepTts(prevText);
          if (res?.audioBase64) {
            audioCache.value[prevIndex] = res.audioBase64;
          }
        } catch (err) {
          console.error("Failed to prefetch prev TTS", err);
        }
      }
    }
  };

  const playText = async (text: string) => {
    try {
      const res = await getStepTts(text);
      if (res?.audioBase64) {
        isVoicePlaying.value = true;
        innerAudioContext.src = "data:audio/mp3;base64," + res.audioBase64;
        innerAudioContext.play();
      }
    } catch (e) {
      console.error("Failed to play TTS text", e);
    }
  };

  const destroy = () => {
    innerAudioContext.stop();
    innerAudioContext.destroy();
  };

  return {
    isVoicePlaying,
    audioCache,
    playStepAudio,
    prefetchNextStepAudio,
    prefetchPrevStepAudio,
    playText,
    destroy,
  };
}
