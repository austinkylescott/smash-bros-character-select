<script setup lang="ts">
/**
 * Smash for Wii U's "Ready to Fight!" banner: a dark stripe across the screen between orange
 * rules, the words in slanted gold capitals, and the START tab hanging below its right end.
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
    :style="{ top: `${y - 40}px` }"
    @click="press"
    @animationend="flourish = false"
  >
    <span class="stripe" />
    <span class="words">Ready to Fight!</span>
    <span class="start" aria-hidden="true">START<span class="plus">+</span></span>
  </button>
</template>

<style scoped>
.banner {
  position: absolute;
  left: 0;
  width: 1280px;
  height: 116px;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  animation: slide-in 0.2s ease-out;
}

.stripe {
  position: absolute;
  inset: 0 0 auto;
  height: 80px;
  border-block: 5px solid #f2a218;
  background: linear-gradient(
    180deg,
    rgb(20 20 20 / 88%),
    rgb(44 40 36 / 92%) 50%,
    rgb(20 20 20 / 88%)
  );
  box-shadow:
    0 -4px 0 rgb(20 20 20 / 70%),
    0 4px 0 rgb(20 20 20 / 70%);
}

/* Gold capitals, slanted, lit yellow at the top and orange at the foot, outlined dark. */
.words {
  position: absolute;
  left: 0;
  right: 0;
  top: 4px;
  background: linear-gradient(180deg, #fff6b0 0%, #ffd23a 40%, #f59a12 75%, #d86a08 100%);
  background-clip: text;
  color: transparent;
  font-size: 70px;
  font-style: italic;
  font-weight: 900;
  letter-spacing: 0.01em;
  line-height: 72px;
  text-align: center;
  text-transform: uppercase;
  white-space: nowrap;
  transform: skewX(-10deg);
  -webkit-text-stroke: 2px #3a1a00;
  filter: drop-shadow(0 3px 0 #1a0c00);
}

/* START, dark on an orange tab cut away on a slant at its left. */
.start {
  position: absolute;
  right: 0;
  top: 80px;
  width: 250px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  padding-right: 54px;
  background: linear-gradient(180deg, #ffc23a, #f08c10);
  clip-path: polygon(30px 0, 100% 0, 100% 100%, 0 100%);
  color: #6a3a00;
  font-size: 30px;
  font-weight: 900;
  line-height: 1;
}

.plus {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #6a3a00;
  color: #ffc23a;
  font-size: 26px;
  line-height: 25px;
  text-align: center;
}

.banner:focus-visible .stripe {
  outline: 5px solid #fff;
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
