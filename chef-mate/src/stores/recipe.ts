import { defineStore } from "pinia";
import { ref } from "vue";
import type { Recipe } from "@/types/recipe";
import { STORAGE_KEYS, getStorage, setStorage } from "@/utils/storage";

export const useRecipeStore = defineStore("recipe", () => {
  const currentRecipe = ref<Recipe | null>(null);

  const setCurrentRecipe = (recipe: Recipe) => {
    currentRecipe.value = recipe;
  };

  const clearCurrentRecipe = () => {
    currentRecipe.value = null;
  };

  const speechLanguage = ref<string>(
    getStorage(STORAGE_KEYS.SPEECH_LANGUAGE) || "zh-cn",
  );

  const setSpeechLanguage = (lang: string) => {
    speechLanguage.value = lang;
    setStorage(STORAGE_KEYS.SPEECH_LANGUAGE, lang);
  };

  return {
    currentRecipe,
    speechLanguage,
    setCurrentRecipe,
    clearCurrentRecipe,
    setSpeechLanguage,
  };
});
