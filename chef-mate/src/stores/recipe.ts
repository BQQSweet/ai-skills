import { defineStore } from "pinia";
import { ref } from "vue";

export const useRecipeStore = defineStore("recipe", () => {
  const currentRecipe = ref<any>(null);

  const setCurrentRecipe = (recipe: any) => {
    currentRecipe.value = recipe;
  };

  const clearCurrentRecipe = () => {
    currentRecipe.value = null;
  };

  const speechLanguage = ref<string>(
    uni.getStorageSync("speechLanguage") || "zh-cn",
  );

  const setSpeechLanguage = (lang: string) => {
    speechLanguage.value = lang;
    uni.setStorageSync("speechLanguage", lang);
  };

  return {
    currentRecipe,
    speechLanguage,
    setCurrentRecipe,
    clearCurrentRecipe,
    setSpeechLanguage,
  };
});
