<template>
  <view class="scan-result-editor">
    <u-popup
      :show="show"
      mode="bottom"
      @close="close"
      :customStyle="{ backgroundColor: '#FAFAFA' }"
      round="24rpx"
    >
      <view class="flex flex-col max-h-[85vh]">
        <!-- Header -->
        <view
          class="pt-6 px-5 pb-4 bg-white flex items-center justify-between rounded-t-2xl"
        >
          <view class="flex items-center gap-3">
            <view class="text-slate-800 active:opacity-70" @click="close">
              <text class="material-symbols-outlined leading-none">close</text>
            </view>
            <text class="text-lg font-bold text-slate-900">确认食材信息</text>
          </view>
          <view v-if="isLoading" class="flex items-center gap-1.5 text-primary">
            <text class="text-xs font-medium animate-pulse">识别中...</text>
          </view>
        </view>

        <!-- Form -->
        <scroll-view scroll-y class="flex-1 px-5 py-4" style="height: 60vh">
          <view class="flex flex-col gap-5">
            <!-- 食材名称 -->
            <view class="flex flex-col gap-1.5">
              <text class="text-sm font-semibold text-slate-700">食材名称</text>
              <CmInput v-model="form.name" placeholder="请输入食材名称" />
            </view>

            <!-- 分类 -->
            <view class="flex flex-col gap-1.5">
              <text class="text-sm font-semibold text-slate-700">分类</text>
              <view class="flex flex-wrap gap-2">
                <button
                  v-for="cat in categories"
                  :key="cat"
                  class="m-0 px-4 py-2 rounded-full text-sm font-medium transition-all after:hidden border leading-none"
                  :class="
                    form.category === cat
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white text-slate-600 border-slate-100 active:bg-slate-50'
                  "
                  @click="form.category = cat"
                >
                  {{ cat }}
                </button>
              </view>
            </view>

            <!-- 数量 + 单位 -->
            <view class="flex gap-3">
              <view class="flex-1 flex flex-col gap-1.5">
                <text class="text-sm font-semibold text-slate-700">数量</text>
                <CmInput
                  v-model="form.quantity"
                  placeholder="数量"
                  type="digit"
                />
              </view>
              <view class="w-28 flex flex-col gap-1.5">
                <text class="text-sm font-semibold text-slate-700">单位</text>
                <CmInput v-model="form.unit" placeholder="克/个/袋" />
              </view>
            </view>

            <!-- 生产日期 -->
            <view class="flex flex-col gap-1.5">
              <text class="text-sm font-semibold text-slate-700">生产日期</text>
              <view
                class="h-14 px-5 bg-white border border-gray-100 rounded-[20rpx] flex items-center text-md"
                :class="
                  form.production_date ? 'text-slate-800' : 'text-gray-400'
                "
                @click="openPicker('production_date')"
              >
                {{ form.production_date || "请选择生产日期" }}
              </view>
            </view>

            <!-- 过期日期 -->
            <view class="flex flex-col gap-1.5">
              <text class="text-sm font-semibold text-slate-700">过期日期</text>
              <view
                class="h-14 px-5 bg-white border border-gray-100 rounded-[20rpx] flex items-center text-md"
                :class="form.expire_date ? 'text-slate-800' : 'text-gray-400'"
                @click="openPicker('expire_date')"
              >
                {{ form.expire_date || "请选择过期日期" }}
              </view>
            </view>
          </view>
        </scroll-view>

        <!-- Footer -->
        <view class="p-5 bg-white border-t border-slate-100 pb-safe">
          <button
            class="w-full m-0 border-none after:hidden bg-primary text-white h-[56px] flex justify-center items-center rounded-2xl font-bold text-[17px] shadow-[0_10px_15px_-3px_rgba(255,159,10,0.3)] active:scale-[0.98] transition-transform"
            :class="isSubmitting ? 'opacity-70' : ''"
            :disabled="isSubmitting"
            @click="handleSubmit"
          >
            {{ isSubmitting ? "添加中..." : "确认添加" }}
          </button>
        </view>
      </view>
    </u-popup>

    <up-datetime-picker
      :show="showDatePicker"
      v-model="pickerValue"
      mode="date"
      @confirm="onDatePickerConfirm"
      @cancel="showDatePicker = false"
    ></up-datetime-picker>

    <up-toast ref="uToastRef"></up-toast>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { addFridgeItem } from "@/services/fridge";

const props = defineProps<{
  show: boolean;
  recognizedData: Record<string, any> | null;
  imageBase64: string;
}>();

const emit = defineEmits(["update:show", "added"]);

const uToastRef = ref();
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

const openPicker = (field: "production_date" | "expire_date") => {
  currentPickerField.value = field;
  if (form[field]) {
    pickerValue.value = Number(new Date(form[field]));
  } else {
    pickerValue.value = Number(new Date());
  }
  showDatePicker.value = true;
};

const onDatePickerConfirm = (e: any) => {
  const date = new Date(e.value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  form[currentPickerField.value] = `${year}-${month}-${day}`;
  showDatePicker.value = false;
};

// 当识别数据变化时，填充表单
watch(
  () => props.recognizedData,
  (data) => {
    if (data) {
      form.name = data.name || "";
      form.category = categories.includes(data.category)
        ? data.category
        : "其他";
      form.quantity = data.quantity?.toString() || "";
      form.unit = data.unit || "";
      form.production_date = data.production_date || "";
      form.expire_date = data.expire_date || "";
    }
  },
  { immediate: true },
);

const close = () => {
  emit("update:show", false);
};

const handleSubmit = async () => {
  if (!form.name.trim()) {
    uToastRef.value?.show({ message: "请输入食材名称", type: "error" });
    return;
  }
  if (!form.expire_date) {
    uToastRef.value?.show({ message: "请选择过期日期", type: "error" });
    return;
  }

  isSubmitting.value = true;
  try {
    await addFridgeItem({
      name: form.name,
      category: form.category,
      quantity: Number(form.quantity) || 1,
      unit: form.unit || "份",
      expire_date: form.expire_date,
      production_date: form.production_date || undefined,
      photo_base64: props.imageBase64 || undefined,
      source: "scan",
    });
    uToastRef.value?.show({ message: "添加成功！", type: "success" });
    setTimeout(() => {
      close();
      emit("added");
    }, 800);
  } catch (e: any) {
    uToastRef.value?.show({ message: e.message || "添加失败", type: "error" });
  } finally {
    isSubmitting.value = false;
  }
};
</script>
