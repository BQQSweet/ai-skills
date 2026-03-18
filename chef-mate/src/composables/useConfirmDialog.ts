import { reactive } from "vue";

type DialogTone = "primary" | "danger";
type DialogVariant = "confirm" | "actions";
type DialogActionTone = DialogTone | "default";

export interface ConfirmDialogAction {
  key: string;
  label: string;
  tone?: DialogActionTone;
}

interface DialogState {
  show: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  iconName: string;
  tone: DialogTone;
  closeOnClickOverlay: boolean;
  disabled: boolean;
  variant: DialogVariant;
  actions: ConfirmDialogAction[];
  actionDescription: string;
}

interface OpenConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  iconName?: string;
  tone?: DialogTone;
  closeOnClickOverlay?: boolean;
}

interface OpenActionSheetOptions {
  title: string;
  description?: string;
  cancelText?: string;
  iconName?: string;
  closeOnClickOverlay?: boolean;
  actions: ConfirmDialogAction[];
}

type PendingMode = DialogVariant | null;
type PendingValue = boolean | string | null;
type PendingResolve = ((value: any) => void) | null;

function createInitialState(): DialogState {
  return {
    show: false,
    title: "",
    description: "",
    confirmText: "确认",
    cancelText: "取消",
    iconName: "warning",
    tone: "primary",
    closeOnClickOverlay: true,
    disabled: false,
    variant: "confirm",
    actions: [],
    actionDescription: "",
  };
}

export function useConfirmDialog() {
  const dialogState = reactive<DialogState>(createInitialState());
  let pendingMode: PendingMode = null;
  let pendingResolve: PendingResolve = null;
  let resetTimer: ReturnType<typeof setTimeout> | null = null;

  function clearDialogState() {
    Object.assign(dialogState, createInitialState());
  }

  function scheduleClearDialogState() {
    if (resetTimer) {
      clearTimeout(resetTimer);
    }

    resetTimer = setTimeout(() => {
      clearDialogState();
      resetTimer = null;
    }, 220);
  }

  function settle(value: PendingValue) {
    const resolve = pendingResolve;
    pendingResolve = null;
    pendingMode = null;
    dialogState.show = false;
    scheduleClearDialogState();
    resolve?.(value);
  }

  function resolveDismiss() {
    if (!pendingResolve || !pendingMode) return;
    settle(pendingMode === "confirm" ? false : null);
  }

  function openConfirm(options: OpenConfirmOptions): Promise<boolean> {
    resolveDismiss();
    pendingMode = "confirm";
    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }

    Object.assign(dialogState, {
      ...createInitialState(),
      show: true,
      title: options.title,
      description: options.description || "",
      confirmText: options.confirmText || "确认",
      cancelText: options.cancelText || "取消",
      iconName: options.iconName || "warning",
      tone: options.tone || "primary",
      closeOnClickOverlay: options.closeOnClickOverlay ?? true,
    });

    return new Promise<boolean>((resolve) => {
      pendingResolve = resolve;
    });
  }

  function openActionSheet(options: OpenActionSheetOptions): Promise<string | null> {
    resolveDismiss();
    pendingMode = "actions";
    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }

    Object.assign(dialogState, {
      ...createInitialState(),
      show: true,
      title: options.title,
      description: options.description || "",
      cancelText: options.cancelText || "取消",
      iconName: options.iconName || "list_alt",
      closeOnClickOverlay: options.closeOnClickOverlay ?? true,
      variant: "actions",
      actions: options.actions,
      actionDescription: options.description || "",
    });

    return new Promise<string | null>((resolve) => {
      pendingResolve = resolve;
    });
  }

  function handleConfirm() {
    if (dialogState.disabled || pendingMode !== "confirm") return;
    settle(true);
  }

  function handleSelect(key: string) {
    if (dialogState.disabled || pendingMode !== "actions") return;
    settle(key);
  }

  function handleCancel() {
    if (dialogState.disabled) return;
    resolveDismiss();
  }

  function handleClose() {
    if (dialogState.disabled) return;
    resolveDismiss();
  }

  return {
    dialogState,
    openConfirm,
    openActionSheet,
    handleConfirm,
    handleSelect,
    handleCancel,
    handleClose,
  };
}
