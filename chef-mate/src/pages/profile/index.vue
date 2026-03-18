<template>
  <view
    class="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 pb-24"
  >
    <view
      class="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10"
    >
      <view class="w-12"></view>
      <text
        class="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center"
      >
        个人中心
      </text>
      <view class="flex w-12 items-center justify-end">
        <button
          class="flex cursor-pointer items-center justify-center rounded-full h-10 w-10 bg-primary/10 text-primary border-none p-0 m-0 after:border-none"
        >
          <text class="material-symbols-outlined">settings</text>
        </button>
      </view>
    </view>

    <ProfileSummaryCard
      :profile-name="profileName"
      :avatar-url="avatarUrl"
      :current-kitchen-name="currentKitchenName"
      :kitchen-rank="kitchenRank"
      :kitchen-level-text="kitchenLevelText"
      :phone-text="phoneText"
    />

    <ProfileStatsSection :items="profileStats" />

    <ProfileKitchenSection
      :cards="profileKitchenCards"
      :family-member-text="familyMemberText"
      @open-group="navToGroupManage"
    />

    <ProfileServiceSection
      :items="profileServiceItems"
      @select="handleServiceSelect"
    />

    <ProfileLogoutAction
      :logging-out="loggingOut"
      @logout="openLogoutConfirm"
    />

    <up-modal
      :show="showLogoutModal"
      title="退出登录"
      content="退出后需要重新登录才能继续使用 ChefMate，确定退出吗？"
      showCancelButton
      confirmText="退出"
      confirmColor="#ef4444"
      @confirm="handleLogout"
      @cancel="showLogoutModal = false"
      @close="showLogoutModal = false"
    ></up-modal>

    <CmTabBar :current="4" />
  </view>
</template>

<script setup lang="ts">
import ProfileKitchenSection from "./components/ProfileKitchenSection.vue";
import ProfileLogoutAction from "./components/ProfileLogoutAction.vue";
import ProfileServiceSection from "./components/ProfileServiceSection.vue";
import ProfileStatsSection from "./components/ProfileStatsSection.vue";
import ProfileSummaryCard from "./components/ProfileSummaryCard.vue";
import { profileKitchenCards, profileServiceItems, profileStats } from "./constants/profile";
import { useProfilePage } from "./composables/useProfilePage";

const {
  showLogoutModal,
  loggingOut,
  profileName,
  avatarUrl,
  currentKitchenName,
  familyMemberText,
  kitchenRank,
  kitchenLevelText,
  phoneText,
  navToLanguageSettings,
  navToDietaryPreferences,
  navToGroupManage,
  openLogoutConfirm,
  handleLogout,
} = useProfilePage();

const handleServiceSelect = (key: string) => {
  if (key === "dietary") {
    navToDietaryPreferences();
    return;
  }

  if (key === "language") {
    navToLanguageSettings();
  }
};
</script>
