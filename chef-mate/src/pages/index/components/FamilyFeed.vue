<template>
  <view class="px-6 pb-6 mt-2">
    <view class="flex items-center justify-between mb-4">
      <text class="text-lg font-bold text-text-main dark:text-white"
        >家庭协作</text
      >
    </view>
    <view
      class="rounded-[24rpx] bg-white dark:bg-[#2d2418] shadow-[0_4px_20px_-2px_rgba(29,22,12,0.06)] p-1 overflow-hidden"
    >
      <view
        v-for="(item, index) in feedItems"
        :key="index"
        class="flex items-center gap-4 p-4"
        :class="{
          'border-b border-gray-50 dark:border-slate-800/50':
            index < feedItems.length - 1,
        }"
        @click="handleFeedClick(item)"
      >
        <view class="relative">
          <image
            class="w-10 h-10 rounded-full object-cover bg-gray-100"
            :src="item.avatarUrl"
            mode="aspectFill"
          />
          <view
            class="absolute -bottom-1 -right-1 border-2 p-2.5 border-white dark:border-[#2d2418] rounded-full w-4 h-4 flex items-center justify-center"
            :class="item.badgeBg"
          >
            <text
              class="material-symbols-outlined text-[10px] font-bold"
              :class="item.badgeIconColor"
              >{{ item.badgeIcon }}</text
            >
          </view>
        </view>
        <view class="flex-1">
          <view class="text-sm text-text-main dark:text-white leading-normal">
            <text class="font-bold">{{ item.userName }}</text> {{ item.action }}
            <text class="font-bold text-primary">{{ item.target }}</text>
            {{ item.actionSuffix }}
          </view>
          <text class="block text-xs text-text-muted mt-1">{{
            item.time
          }}</text>
        </view>
      </view>
    </view>

    <!-- Quick Action Button -->
    <button
      class="w-full mt-4 bg-primary/10 border border-primary/20 dark:border-primary/30 after:hidden flex items-center justify-center gap-2 py-1 h-[52px] rounded-xl text-primary hover:bg-primary/20 transition-colors active:opacity-70"
      @click="handleGoShopping"
    >
      <text class="font-bold text-[15px] leading-none">去买菜</text>
    </button>
  </view>
</template>

<script setup lang="ts">
export interface FeedItem {
  userName: string;
  avatarUrl: string;
  action: string;
  target: string;
  actionSuffix: string;
  time: string;
  badgeIcon: string;
  badgeBg: string;
  badgeIconColor: string;
}

withDefaults(
  defineProps<{
    feedItems?: FeedItem[];
  }>(),
  {
    feedItems: () => [
      {
        userName: "王大力",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBjcq8CxGQy10qOw1mGfDaRNM6EANdhOWxTONBLlMw3M9Xco518tnNUaf0RZtaJtdGn-hLIqhUQihRUs10iZ3l0-MF0A5rihvZPyF9JUzmc97ZSumzqsL24avZUijzhjPbHffNsUtsl59YO0cs_jWktk2kk_acKT7z8xaASvDhqgf17j6EoBuf4sOfq70sIpsOiKO9ewIqFGOvRlqHTNoOp_aI5sAerjifbxTcRYBox9suxgcqiS-h0cOlCkcByyryY8L_CRfMPZlZt",
        action: "标记了",
        target: "生姜",
        actionSuffix: "已买",
        time: "10分钟前",
        badgeIcon: "check",
        badgeBg: "bg-green-100 dark:bg-green-900",
        badgeIconColor: "text-green-600 dark:text-green-300",
      },
      {
        userName: "李妈妈",
        avatarUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCSyb22lNKeHPxwTv8K7Je_lJriUDk6NJpc7_DkkBTi0PT0B99bYFRnLqx2GTd7GgVWp-f5YZCgT-v-vQV_zw8tm3kIGsrzO5IOZH_koZgd7lwuwiSN5anglDylsKfPMCkA1NHIiBb1p2YbqjSbKehjtjI3lfxPRAs39dKJ1O--G7zYGdw0dCFpGLKdpJcd3vMBNUGyl0SU5QGQZAex7-eJObFDVYI6G5jVDtpwTE9D256cBo1GTpiKpEhWTP86v2_TCDZBC_148NXq",
        action: "添加了",
        target: "酱油",
        actionSuffix: "到清单",
        time: "30分钟前",
        badgeIcon: "add",
        badgeBg: "bg-blue-100 dark:bg-blue-900",
        badgeIconColor: "text-blue-600 dark:text-blue-300",
      },
    ],
  },
);

const handleFeedClick = (item: FeedItem) => {
  // TODO: 跳转到协作详情
  uni.$u.toast(`${item.userName}的动态（开发中）`);
};

const handleGoShopping = () => {
  // TODO: 跳转到购物清单页
  uni.$u.toast("去买菜（开发中）");
};
</script>
