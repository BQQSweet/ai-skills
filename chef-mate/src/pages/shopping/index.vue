<template>
  <CmPageShell
    title="家庭采购清单"
    :background-class="'relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f8f5ef] dark:bg-background-dark font-display'"
    :header-class="'z-30 bg-[#f8f5ef]/90 dark:bg-background-dark/90 px-6 pb-4 backdrop-blur-lg'"
    :use-scroll-view="false"
    :content-class="'flex min-h-0 flex-1 flex-col'"
    :content-padding-class="'flex min-h-0 flex-1 flex-col'"
    :footer-class="
      page.shoppingStore.purchasedItems.length > 0
        ? isWebRuntime
          ? 'pointer-events-none fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[#f8f5ef] via-[#f8f5ef]/95 to-transparent px-6 pb-8 pt-4 dark:from-background-dark dark:via-background-dark/90'
          : 'pointer-events-none fixed bottom-0 left-6 right-6 z-20 pb-8'
        : ''
    "
    @back="page.goBack"
  >
    <template #right>
      <view class="flex items-center gap-3">
        <view
          v-if="!isWebRuntime"
          class="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-surface-dark shadow-soft cursor-pointer"
          :class="{ 'opacity-60': page.shoppingStore.loading }"
          @click="page.handleRefresh"
        >
          <text
            class="material-symbols-outlined text-text-main dark:text-white"
            :class="{ 'animate-spin': page.shoppingStore.loading }"
          >
            refresh
          </text>
        </view>

        <view
          class="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-surface-dark shadow-soft cursor-pointer"
          @click="page.handleShare"
        >
          <text class="material-symbols-outlined text-text-main dark:text-white">
            share
          </text>
        </view>
      </view>
    </template>

    <scroll-view
      :scroll-y="!page.isPageScrollLocked"
      class="flex-1 min-h-0 px-6"
      :show-scrollbar="false"
    >
      <view :class="page.contentPaddingClass">
        <ShoppingOverviewCard
          :title="page.pageTitle"
          :subtitle="page.activeListSubTitle"
          :source-label="page.listSourceLabel"
          :is-recipe-list="page.shoppingStore.activeList?.source === 'recipe'"
          :show-list-switcher-trigger="page.canSwitchShoppingLists"
          :progress="page.purchaseProgress"
          :progress-status="page.progressStatusText"
          :active-members="page.activeMembers"
          :group-member-count="page.groupMemberCount"
          :active-member-names="page.activeMemberNames"
          :claimed-count="page.shoppingStore.claimedItems.length"
          :pending-count="page.pendingWithoutFridgeCount"
          :purchased-count="page.shoppingStore.purchasedItems.length"
          :in-fridge-count="page.inFridgeCount"
          @invite-members="page.handleInviteMembers"
          @open-list-switcher="page.openListSwitcher"
        />

        <ShoppingQuickAddCard
          v-model="page.newItemName"
          :current-category-label="page.currentCategoryLabel"
          @open-category="page.showCategoryPicker = true"
          @add="page.handleAddItem"
        />

        <ShoppingPendingSection
          :loading="page.shoppingStore.loading"
          :total-count="page.shoppingStore.shoppingList.length"
          :items="page.activeDisplayItems"
          :completed-count="page.completedDisplayItems.length"
          :description="page.activeSectionDescription"
          :can-assign="page.isOwner"
          :current-user-id="page.userStore.userId"
          :transitioning-map="page.isTransitioningToCompletedMap"
          @toggle="page.handleToggle"
          @claim="page.handleClaim"
          @assign="page.handleAssign"
          @delete="page.confirmDelete"
        />

        <ShoppingCompletedSection
          :items="page.completedDisplayItems"
          :show="page.showCompletedSection"
          :restoring-map="page.isRestoringCompletedItemMap"
          @toggle-show="page.showCompletedSection = !page.showCompletedSection"
          @restore="page.handleRestoreCompleted"
        />

        <view
          v-if="!isWebRuntime && page.shoppingStore.purchasedItems.length > 0"
          class="h-28 shrink-0"
        ></view>
      </view>
    </scroll-view>

    <template v-if="page.shoppingStore.purchasedItems.length > 0" #footer>
      <view v-if="!isWebRuntime" class="pointer-events-auto">
        <ShoppingFooterAction @complete="page.confirmCompleteAndStock" />
      </view>
      <ShoppingFooterAction
        v-else
        @complete="page.confirmCompleteAndStock"
      />
    </template>

    <ShoppingAssignPopup
      v-model:show="page.showAssignMemberPopup"
      :item="page.pendingAssignmentItem"
      :members="page.candidateMembers"
      :selected-assignee-id="page.selectedAssigneeId"
      :assigning="page.assigning"
      :category-label="page.assignmentItemCategoryLabel"
      :category-icon="page.assignmentItemCategoryIcon"
      :role-labels="shoppingRoleLabels"
      @select="page.selectedAssigneeId = $event"
      @confirm="page.confirmAssignMember"
    />

    <ShoppingCategoryPicker
      v-model:show="page.showCategoryPicker"
      :categories="shoppingCategories"
      :selected-category="page.selectedCategory"
      :labels="shoppingCategoryLabels"
      :icons="shoppingCategoryIcons"
      @select="page.selectCategory"
    />

    <ShoppingListSwitcherSheet
      :show="page.showListSwitcherSheet"
      :items="page.switchableShoppingLists"
      @update:show="
        $event
          ? (page.showListSwitcherSheet = $event)
          : page.closeListSwitcher()
      "
      @select="page.selectShoppingList"
    />

    <CmConfirmDialog
      v-model:show="page.interactionDialog.dialogState.show"
      :title="page.interactionDialog.dialogState.title"
      :description="page.interactionDialog.dialogState.description"
      :confirm-text="page.interactionDialog.dialogState.confirmText"
      :cancel-text="page.interactionDialog.dialogState.cancelText"
      :icon-name="page.interactionDialog.dialogState.iconName"
      :tone="page.interactionDialog.dialogState.tone"
      :close-on-click-overlay="
        page.interactionDialog.dialogState.closeOnClickOverlay
      "
      :disabled="page.interactionDialog.dialogState.disabled"
      :variant="page.interactionDialog.dialogState.variant"
      :actions="page.interactionDialog.dialogState.actions"
      :action-description="page.interactionDialog.dialogState.actionDescription"
      @confirm="page.interactionDialog.handleConfirm"
      @select="page.interactionDialog.handleSelect"
      @cancel="page.interactionDialog.handleCancel"
      @close="page.interactionDialog.handleClose"
    />

    <CmConfirmDialog
      v-model:show="page.showDeleteModal"
      title="确认删除"
      description="确定要删除这个购物项吗？"
      icon-name="delete"
      tone="danger"
      @confirm="page.handleDelete"
    />

    <CmConfirmDialog
      v-model:show="page.showCompleteModal"
      title="完成采购"
      :description="`确定要将 ${page.shoppingStore.purchasedItems.length} 个已购买的食材入库吗？`"
      icon-name="inventory_2"
      @confirm="page.handleCompleteAndStock"
    />

    <up-toast ref="uToastRef"></up-toast>
  </CmPageShell>
