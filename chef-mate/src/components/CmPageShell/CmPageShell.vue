<template>
  <view :class="wrapperClass">
    <view :class="fixedHeaderClass">
      <slot v-if="$slots.header" name="header" />
      <view v-else class="flex items-center justify-between gap-3">
        <view class="shrink-0">
          <slot name="left">
            <view
              class="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-surface-dark shadow-soft cursor-pointer"
              @click="$emit('back')"
            >
              <text class="material-symbols-outlined text-text-main dark:text-white">
                arrow_back_ios_new
              </text>
            </view>
          </slot>
        </view>

        <view class="min-w-0 flex-1 text-center">
          <slot name="title">
            <text class="block truncate text-lg font-bold text-text-main dark:text-white">
              {{ title }}
            </text>
            <text
              v-if="subtitle"
              class="mt-1 block text-[10px] font-medium uppercase tracking-widest text-slate-400"
            >
              {{ subtitle }}
            </text>
          </slot>
        </view>

        <view class="shrink-0">
          <slot name="right">
            <view class="h-10 w-10"></view>
          </slot>
        </view>
      </view>
    </view>

    <view :class="headerOffsetClass"></view>

    <scroll-view
      v-if="useScrollView"
      :class="contentWrapperClass"
      :scroll-y="normalizedScrollProps.scrollY"
      :scroll-x="normalizedScrollProps.scrollX"
      :scroll-top="normalizedScrollProps.scrollTop"
      :scroll-left="normalizedScrollProps.scrollLeft"
      :scroll-into-view="normalizedScrollProps.scrollIntoView"
      :scroll-with-animation="normalizedScrollProps.scrollWithAnimation"
      :show-scrollbar="normalizedScrollProps.showScrollbar"
      :enhanced="normalizedScrollProps.enhanced"
      :enable-flex="normalizedScrollProps.enableFlex"
      :refresher-enabled="normalizedScrollProps.refresherEnabled"
      :refresher-triggered="normalizedScrollProps.refresherTriggered"
      :refresher-threshold="normalizedScrollProps.refresherThreshold"
      :lower-threshold="normalizedScrollProps.lowerThreshold"
      :upper-threshold="normalizedScrollProps.upperThreshold"
      @refresherrefresh="$emit('refresh')"
    >
      <view :class="contentPaddingClass">
        <slot />
      </view>
    </scroll-view>

    <view v-else :class="contentWrapperClass">
      <view :class="contentPaddingClass">
        <slot />
      </view>
    </view>

    <view v-if="$slots.footer" :class="footerClass">
      <slot name="footer" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    useScrollView?: boolean;
    backgroundClass?: string;
    headerClass?: string;
    contentClass?: string;
    contentPaddingClass?: string;
    footerClass?: string;
    scrollViewClass?: string;
    scrollProps?: Record<string, any>;
    headerFixed?: boolean;
    headerOffsetClass?: string;
  }>(),
  {
    title: "",
    subtitle: "",
    useScrollView: true,
    backgroundClass:
      "relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display",
    headerClass:
      "sticky top-0 z-30 bg-background-light/80 dark:bg-background-dark/80 px-6 pt-12 pb-4 backdrop-blur-lg",
    contentClass: "",
    contentPaddingClass: "",
    footerClass: "",
    scrollViewClass: "",
    scrollProps: () => ({}),
    headerFixed: true,
    headerOffsetClass: "pt-[88px]",
  },
);

defineEmits<{
  back: [];
  refresh: [];
}>();

const wrapperClass = computed(() => props.backgroundClass);

const fixedHeaderClass = computed(() => {
  const positionClass = props.headerFixed
    ? "fixed top-0 left-0 right-0"
    : "relative";
  return [positionClass, props.headerClass].filter(Boolean).join(" ");
});

const contentWrapperClass = computed(() => {
  const base = props.useScrollView ? "flex-1 min-h-0" : "flex-1";
  return [base, props.scrollViewClass, props.contentClass].filter(Boolean).join(" ");
});

function readScrollProp<T>(
  camelKey: string,
  kebabKey: string,
  defaultValue?: T,
): T | undefined {
  if (!props.useScrollView) return defaultValue;
  return props.scrollProps?.[camelKey] ?? props.scrollProps?.[kebabKey] ?? defaultValue;
}

const normalizedScrollProps = computed(() => ({
  scrollY: readScrollProp<boolean>("scrollY", "scroll-y"),
  scrollX: readScrollProp<boolean>("scrollX", "scroll-x"),
  scrollTop: readScrollProp<number>("scrollTop", "scroll-top"),
  scrollLeft: readScrollProp<number>("scrollLeft", "scroll-left"),
  scrollIntoView: readScrollProp<string>("scrollIntoView", "scroll-into-view"),
  scrollWithAnimation: readScrollProp<boolean>(
    "scrollWithAnimation",
    "scroll-with-animation",
  ),
  showScrollbar: readScrollProp<boolean>("showScrollbar", "show-scrollbar"),
  enhanced: readScrollProp<boolean>("enhanced", "enhanced"),
  enableFlex: readScrollProp<boolean>("enableFlex", "enable-flex"),
  refresherEnabled: readScrollProp<boolean>(
    "refresherEnabled",
    "refresher-enabled",
  ),
  refresherTriggered: readScrollProp<boolean>(
    "refresherTriggered",
    "refresher-triggered",
  ),
  refresherThreshold: readScrollProp<number>(
    "refresherThreshold",
    "refresher-threshold",
  ),
  lowerThreshold: readScrollProp<number>("lowerThreshold", "lower-threshold"),
  upperThreshold: readScrollProp<number>("upperThreshold", "upper-threshold"),
}));
</script>
