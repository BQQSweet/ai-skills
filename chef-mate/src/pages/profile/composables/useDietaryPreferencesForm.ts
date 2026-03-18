import { reactive, ref } from "vue";
import { useUserStore } from "@/stores/user";

export function useDietaryPreferencesForm() {
  const userStore = useUserStore();

  const allergies = ref<string[]>([...userStore.dietaryPreferences.allergies]);
  const habits = ref<string[]>([...userStore.dietaryPreferences.habits]);
  const newDislike = ref("");
  const dislikes = ref<string[]>([...userStore.dietaryPreferences.dislikes]);

  const preferences = reactive({
    spicy: userStore.dietaryPreferences.taste.spicy,
    sweet: userStore.dietaryPreferences.taste.sweet,
    salty: userStore.dietaryPreferences.taste.salty,
  });

  function toggleAllergy(item: string) {
    const index = allergies.value.indexOf(item);
    if (index > -1) {
      allergies.value.splice(index, 1);
    } else {
      allergies.value.push(item);
    }
  }

  function toggleHabit(id: string) {
    const index = habits.value.indexOf(id);
    if (index > -1) {
      habits.value.splice(index, 1);
    } else {
      habits.value.push(id);
    }
  }

  function addDislike() {
    const value = newDislike.value.trim();
    if (!value || dislikes.value.includes(value)) return;
    dislikes.value.push(value);
    newDislike.value = "";
  }

  function removeDislike(index: number) {
    dislikes.value.splice(index, 1);
  }

  function onSpicyChange(event: any) {
    preferences.spicy = event.detail.value;
  }

  function onSweetChange(event: any) {
    preferences.sweet = event.detail.value;
  }

  function onSaltyChange(event: any) {
    preferences.salty = event.detail.value;
  }

  function getSpicyLabel(value: number) {
    if (value < 15) return "不吃辣";
    if (value < 50) return "微辣";
    if (value < 80) return "中辣";
    return "特辣";
  }

  function getSweetLabel(value: number) {
    if (value < 25) return "无糖";
    if (value < 75) return "微甜";
    return "多糖";
  }

  function getSaltyLabel(value: number) {
    if (value < 25) return "清淡";
    if (value < 75) return "适中";
    return "重口";
  }

  function savePreferences() {
    userStore.setDietaryPreferences({
      allergies: allergies.value,
      habits: habits.value,
      dislikes: dislikes.value,
      taste: preferences,
    });
  }

  return {
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
  };
}