</template>

<script setup lang="ts">
import { isWeb } from "@uni-helper/uni-env";
import { reactive, ref } from "vue";
import { onHide, onLoad, onShow, onUnload } from "@dcloudio/uni-app";
import CmConfirmDialog from "@/components/CmConfirmDialog/CmConfirmDialog.vue";
import {
  shoppingCategories,
  shoppingCategoryIcons,
  shoppingCategoryLabels,
  shoppingRoleLabels,
} from "./constants/shopping";
import ShoppingAssignPopup from "./components/ShoppingAssignPopup.vue";
import ShoppingCategoryPicker from "./components/ShoppingCategoryPicker.vue";
import ShoppingCompletedSection from "./components/ShoppingCompletedSection.vue";
import ShoppingFooterAction from "./components/ShoppingFooterAction.vue";
import ShoppingListSwitcherSheet from "./components/ShoppingListSwitcherSheet.vue";
import ShoppingOverviewCard from "./components/ShoppingOverviewCard.vue";
import ShoppingPendingSection from "./components/ShoppingPendingSection.vue";
import ShoppingQuickAddCard from "./components/ShoppingQuickAddCard.vue";
import { useShoppingPage } from "./composables/useShoppingPage";

const uToastRef = ref<{
  show?: (options: { type: string; message: string; duration?: number }) => void;
} | null>(null);
const page = reactive(useShoppingPage({ toastRef: uToastRef }));
const isWebRuntime = isWeb;

onLoad((options) => {
  page.parseRouteOptions(options || {});
});

onShow(() => {
  void page.initializePage();
});

onHide(() => {
  page.cleanupPageState();
});

onUnload(() => {
  page.cleanupPageState();
});
</script>

<style scoped>
.shadow-soft {
  box-shadow: 0 4px 20px -2px rgba(29, 22, 12, 0.05);
}
</style>
