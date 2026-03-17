import { computed, ref } from "vue";

export function useInviteCodeInput() {
  const inviteCodeArr = ref(["", "", "", "", "", ""]);
  const focusIndex = ref(-1);
  const inviteCode = computed(() => inviteCodeArr.value.join(""));

  function resetInviteCodeInput() {
    inviteCodeArr.value = ["", "", "", "", "", ""];
    focusIndex.value = -1;
  }

  function handleInviteCodeInput(index: number, event: { detail?: { value?: string } }) {
    const value = String(event?.detail?.value || "")
      .replace(/[^0-9a-z]/gi, "")
      .toUpperCase()
      .slice(-1);
    inviteCodeArr.value[index] = value;

    if (value && index < inviteCodeArr.value.length - 1) {
      focusIndex.value = index + 1;
      return;
    }

    if (!value && index > 0) {
      focusIndex.value = index - 1;
    }
  }

  return {
    inviteCodeArr,
    focusIndex,
    inviteCode,
    resetInviteCodeInput,
    handleInviteCodeInput,
  };
}
