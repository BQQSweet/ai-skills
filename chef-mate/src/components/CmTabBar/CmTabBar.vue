<template>
  <view class="cm-tabbar-placeholder">
    <view
      class="cm-tabbar fixed bottom-0 left-0 w-full z-50 bg-white dark:bg-[#1a150e] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe"
    >
      <view class="flex items-end justify-around h-14 relative px-2">
        <template v-for="(item, index) in tabList" :key="index">
          <!-- 正常 Tab 项 -->
          <view
            v-if="index !== 2"
            class="flex-1 flex flex-col items-center justify-center h-14"
            @click="switchTab(index, item)"
          >
            <text
              class="material-symbols-outlined text-2xl transition-all duration-300"
              :class="
                current === index
                  ? 'text-primary'
                  : 'text-gray-400 dark:text-gray-500'
              "
              :style="{
                fontVariationSettings:
                  current === index
                    ? '\'FILL\' 1, \'wght\' 600'
                    : '\'FILL\' 0, \'wght\' 400',
              }"
            >
              {{ item.icon }}
            </text>
            <text
              class="text-[10px] mt-0.5 transition-colors duration-300"
              :class="
                current === index
                  ? 'text-primary font-bold'
                  : 'text-gray-400 dark:text-gray-500'
              "
            >
              {{ item.text }}
            </text>
          </view>

          <!-- 中间凸出按钮 -->
          <view
            v-else
            class="flex-1 flex justify-center pb-2 relative z-10"
            @click="onMidButtonClick"
          >
            <view
              class="w-14 h-14 bg-white dark:bg-[#1a150e] rounded-full p-1.5 absolute -top-12 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] flex items-center justify-center"
            >
              <view
                class="w-full h-full bg-primary rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(255,157,10,0.4)] active:scale-95 transition-transform duration-200"
              >
                <text
                  class="material-symbols-outlined text-white text-3xl font-bold"
                  >add</text
                >
              </view>
            </view>
            <!-- 占位文案保持对齐 -->
            <text class="text-[10px] text-transparent mt-auto">{{
              item.text
            }}</text>
          </view>
        </template>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

onMounted(() => {
  uni.hideTabBar();
});

const props = defineProps({
  current: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["change", "mid-click"]);

const tabList = ref([
  { text: "首页", icon: "home", path: "/pages/index/index" },
  { text: "菜单", icon: "menu_book", path: "/pages/menu/index" },
  { text: "发布", icon: "add", path: "" }, // 占位
  { text: "冰箱", icon: "kitchen", path: "/pages/fridge/index" },
  { text: "我的", icon: "person", path: "/pages/my/index" },
]);

const switchTab = (index: number, item: any) => {
  if (index === props.current) return;
  emit("change", index);

  // 原生系统跳转
  if (item.path) {
    uni.switchTab({
      url: item.path,
      fail: () => {
        // 退级方案
        uni.navigateTo({ url: item.path });
      },
    });
  }
};

const onMidButtonClick = () => {
  emit("mid-click");
  // todo: 跳转到发布页面或弹出菜单
  uni.showToast({ title: "点击了发布按钮", icon: "none" });
};
</script>

<style scoped>
.pb-safe {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.cm-tabbar-placeholder {
  /* 固定占位，防止底部内容被 fixed 的 tabbar 遮挡 */
  height: calc(56px + env(safe-area-inset-bottom));
  width: 100%;
}
</style>
