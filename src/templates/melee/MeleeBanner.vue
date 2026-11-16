<script setup lang="ts">
/**
 * Melee's "Ready to Fight" banner: a red streak across the screen with "PRESS START" beneath.
 * Pressing it gives a flourish; there is no battle to start.
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
    :style="{ top: `${y - 90}px` }"
    @click="press"
    @animationend="flourish = false"
  >
    <span class="streak" />
    <span class="words">Ready to Fight</span>
    <span class="press">Press Start</span>
  </button>
</template>

<style scoped>
.banner {
  position: absolute;
  left: 0;
  width: 1280px;
  height: 180px;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  animation: slide-in 0.24s ease-out;
}

/* A translucent red band between two bright streaks, each tapered to a point at both ends. */
.streak {
  position: absolute;
  left: 0;
  right: 0;
  top: 40px;
  height: 100px;
  background: linear-gradient(180deg, transparent 0 4%, rgb(150 0 0 / 55%) 4% 96%, transparent 96%);
}

.streak::before,
.streak::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 12px;
  clip-path: polygon(0 50%, 12% 0, 88% 0, 100% 50%, 88% 100%, 12% 100%);
  background: linear-gradient(90deg, #ff3a2a, #e0100c 50%, #ff3a2a);
}

.streak::before {
  top: -4px;
}

.streak::after {
  bottom: -4px;
}

.words {
  position: absolute;
  left: 0;
  right: 0;
  top: 44px;
  font-size: 86px;
  font-style: italic;
  font-weight: 900;
  letter-spacing: 0.02em;
  line-height: 1;
  text-align: center;
  text-transform: uppercase;
  background: linear-gradient(180deg, #fff3a8 8%, #ffc41a 45%, #f07c10 80%);
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 2px #4a1400) drop-shadow(0 4px 0 #4a1400);
  transform: skewX(-10deg);
}

.press {
  position: absolute;
  left: 0;
  right: 0;
  top: 112px;
  color: #f4dde2;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 0.4em;
  line-height: 1;
  text-align: center;
  text-transform: uppercase;
  text-shadow: 0 2px 0 #5a0008;
}

.banner:focus-visible .streak {
  outline: 6px solid #fff;
}

.flourish {
  animation: flourish 0.5s ease-out;
}

@keyframes slide-in {
  from {
    transform: scaleX(0.2);
    opacity: 0;
  }
}

@keyframes flourish {
  0% {
    filter: brightness(2.2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .banner,
  .flourish {
    animation: none;
  }
}
</style>
