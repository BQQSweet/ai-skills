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
    @back="goBack"
  >
      <view v-if="loading" class="py-20 flex justify-center">
        <text class="text-sm text-text-muted">正在加载家庭组信息...</text>
      </view>

      <template v-else-if="currentGroup">
        <view
          class="mt-2 overflow-hidden rounded-[28rpx] bg-white shadow-[0_18px_45px_-24px_rgba(245,158,11,0.55)] border border-primary/10"
        >
          <view
            class="px-6 py-5 bg-gradient-to-br from-primary/15 via-[#fff4df] to-white"
          >
            <view class="flex items-start justify-between gap-4">
              <view>
                <text class="block text-xs font-semibold tracking-[0.3em] text-primary/80">
                  CURRENT KITCHEN
                </text>
                <text class="mt-2 block text-[28px] font-black leading-tight">
                  {{ currentGroup.name }}
                </text>
                <text class="mt-2 block text-sm text-text-muted">
                  {{ currentGroup.memberCount || memberList.length }} 位成员正在协作
                </text>
              </view>
              <CmTag
                :tone="isOwner ? 'primary' : 'neutral'"
                :variant="isOwner ? 'solid' : 'soft'"
                size="xs"
              >
                {{ currentRoleLabel }}
              </CmTag>
            </view>

            <view
              class="mt-5 rounded-2xl border border-primary/15 bg-white/80 px-4 py-4"
            >
              <text class="block text-xs font-semibold tracking-[0.24em] text-primary/70">
                INVITE CODE
              </text>
              <view class="mt-2 flex items-center justify-between gap-3">
                <text class="text-[30px] font-black tracking-[0.22em] text-slate-900">
                  {{ currentGroup.inviteCode }}
                </text>
                <view
                  class="shrink-0 rounded-full bg-primary/10 px-3 py-2 text-primary"
                  @click="handleCopyInviteCode"
                >
                  <text class="material-symbols-outlined text-lg">content_copy</text>
                </view>
              </view>
            </view>

            <view
              v-if="isOwner"
              class="mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-white font-bold shadow-[0_10px_20px_-10px_rgba(255,157,10,0.75)]"
              @click="goInvite"
            >
              <text class="material-symbols-outlined text-lg">group_add</text>
              <text>邀请成员</text>
            </view>
            <text
              v-else
              class="mt-4 block text-xs text-text-muted"
            >
              当前仅组长可邀请成员或刷新邀请码。
            </text>
          </view>
        </view>

        <view class="mt-6">
          <view class="flex items-center justify-between mb-3">
            <text class="text-base font-bold">家庭成员</text>
            <text class="text-xs text-text-muted">
              共 {{ memberList.length }} 人
            </text>
          </view>
          <view class="rounded-[24rpx] bg-white px-4 py-3 shadow-soft">
            <view
              v-for="member in memberList"
              :key="member.id"
              class="flex items-center gap-3 py-3"
              :class="{ 'border-b border-slate-100': member.id !== memberList[memberList.length - 1]?.id }"
            >
              <image
                class="w-12 h-12 rounded-full bg-slate-100 border border-white shadow-sm"
                :src="member.avatarUrl || defaultAvatar"
                mode="aspectFill"
              />
              <view class="flex-1 min-w-0">
                <text class="block text-sm font-bold truncate">{{ member.nickname }}</text>
                <text class="block text-xs text-text-muted">
                  {{ member.phone || "ChefMate 家庭成员" }}
                </text>
              </view>
              <CmTag
                :tone="roleTagTone(member.role)"
                :variant="member.role === 'owner' ? 'solid' : 'soft'"
                size="xs"
              >
                {{ roleLabelMap[member.role] }}
              </CmTag>
            </view>
          </view>
        </view>

        <view class="mt-6">
          <view class="flex items-center justify-between mb-3">
            <text class="text-base font-bold">切换家庭组</text>
            <text class="text-xs text-text-muted">已加入 {{ groupStore.groupList.length }} 个家庭组</text>
          </view>
          <view class="flex flex-col gap-3">
            <view
              v-for="group in groupStore.groupList"
              :key="group.id"
              class="rounded-[24rpx] bg-white px-4 py-4 border transition-all"
              :class="
                group.id === currentGroup.id
                  ? 'border-primary shadow-[0_14px_35px_-25px_rgba(245,158,11,0.75)]'
                  : 'border-transparent'
              "
              @click="handleSwitchGroup(group.id)"
            >
              <view class="flex items-center gap-3">
                <view
                  class="w-11 h-11 rounded-2xl flex items-center justify-center"
                  :class="group.id === currentGroup.id ? 'bg-primary text-white' : 'bg-[#fff4df] text-primary'"
                >
                  <text class="material-symbols-outlined text-xl">kitchen</text>
                </view>
                <view class="flex-1 min-w-0">
                  <text class="block text-sm font-bold truncate">{{ group.name }}</text>
                  <text class="block text-xs text-text-muted">
                    {{ group.memberCount || group.members?.length || 0 }} 位成员 · {{ roleLabelMap[group.role] }}
                  </text>
                </view>
                <view
                  class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  :class="group.id === currentGroup.id ? 'border-primary' : 'border-slate-300'"
                >
                  <view
                    v-if="group.id === currentGroup.id"
                    class="w-2.5 h-2.5 rounded-full bg-primary"
                  ></view>
                </view>
              </view>
            </view>
          </view>

          <view
            class="mt-4 rounded-[24rpx] border-2 border-dashed border-primary/20 bg-white px-4 py-4 transition-all"
            :class="showAddGroupPanel ? 'shadow-soft' : ''"
          >
            <view
              class="flex items-center justify-between gap-3 cursor-pointer"
              @click="toggleAddGroupPanel"
            >
              <view class="flex items-center gap-3">
                <view
                  class="w-11 h-11 shrink-0 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"
                >
                  <text class="material-symbols-outlined text-xl">add</text>
                </view>
                <view>
                  <text class="block text-sm font-bold text-slate-900">创建或加入新厨房</text>
                  <text class="block text-xs text-text-muted">
                    可继续创建家庭组，或通过邀请码加入其他厨房
                  </text>
                </view>
              </view>
              <text class="material-symbols-outlined text-text-muted">
                {{ showAddGroupPanel ? "expand_less" : "expand_more" }}
              </text>
            </view>

            <view v-if="showAddGroupPanel" class="mt-4 flex flex-col gap-4">
              <view class="rounded-[20rpx] bg-[#fff9ef] px-4 py-4 border border-primary/10">
                <text class="block text-sm font-bold text-slate-900">创建新厨房</text>
                <text class="mt-1 block text-xs text-text-muted">
                  创建一个新的家庭协作空间，并自动切换到新厨房
                </text>
                <view class="mt-3">
                  <CmInput
                    v-model="newGroupName"
                    dark
                    placeholder="例如：周末聚会组"
                    inputClass="bg-white border border-transparent focus:border-primary"
                  />
                </view>
                <view
                  class="mt-3 h-11 rounded-full bg-primary text-white font-bold flex items-center justify-center"
                  :class="creatingGroup ? 'opacity-70' : ''"
                  @click="handleCreateGroup"
                >
                  <text>{{ creatingGroup ? "创建中..." : "创建家庭组" }}</text>
                </view>
              </view>

              <view class="rounded-[20rpx] bg-[#f8fafc] px-4 py-4 border border-slate-100">
                <text class="block text-sm font-bold text-slate-900">加入其他厨房</text>
                <text class="mt-1 block text-xs text-text-muted">
                  输入家人或朋友分享的 6 位邀请码，加入已有厨房
                </text>
                <view class="mt-3 flex gap-2 justify-between">
                  <input
                    v-for="(_, index) in 6"
                    :key="index"
                    v-model="inviteCodeArr[index]"
                    class="w-10 h-11 text-center text-lg font-black rounded-xl border border-slate-200 bg-white text-slate-900"
                    type="text"
                    maxlength="1"
                    placeholder="•"
                    :focus="focusIndex === index"
                    @input="handleInviteCodeInput(index, $event)"
                    @focus="focusIndex = index"
                  />
                </view>
                <view
                  class="mt-3 h-11 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center"
                  :class="joiningGroup ? 'opacity-70' : ''"
                  @click="handleJoinGroup"
                >
                  <text>{{ joiningGroup ? "加入中..." : "加入家庭组" }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="mt-6 rounded-[24rpx] bg-[#fff7f3] border border-[#ffd9c8] px-4 py-4">
          <text class="block text-sm font-bold text-[#b45309]">危险操作</text>
          <text class="mt-1 block text-xs text-[#c27a40]">
            {{ isOwner ? "解散后当前家庭组会失效，且无法恢复。" : "退出后你将无法再访问当前家庭组的数据。" }}
          </text>
          <view
            class="mt-4 h-12 rounded-full flex items-center justify-center font-bold text-white"
            :class="isOwner ? 'bg-[#ef4444]' : 'bg-slate-500'"
            @click="isOwner ? (showDisbandModal = true) : (showLeaveModal = true)"
          >
            <text>{{ isOwner ? "解散家庭组" : "退出家庭组" }}</text>
          </view>
        </view>
      </template>

      <view
        v-else
        class="mt-12 rounded-[32rpx] bg-white px-6 py-10 text-center shadow-soft"
      >
        <view
          class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <text class="material-symbols-outlined text-4xl">group</text>
        </view>
        <text class="mt-5 block text-xl font-black">还没有加入家庭组</text>
        <text class="mt-2 block text-sm text-text-muted leading-6">
          创建一个新的家庭厨房，或者通过邀请码加入家人的厨房空间。
        </text>
        <view
          class="mt-6 h-12 rounded-full bg-primary text-white font-bold flex items-center justify-center"
          @click="openAddGroupPanel"
        >
          <text>创建家庭组</text>
        </view>
        <view
          class="mt-3 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center"
          @click="openAddGroupPanel"
        >
          <text>输入邀请码加入</text>
        </view>

        <view
          v-if="showAddGroupPanel"
          class="mt-4 rounded-[24rpx] border-2 border-dashed border-primary/20 bg-white px-4 py-4 text-left shadow-soft"
        >
          <view class="flex items-center justify-between gap-3">
            <view class="flex items-center gap-3">
              <view
                class="w-11 h-11 shrink-0 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"
              >
                <text class="material-symbols-outlined text-xl">add</text>
              </view>
              <view>
                <text class="block text-sm font-bold text-slate-900">创建或加入新厨房</text>
                <text class="block text-xs text-text-muted">
                  创建新的家庭厨房，或输入邀请码加入已有厨房
                </text>
              </view>
            </view>
            <text
              class="material-symbols-outlined text-text-muted cursor-pointer"
              @click="showAddGroupPanel = false"
            >
              expand_less
            </text>
          </view>

          <view class="mt-4 flex flex-col gap-4">
            <view class="rounded-[20rpx] bg-[#fff9ef] px-4 py-4 border border-primary/10">
              <text class="block text-sm font-bold text-slate-900">创建新厨房</text>
              <text class="mt-1 block text-xs text-text-muted">
                创建一个新的家庭协作空间，并自动切换到新厨房
              </text>
              <view class="mt-3">
                <CmInput
                  v-model="newGroupName"
                  dark
                  placeholder="例如：周末聚会组"
                  inputClass="bg-white border border-transparent focus:border-primary"
                />
              </view>
              <view
                class="mt-3 h-11 rounded-full bg-primary text-white font-bold flex items-center justify-center"
                :class="creatingGroup ? 'opacity-70' : ''"
                @click="handleCreateGroup"
              >
                <text>{{ creatingGroup ? "创建中..." : "创建家庭组" }}</text>
              </view>
            </view>

            <view class="rounded-[20rpx] bg-[#f8fafc] px-4 py-4 border border-slate-100">
              <text class="block text-sm font-bold text-slate-900">加入其他厨房</text>
              <text class="mt-1 block text-xs text-text-muted">
                输入家人或朋友分享的 6 位邀请码，加入已有厨房
              </text>
              <view class="mt-3 flex gap-2 justify-between">
                <input
                  v-for="(_, index) in 6"
                  :key="index"
                  v-model="inviteCodeArr[index]"
                  class="w-10 h-11 text-center text-lg font-black rounded-xl border border-slate-200 bg-white text-slate-900"
                  type="text"
                  maxlength="1"
                  placeholder="•"
                  :focus="focusIndex === index"
                  @input="handleInviteCodeInput(index, $event)"
                  @focus="focusIndex = index"
                />
              </view>
              <view
                class="mt-3 h-11 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center"
                :class="joiningGroup ? 'opacity-70' : ''"
                @click="handleJoinGroup"
              >
                <text>{{ joiningGroup ? "加入中..." : "加入家庭组" }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
  </CmPageShell>

    <up-modal
      :show="showLeaveModal"
      title="退出家庭组"
      content="退出后将无法继续访问该家庭组的数据，确定要退出吗？"
      showCancelButton
      @confirm="confirmLeaveGroup"
      @cancel="showLeaveModal = false"
      @close="showLeaveModal = false"
    ></up-modal>

    <up-modal
      :show="showDisbandModal"
      title="解散家庭组"
      content="解散后邀请码将立即失效，且无法恢复，确定要继续吗？"
      showCancelButton
      @confirm="confirmDisbandGroup"
      @cancel="showDisbandModal = false"
      @close="showDisbandModal = false"
    ></up-modal>

    <up-toast ref="uToastRef"></up-toast>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import CmInput from "@/components/CmInput/CmInput.vue";
import defaultAvatar from "@/static/svgs/default_avatar.svg";
import { useGroupStore } from "@/stores/group";
import type { GroupRole } from "@/types/group";

const groupStore = useGroupStore();
const uToastRef = ref();
const loading = ref(false);
const switchingGroupId = ref("");
const showLeaveModal = ref(false);
const showDisbandModal = ref(false);
const showAddGroupPanel = ref(false);
const creatingGroup = ref(false);
const joiningGroup = ref(false);
const newGroupName = ref("");
const inviteCodeArr = ref(["", "", "", "", "", ""]);
const focusIndex = ref(-1);

const roleLabelMap: Record<GroupRole, string> = {
  owner: "组长",
  admin: "管理员",
  member: "成员",
};

const currentGroup = computed(() => groupStore.currentGroup);
const memberList = computed(() => currentGroup.value?.members || []);
const isOwner = computed(() => currentGroup.value?.role === "owner");
const inviteCode = computed(() => inviteCodeArr.value.join(""));
const currentRoleLabel = computed(() => {
  if (!currentGroup.value) return "成员";
  return roleLabelMap[currentGroup.value.role];
});

function roleTagTone(role: GroupRole) {
  if (role === "owner") return "primary";
  if (role === "admin") return "info";
  return "neutral";
}

function toggleAddGroupPanel() {
  showAddGroupPanel.value = !showAddGroupPanel.value;
}

function resetAddGroupForm() {
  newGroupName.value = "";
  inviteCodeArr.value = ["", "", "", "", "", ""];
  focusIndex.value = -1;
}

function openAddGroupPanel() {
  showAddGroupPanel.value = true;
}

function handleInviteCodeInput(index: number, event: any) {
  const value = String(event?.detail?.value || "")
    .replace(/[^0-9a-z]/gi, "")
    .toUpperCase()
    .slice(-1);
  inviteCodeArr.value[index] = value;

  if (value && index < inviteCodeArr.value.length - 1) {
    focusIndex.value = index + 1;
    return;
  }

  if (!value && index > 0) {
    focusIndex.value = index - 1;
  }
}

async function loadGroupState() {
  loading.value = true;
  try {
    await groupStore.fetchMyGroups();
    if (groupStore.currentGroup?.id) {
      await groupStore.fetchGroupDetail(groupStore.currentGroup.id);
    }
  } catch (error: any) {
    uToastRef.value?.show({
      type: "error",
      message: error?.msg || "加载家庭组失败",
    });
  } finally {
    loading.value = false;
  }
}

onShow(() => {
  void loadGroupState();
});

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({ url: "/pages/profile/index" });
    },
  });
}

