import { ref } from "vue";
import { useRecipeStore } from "@/stores/recipe";

interface VoiceRecordingOptions {
  onResult: (text: string) => void;
  onError?: (message: string) => void;
  onUnsupported?: (message: string) => void;
}

export function useVoiceRecording(options: VoiceRecordingOptions) {
  const isRecording = ref(false);
  const isWeb = uni.getSystemInfoSync().uniPlatform === "web";
  const recipeStore = useRecipeStore();

  let recognition: any = null;
  let finalH5Transcript = "";
  let isStopping = false; // 防止重复调用 stop

  const getWebSpeechLangCode = (pref: string) => {
    switch (pref) {
      case "cantonese":
        return "zh-HK";
      case "sichuan":
      case "dongbei":
      case "henan":
      default:
        return "zh-CN";
    }
  };

  const initRecognition = () => {
    if (!isWeb) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognition = new SpeechRecognition();
    recognition.lang = getWebSpeechLangCode(
      recipeStore.speechLanguage || "zh-cn",
    );
    recognition.continuous = false; // 改为 false，单次识别更可靠
    recognition.interimResults = false; // 改为 false，只要最终结果
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("[Voice] Recognition started");
      finalH5Transcript = "";
      isStopping = false;
    };

    recognition.onspeechend = () => {
      console.log("[Voice] Speech ended");
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
      console.log("[Voice] Result:", { final: finalH5Transcript, interim: interimTranscript });
    };

    recognition.onerror = (event: any) => {
      console.error("[Voice] Recognition error:", event.error);
      isRecording.value = false;
      if (event.error !== "aborted" && event.error !== "no-speech") {
        options.onError?.(`语音识别发生错误: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log("[Voice] Recognition ended, transcript:", finalH5Transcript);
      isStopping = false;
      isRecording.value = false;
      if (finalH5Transcript.trim()) {
        options.onResult(finalH5Transcript);
        finalH5Transcript = "";
      }
    };
  };

  initRecognition();

  const startVoiceRecording = async () => {
    console.log("[Voice] startVoiceRecording called, isRecording:", isRecording.value);
    if (isWeb) {
      if (!recognition) {
        options.onUnsupported?.(
          "当前浏览器不支持 Web Speech API，推荐使用 iOS Safari 或 Chrome",
        );
        return;
      }

      // 如果已经在录音，先停止
      if (isRecording.value) {
        console.log("[Voice] Already recording, aborting first");
        try {
          recognition.abort();
        } catch (e) {
          // Ignore
        }
      }

      try {
        finalH5Transcript = "";
        recognition.lang = getWebSpeechLangCode(
          recipeStore.speechLanguage || "zh-cn",
        );
        console.log("[Voice] Starting recognition with lang:", recognition.lang);
        recognition.start();
        isRecording.value = true;
      } catch (e: any) {
        console.warn("[Voice] Recognition start error:", e);
        // 如果是因为已经在运行，尝试先停止再重新开始
        if (e.message && e.message.includes("already")) {
          try {
            recognition.abort();
            setTimeout(() => {
              finalH5Transcript = "";
              recognition.start();
              isRecording.value = true;
              console.log("[Voice] Recognition restarted after abort");
            }, 100);
          } catch (retryError) {
            console.error("[Voice] Recognition retry failed:", retryError);
            isRecording.value = false;
          }
        } else {
          isRecording.value = false;
        }
      }
    } else {
      // @ts-ignore
      if (typeof plus !== "undefined" && plus.speech) {
        isRecording.value = true;
        uni.vibrateShort({ success: () => {} });

        let engineLang = "zh-cn";
        if (recipeStore.speechLanguage === "cantonese") engineLang = "cantonese";
        if (recipeStore.speechLanguage === "sichuan") engineLang = "lmz";

        // @ts-ignore
        plus.speech.startRecognize(
          // @ts-ignore
          { engine: "iFly", language: engineLang },
          (res: string) => {
            isRecording.value = false;
            options.onResult(res);
          },
          (e: any) => {
            isRecording.value = false;
            console.error("plus.speech err:", e);
            options.onError?.("原生识别失败");
          },
        );
      } else {
        options.onUnsupported?.("非 App 环境或未开启 plus.speech 模块");
      }
    }
  };

  const stopVoiceRecording = () => {
    console.log("[Voice] stopVoiceRecording called, isRecording:", isRecording.value, "isStopping:", isStopping);
    if (isWeb) {
      // 防止重复调用
      if (isStopping || !isRecording.value || !recognition) {
        console.log("[Voice] Skip stop - already stopping or not recording");
        return;
      }

      isStopping = true;
      try {
        // recognition.stop() 会触发 onend 事件，在那里处理结果
        console.log("[Voice] Calling recognition.stop()");
        recognition.stop();
      } catch (e) {
        console.warn("[Voice] Recognition stop error:", e);
        // 如果停止失败，手动触发结束逻辑
        isStopping = false;
        isRecording.value = false;
        if (finalH5Transcript.trim()) {
          options.onResult(finalH5Transcript);
          finalH5Transcript = "";
        }
      }
    } else {
      // @ts-ignore
      if (isRecording.value && typeof plus !== "undefined" && plus.speech) {
        // @ts-ignore
        plus.speech.stopRecognize();
      }
      isRecording.value = false;
    }
  };

  const cleanup = () => {
    if (recognition) {
      try {
        recognition.abort();
      } catch (e) {
        // Ignore errors during cleanup
      }
      recognition = null;
    }
  };

  return {
    isRecording,
    startVoiceRecording,
    stopVoiceRecording,
    cleanup,
  };
}
