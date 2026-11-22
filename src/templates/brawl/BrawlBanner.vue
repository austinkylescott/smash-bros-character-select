<script setup lang="ts">
/**
 * Brawl's "Ready to Fight" banner: a gold stripe across the screen, the Start button and an arrow
 * on its left, and the words in Brawl's orange slanted capitals. Pressing it gives a flourish;
 * there is no battle to start.
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
    :style="{ top: `${y - 50}px` }"
    @click="press"
    @animationend="flourish = false"
  >
    <span class="stripe" />
    <span class="start" aria-hidden="true">START</span>
    <span class="arrow" aria-hidden="true" />
    <span class="words">Ready to Fight!</span>
  </button>
</template>

<style scoped>
.banner {
  position: absolute;
  left: 0;
  width: 1280px;
  height: 100px;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  animation: slide-in 0.2s ease-out;
}

/* Gold, banded lighter through the middle, with a dark rule above and below. */
.stripe {
  position: absolute;
  left: 0;
  right: 0;
  top: 22px;
  height: 56px;
  border-block: 4px solid #3a2a12;
  background: linear-gradient(
    180deg,
    #e6a92a 0%,
    #ffd768 22%,
    #fff0b0 46%,
    #ffd768 70%,
    #d8901c 100%
  );
}

.start {
  position: absolute;
  left: 78px;
  top: 10px;
  width: 80px;
  height: 80px;
  display: grid;
  place-items: center;
  border: 4px solid #7a7e88;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 30%, #fff, #c8ccd4 70%, #9ca0aa);
  color: #4a4e58;
  font-size: 22px;
  font-weight: 900;
  font-style: italic;
  letter-spacing: -0.02em;
}

.arrow {
  position: absolute;
  left: 184px;
  top: 34px;
  width: 140px;
  height: 32px;
  background: #fff;
  clip-path: polygon(0 50%, 28% 0, 28% 25%, 100% 25%, 100% 75%, 28% 75%, 28% 100%);
}

.words {
  position: absolute;
  left: 340px;
  right: 40px;
  top: 6px;
  color: #ff7a14;
  font-size: 84px;
  font-style: italic;
  font-weight: 900;
  letter-spacing: 0.04em;
  line-height: 1;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
  transform: skewX(-12deg) scaleY(0.82);
  -webkit-text-stroke: 6px #3a1400;
  paint-order: stroke fill;
  text-shadow: 0 4px 0 #3a1400;
}

.banner:focus-visible .stripe {
  outline: 6px solid #fff;
}

.flourish {
  animation: flourish 0.5s ease-out;
}

@keyframes slide-in {
  from {
    transform: translateX(-100%);
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
