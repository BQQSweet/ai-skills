import { ref, onUnmounted } from "vue";
import { useRecipeStore } from "@/stores/recipe";

interface VoiceCommandOptions {
  onCommand: (text: string) => void; // 命令回调
  onError?: (message: string) => void;
  onUnsupported?: (message: string) => void;
}

export function useVoiceCommand(options: VoiceCommandOptions) {
  const isListening = ref(false);
  const isWeb = uni.getSystemInfoSync().uniPlatform === "web";
  const recipeStore = useRecipeStore();

  let recognition: any = null;
  let lastCommandTime = 0;
  let lastCommandText = "";
  let isProcessing = false; // 添加处理中标志
  const COMMAND_COOLDOWN = 1000; // 1秒内不重复执行相同命令

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
    recognition.continuous = true; // 持续监听
    recognition.interimResults = true; // 使用中间结果快速响应

    recognition.onstart = () => {
      console.log("[VoiceCommand] Recognition started");
    };

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }

      if (!transcript.trim()) return;

      const text = transcript.trim();
      const isFinal = event.results[event.results.length - 1].isFinal;
      console.log("[VoiceCommand] Heard:", text, "isFinal:", isFinal);

      // 检测有效命令
      const hasValidCommand =
        text.includes("下一步") ||
        text.includes("上一步") ||
        text.includes("开始计时") ||
        text.includes("暂停") ||
        text.includes("完成") ||
        text.includes("好的") ||
        text.includes("回退");

      // 如果是最终结果或包含有效命令，则执行
      if (isFinal || hasValidCommand) {
        console.log("[VoiceCommand] Checking processing flag, isProcessing:", isProcessing);

        // 如果正在处理中，忽略后续结果
        if (isProcessing) {
          console.log("[VoiceCommand] Already processing, ignored:", text);
          return;
        }

        // 防抖：检查是否是重复命令
        const now = Date.now();
        const isSameCommand = text === lastCommandText;
        const isWithinCooldown = now - lastCommandTime < COMMAND_COOLDOWN;

        if (isSameCommand && isWithinCooldown) {
          console.log("[VoiceCommand] Duplicate command ignored:", text);
          return;
        }

        console.log("[VoiceCommand] Command detected:", text);

        // 标记为处理中
        isProcessing = true;
        console.log("[VoiceCommand] Set isProcessing to true");

        // 更新最后执行的命令和时间
        lastCommandText = text;
        lastCommandTime = now;

        // 停止当前识别，避免重复处理
        try {
          recognition.stop();
        } catch (e) {
          console.warn("[VoiceCommand] Stop error:", e);
        }

        options.onCommand(text);

        // 500ms后重置处理标志
        setTimeout(() => {
          isProcessing = false;
          console.log("[VoiceCommand] Reset isProcessing to false");
        }, 500);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("[VoiceCommand] Recognition error:", event.error);
      if (event.error !== "aborted" && event.error !== "no-speech") {
        options.onError?.(`语音识别发生错误: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log("[VoiceCommand] Recognition ended");
      // 重置处理标志
      isProcessing = false;
      // 如果还在监听状态，自动重启
      if (isListening.value) {
        console.log("[VoiceCommand] Auto-restarting recognition");
        setTimeout(() => {
          if (isListening.value) {
            try {
              recognition.start();
            } catch (e) {
              console.warn("[VoiceCommand] Restart failed:", e);
            }
          }
        }, 100);
      }
    };
  };

  initRecognition();

  const startListening = () => {
    console.log("[VoiceCommand] startListening called");
    if (!isWeb) {
      options.onUnsupported?.("语音识别功能仅支持 H5 端");
      return;
    }

    if (!recognition) {
      options.onUnsupported?.(
        "当前浏览器不支持 Web Speech API，推荐使用 iOS Safari 或 Chrome",
      );
      return;
    }

    if (isListening.value) {
      console.log("[VoiceCommand] Already listening");
      return;
    }

    try {
      recognition.lang = getWebSpeechLangCode(
        recipeStore.speechLanguage || "zh-cn",
      );
      recognition.start();
      isListening.value = true;
      console.log("[VoiceCommand] Started listening for commands");
    } catch (e: any) {
      console.error("[VoiceCommand] Start error:", e);
      if (e.message && e.message.includes("already")) {
        isListening.value = true;
      } else {
        options.onError?.("启动语音识别失败");
      }
    }
  };

  const stopListening = () => {
    console.log("[VoiceCommand] stopListening called");
    isListening.value = false;

    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        console.warn("[VoiceCommand] Stop error:", e);
      }
    }
  };

  const cleanup = () => {
    stopListening();
    if (recognition) {
      try {
        recognition.abort();
      } catch (e) {
        // Ignore
      }
      recognition = null;
    }
  };

  onUnmounted(() => {
    cleanup();
  });

  return {
    isListening,
    startListening,
    stopListening,
    cleanup,
  };
}
