<script setup lang="ts">
/**
 * Smash 64's "Ready to Fight" banner: a dark see-through band across the screen between two pink
 * rules, the words in wide gold capitals. Pressing it gives a flourish; there is no battle to
 * start.
 */
import { ref } from "vue";

/** The banner's vertical centre on the stage. */
defineProps<{ y: number }>();

const flourish = ref(false);
function press() {
  flourish.value = false;
  requestAnimationFrame(() => (flourish.value = true));
}
</script>

<template>
  <button
    type="button"
    class="banner"
    :class="{ flourish }"
    data-banner
    :style="{ top: `${y - 26}px` }"
    @click="press"
    @animationend="flourish = false"
  >
    <span class="words">Ready to Fight</span>
  </button>
</template>

<style scoped>
.banner {
  position: absolute;
  left: 40px;
  width: 1200px;
  height: 52px;
  padding: 0;
  border: 0;
  border-block: 4px solid #d06080;
  background: rgb(40 0 10 / 55%);
  font: inherit;
  animation: wipe-in 0.25s ease-out;
}

.words {
  display: block;
  color: #e8c030;
  font-size: 56px;
  font-weight: 900;
  letter-spacing: 0.34em;
  line-height: 44px;
  text-align: center;
  text-transform: none;
  white-space: nowrap;
  transform: scaleY(0.7);
  -webkit-text-stroke: 5px #3a2000;
  paint-order: stroke fill;
}

.banner:focus-visible {
  outline: 6px solid #fff;
}

.flourish {
  animation: flourish 0.5s ease-out;
}

@keyframes wipe-in {
  from {
    clip-path: inset(0 50%);
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
