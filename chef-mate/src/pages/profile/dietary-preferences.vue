<template>
  <CmPageShell
    title="饮食偏好"
    :background-class="
      'relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light font-display text-slate-900 pb-10'
    "
    :header-class="
      'z-30 px-4 py-4 bg-background-light/80 backdrop-blur-md'
    "
    :content-padding-class="'px-5 pb-10'"
    @back="goBack"
  >
    <template #right>
      <button
        @click="savePreferences"
        class="px-4 py-2 bg-transparent text-primary font-bold text-base hover:opacity-80 transition-opacity p-0 m-0 border-none after:border-none"
      >
        保存
      </button>
    </template>

      <!-- Allergies -->
      <view>
        <view class="flex items-center gap-2 mb-4">
          <text class="material-symbols-outlined text-red-500 text-xl"
            >error</text
          >
          <text class="text-lg font-bold text-slate-900">过敏源</text>
        </view>
        <view class="flex flex-wrap gap-3">
          <view
            v-for="item in allergyOptions"
            :key="item"
            @click="toggleAllergy(item)"
            :class="[
              'flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-medium text-sm transition-colors',
              allergies.includes(item)
                ? 'bg-red-50 border-2 border-red-200 text-red-600'
                : 'bg-white border border-slate-100 text-slate-600 shadow-sm',
            ]"
          >
            <text
              v-if="allergies.includes(item)"
              class="material-symbols-outlined text-sm"
              >warning</text
            >
            {{ item }}
          </view>
          <view
            @click="addAllergy"
            class="flex items-center justify-center py-3 px-4 rounded-xl bg-white border border-slate-200 border-dashed text-slate-400 font-medium text-sm active:bg-slate-50"
          >
            + 添加
          </view>
        </view>
      </view>

      <!-- Diet Habits -->
      <view>
        <text class="text-lg font-bold text-slate-900 mb-4 block"
          >饮食习惯</text
        >
        <view class="flex flex-col gap-3">
          <view
            v-for="habit in habitOptions"
            :key="habit.id"
            @click="toggleHabit(habit.id)"
            :class="[
              'relative flex items-center p-4 rounded-2xl shadow-sm transition-colors',
              habits.includes(habit.id)
                ? 'bg-white border-2 border-primary'
                : 'bg-white border border-slate-100',
            ]"
          >
            <view
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center mr-4',
                habit.iconBg,
                habit.iconColor,
              ]"
            >
              <text class="material-symbols-outlined text-2xl">{{
                habit.icon
              }}</text>
            </view>
            <view class="flex-1">
              <text class="font-bold text-slate-900 block">{{
                habit.title
              }}</text>
              <text class="text-xs text-slate-500 block">{{ habit.desc }}</text>
            </view>
            <text
              v-if="habits.includes(habit.id)"
              class="material-symbols-outlined text-primary"
              >check_circle</text
            >
          </view>
        </view>
      </view>

      <!-- Dislikes -->
      <view>
        <text class="text-lg font-bold text-slate-900 mb-4 block">不想吃</text>
        <view class="relative flex mb-4 items-center gap-1">
          <cm-input
            class="flex-1"
            v-model="newDislike"
            placeholder="输入并回车添加不想吃的食材"
            type="text"
          >
            <template #suffix>
              <view
                class="border-white bg-primary shadow-md shadow-primary-light border-3 rounded-full h-10 w-12 flex items-center justify-center ml-2"
              >
                <text
                  @click="addDislike"
                  class="material-symbols-outlined text-2xl text-white active:text-slate-600"
                  >check</text
                >
              </view>
            </template>
          </cm-input>
        </view>
        <view class="flex flex-wrap gap-2">
          <view
            v-for="(item, index) in dislikes"
            :key="item"
            class="flex items-center gap-1 px-3 py-1.5 bg-slate-100 rounded-full text-slate-700 text-sm font-medium"
          >
            {{ item }}
            <text
              @click="removeDislike(index)"
              class="material-symbols-outlined text-base text-slate-400 active:text-slate-600"
              >close</text
            >
          </view>
        </view>
      </view>

      <!-- Taste Preferences -->
      <view>
        <text class="text-lg font-bold text-slate-900 mb-6 block"
          >口味偏好</text
        >
        <view
          class="flex flex-col gap-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <!-- Spiciness -->
          <view class="flex flex-col gap-3">
            <view class="flex justify-between items-center">
              <text class="text-sm font-bold text-slate-700">辣度</text>
              <text class="text-xs text-primary font-bold">{{
                getSpicyLabel(preferences.spicy)
              }}</text>
            </view>
            <slider
              :value="preferences.spicy"
              @change="onSpicyChange"
              min="0"
              max="100"
              step="33"
              activeColor="#ff9f0a"
              backgroundColor="#f1f5f9"
              block-size="24"
              block-color="#ff9f0a"
            />
            <view class="flex justify-between text-[10px] text-slate-400">
              <text>不吃辣</text>
              <text>微辣</text>
              <text>中辣</text>
              <text>特辣</text>
            </view>
          </view>

          <!-- Sweetness -->
          <view class="flex flex-col gap-3">
            <view class="flex justify-between items-center">
              <text class="text-sm font-bold text-slate-700">甜度</text>
              <text class="text-xs text-primary font-bold">{{
                getSweetLabel(preferences.sweet)
              }}</text>
            </view>
            <slider
              :value="preferences.sweet"
              @change="onSweetChange"
              min="0"
              max="100"
              step="50"
              activeColor="#ff9f0a"
              backgroundColor="#f1f5f9"
              block-size="24"
              block-color="#ff9f0a"
            />
            <view class="flex justify-between text-[10px] text-slate-400">
              <text>无糖</text>
              <text>微甜</text>
              <text>多糖</text>
            </view>
          </view>

          <!-- Saltiness -->
          <view class="flex flex-col gap-3">
            <view class="flex justify-between items-center">
              <text class="text-sm font-bold text-slate-700">咸度</text>
              <text class="text-xs text-primary font-bold">{{
                getSaltyLabel(preferences.salty)
              }}</text>
            </view>
            <slider
              :value="preferences.salty"
              @change="onSaltyChange"
              min="0"
              max="100"
              step="50"
              activeColor="#ff9f0a"
              backgroundColor="#f1f5f9"
              block-size="24"
              block-color="#ff9f0a"
            />
            <view class="flex justify-between text-[10px] text-slate-400">
              <text>清淡</text>
              <text>适中</text>
              <text>重口</text>
            </view>
          </view>
        </view>
      </view>
  </CmPageShell>
    <up-toast ref="uToastRef"></up-toast>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

