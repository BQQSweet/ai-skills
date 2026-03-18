import { ref, onUnmounted } from "vue";
import { isWeb as isWebPlatform } from "@uni-helper/uni-env";
import { useRecipeStore } from "@/stores/recipe";

interface VoiceWakeupOptions {
  wakeWords?: string[]; // 唤醒词列表，默认 ["小西"]
  commandTimeout?: number; // 命令超时时间（毫秒），默认 8000
  onWakeup?: () => void; // 唤醒回调
  onCommand: (text: string) => void; // 命令回调
  onError?: (message: string) => void;
  onUnsupported?: (message: string) => void;
}

export function useVoiceWakeup(options: VoiceWakeupOptions) {
  const isListening = ref(false); // 是否在监听唤醒词
  const isAwake = ref(false); // 是否已唤醒，等待命令
  const recipeStore = useRecipeStore();

  const wakeWords = options.wakeWords || ["小西", "小溪", "小希"];
  const timeoutDuration = options.commandTimeout || 8000;
  let recognition: any = null;
  let commandTimeout: ReturnType<typeof setTimeout> | null = null;

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
    if (!isWebPlatform) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognition = new SpeechRecognition();
    recognition.lang = getWebSpeechLangCode(
      recipeStore.speechLanguage || "zh-cn",
    );
    recognition.continuous = true; // 持续监听
    recognition.interimResults = true; // 需要中间结果来快速响应

    recognition.onstart = () => {
      console.log("[Wakeup] Recognition started");
    };

    recognition.onresult = (event: any) => {
      // 处理所有结果（包括中间结果和最终结果）
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }

      if (!transcript.trim()) return;

      const text = transcript.trim();
      console.log("[Wakeup] Heard:", text, "isAwake:", isAwake.value, "isFinal:", event.results[event.results.length - 1].isFinal);

      if (!isAwake.value) {
        // 监听唤醒词（使用所有结果，包括中间结果）
        const hasWakeWord = wakeWords.some((word) =>
          text.includes(word)
        );
        if (hasWakeWord) {
          console.log("[Wakeup] Wake word detected!");
          isAwake.value = true;

          // 停止当前识别，准备接收新的命令
          try {
            recognition.stop();
          } catch (e) {
            console.warn("[Wakeup] Stop error:", e);
          }

          // 延迟重启，等待用户说命令
          setTimeout(() => {
            if (isAwake.value && isListening.value) {
              try {
                recognition.start();
                console.log("[Wakeup] Restarted for command");
              } catch (e) {
                console.warn("[Wakeup] Restart error:", e);
              }
            }
          }, 500);

          options.onWakeup?.();

          // 播放反馈音或提示
          uni.vibrateShort({ success: () => {} });

          // 设置超时（但会在 TTS 播放后重置）
          if (commandTimeout) clearTimeout(commandTimeout);
          commandTimeout = setTimeout(() => {
            console.log("[Wakeup] Command timeout, going back to sleep");
            isAwake.value = false;
          }, timeoutDuration);
        }
      } else {
        // 已唤醒，处理命令
        // 从完整文本中移除唤醒词
        let cleanCommand = text;
        for (const word of wakeWords) {
          cleanCommand = cleanCommand.replace(word, "").trim();
        }

        if (cleanCommand) {
          // 检测到有效命令（包括中间结果）
          const hasValidCommand =
            cleanCommand.includes("下一步") ||
            cleanCommand.includes("上一步") ||
            cleanCommand.includes("开始计时") ||
            cleanCommand.includes("暂停") ||
            cleanCommand.includes("完成") ||
            cleanCommand.includes("好的") ||
            cleanCommand.includes("回退");

          // 如果是最终结果，或者中间结果包含有效命令，则执行
          const isFinal = event.results[event.results.length - 1].isFinal;
          if (isFinal || hasValidCommand) {
            console.log("[Wakeup] Command received:", cleanCommand, "isFinal:", isFinal);
            isAwake.value = false;
            if (commandTimeout) {
              clearTimeout(commandTimeout);
              commandTimeout = null;
            }

            // 停止当前识别，避免继续处理
            try {
              recognition.stop();
            } catch (e) {
              console.warn("[Wakeup] Stop error:", e);
            }

            options.onCommand(cleanCommand);
          }
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("[Wakeup] Recognition error:", event.error);
      if (event.error !== "aborted" && event.error !== "no-speech") {
        options.onError?.(`语音识别发生错误: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log("[Wakeup] Recognition ended");
      // 如果还在监听状态，自动重启
      if (isListening.value) {
        console.log("[Wakeup] Auto-restarting recognition");
        setTimeout(() => {
          if (isListening.value) {
            try {
              recognition.start();
            } catch (e) {
              console.warn("[Wakeup] Restart failed:", e);
            }
          }
        }, 100);
      }
    };
  };

  initRecognition();

  const startListening = () => {
    console.log("[Wakeup] startListening called");
    if (!isWebPlatform) {
      options.onUnsupported?.("语音唤醒功能仅支持 H5 端");
      return;
    }

    if (!recognition) {
      options.onUnsupported?.(
        "当前浏览器不支持 Web Speech API，推荐使用 iOS Safari 或 Chrome",
      );
      return;
    }

    if (isListening.value) {
      console.log("[Wakeup] Already listening");
      return;
    }

    try {
      recognition.lang = getWebSpeechLangCode(
        recipeStore.speechLanguage || "zh-cn",
      );
      recognition.start();
      isListening.value = true;
      console.log("[Wakeup] Started listening for wake words");
    } catch (e: any) {
      console.error("[Wakeup] Start error:", e);
      if (e.message && e.message.includes("already")) {
        // 已经在运行，只需要设置状态
        isListening.value = true;
      } else {
        options.onError?.("启动语音唤醒失败");
      }
    }
  };

  const stopListening = (resetAwake = true) => {
    console.log("[Wakeup] stopListening called, resetAwake:", resetAwake);
    isListening.value = false;

    // 只有在明确要求时才重置唤醒状态
    if (resetAwake) {
      isAwake.value = false;
    }

    if (commandTimeout && resetAwake) {
      clearTimeout(commandTimeout);
      commandTimeout = null;
    }

    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        console.warn("[Wakeup] Stop error:", e);
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

  const resetCommandTimeout = () => {
    console.log("[Wakeup] Resetting command timeout");
    if (commandTimeout) {
      clearTimeout(commandTimeout);
    }
    commandTimeout = setTimeout(() => {
      console.log("[Wakeup] Command timeout, going back to sleep");
      isAwake.value = false;
    }, timeoutDuration);
  };

  onUnmounted(() => {
    cleanup();
  });

  return {
    isListening,
    isAwake,
    startListening,
    stopListening,
    resetCommandTimeout,
    cleanup,
  };
}
