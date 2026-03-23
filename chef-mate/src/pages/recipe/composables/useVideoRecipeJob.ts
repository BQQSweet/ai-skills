import { computed, onBeforeUnmount, ref } from "vue";
import { getFridgeItems } from "@/services/fridge";
import { classifyRecipeIngredients } from "@/services/shopping";
import {
  getVideoRecipeJobStatus,
  regenerateVideoRecipe,
  submitVideoRecipe,
} from "@/services/recipe";
import { useGroupStore } from "@/stores/group";
import { useRecipeStore } from "@/stores/recipe";
import {
  getStorage,
  removeStorage,
  setStorage,
  STORAGE_KEYS,
} from "@/utils/storage";
import type {
  Recipe,
  RecipeIngredient,
  VideoRecipeClassifiedIngredient,
  VideoRecipeIngredientAvailability,
  VideoRecipeJobStatus,
  VideoRecipeMode,
  VideoRecipePageState,
  VideoRecipeSelectedFile,
} from "@/types/recipe";
import type { FridgeItem } from "@/types/fridge";

const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024;
const POLL_INTERVAL = 3000;

interface StoredActiveVideoRecipeJob {
  jobId: string;
  file: VideoRecipeSelectedFile | null;
  mode: VideoRecipeMode;
}

function normalizeIngredientName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[　\s]+/g, "")
    .replace(/[：:]/g, "");
}

function buildIngredientKey(item: RecipeIngredient, index: number) {
  return `${index}:${item.name}:${item.quantity}:${item.unit}`;
}

