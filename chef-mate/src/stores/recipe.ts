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

  return {
    currentRecipe,
    setCurrentRecipe,
    clearCurrentRecipe,
  };
});
