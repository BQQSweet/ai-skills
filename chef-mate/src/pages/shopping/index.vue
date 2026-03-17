<template>
  <CmPageShell
    title="家庭采购清单"
    :background-class="'relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f8f5ef] dark:bg-background-dark font-display'"
    :header-class="'z-30 bg-[#f8f5ef]/90 dark:bg-background-dark/90 px-6 pt-12 pb-4 backdrop-blur-lg'"
    :use-scroll-view="useInnerScroll"
    :scroll-view-class="'shopping-content'"
    :content-class="contentWrapperClass"
    :content-padding-class="`px-6 ${contentPaddingClass}`"
    :scroll-props="scrollContainerProps"
    :footer-class="
      shoppingStore.purchasedItems.length > 0
        ? 'pointer-events-none fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[#f8f5ef] via-[#f8f5ef]/95 to-transparent px-6 pb-8 pt-4 dark:from-background-dark dark:via-background-dark/90'
        : ''
    "
    @back="goBack"
    @refresh="handleRefresh"
  >
    <template #right>
      <view
        @click="handleShare"
        class="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-surface-dark shadow-soft cursor-pointer"
      >
        <text class="material-symbols-outlined text-text-main dark:text-white">
          share
        </text>
      </view>
    </template>

    <view
      class="mt-2 overflow-hidden rounded-[28rpx] border border-primary/10 bg-white shadow-[0_18px_45px_-24px_rgba(245,158,11,0.55)]"
    >
      <view
        class="bg-gradient-to-br from-[#fffaf2] via-[#fdf2e3] to-[#fee1bb] px-5 pb-5 pt-5"
      >
        <view class="flex items-start justify-between gap-4">
          <view class="min-w-0 flex-1">
            <text
              class="mt-2 block text-[28px] font-black leading-tight text-slate-900"
            >
              {{ pageTitle }}
            </text>
            <text class="mt-2 block text-sm text-text-muted">
              {{ activeListSubTitle }}
            </text>
          </view>
          <CmTag
            :tone="
              shoppingStore.activeList?.source === 'recipe'
                ? 'primary'
                : 'neutral'
            "
            :variant="
              shoppingStore.activeList?.source === 'recipe' ? 'solid' : 'soft'
            "
            size="xs"
          >
            {{ listSourceLabel }}
          </CmTag>
        </view>

        <view class="mt-6 flex items-end justify-between gap-4">
          <view>
            <view class="mt-2 flex items-end gap-2">
              <text class="text-[34px] font-black leading-none text-slate-900">
                {{ purchaseProgress }}%
              </text>
              <text class="pb-1 text-xs font-semibold text-primary">
                {{ progressStatusText }}
              </text>
            </view>
          </view>

          <view
            v-if="activeMembers.length > 0"
            class="flex items-center -space-x-3"
          >
            <image
              v-for="(member, index) in activeMembers.slice(0, 3)"
              :key="index"
              class="h-10 w-10 rounded-full border-2 border-white object-cover"
              :src="member.avatarUrl"
              mode="aspectFill"
            />
            <view
              v-if="activeMembers.length > 3"
              class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-bold text-slate-500"
            >
              +{{ activeMembers.length - 3 }}
            </view>
          </view>

          <view
            v-else-if="groupMemberCount > 0"
            class="rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-slate-500"
          >
            {{ groupMemberCount }} 人待命
          </view>

          <view
            v-else
            class="rounded-full bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"
            @click="handleInviteMembers"
          >
            邀请家人
          </view>
        </view>

        <view class="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/80">
          <view
            class="h-full rounded-full bg-primary transition-all duration-1000"
            :style="{ width: purchaseProgress + '%' }"
          ></view>
        </view>

        <view class="mt-5 flex justify-between">
          <CmTag variant="soft" tone="primary" size="sm">
            <view class="flex items-center gap-1">
              <text>进行中</text>
              <text>{{ shoppingStore.claimedItems.length }}</text>
            </view>
          </CmTag>
          <CmTag variant="soft" tone="neutral" size="sm">
            <view class="flex items-center gap-1">
              <text>待处理</text>
              <text> {{ pendingWithoutFridgeCount }}</text>
            </view>
          </CmTag>
          <CmTag variant="soft" tone="success" size="sm">
            <view class="flex gap-1 items-center">
              <text>已买到</text>
              <text>{{ shoppingStore.purchasedItems.length }}</text>
            </view>
          </CmTag>
          <CmTag variant="soft" tone="warning" size="sm">
            <view class="flex gap-1 items-center">
              <text>冰箱已有</text>
              <text>{{ inFridgeCount }}</text>
            </view>
          </CmTag>
        </view>

        <text
          v-if="activeMembers.length > 0"
          class="mt-4 block text-xs text-text-muted"
        >
          {{ activeMemberNames }} 正在外出采购
        </text>
        <text
          v-else-if="groupMemberCount > 0"
          class="mt-4 block text-xs text-text-muted"
        >
          你们家一共有 {{ groupMemberCount }} 位成员可参与这次协作采购
        </text>
        <text v-else class="mt-4 block text-xs text-text-muted">
          还没有家庭成员加入，先邀请家人再一起分工会更高效
        </text>
      </view>
    </view>

    <view class="mt-6 rounded-[24rpx] bg-white px-4 py-4 shadow-soft">
      <view class="flex items-center justify-between gap-3">
        <view>
          <text class="block text-sm font-bold text-slate-900">快速添加</text>
          <text class="mt-1 block text-xs text-text-muted">
            当前分类：{{ currentCategoryLabel }}
          </text>
        </view>
        <view
          class="rounded-full bg-primary/10 px-3 py-2 text-primary"
          @click="showCategoryPicker = true"
        >
          <text class="text-xs font-bold">切换分类</text>
        </view>
      </view>

      <view class="mt-4 flex items-center gap-2">
        <CmInput
          v-model="newItemName"
          dark
          placeholder="添加待买食材..."
          custom-class="flex-1"
          input-class="border-transparent bg-[#f8f5ef] pr-4 shadow-none"
          @keyup.enter="handleAddItem"
        />
        <view
          @click="handleAddItem"
          class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_10px_20px_-10px_rgba(255,157,10,0.75)] cursor-pointer active:scale-95 transition-transform"
        >
          <text class="material-symbols-outlined text-2xl">add</text>
        </view>
      </view>
    </view>

    <view class="mt-6">
      <view class="mb-4 flex items-center justify-between gap-3">
        <view class="flex items-center gap-2">
          <text class="text-xl font-black text-slate-900">待买清单</text>
          <view class="rounded-full bg-primary/10 px-2.5 py-1">
            <text class="text-xs font-bold text-primary">
              {{ activeDisplayItems.length }}
            </text>
          </view>
        </view>
        <text class="text-xs text-text-muted">
          {{ activeSectionDescription }}
        </text>
      </view>

      <view
        v-if="shoppingStore.loading && shoppingStore.shoppingList.length === 0"
        class="flex items-center justify-center py-20"
      >
        <text class="text-text-muted">加载中...</text>
      </view>

      <view
        v-else-if="shoppingStore.shoppingList.length === 0"
        class="rounded-[24rpx] bg-white px-6 py-14 text-center shadow-soft"
      >
        <text class="material-symbols-outlined text-5xl text-slate-300">
          shopping_cart
        </text>
        <text class="mt-4 block text-base font-bold text-slate-900">
          购物清单还是空的
        </text>
        <text class="mt-2 block text-sm text-text-muted">
          添加一些本周要买的食材，让家人一起认领采购任务
        </text>
      </view>

      <view
        v-else-if="activeDisplayItems.length === 0"
        class="rounded-[24rpx] bg-white px-6 py-12 text-center shadow-soft"
      >
        <text class="material-symbols-outlined text-5xl text-primary/35">
          task_alt
        </text>
        <text class="mt-4 block text-base font-bold text-slate-900">
          当前待买食材已全部处理
        </text>
        <text class="mt-2 block text-sm text-text-muted">
          {{
            completedDisplayItems.length > 0
              ? "下面还能查看已完成与库存命中的记录"
              : "继续添加新的采购项吧"
          }}
        </text>
      </view>

      <view v-else class="space-y-3">
        <ShoppingItem
          v-for="item in activeDisplayItems"
          :key="item.id"
          :item="item"
          :can-assign="isOwner"
          :current-user-id="userStore.userId"
          :is-transitioning-to-completed="isTransitioningToCompleted(item.id)"
          @toggle="handleToggle"
          @claim="handleClaim"
          @assign="handleAssign"
          @delete="confirmDelete"
        />
      </view>
    </view>

    <view v-if="completedDisplayItems.length > 0" class="mt-8">
      <view
        class="flex cursor-pointer items-center justify-between gap-4"
        @click="showCompletedSection = !showCompletedSection"
      >
        <view class="flex items-center gap-2 text-slate-500">
          <text
            class="material-symbols-outlined transition-transform duration-300"
            :class="{ 'rotate-90': showCompletedSection }"
          >
            arrow_right
          </text>
          <text class="text-base font-semibold">
            已完成 / 冰箱已有 ({{ completedDisplayItems.length }})
          </text>
        </view>
      </view>

      <view
        v-if="showCompletedSection"
        class="mt-4 rounded-[24rpx] bg-white/80 px-3 py-2 shadow-soft"
      >
        <view
          v-for="item in completedDisplayItems"
          :key="item.id"
          class="flex items-center gap-4 py-3"
          :class="{
            'border-b border-dashed border-slate-200':
              item.id !==
              completedDisplayItems[completedDisplayItems.length - 1]?.id,
          }"
        >
          <view
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all"
            :class="
              item.hasInFridge && item.status !== 'purchased'
                ? 'bg-amber-100 text-amber-600'
                : isRestoringCompletedItem(item.id)
                  ? 'bg-primary/75 text-white opacity-80'
                  : 'bg-primary text-white shadow-[0_6px_12px_-8px_rgba(255,157,10,0.85)]'
            "
            :hover-class="
              item.status === 'purchased' && !item.hasInFridge
                ? 'opacity-90'
                : 'none'
            "
            :style="{
              cursor:
                item.status === 'purchased' && !item.hasInFridge
                  ? 'pointer'
                  : 'default',
            }"
            @click.stop="handleRestoreCompleted(item)"
          >
            <text class="material-symbols-outlined text-[14px]">
              {{
                item.hasInFridge && item.status !== "purchased"
                  ? "inventory_2"
                  : "check"
              }}
            </text>
          </view>
          <view class="min-w-0 flex-1">
            <text
              class="block text-sm font-medium text-slate-500"
              :class="{
                'line-through decoration-slate-400':
                  item.status === 'purchased',
              }"
            >
              {{ item.name }}
            </text>
            <text class="mt-1 block text-xs text-slate-400">
              {{ item.quantity }}{{ item.unit }} · {{ completedMeta(item) }}
            </text>
          </view>
          <view
            class="rounded-full px-2 py-1 text-[10px] font-bold"
            :class="
              item.hasInFridge && item.status !== 'purchased'
                ? 'bg-amber-50 text-amber-600'
                : 'bg-slate-100 text-slate-500'
            "
          >
            {{
              item.hasInFridge && item.status !== "purchased"
                ? "库存"
                : item.purchasedByName || "完成"
            }}
          </view>
        </view>
      </view>
    </view>
    <template v-if="shoppingStore.purchasedItems.length > 0" #footer>
      <view
        @click="confirmCompleteAndStock"
        class="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-bold text-white shadow-glow transition-all cursor-pointer active:scale-[0.98]"
      >
        <text class="material-symbols-outlined">inventory_2</text>
        <text>完成采购并入库</text>
      </view>
    </template>

    <u-popup
      :show="showAssignMemberPopup"
      mode="bottom"
      :round="32"
      @close="closeAssignMemberPopup()"
    >
      <view class="rounded-t-[40rpx] bg-white px-6 pb-8 pt-4">
        <view class="mx-auto h-2 w-24 rounded-full bg-[#f5ddc0]"></view>

        <view class="mt-8 flex items-center justify-between">
          <view class="w-10"></view>
          <text class="text-[22px] font-black text-slate-900">
            分配采购任务
          </text>
          <view
            class="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 cursor-pointer active:opacity-70"
            @click="closeAssignMemberPopup()"
          >
            <text class="material-symbols-outlined text-[28px]">close</text>
          </view>
        </view>

        <view
          v-if="pendingAssignmentItem"
          class="mt-6 flex items-center gap-4 rounded-[32rpx] border border-primary/20 bg-[#fffaf2] px-5 py-5"
        >
          <view
            class="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28rpx] bg-gradient-to-br from-[#ffe2bf] via-[#fff2dd] to-white text-primary shadow-[0_12px_28px_-18px_rgba(255,157,10,0.7)]"
          >
            <text class="material-symbols-outlined text-[36px]">
              {{ assignmentItemCategoryIcon }}
            </text>
          </view>

          <view class="min-w-0 flex-1">
            <text class="block text-sm font-bold text-primary">
              {{ assignmentItemCategoryLabel }}
            </text>
            <text
              class="mt-2 block text-[24px] font-black leading-tight text-slate-900"
            >
              {{ assignmentItemTitle }}
            </text>
            <text class="mt-2 block text-sm text-slate-400">
              {{ assignmentItemSourceText }}
            </text>
          </view>
        </view>

        <view class="mt-10 flex items-center justify-between">
          <text class="text-[20px] font-black text-slate-900">
            选择家庭成员
          </text>
          <text class="text-sm font-semibold text-slate-400">单选</text>
        </view>

        <view class="mt-5 flex flex-col gap-3">
          <view
            v-for="member in candidateMembers"
            :key="member.id"
            class="flex items-center gap-3 rounded-[28rpx] border bg-white px-4 py-4 transition-all cursor-pointer"
            :class="
              selectedAssigneeId === member.id
                ? 'border-primary bg-[#fffaf2] shadow-[0_16px_35px_-24px_rgba(255,157,10,0.75)]'
                : 'border-transparent shadow-soft'
            "
            @click="selectAssignee(member.id)"
          >
            <image
              class="h-12 w-12 shrink-0 rounded-full border-2 border-white bg-[#fff1df] shadow-sm"
              :src="member.avatarUrl || defaultAvatar"
              mode="aspectFill"
            />

            <view class="min-w-0 flex-1">
              <text
                class="block truncate text-[16px] font-black text-slate-900"
              >
                {{ member.nickname }}
              </text>
              <text
                class="mt-0.5 block text-[15px] font-semibold"
                :class="
                  selectedAssigneeId === member.id
                    ? 'text-primary'
                    : 'text-slate-400'
                "
              >
                {{ assignRoleLabelMap[member.role] }}
              </text>
            </view>

            <view
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all"
              :class="
                selectedAssigneeId === member.id
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary/30 text-primary/40'
              "
            >
              <text
                v-if="selectedAssigneeId === member.id"
                class="material-symbols-outlined text-[18px]"
              >
                check
              </text>
            </view>
          </view>
        </view>

        <view
          class="mt-10 flex h-14 items-center justify-center rounded-full font-black text-white transition-all"
          :class="
            selectedAssigneeId && !assigning
              ? 'bg-primary shadow-[0_14px_30px_-18px_rgba(255,157,10,0.9)]'
              : 'bg-primary/40'
          "
          @click="confirmAssignMember"
        >
          <text>{{ assigning ? "分配中..." : "确认分配" }}</text>
        </view>

        <text class="mt-6 block text-center text-sm text-slate-400">
          成员将在其 ChefMate 应用中收到通知
        </text>
      </view>
    </u-popup>

    <u-popup
      :show="showCategoryPicker"
      mode="bottom"
      @close="showCategoryPicker = false"
    >
      <view class="bg-white dark:bg-surface-dark p-6 rounded-t-3xl">
        <text
          class="block text-lg font-bold text-text-main dark:text-white mb-4"
        >
          选择分类
        </text>
        <view class="grid grid-cols-3 gap-3">
          <view
            v-for="cat in categories"
            :key="cat"
            @click="selectCategory(cat)"
            class="p-4 rounded-xl text-center cursor-pointer transition-all"
            :class="
              selectedCategory === cat
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white'
            "
          >
            <text class="font-bold">{{ categoryLabel[cat] }}</text>
          </view>
        </view>
      </view>
    </u-popup>

    <CmConfirmDialog
      v-model:show="showDeleteModal"
      title="确认删除"
      description="确定要删除这个购物项吗？"
      icon-name="delete"
      tone="danger"
      @confirm="handleDelete"
    />

    <CmConfirmDialog
      v-model:show="showCompleteModal"
      title="完成采购"
      :description="`确定要将 ${shoppingStore.purchasedItems.length} 个已购买的食材入库吗？`"
      icon-name="inventory_2"
      @confirm="handleCompleteAndStock"
    />

    <up-toast ref="uToastRef"></up-toast>
  </CmPageShell>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { onHide, onLoad, onShow, onUnload } from "@dcloudio/uni-app";