export function useVideoRecipeJob() {
  const groupStore = useGroupStore();
  const recipeStore = useRecipeStore();

  const status = ref<VideoRecipePageState>("idle");
  const selectedFile = ref<VideoRecipeSelectedFile | null>(null);
  const jobStatus = ref<VideoRecipeJobStatus | null>(null);
  const ingredientAvailability = ref<VideoRecipeIngredientAvailability[]>([]);
  const classifiedIngredients = ref<VideoRecipeClassifiedIngredient[]>([]);
  const classifyingIngredients = ref(false);
  const ingredientClassificationError = ref("");
  const errorMessage = ref("");
  const regenerating = ref(false);
  const mode = ref<VideoRecipeMode>("strict");
  const pollTimer = ref<ReturnType<typeof setTimeout> | null>(null);
  const pollingJobId = ref("");

  const recipe = computed(() => jobStatus.value?.recipe || null);
  const coverUrl = computed(() => recipe.value?.cover_url || "");
  const isBusy = computed(
    () =>
      status.value === "uploading"
      || status.value === "processing"
      || regenerating.value,
  );
  const canSubmit = computed(
    () => Boolean(selectedFile.value?.path) && !isBusy.value,
  );
  const modeLabel = computed(() =>
    mode.value === "strict" ? "严格模式" : "允许补全",
  );
  const displayIngredients = computed<VideoRecipeClassifiedIngredient[]>(() => {
    if (classifiedIngredients.value.length) {
      return classifiedIngredients.value;
    }

    return ingredientAvailability.value.map((item, index) => ({
      ...item,
      type: "ingredient",
      selectedByDefault: true,
      key: buildIngredientKey(item, index),
    }));
  });
  const shoppingSelectableIngredients = computed(() =>
    classifiedIngredients.value.filter((item) => !item.inFridge),
  );

  function clearPolling() {
    if (pollTimer.value) {
      clearTimeout(pollTimer.value);
      pollTimer.value = null;
    }
    pollingJobId.value = "";
  }

  function persistActiveJob(jobId: string, file: VideoRecipeSelectedFile | null) {
    setStorage(STORAGE_KEYS.ACTIVE_VIDEO_RECIPE_JOB, {
      jobId,
      file,
      mode: mode.value,
    } satisfies StoredActiveVideoRecipeJob);
  }

  function clearActiveJobStorage() {
    removeStorage(STORAGE_KEYS.ACTIVE_VIDEO_RECIPE_JOB);
  }

  function updateSelectedFile(file: VideoRecipeSelectedFile) {
    selectedFile.value = file;
    if (status.value === "idle" || status.value === "failed") {
      status.value = "selected";
    }
  }

  function setMode(nextMode: VideoRecipeMode) {
    mode.value = nextMode;
  }

  async function chooseLocalVideo() {
    if (isBusy.value) {
      return;
    }

    const file = await new Promise<VideoRecipeSelectedFile | null>((resolve) => {
      uni.chooseVideo({
        sourceType: ["album", "camera"],
        compressed: false,
        maxDuration: 1800,
        success: (result) => {
          const tempFilePath = result.tempFilePath || "";
          if (!tempFilePath) {
            resolve(null);
            return;
          }

          const derivedName =
            tempFilePath.split("/").pop()?.split("?")[0] || "本地视频";

          resolve({
            path: tempFilePath,
            name: derivedName,
            size: Number(result.size || 0),
            duration: Number(result.duration || 0),
          });
        },
        fail: () => resolve(null),
      });
    });

    if (!file) {
      return;
    }

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      uni.$u.toast("文件不能超过 500MB");
      return;
    }

    errorMessage.value = "";
    jobStatus.value = null;
    ingredientAvailability.value = [];
    classifiedIngredients.value = [];
    ingredientClassificationError.value = "";
    updateSelectedFile(file);
  }

  async function submitSelectedVideo() {
    if (!selectedFile.value || isBusy.value) {
      return;
    }

    status.value = "uploading";
    errorMessage.value = "";
    ingredientAvailability.value = [];
    classifiedIngredients.value = [];
    ingredientClassificationError.value = "";

    try {
      const result = await submitVideoRecipe(selectedFile.value.path, mode.value);
      persistActiveJob(result.jobId, selectedFile.value);

      jobStatus.value = {
        jobId: result.jobId,
        status: "queued",
        progress: 5,
        stage: "validating",
        mode: result.mode,
      };

      mode.value = result.mode;
      status.value = "processing";
      await pollJob(result.jobId, true);
    } catch (error: any) {
      status.value = "failed";
      errorMessage.value = error?.message || "视频上传失败，请稍后重试";
      clearActiveJobStorage();
    }
  }

  async function resumeActiveJob() {
    if (pollingJobId.value) {
      return;
    }

    const stored = getStorage<StoredActiveVideoRecipeJob>(
      STORAGE_KEYS.ACTIVE_VIDEO_RECIPE_JOB,
    );

    if (!stored?.jobId) {
      return;
    }

    mode.value = stored.mode || "strict";

    if (stored.file) {
      selectedFile.value = stored.file;
    }

    status.value = "processing";
    errorMessage.value = "";
    jobStatus.value = {
      jobId: stored.jobId,
      status: "queued",
      progress: 0,
      stage: "validating",
      mode: mode.value,
    };

    await pollJob(stored.jobId, true);
  }

  async function pollJob(jobId: string, immediate = false) {
    clearPolling();
    pollingJobId.value = jobId;

    const run = async () => {
      try {
        const nextStatus = await getVideoRecipeJobStatus(jobId);
        jobStatus.value = nextStatus;
        mode.value = nextStatus.mode;

        if (nextStatus.status === "completed" && nextStatus.recipe) {
          status.value = "done";
          clearPolling();
          clearActiveJobStorage();
          await syncRecipeIngredients(nextStatus.recipe);
          return;
        }

        if (nextStatus.status === "failed") {
          status.value = "failed";
          errorMessage.value = nextStatus.error || "视频解析失败，请稍后重试";
          clearPolling();
          clearActiveJobStorage();
          return;
        }

        status.value = "processing";
        pollTimer.value = setTimeout(() => {
          void run();
        }, POLL_INTERVAL);
      } catch (error: any) {
        status.value = "failed";
        errorMessage.value = error?.message || "任务状态获取失败";
        clearPolling();
        clearActiveJobStorage();
      }
    };

    if (immediate) {
      await run();
      return;
    }

    pollTimer.value = setTimeout(() => {
      void run();
    }, POLL_INTERVAL);
  }

  async function regenerateWithMode(nextMode: VideoRecipeMode) {
    if (!jobStatus.value?.jobId || !recipe.value || regenerating.value) {
      return;
    }

    if (nextMode === mode.value) {
      return;
    }

    regenerating.value = true;

    try {
      const result = await regenerateVideoRecipe(jobStatus.value.jobId, nextMode);
      mode.value = result.mode;
      jobStatus.value = {
        ...(jobStatus.value || {
          jobId: result.jobId,
          status: "completed",
          progress: 100,
          stage: "saving",
          mode: result.mode,
        }),
        status: "completed",
        progress: 100,
        stage: "saving",
        mode: result.mode,
        recipe: result.recipe,
      };
      status.value = "done";
      await syncRecipeIngredients(result.recipe);
      uni.$u.toast(
        nextMode === "strict" ? "已切换为严格模式" : "已切换为允许补全",
      );
    } catch (error: any) {
      uni.$u.toast(error?.message || "重生成失败，请稍后重试");
    } finally {
      regenerating.value = false;
    }
  }

  async function syncIngredientAvailability(currentRecipe: Recipe) {
    const fallbackIngredients = currentRecipe.ingredients || [];
    ingredientAvailability.value = fallbackIngredients.map((item) => ({
      ...item,
      inFridge: false,
    }));

    if (!groupStore.currentGroup) {
      try {
        await groupStore.fetchMyGroups();
      } catch {
        return;
      }
    }

    if (!groupStore.currentGroup) {
      return;
    }

    try {
      const fridgeItems = await getFridgeItems(groupStore.currentGroup.id);
      const fridgeMap = new Map(
        (fridgeItems as FridgeItem[]).map((item) => [
          normalizeIngredientName(item.name),
          item.name,
        ]),
      );

      ingredientAvailability.value = fallbackIngredients.map((item) => {
        const normalizedName = normalizeIngredientName(item.name);
        return {
          ...item,
          inFridge: fridgeMap.has(normalizedName),
          matchedName: fridgeMap.get(normalizedName),
        };
      });
    } catch {
      ingredientAvailability.value = fallbackIngredients.map((item) => ({
        ...item,
        inFridge: false,
      }));
    }
  }

  async function classifyVideoIngredients(
    currentRecipe: Recipe,
    availability: VideoRecipeIngredientAvailability[],
  ) {
    if (!currentRecipe.ingredients?.length) {
      classifiedIngredients.value = [];
      ingredientClassificationError.value = "";
      return;
    }

    classifyingIngredients.value = true;
    ingredientClassificationError.value = "";

    try {
      const result = await classifyRecipeIngredients({
        recipeId: currentRecipe.id || undefined,
        recipeTitle: currentRecipe.title || undefined,
        ingredients: currentRecipe.ingredients,
      });

      classifiedIngredients.value = result.ingredients.map((item, index) => {
        const matched = availability[index];
        return {
          ...(matched || {
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            optional: item.optional,
            inFridge: false,
          }),
          type: item.type,
          selectedByDefault: item.selectedByDefault,
          key: buildIngredientKey(item, index),
        };
      });
    } catch (error: any) {
      classifiedIngredients.value = [];
      ingredientClassificationError.value =
        error?.msg || error?.message || "原料分类失败，请稍后重试";
    } finally {
      classifyingIngredients.value = false;
    }
  }

  async function syncRecipeIngredients(currentRecipe: Recipe) {
    await syncIngredientAvailability(currentRecipe);
    await classifyVideoIngredients(currentRecipe, ingredientAvailability.value);
  }

  function openRecipeSteps() {
    if (!recipe.value) {
      return;
    }

    recipeStore.setCurrentRecipe(recipe.value);
    uni.navigateTo({
      url: "/pages/recipe/cooking-steps",
    });
  }

  async function openShoppingList() {
    if (!recipe.value) {
      return;
    }

    if (classifyingIngredients.value) {
      uni.$u.toast("原料分类中，请稍候");
      return;
    }

    if (ingredientClassificationError.value) {
      uni.$u.toast(ingredientClassificationError.value);
      return;
    }

    if (!shoppingSelectableIngredients.value.length) {
      uni.$u.toast("所需食材已都在冰箱中");
      return;
    }
  }

  function resetForRetry() {
    clearPolling();
    clearActiveJobStorage();
    jobStatus.value = null;
    ingredientAvailability.value = [];
    classifiedIngredients.value = [];
    ingredientClassificationError.value = "";
    classifyingIngredients.value = false;
    errorMessage.value = "";
    regenerating.value = false;
    mode.value = "strict";
    status.value = selectedFile.value ? "selected" : "idle";
  }

  function clearSelectedVideo() {
    if (isBusy.value) {
      return;
    }

    clearPolling();
    clearActiveJobStorage();
    selectedFile.value = null;
    jobStatus.value = null;
    ingredientAvailability.value = [];
    classifiedIngredients.value = [];
    ingredientClassificationError.value = "";
    classifyingIngredients.value = false;
    errorMessage.value = "";
    regenerating.value = false;
    status.value = "idle";
  }

  onBeforeUnmount(() => {
    clearPolling();
  });

  return {
    status,
    selectedFile,
    jobStatus,
    recipe,
    coverUrl,
    mode,
    modeLabel,
    ingredientAvailability,
    displayIngredients,
    classifiedIngredients,
    shoppingSelectableIngredients,
    classifyingIngredients,
    ingredientClassificationError,
    errorMessage,
    regenerating,
    isBusy,
    canSubmit,
    setMode,
    chooseLocalVideo,
    submitSelectedVideo,
    resumeActiveJob,
    regenerateWithMode,
    openRecipeSteps,
    openShoppingList,
    resetForRetry,
    clearSelectedVideo,
  };
}
