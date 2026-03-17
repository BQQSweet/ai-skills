<template>
  <CmPageShell
    title="我的家庭组"
    :background-class="
      'min-h-screen bg-[#f8f5ef] dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display'
    "
    :header-class="
      'z-20 px-6 pt-12 pb-4 bg-[#f8f5ef]/90 dark:bg-background-dark/90 backdrop-blur-lg'
    "
    :content-padding-class="'px-6 pb-8'"
    @back="page.goBack"
  >
    <view v-if="page.loading" class="py-20 flex justify-center">
      <text class="text-sm text-text-muted">正在加载家庭组信息...</text>
    </view>

    <template v-else-if="page.currentGroup">
      <CurrentGroupCard
        :group="page.currentGroup"
        :member-count="page.currentGroup.memberCount || page.memberList.length"
        :is-owner="page.isOwner"
        :role-label="page.currentRoleLabel"
        @copy="page.handleCopyInviteCode"
        @invite="page.goInvite"
      />

      <MemberListSection
        :members="page.memberList"
        :role-labels="groupRoleLabels"
        :role-tones="groupRoleTones"
      />

      <GroupSwitcherSection
        :groups="page.groupStore.groupList"
        :current-group-id="page.currentGroup.id"
        :role-labels="groupRoleLabels"
        @switch="page.handleSwitchGroup"
      />

      <GroupJoinCreatePanel
        :show="page.showAddGroupPanel"
        :new-group-name="page.newGroupName"
        :invite-code-arr="page.inviteCodeArr"
        :focus-index="page.focusIndex"
        :creating-group="page.creatingGroup"
        :joining-group="page.joiningGroup"
        @toggle="page.toggleAddGroupPanel"
        @create="page.handleCreateGroup"
        @join="page.handleJoinGroup"
        @update:new-group-name="page.newGroupName = $event"
        @update:focus-index="page.focusIndex = $event"
        @invite-input="page.handleInviteCodeInput"
      />

      <GroupDangerZone
        :is-owner="page.isOwner"
        @leave="page.showLeaveModal = true"
        @disband="page.showDisbandModal = true"
      />
    </template>

    <template v-else>
      <GroupEmptyState @open="page.openAddGroupPanel" />
      <GroupJoinCreatePanel
        :show="page.showAddGroupPanel"
        :new-group-name="page.newGroupName"
        :invite-code-arr="page.inviteCodeArr"
        :focus-index="page.focusIndex"
        :creating-group="page.creatingGroup"
        :joining-group="page.joiningGroup"
        @toggle="page.toggleAddGroupPanel"
        @create="page.handleCreateGroup"
        @join="page.handleJoinGroup"
        @update:new-group-name="page.newGroupName = $event"
        @update:focus-index="page.focusIndex = $event"
        @invite-input="page.handleInviteCodeInput"
      />
    </template>

    <up-modal
      :show="page.showLeaveModal"
      title="退出家庭组"
      content="退出后将无法继续访问该家庭组的数据，确定要退出吗？"
      showCancelButton
      @confirm="page.confirmLeaveGroup"
      @cancel="page.showLeaveModal = false"
      @close="page.showLeaveModal = false"
    ></up-modal>

    <up-modal
      :show="page.showDisbandModal"
      title="解散家庭组"
      content="解散后邀请码将立即失效，且无法恢复，确定要继续吗？"
      showCancelButton
      @confirm="page.confirmDisbandGroup"
      @cancel="page.showDisbandModal = false"
      @close="page.showDisbandModal = false"
    ></up-modal>

    <up-toast ref="uToastRef"></up-toast>
  </CmPageShell>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import CurrentGroupCard from "./components/CurrentGroupCard.vue";
import GroupDangerZone from "./components/GroupDangerZone.vue";
import GroupEmptyState from "./components/GroupEmptyState.vue";
import GroupJoinCreatePanel from "./components/GroupJoinCreatePanel.vue";
import GroupSwitcherSection from "./components/GroupSwitcherSection.vue";
import MemberListSection from "./components/MemberListSection.vue";
import { groupRoleLabels, groupRoleTones } from "./constants/group";
import { useGroupManage } from "./composables/useGroupManage";

const uToastRef = ref<{
  show?: (options: { type: string; message: string }) => void;
} | null>(null);
const page = reactive(useGroupManage({ toastRef: uToastRef }));

onShow(() => {
  void page.loadGroupState();
});
</script>

<style scoped>
.shadow-soft {
  box-shadow: 0 8px 30px -18px rgba(29, 22, 12, 0.22);
}
</style>
