<script setup lang="ts">
import { computed } from "vue";

import { fitStage } from "./stage";
import { useViewport } from "./useViewport";

/** A template's fixed-size stage, scaled to fit the window without distortion. */
const props = defineProps<{ width: number; height: number }>();

const viewport = useViewport();
const fit = computed(() => fitStage(viewport.value, props));
</script>

<template>
  <div class="viewport">
    <div
      class="stage"
      :style="{
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})`,
      }"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.viewport {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #000;
}

.stage {
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  transform-origin: 0 0;
}
</style>
