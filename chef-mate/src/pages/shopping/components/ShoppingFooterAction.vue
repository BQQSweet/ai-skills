<template>
  <view
    class="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-bold text-white shadow-glow transition-all cursor-pointer active:scale-[0.98]"
    @click="$emit('complete')"
  >
    <text class="material-symbols-outlined">inventory_2</text>
    <text>完成采购并入库</text>
  </view>
</template>

<script setup lang="ts">
defineEmits<{
  complete: [];
}>();
</script>