function goGuide() {
  uni.reLaunch({ url: "/pages/guide/index" });
}

function goInvite() {
  if (!currentGroup.value || !isOwner.value) {
    uToastRef.value?.show({
      type: "error",
      message: "只有组长可以邀请成员",
    });
    return;
  }

  uni.navigateTo({ url: "/pages/group/invite" });
}

function handleCopyInviteCode() {
  if (!currentGroup.value) return;

  uni.setClipboardData({
    data: currentGroup.value.inviteCode,
    showToast: false,
    success: () => {
      uToastRef.value?.show({
        type: "success",
        message: "邀请码已复制",
      });
    },
    fail: () => {
      uToastRef.value?.show({
        type: "error",
        message: "复制失败，请重试",
      });
    },
  });
}

async function handleSwitchGroup(groupId: string) {
  if (groupId === currentGroup.value?.id || switchingGroupId.value) return;

  switchingGroupId.value = groupId;
  try {
    await groupStore.switchGroup(groupId);
    uToastRef.value?.show({
      type: "success",
      message: "已切换家庭组",
    });
  } catch (error: any) {
    uToastRef.value?.show({
      type: "error",
      message: error?.msg || "切换失败，请重试",
    });
  } finally {
    switchingGroupId.value = "";
  }
}

async function handleCreateGroup() {
  if (creatingGroup.value) return;

  if (!newGroupName.value.trim()) {
    uToastRef.value?.show({
      type: "error",
      message: "请输入厨房名称",
    });
    return;
  }

  creatingGroup.value = true;
  try {
    await groupStore.createGroup(newGroupName.value.trim());
    resetAddGroupForm();
    showAddGroupPanel.value = false;
    uToastRef.value?.show({
      type: "success",
      message: "创建成功，已切换到新厨房",
    });
  } catch (error: any) {
    uToastRef.value?.show({
      type: "error",
      message: error?.msg || "创建失败，请稍后重试",
    });
  } finally {
    creatingGroup.value = false;
  }
}