import CmConfirmDialog from "@/components/CmConfirmDialog/CmConfirmDialog.vue";
import CmInput from "@/components/CmInput/CmInput.vue";
import ShoppingItem from "./components/ShoppingItem.vue";
import defaultAvatar from "@/static/svgs/default_avatar.svg";
import { useGroupStore } from "@/stores/group";
import { useShoppingStore } from "@/stores/shopping";
import { useUserStore } from "@/stores/user";
import type {
  GenerateShoppingListFromRecipeParams,
  ShoppingCategory,
  ShoppingItem as ShoppingListItem,
} from "@/types/shopping";
import type { GroupMemberInfo, GroupRole } from "@/types/group";
import type { RecipeIngredient } from "@/types/recipe";

const shoppingStore = useShoppingStore();
const groupStore = useGroupStore();
const userStore = useUserStore();
const useInnerScroll = uni.getSystemInfoSync().uniPlatform !== "web";
const isWebPlatform = uni.getSystemInfoSync().uniPlatform === "web";

const newItemName = ref("");
const selectedCategory = ref<ShoppingCategory>("other");
const showCategoryPicker = ref(false);
const refreshing = ref(false);
const uToastRef = ref();
const showDeleteModal = ref(false);
const showCompleteModal = ref(false);
const showCompletedSection = ref(false);
const showAssignMemberPopup = ref(false);
const itemToDelete = ref<string>("");
const recipeContext = ref<GenerateShoppingListFromRecipeParams | null>(null);
const recipeFlowHandled = ref(false);
const requestedListId = ref("");
const completionTransitionState = ref<Record<string, boolean>>({});
const restoringCompletedState = ref<Record<string, boolean>>({});
const assigning = ref(false);
const pendingAssignmentItem = ref<ShoppingListItem | null>(null);
const selectedAssigneeId = ref("");
const completionTransitionTimers = new Map<
  string,
  ReturnType<typeof setTimeout>