// --- Allergies ---
import { useUserStore } from "@/stores/user";
import CmInput from "@/components/CmInput/CmInput.vue";
const userStore = useUserStore();

const uToastRef = ref();

const goBack = () => {
  uni.navigateBack();
};

const savePreferences = () => {
  userStore.setDietaryPreferences({
    allergies: allergies.value,
    habits: habits.value,
    dislikes: dislikes.value,
    taste: preferences,
  });

  uToastRef.value?.show({
    type: "success",
    message: "偏好设置已保存",
  });
  setTimeout(() => {
    uni.navigateBack();
  }, 1000);
};

// --- Allergies ---
const allergyOptions = ["花生", "海鲜", "坚果", "乳制品", "大豆"];
const allergies = ref<string[]>([...userStore.dietaryPreferences.allergies]);

const toggleAllergy = (item: string) => {
  const index = allergies.value.indexOf(item);
  if (index > -1) {
    allergies.value.splice(index, 1);
  } else {
    allergies.value.push(item);
  }
};

const addAllergy = () => {
  uToastRef.value?.show({ type: "default", message: "暂未开放自定义过敏源" });
};

// --- Diet Habits ---
const habitOptions = [
  {
    id: "vegetarian",
    title: "素食主义",
    desc: "不包含肉类及家禽制品",
    icon: "eco",
    iconBg: "bg-orange-100",
    iconColor: "text-primary",
  },
  {
    id: "low_carb",
    title: "低碳水",
    desc: "严格控制淀粉和糖分的摄入",
    icon: "fitness_center",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    id: "light",
    title: "少盐少油",
    desc: "追求食材本味，清淡健康",
    icon: "water_drop",
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
  },
];
const habits = ref<string[]>([...userStore.dietaryPreferences.habits]);

const toggleHabit = (id: string) => {
  const index = habits.value.indexOf(id);
  if (index > -1) {
    habits.value.splice(index, 1);
  } else {
    habits.value.push(id);
  }
};

// --- Dislikes ---
const newDislike = ref("");
const dislikes = ref<string[]>([...userStore.dietaryPreferences.dislikes]);

const addDislike = () => {
  if (
    newDislike.value.trim() &&
    !dislikes.value.includes(newDislike.value.trim())
  ) {
    dislikes.value.push(newDislike.value.trim());
    newDislike.value = "";
  }
};

const removeDislike = (index: number) => {
  dislikes.value.splice(index, 1);
};

// --- Taste Preferences (Sliders) ---
const preferences = reactive({
  spicy: userStore.dietaryPreferences.taste.spicy,
  sweet: userStore.dietaryPreferences.taste.sweet,
  salty: userStore.dietaryPreferences.taste.salty,
});

const onSpicyChange = (e: any) => (preferences.spicy = e.detail.value);
const onSweetChange = (e: any) => (preferences.sweet = e.detail.value);
const onSaltyChange = (e: any) => (preferences.salty = e.detail.value);

const getSpicyLabel = (val: number) => {
  if (val < 15) return "不吃辣";
  if (val < 50) return "微辣";
  if (val < 80) return "中辣";
  return "特辣";
};

const getSweetLabel = (val: number) => {
  if (val < 25) return "无糖";
  if (val < 75) return "微甜";
  return "多糖";
};

const getSaltyLabel = (val: number) => {
  if (val < 25) return "清淡";
  if (val < 75) return "适中";
  return "重口";
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
