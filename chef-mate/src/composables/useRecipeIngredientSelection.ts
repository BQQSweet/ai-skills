import { computed, ref } from "vue";
import { useGroupStore } from "@/stores/group";
import { classifyRecipeIngredients } from "@/services/shopping";
import type { Recipe } from "@/types/recipe";
import type { ClassifiedRecipeIngredient } from "@/types/shopping";

type SelectableClassifiedRecipeIngredient = ClassifiedRecipeIngredient & {
  key: string;
};

interface ShoppingRecipeSelectionContext {
  recipeId?: string;
  recipeTitle: string;
}

export function useRecipeIngredientSelection() {
  const groupStore = useGroupStore();

  const showIngredientSelectionSheet = ref(false);
  const pendingRecipeContext = ref<ShoppingRecipeSelectionContext | null>(null);
  const pendingShoppingNavigationUrl = ref("");
  const classifiedRecipeIngredients = ref<SelectableClassifiedRecipeIngredient[]>([]);
  const selectedIngredientKeys = ref<string[]>([]);
  const loadingIngredientClassification = ref(false);
  const confirmingIngredientSelection = ref(false);

  const selectionRecipeTitle = computed(
    () => pendingRecipeContext.value?.recipeTitle || "",
  );

  function buildIngredientKey(
    item: ClassifiedRecipeIngredient,
    index: number,
  ) {
    return `${index}:${item.name}:${item.quantity}:${item.unit}`;
  }

  async function ensureGroupReady() {
    if (groupStore.currentGroup) {
      return true;
    }

    try {
      await groupStore.fetchMyGroups();
    } catch {
      return false;
    }

    return Boolean(groupStore.currentGroup);
  }

  function resetSelectionState() {
    pendingRecipeContext.value = null;
    pendingShoppingNavigationUrl.value = "";
    classifiedRecipeIngredients.value = [];
    selectedIngredientKeys.value = [];
    confirmingIngredientSelection.value = false;
  }

  function closeIngredientSelection(preservePendingNavigation = false) {
    showIngredientSelectionSheet.value = false;

    const shouldPreservePendingNavigation =
      preservePendingNavigation || Boolean(pendingShoppingNavigationUrl.value);

    if (!shouldPreservePendingNavigation) {
      pendingShoppingNavigationUrl.value = "";
      confirmingIngredientSelection.value = false;
    }
  }

  function handleIngredientSelectionClosed() {
    if (showIngredientSelectionSheet.value) {
      return;
    }

    const navigationUrl = pendingShoppingNavigationUrl.value;
    resetSelectionState();

    if (!navigationUrl) {
      return;
    }

    uni.navigateTo({
      url: navigationUrl,
    });
  }

  function applySelectableItems(
    context: ShoppingRecipeSelectionContext,
    items: ClassifiedRecipeIngredient[],
  ) {
    const selectableItems = items.map((item, index) => ({
      ...item,
      key: buildIngredientKey(item, index),
    }));

    if (!selectableItems.length) {
      uni.$u.toast("当前食谱暂无可加入清单的原料");
      return;
    }

    pendingRecipeContext.value = context;
    classifiedRecipeIngredients.value = selectableItems;
    selectedIngredientKeys.value = selectableItems
      .filter((item) => item.selectedByDefault)
      .map((item) => item.key);
    showIngredientSelectionSheet.value = true;
  }

  async function openIngredientSelection(recipe: Recipe) {
    if (loadingIngredientClassification.value) {
      return;
    }

    const hasGroup = await ensureGroupReady();
    if (!hasGroup) {
      uni.$u.toast("请先加入家庭组");
      return;
    }

    if (!recipe.ingredients?.length) {
      uni.$u.toast("当前食谱暂无可加入清单的原料");
      return;
    }

    loadingIngredientClassification.value = true;
    uni.showLoading({
      title: "识别原料中...",
      mask: true,
    });

    try {
      const result = await classifyRecipeIngredients({
        recipeId: recipe.id || undefined,
        recipeTitle: recipe.title || undefined,
        ingredients: recipe.ingredients || [],
      });

      applySelectableItems(
        {
          recipeId: recipe.id || undefined,
          recipeTitle: recipe.title || "协作采购清单",
        },
        result.ingredients,
      );
    } catch (error: any) {
      uni.$u.toast(error?.msg || "原料分类失败，请稍后重试");
    } finally {
      loadingIngredientClassification.value = false;
      uni.hideLoading();
    }
  }

  async function openWithClassifiedIngredients(options: {
    recipeId?: string;
    recipeTitle?: string;
    items: ClassifiedRecipeIngredient[];
  }) {
    const hasGroup = await ensureGroupReady();
    if (!hasGroup) {
      uni.$u.toast("请先加入家庭组");
      return;
    }

    applySelectableItems(
      {
        recipeId: options.recipeId,
        recipeTitle: options.recipeTitle || "协作采购清单",
      },
      options.items,
    );
  }

  function toggleIngredientSelection(key: string) {
    const selectedSet = new Set(selectedIngredientKeys.value);

    if (selectedSet.has(key)) {
      selectedSet.delete(key);
    } else {
      selectedSet.add(key);
    }

    selectedIngredientKeys.value = Array.from(selectedSet);
  }

  function confirmSelectedIngredients() {
    if (confirmingIngredientSelection.value) {
      return;
    }

    const selectedIngredients = classifiedRecipeIngredients.value
      .filter((item) => selectedIngredientKeys.value.includes(item.key))
      .map(({ key, type, selectedByDefault, ...item }) => item);

    if (!selectedIngredients.length) {
      uni.$u.toast("至少选择一项");
      return;
    }

    const context = pendingRecipeContext.value;
    if (!context) {
      return;
    }

    confirmingIngredientSelection.value = true;

    const query = [
      `recipeId=${encodeURIComponent(context.recipeId || "")}`,
      `recipeTitle=${encodeURIComponent(context.recipeTitle || "")}`,
      `ingredients=${encodeURIComponent(JSON.stringify(selectedIngredients))}`,
    ].join("&");

    pendingShoppingNavigationUrl.value = `/pages/shopping/index?${query}`;
    closeIngredientSelection(true);
  }

  return {
    showIngredientSelectionSheet,
    selectionRecipeTitle,
    classifiedRecipeIngredients,
    selectedIngredientKeys,
    loadingIngredientClassification,
    confirmingIngredientSelection,
    openIngredientSelection,
    openWithClassifiedIngredients,
    closeIngredientSelection,
    handleIngredientSelectionClosed,
    toggleIngredientSelection,
    confirmSelectedIngredients,
  };
}