>();

const COMPLETION_TRANSITION_MS = 360;
let lockedBodyScrollTop = 0;

const categories: ShoppingCategory[] = [
  "vegetable",
  "meat",
  "seafood",
  "fruit",
  "seasoning",
  "dairy",
  "grain",
  "snack",
  "beverage",
  "other",
];

const categoryLabel: Record<ShoppingCategory, string> = {
  vegetable: "蔬菜",
  meat: "肉类",
  seafood: "海鲜",
  fruit: "水果",
  seasoning: "调料",
  dairy: "乳制品",
  grain: "粮油",
  snack: "零食",
  beverage: "饮料",
  other: "其他",
};

const categoryIconMap: Record<ShoppingCategory, string> = {
  vegetable: "eco",
  meat: "set_meal",
  seafood: "phishing",
  fruit: "nutrition",
  seasoning: "soup_kitchen",
  dairy: "egg_alt",
  grain: "breakfast_dining",
  snack: "cookie",
  beverage: "local_cafe",
  other: "shopping_bag",
};

const assignRoleLabelMap: Record<GroupRole, string> = {
  owner: "创建者",
  admin: "管理员",
  member: "成员",
};

const activeMembers = computed(() => {
  const members = groupStore.currentGroup?.members || [];
  const activeIds = new Set<string>();

  shoppingStore.shoppingList.forEach((item) => {
    if (item.assignedTo) activeIds.add(item.assignedTo);
    if (item.purchasedBy) activeIds.add(item.purchasedBy);
  });

  return members
    .filter((member) => activeIds.has(member.id))
    .map((member) => ({
      name: member.nickname,
      avatarUrl: member.avatarUrl || "https://via.placeholder.com/32",
    }));
});

