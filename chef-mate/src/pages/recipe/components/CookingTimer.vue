<template>
  <view
    class="w-full flex-1 flex flex-col items-center justify-center min-h-0"
  >
    <template v-if="showTimer">
      <!-- Giant Circular Timer -->
      <view
        class="relative flex items-center justify-center transform scale-90"
      >
        <!-- Progress Ring -->
        <view
          class="w-56 h-56 relative rounded-full border-8 border-white/5 flex items-center justify-center"
        >
          <svg
            class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          >
            <circle
              class="text-primary transition-all duration-1000 linear"
              cx="112"
              cy="112"
              fill="transparent"
              r="104"
              stroke="currentColor"
              :stroke-dasharray="dashArray"
              :stroke-dashoffset="dashOffset"
              stroke-width="8"
              stroke-linecap="round"
            ></circle>
          </svg>

          <!-- Timer Text & Play Button Container -->
          <view
            class="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10"
          >
            <text
              class="text-5xl font-black tracking-tighter text-white font-mono"
              >{{ formattedTime }}</text
            >
            <view
              @click="$emit('toggle')"
              class="mt-2 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40 active:scale-95 transition-transform cursor-pointer"
            >
              <text
                class="material-symbols-outlined text-background-dark text-4xl"
                :style="{ fontVariationSettings: '\\'FILL\\' 1' }"
                >{{ isRunning ? "pause" : "play_arrow" }}</text
              >
            </view>
          </view>
        </view>
      </view>
    </template>
    <template v-else>
      <view class="flex flex-col items-center justify-center opacity-50">
        <text class="material-symbols-outlined text-5xl mb-2"
          >check_circle</text
        >
        <text>此步骤无需计时</text>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  showTimer: boolean;
  formattedTime: string;
  isRunning: boolean;
  dashArray: number;
  dashOffset: number;
}>();

defineEmits<{
  toggle: [];
}>();
</script>
