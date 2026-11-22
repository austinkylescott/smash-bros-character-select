<script setup lang="ts">
/**
 * Smash for 3DS's "Ready to Fight" banner across the top screen: a black band between red rules,
 * the words in slanted orange-gold capitals, and the red START tab at its right end. Pressing it
 * gives a flourish; there is no battle to start.
 */
import { ref } from "vue";

/** The banner's vertical centre and width on the stage. */
defineProps<{ y: number; width: number }>();

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
    :style="{ top: `${y - 120}px`, width: `${width}px` }"
    @click="press"
    @animationend="flourish = false"
  >
    <span class="band" />
    <span class="words">Ready to Fight</span>
    <span class="start" aria-hidden="true">START</span>
  </button>
</template>

<style scoped>
.banner {
  position: absolute;
  left: 0;
  z-index: 6;
  height: 240px;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  animation: slide-in 0.2s ease-out;
}

/* A black band, red rules above and below it, each rule stepping down at the left. */
.band {
  position: absolute;
  inset: 24px 0;
  background:
    linear-gradient(
      180deg,
      transparent 0 3%,
      #e0141c 3% 9%,
      transparent 9% 91%,
      #e0141c 91% 97%,
      transparent 97%
    ),
    linear-gradient(180deg, #1a1a1c, #050506 50%, #1a1a1c);
  box-shadow: 0 6px 10px rgb(0 0 0 / 50%);
}

.words {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  font-size: 112px;
  font-style: italic;
  font-weight: 900;
  letter-spacing: 0.01em;
  line-height: 1;
  text-align: center;
  text-transform: uppercase;
  white-space: nowrap;
  background: linear-gradient(180deg, #fff27a 10%, #ffc414 50%, #ff8a00 90%);
  background-clip: text;
  color: transparent;
  transform: translateY(-52%) skewX(-10deg);
  filter: drop-shadow(0 0 4px #3a1000) drop-shadow(0 4px 0 #3a1000);
}

.start {
  position: absolute;
  right: 36px;
  bottom: 0;
  padding: 8px 26px;
  border: 4px solid #ff6a6a;
  border-radius: 12px;
  background: linear-gradient(180deg, #e8323a, #a00c12);
  color: #fff;
  font-size: 40px;
  font-style: italic;
  font-weight: 900;
  line-height: 1;
}

.banner:focus-visible .band {
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