const candidateMembers = computed<GroupMemberInfo[]>(() =>
  (groupStore.currentGroup?.members || []).filter(
    (member) => member.id !== userStore.userId,
  ),
);

const selectedAssignee = computed(
  () =>
    candidateMembers.value.find(
      (member) => member.id === selectedAssigneeId.value,
    ) || null,
);

const assignmentItemTitle = computed(() => {
  if (!pendingAssignmentItem.value) return "";
  return `${pendingAssignmentItem.value.name} ${pendingAssignmentItem.value.quantity}${pendingAssignmentItem.value.unit}`;
});

const assignmentItemSourceText = computed(() => {
  if (!pendingAssignmentItem.value) return "";
  if (pendingAssignmentItem.value.sourceRecipeTitle) {
    return `来自食谱：${pendingAssignmentItem.value.sourceRecipeTitle}`;
  }

  if (pendingAssignmentItem.value.source === "manual") {
    return `手动添加 · ${categoryLabel[pendingAssignmentItem.value.category]}`;
  }

  return categoryLabel[pendingAssignmentItem.value.category];
});

const assignmentItemCategoryLabel = computed(() => {
  if (!pendingAssignmentItem.value) return "";
  return categoryLabel[pendingAssignmentItem.value.category];
});

const assignmentItemCategoryIcon = computed(() => {
  if (!pendingAssignmentItem.value) return "shopping_bag";
  return categoryIconMap[pendingAssignmentItem.value.category];
});

