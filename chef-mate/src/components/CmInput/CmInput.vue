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
      class="w-full h-10 bg-white dark:bg-background-input border border-gray-100 dark:border-gray-200 text-text-main dark:text-text-main rounded-[20rpx] text-md transition-all duration-300 shadow-sm focus:border-primary focus:shadow-[0_0_0_2px_rgba(var(--primary),0.2)]"
      :class="[icon || $slots.prefix ? 'pl-14' : 'pl-5', inputClass]"
      :type="type"
      :password="password"
      :placeholder="placeholder"
      placeholder-class="text-gray-400 dark:text-gray-400"
      :value="modelValue"
      :maxlength="maxlength"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <slot name="suffix"></slot>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";

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
  }>(),
  {
    type: "text",
    password: false,
    placeholder: "",
    maxlength: -1,
    dark: false,
    customClass: "",
    inputClass: "pr-5",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number): void;
  (e: "focus", event: Event): void;
  (e: "blur", event: Event): void;
}>();

const isFocused = ref(false);

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
</script>