async function handleJoinGroup() {
  if (joiningGroup.value) return;

  if (inviteCode.value.length !== 6) {
    uToastRef.value?.show({
      type: "error",
      message: "请输入 6 位邀请码",
    });
    return;
  }

  joiningGroup.value = true;
  try {
    await groupStore.joinGroup(inviteCode.value);
    resetAddGroupForm();
    showAddGroupPanel.value = false;
    uToastRef.value?.show({
      type: "success",
      message: "加入成功，已切换到新厨房",
    });
  } catch (error: any) {
    uToastRef.value?.show({
      type: "error",
      message: error?.msg || "邀请码无效或已失效",
    });
  } finally {
    joiningGroup.value = false;
  }
}

async function confirmLeaveGroup() {
  if (!currentGroup.value) return;

  try {
    await groupStore.leaveGroup(currentGroup.value.id);
    showLeaveModal.value = false;
    uToastRef.value?.show({
      type: "success",
      message: "已退出家庭组",
    });
    if (!groupStore.currentGroup) {
      setTimeout(() => {
        uni.reLaunch({ url: "/pages/guide/index" });
      }, 700);
    }
  } catch (error: any) {
    uToastRef.value?.show({
      type: "error",
      message: error?.msg || "退出失败，请重试",
    });
  }
}

async function confirmDisbandGroup() {
  if (!currentGroup.value) return;

  try {
    await groupStore.disbandGroup(currentGroup.value.id);
    showDisbandModal.value = false;
    uToastRef.value?.show({
      type: "success",
      message: "家庭组已解散",
    });
    if (!groupStore.currentGroup) {
      setTimeout(() => {
        uni.reLaunch({ url: "/pages/guide/index" });
      }, 700);
    }
  } catch (error: any) {
    uToastRef.value?.show({
      type: "error",
      message: error?.msg || "解散失败，请重试",
    });
  }
}
</script>

<style scoped>
.shadow-soft {
  box-shadow: 0 8px 30px -18px rgba(29, 22, 12, 0.22);
}
</style>
