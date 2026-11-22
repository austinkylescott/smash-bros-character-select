<script setup lang="ts">
/**
 * Smash 64's "Ready to Fight" banner: a dark band across the grid between two pink rules, the
 * words stretched wide in gold, and "PRESS START" below the panels. Pressing it gives a flourish;
 * there is no battle to start.
 */
import { ref } from "vue";

defineProps<{
  /** The banner's vertical centre on the stage. */
  y: number;
  /** Where "PRESS START" sits: just below the panels. */
  pressY: number;
}>();

const flourish = ref(false);
function press() {
  flourish.value = false;
  requestAnimationFrame(() => (flourish.value = true));
}
</script>

<template>
  <div class="banner-layer">
    <button
      type="button"
      class="banner"
      :class="{ flourish }"
      data-banner
      :style="{ top: `${y - 30}px` }"
      @click="press"
      @animationend="flourish = false"
    >
      <span class="band" />
      <span class="words">Ready to Fight</span>
    </button>
    <span class="press" aria-hidden="true" :style="{ top: `${pressY}px` }">
      PRESS <span class="start">START</span>
    </span>
  </div>
</template>

<style scoped>
.banner {
  position: absolute;
  left: 0;
  z-index: 4;
  width: 1280px;
  height: 60px;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  animation: grow 0.18s ease-out;
}

/* A see-through dark band between two pink rules. */
.band {
  position: absolute;
  inset: 0 160px;
  border-block: 6px solid #d05a78;
  background: rgb(0 0 0 / 55%);
}

.words {
  position: absolute;
  inset: 4px 0 0;
  color: #d8c060;
  font-size: 56px;
  font-weight: 900;
  letter-spacing: 0.06em;
  line-height: 52px;
  text-align: center;
  white-space: nowrap;
  transform: scaleX(1.9);
  -webkit-text-stroke: 3px #3a2c00;
  paint-order: stroke fill;
}

.banner:focus-visible .band {
  outline: 6px solid #fff;
}

.press {
  position: absolute;
  left: 0;
  width: 1280px;
  color: #e4e4d8;
  font-size: 34px;
  font-weight: 700;
  letter-spacing: 0.12em;
  line-height: 1;
  text-align: center;
}

.start {
  color: #f06a9a;
}

.flourish {
  animation: flourish 0.5s ease-out;
}

@keyframes grow {
  from {
    transform: scaleY(0);
  }
}

@keyframes flourish {
  0% {
    filter: brightness(1.8);
  }
}

@media (prefers-reduced-motion: reduce) {
  .banner,
  .flourish {
    animation: none;
  }
}
</style>