const groupMemberCount = computed(
  () =>
    groupStore.currentGroup?.memberCount ||
    groupStore.currentGroup?.members?.length ||
    0,
);

const activeMemberNames = computed(() =>
  activeMembers.value.map((member) => member.name).join("、"),
);

const inFridgeCount = computed(
  () => shoppingStore.shoppingList.filter((item) => item.hasInFridge).length,
);

const pendingWithoutFridgeCount = computed(
  () =>
    shoppingStore.shoppingList.filter(
      (item) =>
        !item.hasInFridge &&
        item.status !== "purchased" &&
        item.status !== "claimed",
    ).length,
);

const completedCount = computed(
  () => shoppingStore.purchasedItems.length + inFridgeCount.value,
);

const purchaseProgress = computed(() => {
  if (shoppingStore.stats.total === 0) return 0;
  return Math.round((completedCount.value / shoppingStore.stats.total) * 100);
});

const activeDisplayItems = computed(() =>
  [...shoppingStore.shoppingList]
    .filter((item) => {
      if (item.hasInFridge) return false;
      if (isTransitioningToCompleted(item.id)) return true;
      return item.status !== "purchased";
    })
    .sort((left, right) => {
      const leftScore = left.status === "claimed" ? 0 : 1;
      const rightScore = right.status === "claimed" ? 0 : 1;
      return leftScore - rightScore;
    }),
);

const completedDisplayItems = computed(() =>
  [...shoppingStore.shoppingList]
    .filter((item) => {
      if (isTransitioningToCompleted(item.id)) return false;
      return item.status === "purchased" || item.hasInFridge;
    })
    .sort((left, right) => {
      const leftScore = left.status === "purchased" ? 0 : 1;
      const rightScore = right.status === "purchased" ? 0 : 1;
      return leftScore - rightScore;
    }),
);

const activeListSubTitle = computed(() => {
  if (!shoppingStore.activeList) return "当前没有活跃协作清单";
  if (shoppingStore.activeList.source === "recipe") {
    return "来自“今日烹饪计划”";
  }
  return "手动维护的家庭协作清单";
});

const pageTitle = computed(() => {
  if (shoppingStore.activeList?.source === "recipe") {
    const recipeTitleFromItem =
      shoppingStore.activeList.items[0]?.sourceRecipeTitle;
    if (recipeTitleFromItem) return recipeTitleFromItem;

    if (recipeContext.value?.recipeTitle) {
      return recipeContext.value.recipeTitle;
    }

    return shoppingStore.activeList.title.replace(/\s*协作采购清单$/, "");
  }

  if (shoppingStore.activeList?.title) {
    return shoppingStore.activeList.title;
  }

  return "协作采购清单";
});

const listSourceLabel = computed(() =>
  shoppingStore.activeList?.source === "recipe" ? "食谱清单" : "手动补货",
);

const currentCategoryLabel = computed(
  () => categoryLabel[selectedCategory.value],
);

const progressStatusText = computed(() => {
  if (shoppingStore.stats.total === 0) return "待开始";
  if (purchaseProgress.value >= 100) return "已备齐";
  if (shoppingStore.claimedItems.length > 0) return "进行中";
  return "待分工";
});

const hasUnassignedPendingItems = computed(() =>
  shoppingStore.shoppingList.some(
    (item) =>
      !item.hasInFridge && item.status === "pending" && !item.assignedTo,
  ),
);

const hasClaimedByCurrentUserItems = computed(() =>
  shoppingStore.shoppingList.some(
    (item) =>
      !item.hasInFridge &&
      item.status === "claimed" &&
      item.assignedTo === userStore.userId,
  ),
);

const hasClaimedByOthersItems = computed(() =>
  shoppingStore.shoppingList.some(
    (item) =>
      !item.hasInFridge &&
      item.status === "claimed" &&
      item.assignedTo &&
      item.assignedTo !== userStore.userId,
  ),
);

