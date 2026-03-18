import { reactive, ref } from "vue";

export function useAiRecipePreferences(ingredients?: string[]) {
  const showPopup = ref(false);

  const prefs = reactive({
    mealType: "正餐",
    taste: "",
    servings: 2,
  });

  const calculateDefaultMealType = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 10) return "早餐";
    if (hour >= 10 && hour < 14) return "午餐";
    if (hour >= 14 && hour < 17) return "下午茶";
    if (hour >= 17 && hour < 21) return "晚餐";
    return "夜宵";
  };

  function openPopup() {
    prefs.mealType = calculateDefaultMealType();
    showPopup.value = true;
  }

  function toggleTaste(taste: string) {
    prefs.taste = taste === prefs.taste ? "" : taste;
  }

  function increaseServings() {
    if (prefs.servings < 10) prefs.servings++;
  }

  function decreaseServings() {
    if (prefs.servings > 1) prefs.servings--;
  }

  function buildQueryString() {
    const queryObj: Record<string, string | number> = {};
    if (ingredients && ingredients.length > 0) {
      queryObj.ingredients = encodeURIComponent(JSON.stringify(ingredients));
    }
    if (prefs.taste) {
      queryObj.taste = prefs.taste;
    }
    queryObj.mealType = prefs.mealType;
    queryObj.servings = prefs.servings;

    return Object.keys(queryObj)
      .map((key) => `${key}=${queryObj[key]}`)
      .join("&");
  }

  function confirmGenerate() {
    showPopup.value = false;
    const queryString = buildQueryString();
    uni.navigateTo({
      url: `/pages/fridge/ai-recipe${queryString ? "?" + queryString : ""}`,
    });
  }

  return {
    showPopup,
    prefs,
    openPopup,
    toggleTaste,
    increaseServings,
    decreaseServings,
    confirmGenerate,
  };
}
