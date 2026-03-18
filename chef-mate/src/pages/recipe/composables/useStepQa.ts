import { computed, nextTick, reactive, ref } from "vue";
import { askStepQuestion } from "@/services/recipe";
import { useRecipeStore } from "@/stores/recipe";

export function useStepQa() {
  const recipeStore = useRecipeStore();
  const recipe = computed(() => recipeStore.currentRecipe);
  const showQaPopup = ref(false);
  const activeStepIndex = ref(-1);
  const activeStep = ref<any>(null);
  const questionInput = ref("");
  const isAsking = ref(false);
  const scrollTop = ref(0);

  const qaRecords = reactive<
    Record<number, { role: "user" | "ai"; content: string }[]>
  >({});

  const activeQaHistory = computed(() => {
    if (activeStepIndex.value === -1) return [];
    return qaRecords[activeStepIndex.value] || [];
  });

  function scrollToBottom() {
    nextTick(() => {
      scrollTop.value = 9999 + Math.random();
    });
  }

  function handleAsk(index: number, step: any) {
    activeStepIndex.value = index;
    activeStep.value = step;
    if (!qaRecords[index]) {
      qaRecords[index] = [];
    }
    showQaPopup.value = true;
    scrollToBottom();
  }

  async function submitQuestion() {
    const q = questionInput.value.trim();
    if (!q || isAsking.value || activeStepIndex.value === -1) return;

    qaRecords[activeStepIndex.value].push({ role: "user", content: q });
    questionInput.value = "";
    isAsking.value = true;
    scrollToBottom();

    try {
      const res: any = await askStepQuestion({
        recipeContext: `食谱名称：${recipe.value?.title || "未知"}。${recipe.value?.description || ""}`,
        stepInstruction: activeStep.value?.instruction,
        question: q,
      });

      const answer =
        res && res.data
          ? res.data
          : typeof res === "string"
            ? res
            : JSON.stringify(res);

      qaRecords[activeStepIndex.value].push({ role: "ai", content: answer });
    } catch {
      qaRecords[activeStepIndex.value].push({
        role: "ai",
        content: "抱歉，网络开小差了，请稍后再试。",
      });
    } finally {
      isAsking.value = false;
      scrollToBottom();
    }
  }

  return {
    recipe,
    showQaPopup,
    activeStep,
    questionInput,
    isAsking,
    scrollTop,
    qaRecords,
    activeQaHistory,
    handleAsk,
    submitQuestion,
  };
}
