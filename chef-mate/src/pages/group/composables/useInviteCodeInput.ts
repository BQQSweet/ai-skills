import { computed, ref } from "vue";

const INVITE_CODE_LENGTH = 6;
const INVITE_CODE_ALLOWED_REGEXP = /[A-HJ-NP-Z2-9]/g;

type InviteInputEvent = {
  detail?: {
    value?: string;
  };
};

export function useInviteCodeInput() {
  const inviteCodeArr = ref(Array.from({ length: INVITE_CODE_LENGTH }, () => ""));
  const focusIndex = ref(-1);
  const inviteCode = computed(() => inviteCodeArr.value.join(""));

  function resetInviteCodeInput() {
    inviteCodeArr.value = Array.from({ length: INVITE_CODE_LENGTH }, () => "");
    focusIndex.value = -1;
  }

  function sanitizeInviteCodeInput(value?: string) {
    return (value || "")
      .toUpperCase()
      .match(INVITE_CODE_ALLOWED_REGEXP)
      ?.join("") || "";
  }

  function updateFocusAfterInput(lastFilledIndex: number) {
    if (lastFilledIndex < 0) {
      focusIndex.value = 0;
      return;
    }

    if (lastFilledIndex < INVITE_CODE_LENGTH - 1) {
      focusIndex.value = lastFilledIndex + 1;
      return;
    }

    focusIndex.value = -1;
  }

  function fillInviteCodeFromStart(value: string) {
    const nextInviteCodeArr = Array.from(
      { length: INVITE_CODE_LENGTH },
      (_, arrIndex) => value[arrIndex] || "",
    );
    inviteCodeArr.value = nextInviteCodeArr;
    updateFocusAfterInput(
      Math.min(value.length, INVITE_CODE_LENGTH) - 1,
    );
  }

  function fillInviteCodeFromIndex(index: number, value: string) {
    const nextInviteCodeArr = [...inviteCodeArr.value];
    const writableLength = Math.min(
      value.length,
      INVITE_CODE_LENGTH - index,
    );

    for (let offset = 0; offset < writableLength; offset += 1) {
      nextInviteCodeArr[index + offset] = value[offset] || "";
    }

    inviteCodeArr.value = nextInviteCodeArr;
    updateFocusAfterInput(index + writableLength - 1);
  }

  function handleInviteCodeInput(index: number, event: InviteInputEvent) {
    const sanitizedValue = sanitizeInviteCodeInput(event?.detail?.value);

    if (!sanitizedValue) {
      inviteCodeArr.value[index] = "";
      focusIndex.value = index > 0 ? index - 1 : 0;
      return;
    }

    if (sanitizedValue.length >= INVITE_CODE_LENGTH) {
      fillInviteCodeFromStart(sanitizedValue.slice(0, INVITE_CODE_LENGTH));
      return;
    }

    if (sanitizedValue.length > 1) {
      fillInviteCodeFromIndex(index, sanitizedValue);
      return;
    }

    inviteCodeArr.value[index] = sanitizedValue;
    updateFocusAfterInput(index);
  }

  return {
    inviteCodeArr,
    focusIndex,
    inviteCode,
    resetInviteCodeInput,
    handleInviteCodeInput,
  };
}