const activeSectionDescription = computed(() => {
  if (shoppingStore.loading && shoppingStore.shoppingList.length === 0) {
    return "同步中";
  }
  if (hasUnassignedPendingItems.value) {
    return "点击勾选可认领或直接完成";
  }
  if (hasClaimedByCurrentUserItems.value) {
    return "你认领的食材可直接勾选完成";
  }
  if (hasClaimedByOthersItems.value) {
    return "已认领食材仅认领人可完成";
  }
  if (completedDisplayItems.value.length > 0) {
    return "待买项都已经处理完";
  }
  return "添加第一项开始协作";
});

const isOwner = computed(() => groupStore.currentGroup?.role === "owner");

const isPageScrollLocked = computed(
  () => showAssignMemberPopup.value || showCategoryPicker.value,
);

const contentWrapperClass = computed(() =>
  [
    useInnerScroll ? "shopping-scroll" : "",
    isPageScrollLocked.value ? "shopping-scroll-locked" : "",
  ]
    .filter(Boolean)
    .join(" "),
);

const scrollContainerProps = computed(() =>
  useInnerScroll
    ? {
        "scroll-y": !isPageScrollLocked.value,
        "refresher-enabled": true,
        "refresher-triggered": refreshing.value,
      }
    : {},
);

const contentPaddingClass = computed(() =>
  shoppingStore.purchasedItems.length > 0 ? "pb-36" : "pb-12",
);

onLoad((options) => {
  const query = options || {};
  requestedListId.value = query.listId ? String(query.listId) : "";
  const rawIngredients = query.ingredients
    ? decodeURIComponent(String(query.ingredients))
    : "[]";
  const ingredients = JSON.parse(rawIngredients) as RecipeIngredient[];

  if (!ingredients.length) return;

  recipeContext.value = {
    recipeId: query.recipeId ? String(query.recipeId) : undefined,
    recipeTitle: query.recipeTitle
      ? decodeURIComponent(String(query.recipeTitle))
      : "协作采购清单",
    ingredients,
    mode: "create",
  };
});

onShow(() => {
  void initializePage();
});

onHide(() => {
  unlockBodyScroll();
  resetCompletionTransitions();
});

onUnload(() => {
  unlockBodyScroll();
  resetCompletionTransitions();
});

watch(isPageScrollLocked, (locked) => {
  if (locked) {
    lockBodyScroll();
    return;
  }

  unlockBodyScroll();
});

async function initializePage() {
  if (!groupStore.currentGroup) {
    await groupStore.fetchMyGroups();
  }

  if (!groupStore.currentGroup) return;

  await groupStore.fetchGroupMembers(groupStore.currentGroup.id);
  await loadShoppingLists();
  applyRequestedListId();

  if (recipeContext.value && !recipeFlowHandled.value) {
    await handleRecipeContext();
  }
}

async function loadShoppingLists() {
  if (!groupStore.currentGroup) return;

  try {
    resetCompletionTransitions();
    await shoppingStore.fetchShoppingLists(groupStore.currentGroup.id);
  } catch (error) {
    uToastRef.value?.show({
      type: "error",
      message: "加载购物清单失败",
    });
  }
}

function applyRequestedListId() {
  if (!requestedListId.value) return;

  const targetList = shoppingStore.shoppingLists.find(
    (list) => list.id === requestedListId.value,
  );

  if (!targetList) {
    uToastRef.value?.show({
      type: "default",
      message: "未找到对应购物清单，已展示当前清单",
    });
    requestedListId.value = "";
    return;
  }

  shoppingStore.setActiveList(targetList.id);
}

async function handleRecipeContext() {
  if (!groupStore.currentGroup || !recipeContext.value) return;

  recipeFlowHandled.value = true;
  let mode: "create" | "overwrite" = "create";
  let targetListId = "";

  if (shoppingStore.activeList?.id) {
    try {
      const { tapIndex } = await uni.showActionSheet({
        itemList: ["新增协作清单", "覆盖当前清单"],
      });
      mode = tapIndex === 1 ? "overwrite" : "create";
      targetListId = mode === "overwrite" ? shoppingStore.activeList.id : "";
    } catch {
      return;
    }
  }

  try {
    const list = await shoppingStore.createListFromRecipe(
      groupStore.currentGroup.id,
      {
        ...recipeContext.value,
        mode,
        targetListId: targetListId || undefined,
      },
    );
    shoppingStore.setActiveList(list.id);
    uToastRef.value?.show({
      type: "success",
      message:
        mode === "overwrite" ? "已覆盖当前协作清单" : "已生成新的协作采购清单",
    });
  } catch (error: any) {
    recipeFlowHandled.value = false;
    uToastRef.value?.show({
      type: "error",
      message: error?.msg || "生成协作清单失败",
    });
  }
}

