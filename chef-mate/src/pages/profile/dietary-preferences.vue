<template>
  <CmPageShell
    title="饮食偏好"
    :background-class="
      'relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light font-display text-slate-900 pb-10'
    "
    :header-class="'z-30 px-4 py-4 bg-background-light/80 backdrop-blur-md'"
    :content-padding-class="'px-5 pb-10'"
    @back="goBack"
  >
    <template #right>
      <button
        @click="handleSave"
        class="px-4 py-2 bg-transparent text-primary font-bold text-base hover:opacity-80 transition-opacity p-0 m-0 border-none after:border-none"
      >
        保存
      </button>
    </template>

    <AllergySelector
      :options="allergyOptions"
      :values="allergies"
      @toggle="toggleAllergy"
      @add-custom="handleAddAllergy"
    />

    <HabitSelector
      class="mt-8"
      :options="habitOptions"
      :values="habits"
      @toggle="toggleHabit"
    />

    <DislikeInputSection
      class="mt-8"
      :draft="newDislike"
      :values="dislikes"
      @update:draft="newDislike = $event"
      @add="addDislike"
      @remove="removeDislike"
    />

    <TastePreferenceSection
      class="mt-8"
      :values="preferences"
      :get-spicy-label="getSpicyLabel"
      :get-sweet-label="getSweetLabel"
      :get-salty-label="getSaltyLabel"
      @change:spicy="onSpicyChange"
      @change:sweet="onSweetChange"
      @change:salty="onSaltyChange"
    />

    <up-toast ref="uToastRef"></up-toast>
  </CmPageShell>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AllergySelector from "./components/AllergySelector.vue";
import DislikeInputSection from "./components/DislikeInputSection.vue";
import HabitSelector from "./components/HabitSelector.vue";
import TastePreferenceSection from "./components/TastePreferenceSection.vue";
import { allergyOptions, habitOptions } from "./constants/profile-dietary";
import { useDietaryPreferencesForm } from "./composables/useDietaryPreferencesForm";

const uToastRef = ref();
const {
  allergies,
  habits,
  newDislike,
  dislikes,
  preferences,
  toggleAllergy,
  toggleHabit,
  addDislike,
  removeDislike,
  onSpicyChange,
  onSweetChange,
  onSaltyChange,
  getSpicyLabel,
  getSweetLabel,
  getSaltyLabel,
  savePreferences,
} = useDietaryPreferencesForm();

const goBack = () => {
  uni.navigateBack();
};

const handleSave = () => {
  savePreferences();
  uToastRef.value?.show({
    type: "success",
    message: "偏好设置已保存",
  });
  setTimeout(() => {
    uni.navigateBack();
  }, 1000);
};

const handleAddAllergy = () => {
  uToastRef.value?.show({
    type: "default",
    message: "暂未开放自定义过敏源",
  });
};
</script>

<style>
/* Unscoped global style applied across instances of slider to override uniapp native components */
uni-slider .uni-slider-handle,
.wx-slider-handle {
  border: 4px solid white !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  box-sizing: border-box;
}
</style>
