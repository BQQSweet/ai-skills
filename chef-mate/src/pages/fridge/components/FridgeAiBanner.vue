<template>
  <view>
    <FridgeAiBannerTrigger @open="openPopup" />

    <FridgeAiPreferencesPopup
      v-model:show="showPopup"
      :meal-options="mealOptions"
      :taste-options="tasteOptions"
      :meal-type="prefs.mealType"
      :selected-taste="prefs.taste"
      :servings="prefs.servings"
      @update:meal-type="prefs.mealType = $event"
      @toggle-taste="toggleTaste"
      @increase-servings="increaseServings"
      @decrease-servings="decreaseServings"
      @confirm="confirmGenerate"
    />

    <up-toast ref="uToastRef"></up-toast>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import FridgeAiBannerTrigger from "./FridgeAiBannerTrigger.vue";
import FridgeAiPreferencesPopup from "./FridgeAiPreferencesPopup.vue";
import { mealOptions, tasteOptions } from "../constants/ai-recipe";
import { useAiRecipePreferences } from "../composables/useAiRecipePreferences";

const props = defineProps<{
  ingredients?: string[];
}>();

const uToastRef = ref();
const {
  showPopup,
  prefs,
  openPopup,
  toggleTaste,
  increaseServings,
  decreaseServings,
  confirmGenerate,
} = useAiRecipePreferences(props.ingredients);
</script>
