<template>
  <InstructionCard
    :step-number="stepNumber"
    :instruction="instruction"
    :is-voice-playing="isVoicePlaying"
  />
</template>

<script setup lang="ts">
import InstructionCard from "./InstructionCard.vue";

defineProps<{
  stepNumber: number;
  instruction: string;
  isVoicePlaying: boolean;
}>();
</script>
