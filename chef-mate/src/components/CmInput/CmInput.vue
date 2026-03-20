<template>
  <view
    class="relative flex items-center"
    :class="[customClass, { dark: dark }]"
  >
    <view
      class="absolute left-5 flex items-center transition-colors duration-300 z-10"
      :class="isFocused ? 'text-primary' : 'text-primary/60'"
    >
      <slot name="prefix">
        <CmIcon v-if="icon" :name="icon.replace(/^icon-/, '')" size="48rpx" />
      </slot>
    </view>
    <input
      class="w-full h-10 bg-white dark:bg-background-input border text-text-main dark:text-text-main rounded-[20rpx] text-md transition-all duration-300"
      :class="[
        icon || $slots.prefix ? 'pl-14' : 'pl-5',
        showBuiltInPasswordToggle ? 'pr-14' : 'pr-5',
        isFocused
          ? 'border-primary shadow-[0_0_0_4px_rgba(var(--primary),0.14),0_12px_24px_-18px_rgba(var(--primary),0.6)]'
          : 'border-gray-100 dark:border-gray-200 shadow-sm',
        inputClass,
      ]"
      :type="resolvedType"
      :password="resolvedPassword"
      :placeholder="placeholder"
      placeholder-class="text-gray-400 dark:text-gray-400"
      :value="modelValue"
      :maxlength="maxlength"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <slot name="suffix"></slot>
    <view
      v-if="showBuiltInPasswordToggle"
      class="absolute inset-y-0 right-4 flex items-center justify-center transition-all duration-300 active:scale-95"
      :class="isFocused ? 'text-primary' : 'text-text-muted/70'"
      @click="togglePasswordVisibility"
    >
      <text class="material-symbols-outlined text-[20px] leading-none">
        {{ isPasswordVisible ? "visibility" : "visibility_off" }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, useSlots } from "vue";

const props = withDefaults(
  defineProps<{
    /** 绑定的值 */
    modelValue: string | number;
    /** input类型: text, number等 */
    type?: string;
    /** 是否为密码框 */
    password?: boolean;
    /** 占位符文本 */
    placeholder?: string;
    /** 最大长度 */
    maxlength?: number | string;
    /** 左侧阿里巴巴矢量图标名称（兼容带或不带 'icon-' 前缀的情况） */
    icon?: string;
    /** 是否强制开启深色模式 */
    dark?: boolean;
    /** 外层 view 的自定义样式类 */
    customClass?: string;
    /** input 本身的自定义样式类（可以用于覆盖 padding 等） */
    inputClass?: string;
    /** 密码框是否展示显示/隐藏切换按钮 */
    passwordToggle?: boolean;
  }>(),
  {
    type: "text",
    password: false,
    placeholder: "",
    maxlength: -1,
    dark: false,
    customClass: "",
    inputClass: "",
    passwordToggle: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number): void;
  (e: "focus", event: Event): void;
  (e: "blur", event: Event): void;
}>();

const slots = useSlots();
const isFocused = ref(false);
const isPasswordVisible = ref(false);

const showBuiltInPasswordToggle = computed(
  () => props.password && props.passwordToggle && !slots.suffix,
);

const resolvedType = computed(() =>
  showBuiltInPasswordToggle.value ? "text" : props.type,
);

const resolvedPassword = computed(
  () => props.password && (!showBuiltInPasswordToggle.value || !isPasswordVisible.value),
);

function handleInput(e: any) {
  emit("update:modelValue", e.detail.value);
}

function handleFocus(e: any) {
  isFocused.value = true;
  emit("focus", e);
}

function handleBlur(e: any) {
  isFocused.value = false;
  emit("blur", e);
}

function togglePasswordVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value;
}
</script>
