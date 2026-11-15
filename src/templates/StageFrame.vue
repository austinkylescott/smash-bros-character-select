<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

import { fitStage, type StageFit } from "./stage";

/** A template's fixed-size stage, scaled to fit the window without distortion. */
const props = defineProps<{ width: number; height: number }>();

const fit = ref<StageFit>({ scale: 1, x: 0, y: 0 });
const refit = () => {
  fit.value = fitStage({ width: window.innerWidth, height: window.innerHeight }, props);
};

onMounted(() => {
  refit();
  window.addEventListener("resize", refit);
});
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
