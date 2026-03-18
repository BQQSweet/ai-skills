import { reactive, ref, watch } from "vue";
import { addFridgeItem } from "@/services/fridge";
import { useGroupStore } from "@/stores/group";
import type { RecognizedFridgeData } from "@/types/fridge";

export function useScanResultForm(options: {
  recognizedData: () => RecognizedFridgeData | null;
  imageBase64: () => string;
  emit: (event: "update:show" | "added", ...args: any[]) => void;
  toastRef: { value?: any };
}) {
  const groupStore = useGroupStore();
  const isLoading = ref(false);
  const isSubmitting = ref(false);

  const categories = [
    "肉禽",
    "果蔬",
    "海鲜",
    "乳制品",
    "调味",
    "主食",
    "零食",
    "饮品",
    "其他",
  ];

  const form = reactive({
    name: "",
    category: "其他",
    quantity: "" as any,
    unit: "",
    production_date: "",
    expire_date: "",
  });

  const showDatePicker = ref(false);
  const currentPickerField = ref<"production_date" | "expire_date">(
    "expire_date",
  );
  const pickerValue = ref(Number(new Date()));

  watch(
    () => options.recognizedData(),
    (data) => {
      if (data) {
        form.name = data.name || "";
        form.category = categories.includes(data.category) ? data.category : "其他";
        form.quantity = data.quantity?.toString() || "";
        form.unit = data.unit || "";
        form.production_date = data.production_date || "";
        form.expire_date = data.expire_date || "";
      }
    },
    { immediate: true },
  );

  function openPicker(field: "production_date" | "expire_date") {
    currentPickerField.value = field;
    if (form[field]) {
      pickerValue.value = Number(new Date(form[field]));
    } else {
      pickerValue.value = Number(new Date());
    }
    showDatePicker.value = true;
  }

  function onDatePickerConfirm(event: any) {
    const date = new Date(event.value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    form[currentPickerField.value] = `${year}-${month}-${day}`;
    showDatePicker.value = false;
  }

  function close() {
    options.emit("update:show", false);
  }

  async function handleSubmit() {
    if (!groupStore.currentGroup) {
      options.toastRef.value?.show({ message: "请先加入家庭组", type: "error" });
      return;
    }
    if (!form.name.trim()) {
      options.toastRef.value?.show({ message: "请输入食材名称", type: "error" });
      return;
    }
    if (!form.expire_date) {
      options.toastRef.value?.show({ message: "请选择过期日期", type: "error" });
      return;
    }

    isSubmitting.value = true;
    try {
      await addFridgeItem({
        groupId: groupStore.currentGroup.id,
        name: form.name,
        category: form.category,
        quantity: Number(form.quantity) || 1,
        unit: form.unit || "份",
        expire_date: form.expire_date,
        production_date: form.production_date || undefined,
        photo_base64: options.imageBase64() || undefined,
        source: "scan",
      });
      options.toastRef.value?.show({ message: "添加成功！", type: "success" });
      setTimeout(() => {
        close();
        options.emit("added");
      }, 800);
    } catch (error: any) {
      options.toastRef.value?.show({
        message: error.message || "添加失败",
        type: "error",
      });
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    isLoading,
    isSubmitting,
    categories,
    form,
    showDatePicker,
    pickerValue,
    openPicker,
    onDatePickerConfirm,
    close,
    handleSubmit,
  };
}
