import { ref } from "vue";

const COMPLETION_TRANSITION_MS = 360;

export function useShoppingCompletionTransition() {
  const completionTransitionState = ref<Record<string, boolean>>({});
  const restoringCompletedState = ref<Record<string, boolean>>({});
  const completionTransitionTimers = new Map<string, ReturnType<typeof setTimeout>>();

  function isTransitioningToCompleted(itemId: string) {
    return Boolean(completionTransitionState.value[itemId]);
  }

  function isRestoringCompletedItem(itemId: string) {
    return Boolean(restoringCompletedState.value[itemId]);
  }

  function setCompletionTransition(itemId: string, active: boolean) {
    if (active) {
      completionTransitionState.value = {
        ...completionTransitionState.value,
        [itemId]: true,
      };
      return;
    }

    const { [itemId]: _removed, ...rest } = completionTransitionState.value;
    completionTransitionState.value = rest;
  }

  function setRestoringCompletedItem(itemId: string, active: boolean) {
    if (active) {
      restoringCompletedState.value = {
        ...restoringCompletedState.value,
        [itemId]: true,
      };
      return;
    }

    const { [itemId]: _removed, ...rest } = restoringCompletedState.value;
    restoringCompletedState.value = rest;
  }

  function clearCompletionTransitionTimer(itemId: string) {
    const timer = completionTransitionTimers.get(itemId);
    if (timer) {
      clearTimeout(timer);
      completionTransitionTimers.delete(itemId);
    }
  }

  function finishCompletionTransition(itemId: string, delay = 0) {
    clearCompletionTransitionTimer(itemId);

    if (delay <= 0) {
      setCompletionTransition(itemId, false);
      return;
    }

    completionTransitionTimers.set(
      itemId,
      setTimeout(() => {
        clearCompletionTransitionTimer(itemId);
        setCompletionTransition(itemId, false);
      }, delay),
    );
  }

  function resetCompletionTransitions() {
    completionTransitionTimers.forEach((timer) => clearTimeout(timer));
    completionTransitionTimers.clear();
    completionTransitionState.value = {};
    restoringCompletedState.value = {};
  }

  async function runPurchaseTransition(
    itemId: string,
    action: () => Promise<unknown>,
    onSuccess: () => void,
    onError: () => void,
  ) {
    clearCompletionTransitionTimer(itemId);
    setCompletionTransition(itemId, true);
    const startedAt = Date.now();

    try {
      await action();
      const elapsed = Date.now() - startedAt;
      finishCompletionTransition(
        itemId,
        Math.max(0, COMPLETION_TRANSITION_MS - elapsed),
      );
      onSuccess();
    } catch {
      clearCompletionTransitionTimer(itemId);
      setCompletionTransition(itemId, false);
      onError();
    }
  }

  return {
    completionTransitionState,
    restoringCompletedState,
    isTransitioningToCompleted,
    isRestoringCompletedItem,
    setRestoringCompletedItem,
    resetCompletionTransitions,
    runPurchaseTransition,
  };
}
