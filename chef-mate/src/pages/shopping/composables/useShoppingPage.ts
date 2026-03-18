import { computed, ref, watch, type Ref } from "vue";
import { useConfirmDialog } from "@/composables/useConfirmDialog";
import { useGroupStore } from "@/stores/group";
import { useShoppingStore } from "@/stores/shopping";
import { useUserStore } from "@/stores/user";
import type { GroupMemberInfo } from "@/types/group";
import type {
  GenerateShoppingListFromRecipeParams,
  ShoppingCategory,
  ShoppingItem,
} from "@/types/shopping";
import type { RecipeIngredient } from "@/types/recipe";
import {
  getCompletedMeta,
  shoppingCategoryIcons,
  shoppingCategoryLabels,
} from "../constants/shopping";
import { useShoppingCompletionTransition } from "./useShoppingCompletionTransition";
import { useShoppingScrollLock } from "./useShoppingScrollLock";

interface ToastValue {
  show?: (options: { type: string; message: string; duration?: number }) => void;
}

export function useShoppingPage(options: { toastRef: Ref<ToastValue | null> }) {
  const shoppingStore = useShoppingStore();
  const groupStore = useGroupStore();
  const userStore = useUserStore();
  const completion = useShoppingCompletionTransition();
  const { useInnerScroll, lockBodyScroll, unlockBodyScroll } =
    useShoppingScrollLock();
  const interactionDialog = useConfirmDialog();

  const newItemName = ref("");
  const selectedCategory = ref<ShoppingCategory>("other");
  const showCategoryPicker = ref(false);
  const refreshing = ref(false);
  const showDeleteModal = ref(false);
  const showCompleteModal = ref(false);
  const showCompletedSection = ref(false);
  const showAssignMemberPopup = ref(false);
  const itemToDelete = ref("");
  const recipeContext = ref<GenerateShoppingListFromRecipeParams | null>(null);
  const recipeFlowHandled = ref(false);
  const requestedListId = ref("");
  const assigning = ref(false);
  const pendingAssignmentItem = ref<ShoppingItem | null>(null);
  const selectedAssigneeId = ref("");

  const activeMembers = computed(() => {
    const members = groupStore.currentGroup?.members || [];
    const activeIds = new Set<string>();
    shoppingStore.shoppingList.forEach((item) => {
      if (item.assignedTo) activeIds.add(item.assignedTo);
      if (item.purchasedBy) activeIds.add(item.purchasedBy);
    });
    return members
      .filter((member) => activeIds.has(member.id))
      .map((member) => ({
        id: member.id,
        name: member.nickname,
        avatarUrl: member.avatarUrl || "",
      }));
  });

  const candidateMembers = computed<GroupMemberInfo[]>(() =>
    (groupStore.currentGroup?.members || []).filter(
      (member) => member.id !== userStore.userId,
    ),
  );

  const groupMemberCount = computed(
    () =>
      groupStore.currentGroup?.memberCount ||
      groupStore.currentGroup?.members?.length ||
      0,
  );
  const activeMemberNames = computed(() =>
    activeMembers.value.map((member) => member.name).join("、"),
  );
  const inFridgeCount = computed(
    () => shoppingStore.shoppingList.filter((item) => item.hasInFridge).length,
  );
  const pendingWithoutFridgeCount = computed(
    () =>
      shoppingStore.shoppingList.filter(
        (item) =>
          !item.hasInFridge &&
          item.status !== "purchased" &&
          item.status !== "claimed",
      ).length,
  );
  const completedCount = computed(
    () => shoppingStore.purchasedItems.length + inFridgeCount.value,
  );
  const purchaseProgress = computed(() => {
    if (shoppingStore.stats.total === 0) return 0;
    return Math.round((completedCount.value / shoppingStore.stats.total) * 100);
  });
  const activeDisplayItems = computed(() =>
    [...shoppingStore.shoppingList]
      .filter((item) => {
        if (item.hasInFridge) return false;
        if (completion.isTransitioningToCompleted(item.id)) return true;
        return item.status !== "purchased";
      })
      .sort((left, right) => {
        const leftScore = left.status === "claimed" ? 0 : 1;
        const rightScore = right.status === "claimed" ? 0 : 1;
        return leftScore - rightScore;
      }),
  );
  const completedDisplayItems = computed(() =>
    [...shoppingStore.shoppingList]
      .filter((item) => {
        if (completion.isTransitioningToCompleted(item.id)) return false;
        return item.status === "purchased" || item.hasInFridge;
      })
      .sort((left, right) => {
        const leftScore = left.status === "purchased" ? 0 : 1;
        const rightScore = right.status === "purchased" ? 0 : 1;
        return leftScore - rightScore;
      }),
  );
  const activeListSubTitle = computed(() => {
    if (!shoppingStore.activeList) return "当前没有活跃协作清单";
    if (shoppingStore.activeList.source === "recipe") return "来自“今日烹饪计划”";
    return "手动维护的家庭协作清单";
  });
  const pageTitle = computed(() => {
    if (shoppingStore.activeList?.source === "recipe") {
      const recipeTitleFromItem = shoppingStore.activeList.items[0]?.sourceRecipeTitle;
      if (recipeTitleFromItem) return recipeTitleFromItem;
      if (recipeContext.value?.recipeTitle) return recipeContext.value.recipeTitle;
      return shoppingStore.activeList.title.replace(/\s*协作采购清单$/, "");
    }

    return shoppingStore.activeList?.title || "协作采购清单";
  });
  const listSourceLabel = computed(() =>
    shoppingStore.activeList?.source === "recipe" ? "食谱清单" : "手动补货",
  );
  const currentCategoryLabel = computed(
    () => shoppingCategoryLabels[selectedCategory.value],
  );
  const progressStatusText = computed(() => {
    if (shoppingStore.stats.total === 0) return "待开始";
    if (purchaseProgress.value >= 100) return "已备齐";
    if (shoppingStore.claimedItems.length > 0) return "进行中";
    return "待分工";
  });
  const hasUnassignedPendingItems = computed(() =>
    shoppingStore.shoppingList.some(
      (item) => !item.hasInFridge && item.status === "pending" && !item.assignedTo,
    ),
  );
  const hasClaimedByCurrentUserItems = computed(() =>
    shoppingStore.shoppingList.some(
      (item) =>
        !item.hasInFridge &&
        item.status === "claimed" &&
        item.assignedTo === userStore.userId,
    ),
  );
  const hasClaimedByOthersItems = computed(() =>
    shoppingStore.shoppingList.some(
      (item) =>
        !item.hasInFridge &&
        item.status === "claimed" &&
        item.assignedTo &&
        item.assignedTo !== userStore.userId,
    ),
  );
  const activeSectionDescription = computed(() => {
    if (shoppingStore.loading && shoppingStore.shoppingList.length === 0) return "同步中";
    if (hasUnassignedPendingItems.value) return "点击勾选可认领或直接完成";
    if (hasClaimedByCurrentUserItems.value) return "你认领的食材可直接勾选完成";
    if (hasClaimedByOthersItems.value) return "已认领食材仅认领人可完成";
    if (completedDisplayItems.value.length > 0) return "待买项都已经处理完";
    return "添加第一项开始协作";
  });
  const isOwner = computed(() => groupStore.currentGroup?.role === "owner");
  const isPageScrollLocked = computed(
    () => showAssignMemberPopup.value || showCategoryPicker.value,
  );
  const contentWrapperClass = computed(() =>
    [
      useInnerScroll ? "shopping-scroll" : "",
      isPageScrollLocked.value ? "shopping-scroll-locked" : "",
    ]
      .filter(Boolean)
      .join(" "),
  );
  const scrollContainerProps = computed(() =>
    useInnerScroll
      ? {
          "scroll-y": !isPageScrollLocked.value,
          "refresher-enabled": true,
          "refresher-triggered": refreshing.value,
        }
      : {},
  );
  const contentPaddingClass = computed(() =>
    shoppingStore.purchasedItems.length > 0 ? "pb-36" : "pb-12",
  );
  const assignmentItemCategoryLabel = computed(() =>
    pendingAssignmentItem.value
      ? shoppingCategoryLabels[pendingAssignmentItem.value.category]
      : "",
  );
  const assignmentItemCategoryIcon = computed(() =>
    pendingAssignmentItem.value
      ? shoppingCategoryIcons[pendingAssignmentItem.value.category]
      : "shopping_bag",
  );

  watch(isPageScrollLocked, (locked) => {
    if (locked) {
      lockBodyScroll();
      return;
    }
    unlockBodyScroll();
  });

  function showToast(type: string, message: string) {
    options.toastRef.value?.show?.({ type, message });
  }

  function parseRouteOptions(options?: Record<string, unknown>) {
    const query = options || {};
    requestedListId.value = query.listId ? String(query.listId) : "";

    const rawIngredients = query.ingredients
      ? decodeURIComponent(String(query.ingredients))
      : "[]";
    const ingredients = JSON.parse(rawIngredients) as RecipeIngredient[];
    if (!ingredients.length) return;

    recipeContext.value = {
      recipeId: query.recipeId ? String(query.recipeId) : undefined,
      recipeTitle: query.recipeTitle
        ? decodeURIComponent(String(query.recipeTitle))
        : "协作采购清单",
      ingredients,
      mode: "create",
    };
  }

  async function initializePage() {
    if (!groupStore.currentGroup) await groupStore.fetchMyGroups();
    if (!groupStore.currentGroup) return;

    await groupStore.fetchGroupMembers(groupStore.currentGroup.id);
    await loadShoppingLists();
    applyRequestedListId();

    if (recipeContext.value && !recipeFlowHandled.value) {
      await handleRecipeContext();
    }
  }

  function cleanupPageState() {
    unlockBodyScroll();
    completion.resetCompletionTransitions();
  }

  async function loadShoppingLists() {
    if (!groupStore.currentGroup) return;

    try {
      completion.resetCompletionTransitions();
      await shoppingStore.fetchShoppingLists(groupStore.currentGroup.id);
    } catch {
      showToast("error", "加载购物清单失败");
    }
  }

  function applyRequestedListId() {
    if (!requestedListId.value) return;

    const targetList = shoppingStore.shoppingLists.find(
      (list) => list.id === requestedListId.value,
    );

    if (!targetList) {
      showToast("default", "未找到对应购物清单，已展示当前清单");
      requestedListId.value = "";
      return;
    }

    shoppingStore.setActiveList(targetList.id);
  }

  async function handleRecipeContext() {
    if (!groupStore.currentGroup || !recipeContext.value) return;

    recipeFlowHandled.value = true;
    let mode: "create" | "overwrite" = "create";
    let targetListId = "";

    if (shoppingStore.activeList?.id) {
      const action = await interactionDialog.openActionSheet({
        title: "生成协作采购清单",
        description: "选择如何处理当前家庭采购清单",
        iconName: "playlist_add_check",
        actions: [
          {
            key: "create",
            label: "新增协作清单",
            tone: "primary",
          },
          {
            key: "overwrite",
            label: "覆盖当前清单",
            tone: "danger",
          },
        ],
      });

      if (!action) {
        return;
      }

      mode = action === "overwrite" ? "overwrite" : "create";
      targetListId = mode === "overwrite" ? shoppingStore.activeList.id : "";
    }

    try {
      const list = await shoppingStore.createListFromRecipe(groupStore.currentGroup.id, {
        ...recipeContext.value,
        mode,
        targetListId: targetListId || undefined,
      });
      shoppingStore.setActiveList(list.id);
      showToast(
        "success",
        mode === "overwrite" ? "已覆盖当前协作清单" : "已生成新的协作采购清单",
      );
    } catch (error: any) {
      recipeFlowHandled.value = false;
      showToast("error", error?.msg || "生成协作清单失败");
    }
  }

  async function handleAddItem() {
    if (!newItemName.value.trim()) {
      showToast("warning", "请输入购物项名称");
      return;
    }

    if (!groupStore.currentGroup) {
      showToast("error", "请先加入家庭组");
      return;
    }

    try {
      await shoppingStore.addItem(groupStore.currentGroup.id, {
        name: newItemName.value.trim(),
        category: selectedCategory.value,
        quantity: 1,
        unit: "份",
      });
      newItemName.value = "";
      showToast("success", "添加成功");
    } catch {
      showToast("error", "添加失败");
    }
  }

  function selectCategory(category: ShoppingCategory) {
    selectedCategory.value = category;
    showCategoryPicker.value = false;
  }

  async function handleToggle(itemId: string) {
    if (completion.isTransitioningToCompleted(itemId)) return;

    const currentItem = shoppingStore.shoppingList.find((item) => item.id === itemId);
    if (!currentItem) return;

    if (currentItem.status === "purchased") {
      try {
        await shoppingStore.togglePurchased(itemId);
      } catch {
        showToast("error", "操作失败");
      }
      return;
    }

    if (currentItem.status === "pending" && !currentItem.assignedTo) {
      const action = await interactionDialog.openActionSheet({
        title: "处理待采购食材",
        description: `选择「${currentItem.name}」的处理方式`,
        iconName: "shopping_bag",
        actions: [
          {
            key: "claimAndComplete",
            label: "认领并完成",
            tone: "primary",
          },
          {
            key: "claim",
            label: "仅认领",
            tone: "default",
          },
        ],
      });

      if (action === "claimAndComplete") {
        await completion.runPurchaseTransition(
          itemId,
          () => shoppingStore.claimAndPurchase(itemId),
          () => showToast("success", "已认领并标记完成"),
          () => showToast("error", "认领并完成失败"),
        );
        return;
      }

      if (action === "claim") {
        await handleClaim(itemId);
      }

      return;
    }

    await completion.runPurchaseTransition(
      itemId,
      () => shoppingStore.togglePurchased(itemId),
      () => showToast("success", "已标记为采购完成"),
      () => showToast("error", "操作失败"),
    );
  }

  async function handleRestoreCompleted(item: ShoppingItem) {
    if (item.hasInFridge && item.status !== "purchased") return;
    if (item.status !== "purchased") return;
    if (
      completion.isTransitioningToCompleted(item.id) ||
      completion.isRestoringCompletedItem(item.id)
    ) {
      return;
    }

    completion.setRestoringCompletedItem(item.id, true);

    try {
      await shoppingStore.togglePurchased(item.id);
    } catch {
      showToast("error", "撤回失败");
    } finally {
      completion.setRestoringCompletedItem(item.id, false);
    }
  }

  async function handleClaim(itemId: string) {
    try {
      await shoppingStore.claimItem(itemId);
      showToast("success", "已领取采购任务");
    } catch (error: any) {
      showToast("error", error?.msg || "领取失败");
    }
  }

  function handleAssign(item: ShoppingItem) {
    if (!isOwner.value || !groupStore.currentGroup?.members?.length) return;

    if (!candidateMembers.value.length) {
      showToast("error", "暂无可分配的家庭成员");
      return;
    }

    pendingAssignmentItem.value = item;
    selectedAssigneeId.value = candidateMembers.value.some(
      (member) => member.id === item.assignedTo,
    )
      ? item.assignedTo || ""
      : "";
    showAssignMemberPopup.value = true;
  }

  function closeAssignMemberPopup(force = false) {
    if (assigning.value && !force) return;

    showAssignMemberPopup.value = false;
    pendingAssignmentItem.value = null;
    selectedAssigneeId.value = "";
  }

  async function confirmAssignMember() {
    if (
      !pendingAssignmentItem.value ||
      !selectedAssigneeId.value ||
      assigning.value
    ) {
      return;
    }

    const targetMember = candidateMembers.value.find(
      (member) => member.id === selectedAssigneeId.value,
    );

    if (!targetMember) {
      showToast("error", "请选择有效的家庭成员");
      return;
    }

    assigning.value = true;

    try {
      await shoppingStore.assignItem(pendingAssignmentItem.value.id, {
        assignedTo: targetMember.id,
      });
      closeAssignMemberPopup(true);
      showToast("success", `已分配给 ${targetMember.nickname}`);
    } catch (error: any) {
      showToast("error", error?.msg || "分配失败");
    } finally {
      assigning.value = false;
    }
  }

  function confirmDelete(itemId: string) {
    itemToDelete.value = itemId;
    showDeleteModal.value = true;
  }

  async function handleDelete() {
    try {
      await shoppingStore.deleteItem(itemToDelete.value);
      showDeleteModal.value = false;
      itemToDelete.value = "";
      showToast("success", "删除成功");
    } catch {
      showToast("error", "删除失败");
    }
  }

  function confirmCompleteAndStock() {
    if (!groupStore.currentGroup) return;
    showCompleteModal.value = true;
  }

  async function handleCompleteAndStock() {
    if (!groupStore.currentGroup) return;

    try {
      await shoppingStore.clearPurchased(groupStore.currentGroup.id);
      showCompleteModal.value = false;
      showToast("success", "已完成采购并入库");
    } catch {
      showToast("error", "操作失败");
    }
  }

  async function handleRefresh() {
    refreshing.value = true;
    try {
      await loadShoppingLists();
    } finally {
      refreshing.value = false;
    }
  }

  function handleShare() {
    showToast("info", "分享功能开发中");
  }

  function handleInviteMembers() {
    uni.navigateTo({ url: "/pages/group/invite" });
  }

  function goBack() {
    uni.navigateBack();
  }

  return {
    shoppingStore,
    userStore,
    interactionDialog,
    useInnerScroll,
    newItemName,
    selectedCategory,
    showCategoryPicker,
    refreshing,
    showDeleteModal,
    showCompleteModal,
    showCompletedSection,
    showAssignMemberPopup,
    assigning,
    pendingAssignmentItem,
    selectedAssigneeId,
    activeMembers,
    candidateMembers,
    groupMemberCount,
    activeMemberNames,
    inFridgeCount,
    pendingWithoutFridgeCount,
    purchaseProgress,
    activeDisplayItems,
    completedDisplayItems,
    activeListSubTitle,
    pageTitle,
    listSourceLabel,
    currentCategoryLabel,
    progressStatusText,
    activeSectionDescription,
    isOwner,
    contentWrapperClass,
    scrollContainerProps,
    contentPaddingClass,
    assignmentItemCategoryLabel,
    assignmentItemCategoryIcon,
    parseRouteOptions,
    initializePage,
    cleanupPageState,
    handleAddItem,
    selectCategory,
    handleToggle,
    handleRestoreCompleted,
    handleClaim,
    handleAssign,
    closeAssignMemberPopup,
    confirmAssignMember,
    confirmDelete,
    handleDelete,
    confirmCompleteAndStock,
    handleCompleteAndStock,
    handleRefresh,
    handleShare,
    handleInviteMembers,
    goBack,
    isTransitioningToCompletedMap: completion.completionTransitionState,
    isRestoringCompletedItemMap: completion.restoringCompletedState,
    getCompletedMeta,
  };
}
