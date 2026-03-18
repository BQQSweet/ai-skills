<template>
  <up-datetime-picker
    :show="show"
    :model-value="value"
    mode="date"
    @confirm="$emit('confirm', $event)"
    @cancel="$emit('cancel')"
  ></up-datetime-picker>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  value: number;
}>();

defineEmits<{
  confirm: [event: any];
  cancel: [];
}>();
</script>