async function handleAddItem() {
  if (!newItemName.value.trim()) {
    uToastRef.value?.show({
      type: "warning",
      message: "请输入购物项名称",
    });
    return;
  }

  if (!groupStore.currentGroup) {
    uToastRef.value?.show({
      type: "error",
      message: "请先加入家庭组",
    });
    return;
  }

  try {
    await shoppingStore.addItem(groupStore.currentGroup.id, {
      name: newItemName.value.trim(),
      category: selectedCategory.value,
      quantity: 1,
      unit: "份",
    });
    newItemName.value = "";
    uToastRef.value?.show({
      type: "success",
      message: "添加成功",
    });
  } catch (error) {
    uToastRef.value?.show({
      type: "error",
      message: "添加失败",
    });
  }
}

function selectCategory(category: ShoppingCategory) {
  selectedCategory.value = category;
  showCategoryPicker.value = false;
}

function completedMeta(item: ShoppingListItem) {
  if (item.hasInFridge && item.status !== "purchased") {
    return item.fridgeMatchedName
      ? `冰箱已有 ${item.fridgeMatchedName}`
      : "冰箱库存已命中";
  }

  if (item.purchasedByName) {
    return `${item.purchasedByName} 已采购`;
  }

  return "已完成采购";
}

function isTransitioningToCompleted(itemId: string) {
  return Boolean(completionTransitionState.value[itemId]);
}

function isRestoringCompletedItem(itemId: string) {
  return Boolean(restoringCompletedState.value[itemId]);
}

function setCompletionTransition(itemId: string, active: boolean) {
  if (active) {
    completionTransitionState.value = {
      ...completionTransitionState.value,
      [itemId]: true,
    };
    return;
  }

  const { [itemId]: _removed, ...rest } = completionTransitionState.value;
  completionTransitionState.value = rest;
}

function setRestoringCompletedItem(itemId: string, active: boolean) {
  if (active) {
    restoringCompletedState.value = {
      ...restoringCompletedState.value,
      [itemId]: true,
    };
    return;
  }

  const { [itemId]: _removed, ...rest } = restoringCompletedState.value;
  restoringCompletedState.value = rest;
}

function clearCompletionTransitionTimer(itemId: string) {
  const timer = completionTransitionTimers.get(itemId);
  if (timer) {
    clearTimeout(timer);
    completionTransitionTimers.delete(itemId);
  }
}

function finishCompletionTransition(itemId: string, delay = 0) {
  clearCompletionTransitionTimer(itemId);

  if (delay <= 0) {
    setCompletionTransition(itemId, false);
    return;
  }

  completionTransitionTimers.set(
    itemId,
    setTimeout(() => {
      clearCompletionTransitionTimer(itemId);
      setCompletionTransition(itemId, false);
    }, delay),
  );
}

function resetCompletionTransitions() {
  completionTransitionTimers.forEach((timer) => clearTimeout(timer));
  completionTransitionTimers.clear();
  completionTransitionState.value = {};
  restoringCompletedState.value = {};
}

function closeAssignMemberPopup(force = false) {
  if (assigning.value && !force) return;

  showAssignMemberPopup.value = false;
  pendingAssignmentItem.value = null;
  selectedAssigneeId.value = "";
}

function selectAssignee(memberId: string) {
  if (assigning.value) return;
  selectedAssigneeId.value = memberId;
}

