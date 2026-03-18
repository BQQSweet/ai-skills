<template>
  <CmPageShell
    title="邀请家庭成员"
    :background-class="
      'relative flex min-h-screen w-full flex-col bg-[#FAFAFA] dark:bg-background-dark font-display'
    "
    :header-class="
      'z-30 bg-[#FAFAFA]/80 dark:bg-background-dark/80 px-6 pt-12 pb-4 backdrop-blur-lg'
    "
    @back="goBack"
  >
    <InviteHeroSection />
    <InviteCodeCard
      :invite-code="groupStore.currentGroup?.inviteCode"
      @copy="handleCopyInviteCode"
    />
    <InviteQrSection />
    <InviteShareActions
      @wechat="handleShareToWechat"
      @moments="handleShareToMoments"
      @more="handleShareMore"
    />
    <InviteMembersStrip
      :members="groupStore.currentGroup?.members || []"
      :is-owner="isOwner"
      @refresh-code="handleRefreshCode"
    />

    <up-modal
      :show="showRefreshModal"
      title="刷新邀请码"
      content="刷新后旧的邀请码将失效，确定要刷新吗？"
      showCancelButton
      @confirm="confirmRefreshCode"
      @cancel="showRefreshModal = false"
      @close="showRefreshModal = false"
    ></up-modal>

    <up-toast ref="uToastRef"></up-toast>
  </CmPageShell>
</template>

<script setup lang="ts">
import { ref } from "vue";
import InviteCodeCard from "./components/InviteCodeCard.vue";
import InviteHeroSection from "./components/InviteHeroSection.vue";
import InviteMembersStrip from "./components/InviteMembersStrip.vue";
import InviteQrSection from "./components/InviteQrSection.vue";
import InviteShareActions from "./components/InviteShareActions.vue";
import { useGroupInvite } from "./composables/useGroupInvite";

const uToastRef = ref();
const {
  groupStore,
  showRefreshModal,
  isOwner,
  handleCopyInviteCode,
  handleShareToWechat,
  handleShareToMoments,
  handleShareMore,
  handleRefreshCode,
  confirmRefreshCode,
  goBack,
} = useGroupInvite(uToastRef);
</script>
