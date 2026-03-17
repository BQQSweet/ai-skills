import { computed, ref, type Ref } from "vue";
import { useRecipeStore } from "@/stores/recipe";
import { GUIDE_SWIPE_THRESHOLD } from "../constants/cooking-guide";

interface ToastValue {
  show?: (options: { type: string; message: string; complete?: () => void }) => void;
}

export function useCookingGuideSession(options: { toastRef: Ref<ToastValue | null> }) {
  const recipeStore = useRecipeStore();
  const recipe = computed(() => recipeStore.currentRecipe);
  const steps = computed(() => recipe.value?.steps || []);
  const totalSteps = computed(() => steps.value.length);

  const currentStepIndex = ref(0);
  const currentStep = computed(() => steps.value[currentStepIndex.value]);
  const isLastStep = computed(() => currentStepIndex.value === totalSteps.value - 1);
  const progressPercent = computed(() => {
    if (totalSteps.value === 0) return 0;
    return ((currentStepIndex.value + 1) / totalSteps.value) * 100;
  });

  const startX = ref(0);
  const startY = ref(0);

  function nextStep() {
    if (isLastStep.value) {
      options.toastRef.value?.show?.({
        type: "success",
        message: "恭喜完成烹饪！",
        complete() {
          uni.navigateBack();
        },
      });
      return;
    }

    currentStepIndex.value += 1;
  }

  function prevStep() {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value -= 1;
    }
  }

  function handleTouchStart(e: TouchEvent) {
    if (e.touches?.length > 0) {
      startX.value = e.touches[0].clientX;
      startY.value = e.touches[0].clientY;
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    if (e.changedTouches?.length > 0) {
      const diffX = e.changedTouches[0].clientX - startX.value;
      const diffY = e.changedTouches[0].clientY - startY.value;
      if (
        Math.abs(diffX) > Math.abs(diffY) &&
        Math.abs(diffX) > GUIDE_SWIPE_THRESHOLD
      ) {
        diffX > 0 ? prevStep() : nextStep();
      }
    }
  }

  function exitGuide() {
    uni.navigateBack();
  }

  return {
    recipe,
    steps,
    totalSteps,
    currentStepIndex,
    currentStep,
    isLastStep,
    progressPercent,
    nextStep,
    prevStep,
    handleTouchStart,
    handleTouchEnd,
    exitGuide,
  };
}
