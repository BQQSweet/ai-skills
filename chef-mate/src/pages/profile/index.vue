<template>
  <CmPageShell
    title="个人中心"
    :background-class="'relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100'"
    :header-class="'z-20 bg-background-light/95 dark:bg-background-dark/95 px-4 pt-12 pb-2 backdrop-blur-lg'"
    :use-scroll-view="false"
  >
    <template #left>
      <view class="h-10 w-10"></view>
    </template>

    <template #right>
      <view class="flex w-12 items-center justify-end">
        <button
          class="flex cursor-pointer items-center justify-center rounded-full h-10 w-10 bg-primary/10 text-primary border-none p-0 m-0 after:border-none"
        >
          <text class="material-symbols-outlined">settings</text>
        </button>
      </view>
    </template>

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

    <CmConfirmDialog
      v-model:show="showLogoutModal"
      title="退出登录"
      description="退出后需要重新登录才能继续使用 ChefMate，确定退出吗？"
      confirmText="退出"
      icon-name="logout"
      tone="danger"
      :disabled="loggingOut"
      @confirm="handleLogout"
    />

    <template #footer>
      <CmTabBar :current="4" />
    </template>
  </CmPageShell>
</template>

<script setup lang="ts">
import CmConfirmDialog from "@/components/CmConfirmDialog/CmConfirmDialog.vue";
import ProfileKitchenSection from "./components/ProfileKitchenSection.vue";
import ProfileLogoutAction from "./components/ProfileLogoutAction.vue";
import ProfileServiceSection from "./components/ProfileServiceSection.vue";
import ProfileStatsSection from "./components/ProfileStatsSection.vue";
import ProfileSummaryCard from "./components/ProfileSummaryCard.vue";
import {
  profileKitchenCards,
  profileServiceItems,
  profileStats,
} from "./constants/profile";
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
