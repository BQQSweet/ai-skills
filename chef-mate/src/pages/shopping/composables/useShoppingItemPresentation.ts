import { computed } from "vue";
import type { ShoppingItem } from "@/types/shopping";

interface Options {
  item: () => ShoppingItem;
  canAssign: () => boolean;
  currentUserId: () => string | undefined;
  isTransitioningToCompleted: () => boolean;
}

export function useShoppingItemPresentation(options: Options) {
  const quantityText = computed(() => {
    const item = options.item();
    return `${item.quantity}${item.unit}`;
  });

  const cardClass = computed(() => {
    const item = options.item();
    if (options.isTransitioningToCompleted()) {
      return "border border-primary/20 transition-to-completed";
    }

    if (item.status === "claimed") {
      return "border-l-4 border-primary";
    }

    return "border border-slate-100";
  });

  const showCheckedIcon = computed(() => {
    const item = options.item();
    return options.isTransitioningToCompleted() || item.status === "purchased";
  });

  const canToggle = computed(() => {
    const item = options.item();
    if (options.isTransitioningToCompleted()) return false;
    if (item.hasInFridge) return false;
    if (item.status === "claimed" && item.assignedTo !== options.currentUserId()) {
      return false;
    }

    return true;
  });

  const checkboxHitAreaClass = computed(() =>
    canToggle.value ? "cursor-pointer" : "cursor-not-allowed opacity-70",
  );

  const checkboxClass = computed(() => {
    const item = options.item();
    if (showCheckedIcon.value) {
      return "border-primary bg-primary shadow-[0_6px_12px_-8px_rgba(255,157,10,0.85)]";
    }
    if (item.hasInFridge) return "border-amber-300 bg-amber-50";
    if (!canToggle.value) return "border-slate-200 bg-slate-50";
    return "border-slate-200 dark:border-gray-600";
  });

  const assigneeDisplay = computed(() => {
    const item = options.item();
    if (!item.assignedToName) return "";
    if (item.assignedTo === options.currentUserId()) return "我";
    return item.assignedToName;
  });

  const assigneeInitial = computed(() =>
    assigneeDisplay.value ? assigneeDisplay.value.slice(0, 1) : "+",
  );

  const assigneePillClass = computed(() => {
    const item = options.item();
    return item.status === "claimed"
      ? "bg-[#a855f7]/10 text-[#7e22ce]"
      : "bg-[#3b82f6]/10 text-[#2563eb]";
  });

  const assigneeAvatarClass = computed(() => {
    const item = options.item();
    return item.status === "claimed"
      ? "bg-[#a855f7]/15 text-[#7e22ce]"
      : "bg-[#3b82f6]/15 text-[#2563eb]";
  });

  const sourceText = computed(() => {
    const item = options.item();
    if (item.sourceRecipeTitle) return item.sourceRecipeTitle;
    if (item.source === "manual") return "手动添加";
    return "家庭补货";
  });

  const statusBanner = computed(() => {
    const item = options.item();
    if (item.status !== "claimed") return "";
    if (item.assignedTo === options.currentUserId()) return "我在采购";
    if (item.assignedToName) return `${item.assignedToName} 采购中`;
    return "正在采购中";
  });

  const statusMeta = computed(() => {
    const item = options.item();
    if (item.status === "claimed") {
      if (item.assignedTo === options.currentUserId()) return "已由你认领";
      if (item.assignedToName) return `已由 ${item.assignedToName} 采购中`;
      return "已被其他成员认领";
    }

    if (item.status === "purchased") {
      return item.purchasedByName || "已买到";
    }

    if (item.hasInFridge) return "库存已命中";

    return "";
  });

  const showClaimAction = computed(() => {
    const item = options.item();
    return !item.assignedTo || item.assignedTo === options.currentUserId();
  });

  const showClaimIconButton = computed(() => {
    const item = options.item();
    return !item.hasInFridge && item.status !== "purchased" && showClaimAction.value;
  });

  const showAssignIconButton = computed(() => {
    const item = options.item();
    return (
      !item.hasInFridge &&
      item.status !== "purchased" &&
      options.canAssign()
    );
  });

  const showDeleteIconButton = computed(() => {
    const item = options.item();
    return (
      !item.hasInFridge &&
      item.status !== "purchased" &&
      options.canAssign()
    );
  });

  const showTopActionBar = computed(
    () =>
      showClaimIconButton.value ||
      showAssignIconButton.value ||
      showDeleteIconButton.value,
  );

  const showAssignedAvatar = computed(
    () => showAssignIconButton.value && Boolean(assigneeDisplay.value),
  );

  const topActionButtonCount = computed(
    () =>
      Number(showClaimIconButton.value) +
      Number(showAssignIconButton.value) +
      Number(showDeleteIconButton.value),
  );

  const titleAreaStyle = computed(() => {
    if (topActionButtonCount.value >= 3) return { paddingRight: "112rpx" };
    if (topActionButtonCount.value === 2) return { paddingRight: "76rpx" };
    if (topActionButtonCount.value === 1) return { paddingRight: "40rpx" };
    return {};
  });

  const claimIconName = computed(() =>
    options.item().assignedTo === options.currentUserId() ? "task_alt" : "add_task",
  );

  const claimIconClass = computed(() =>
    options.item().assignedTo === options.currentUserId()
      ? "bg-primary text-white shadow-[0_6px_12px_-8px_rgba(255,157,10,0.85)]"
      : "bg-primary/10 text-primary",
  );

  const claimIconTextClass = computed(() =>
    options.item().assignedTo === options.currentUserId() ? "text-white" : "text-primary",
  );

  const assignButtonClass = computed(() =>
    showAssignedAvatar.value ? assigneePillClass.value : "bg-slate-100 text-slate-400",
  );

  const assignIconTextClass = computed(() =>
    showAssignedAvatar.value ? "text-current" : "text-slate-400",
  );

  return {
    quantityText,
    cardClass,
    showCheckedIcon,
    checkboxHitAreaClass,
    checkboxClass,
    assigneeInitial,
    assigneeAvatarClass,
    sourceText,
    statusBanner,
    statusMeta,
    showClaimIconButton,
    showAssignIconButton,
    showDeleteIconButton,
    showTopActionBar,
    showAssignedAvatar,
    titleAreaStyle,
    claimIconName,
    claimIconClass,
    claimIconTextClass,
    assignButtonClass,
    assignIconTextClass,
    canToggle,
  };
}