function lockBodyScroll() {
  if (
    !isWebPlatform ||
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    return;
  }

  const body = document.body;
  if (body.dataset.shoppingScrollLocked === "true") return;

  lockedBodyScrollTop = window.scrollY || window.pageYOffset || 0;
  body.dataset.shoppingScrollLocked = "true";
  body.style.position = "fixed";
  body.style.top = `-${lockedBodyScrollTop}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";
}

function unlockBodyScroll() {
  if (
    !isWebPlatform ||
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    return;
  }

  const body = document.body;
  if (body.dataset.shoppingScrollLocked !== "true") return;

  body.dataset.shoppingScrollLocked = "false";
  body.style.position = "";
  body.style.top = "";
  body.style.left = "";
  body.style.right = "";
  body.style.width = "";
  body.style.overflow = "";
  window.scrollTo(0, lockedBodyScrollTop);
}

async function handleToggle(itemId: string) {
  if (isTransitioningToCompleted(itemId)) return;

  const currentItem = shoppingStore.shoppingList.find(
    (item) => item.id === itemId,
  );
  if (!currentItem) return;

  const isMarkingPurchased = currentItem.status !== "purchased";

  if (!isMarkingPurchased) {
    try {
      await shoppingStore.togglePurchased(itemId);
    } catch (error) {
      uToastRef.value?.show({
        type: "error",
        message: "操作失败",
      });
    }
    return;
  }

  if (currentItem.status === "pending" && !currentItem.assignedTo) {
    await promptPendingItemAction(currentItem);
    return;
  }

  await performPurchaseTransition({
    itemId,
    action: () => shoppingStore.togglePurchased(itemId),
    successMessage: "已标记为采购完成",
    fallbackMessage: "操作失败",
  });
}

async function handleRestoreCompleted(item: ShoppingListItem) {
  if (item.hasInFridge && item.status !== "purchased") return;
  if (item.status !== "purchased") return;
  if (
    isTransitioningToCompleted(item.id) ||
    isRestoringCompletedItem(item.id)
  ) {
    return;
  }

  setRestoringCompletedItem(item.id, true);

  try {
    await shoppingStore.togglePurchased(item.id);
  } catch (error) {
    uToastRef.value?.show({
      type: "error",
      message: "撤回失败",
    });
  } finally {
    setRestoringCompletedItem(item.id, false);
  }
}

async function handleClaim(itemId: string) {
  try {
    await shoppingStore.claimItem(itemId);
    uToastRef.value?.show({
      type: "success",
      message: "已领取采购任务",
    });
  } catch (error: any) {
    uToastRef.value?.show({
      type: "error",
      message: error?.msg || "领取失败",
    });
  }
}

async function promptPendingItemAction(item: ShoppingListItem) {
  try {
    const { tapIndex } = await uni.showActionSheet({
      itemList: ["认领并完成", "仅认领"],
    });

    if (tapIndex === 0) {
      await performPurchaseTransition({
        itemId: item.id,
        action: () => shoppingStore.claimAndPurchase(item.id),
        successMessage: "已认领并标记完成",
        fallbackMessage: "认领并完成失败",
      });
      return;
    }

    if (tapIndex === 1) {
      await handleClaim(item.id);
    }
  } catch (error: any) {
    if (error?.errMsg?.includes("cancel")) return;
  }
}

async function performPurchaseTransition(options: {
  itemId: string;
  action: () => Promise<unknown>;
  successMessage: string;
  fallbackMessage: string;
}) {
  clearCompletionTransitionTimer(options.itemId);
  setCompletionTransition(options.itemId, true);
  const transitionStartAt = Date.now();

  try {
    await options.action();
    const elapsed = Date.now() - transitionStartAt;
    finishCompletionTransition(
      options.itemId,
      Math.max(0, COMPLETION_TRANSITION_MS - elapsed),
    );
    uToastRef.value?.show({
      type: "success",
      message: options.successMessage,
    });
  } catch (error: any) {
    clearCompletionTransitionTimer(options.itemId);
    setCompletionTransition(options.itemId, false);
    uToastRef.value?.show({
      type: "error",
      message: error?.msg || options.fallbackMessage,
    });
  }
}

async function handleAssign(item: ShoppingListItem) {
  if (!isOwner.value || !groupStore.currentGroup?.members?.length) return;

  if (!candidateMembers.value.length) {
    uToastRef.value?.show({
      type: "error",
      message: "暂无可分配的家庭成员",
    });
    return;
  }

  pendingAssignmentItem.value = item;
  selectedAssigneeId.value = candidateMembers.value.some(
    (member) => member.id === item.assignedTo,
  )
    ? item.assignedTo || ""
    : "";
  showAssignMemberPopup.value = true;
}

async function confirmAssignMember() {
  if (
    !pendingAssignmentItem.value ||
    !selectedAssigneeId.value ||
    assigning.value
  ) {
    return;
  }

  const targetMember = candidateMembers.value.find(
    (member) => member.id === selectedAssigneeId.value,
  );

  if (!targetMember) {
    uToastRef.value?.show({
      type: "error",
      message: "请选择有效的家庭成员",
    });
    return;
  }

  assigning.value = true;

  try {
    await shoppingStore.assignItem(pendingAssignmentItem.value.id, {
      assignedTo: targetMember.id,
    });
    assigning.value = false;
    closeAssignMemberPopup(true);
    uToastRef.value?.show({
      type: "success",
      message: `已分配给 ${targetMember.nickname}`,
    });
  } catch (error: any) {
    uToastRef.value?.show({
      type: "error",
      message: error?.msg || "分配失败",
    });
  } finally {
    assigning.value = false;
  }
}

function confirmDelete(itemId: string) {
  itemToDelete.value = itemId;
  showDeleteModal.value = true;
}

async function handleDelete() {
  try {
    await shoppingStore.deleteItem(itemToDelete.value);
    showDeleteModal.value = false;
    itemToDelete.value = "";
    uToastRef.value?.show({
      type: "success",
      message: "删除成功",
    });
  } catch (error) {
    uToastRef.value?.show({
      type: "error",
      message: "删除失败",
    });
  }
}

function confirmCompleteAndStock() {
  if (!groupStore.currentGroup) return;
  showCompleteModal.value = true;
}

async function handleCompleteAndStock() {
  if (!groupStore.currentGroup) return;

  try {
    await shoppingStore.clearPurchased(groupStore.currentGroup.id);
    showCompleteModal.value = false;
    uToastRef.value?.show({
      type: "success",
      message: "已完成采购并入库",
    });
  } catch (error) {
    uToastRef.value?.show({
      type: "error",
      message: "操作失败",
    });
  }
}

async function handleRefresh() {
  refreshing.value = true;
  try {
    await loadShoppingLists();
  } finally {
    refreshing.value = false;
  }
}

function handleShare() {
  uToastRef.value?.show({
    type: "info",
    message: "分享功能开发中",
  });
}

function handleInviteMembers() {
  uni.navigateTo({
    url: "/pages/group/invite",
  });
}

function goBack() {
  uni.navigateBack();
}
</script>

<style scoped>
.shopping-scroll {
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}

.shopping-scroll-locked {
  overflow: hidden;
}

.shadow-soft {
  box-shadow: 0 4px 20px -2px rgba(29, 22, 12, 0.05);
}

.shadow-glow {
  box-shadow: 0 8px 24px -4px rgba(255, 159, 10, 0.3);
}
</style>
