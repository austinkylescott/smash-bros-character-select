<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

import { fitStage, type StageFit } from "./stage";

/** A template's fixed-size stage, scaled to fit the window without distortion. */
const props = defineProps<{ width: number; height: number }>();

const fitToWindow = (): StageFit =>
  fitStage({ width: window.innerWidth, height: window.innerHeight }, props);

// Fitted before the first paint, so the stage never flashes at full size.
const fit = ref(fitToWindow());
const refit = () => {
  fit.value = fitToWindow();
};

onMounted(() => window.addEventListener("resize", refit));
onBeforeUnmount(() => window.removeEventListener("resize", refit));
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
