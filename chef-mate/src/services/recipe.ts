import { get, post } from "./request";
import { getToken } from "@/utils/storage";
import { BASE_URL } from "@/utils/env";

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: any;
  steps: any;
  nutrition?: any;
  difficulty: string;
  cook_time: number;
  servings: number;
  cover_url?: string;
  source_type: string;
  tags: string[];
  status: string;
}

/**
 * 获取推荐食谱
 */
export function getRecommendedRecipes() {
  return get<Recipe[]>("/api/recipe/recommend");
}

/**
 * 以现有食材请求 AI 灵感食谱
 */
export function generateAiRecipe(params: {
  ingredients: string[];
  taste?: string;
  mealType?: string;
  servings?: number;
}) {
  return post<Recipe>("/api/recipe/ai-generate", params);
}

/**
 * 针对食谱步骤向 AI 提问
 */
export function askStepQuestion(params: {
  recipeContext: string;
  stepInstruction: string;
  question: string;
}) {
  // 必须把 responseType 声明为 text 或手动处理，因为后端这里返回纯文本而不是对象封装的 code/data
  return post<string>("/api/recipe/ask-step", params);
}

/**
 * 获取某个文本的语音播报音频流 Base64
 */
export function getStepTts(text: string) {
  return post<{ audioBase64: string }>("/api/recipe/tts", { text });
}

/**
 * 上传语音指令文件并解析意图
 */
export function uploadVoiceCommand(filePath: string) {
  return new Promise<{
    command: string;
    confidence: number;
    original_text: string;
  }>((resolve, reject) => {
    uni.uploadFile({
      url: `${BASE_URL}/api/recipe/voice-command`,
      filePath: filePath,
      name: "file",
      header: {
        Authorization: `Bearer ${getToken()}`,
      },
      success: (uploadFileRes) => {
        try {
          const res = JSON.parse(uploadFileRes.data);
          if (res.code === 0) {
            resolve(res.data);
          } else {
            console.error("Voice Command Error:", res.msg);
            reject(new Error(res.msg || "识别失败"));
          }
        } catch (e) {
          reject(e);
        }
      },
      fail: (err) => {
        console.error("Voice Command Upload Fail:", err);
        reject(err);
      },
    });
  });
}

/**
 * 上传语音指令 Blob（专属 H5 兼容方案）
 */
export function uploadVoiceCommandBlob(blob: Blob) {
  return new Promise<{
    command: string;
    confidence: number;
    original_text: string;
  }>((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", blob, "audio.webm");

    // XMLHttpRequest or fetch for H5
    fetch(`${BASE_URL}/api/recipe/voice-command`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.code === 0) {
          resolve(res.data);
        } else {
          console.error("Voice Command Error:", res.msg);
          reject(new Error(res.msg || "识别失败"));
        }
      })
      .catch((err) => {
        console.error("Voice Command Upload Fail:", err);
        reject(err);
      });
  });
}

/**
 * 将本地端侧语音转写的文字，发送给 AI 提取指令意图
 */
export function parseCommandIntent(text: string) {
  return post<{
    command: string;
    confidence: number;
    original_text: string;
  }>("/api/recipe/parse-intent", { text });
}
