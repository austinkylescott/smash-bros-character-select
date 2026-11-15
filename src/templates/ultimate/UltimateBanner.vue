<script setup lang="ts">
/** Ultimate's "Ready to Fight!" banner. Pressing it gives a flourish; there is no battle to start. */
import { ref } from "vue";

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
    @click="press"
    @animationend="flourish = false"
  >
    <span class="band">
      <span class="words">
        <span class="small">Ready</span><span class="to">to</span><span class="big">Fight!</span>
      </span>
    </span>
  </button>
</template>

<style scoped>
.banner {
  position: absolute;
  left: -120px;
  top: 300px;
  width: 2160px;
  height: 240px;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  transform: rotate(-6deg);
  animation: slide-in 0.28s cubic-bezier(0.2, 0.9, 0.3, 1.2);
}

.band {
  position: absolute;
  inset: 0;
  display: block;
  background: linear-gradient(
    180deg,
    rgb(255 255 255 / 92%) 0 10%,
    #111 10% 86%,
    rgb(240 240 240 / 92%) 86%
  );
  box-shadow: 0 10px 30px rgb(0 0 0 / 55%);
}

.band::before {
  content: "";
  position: absolute;
  left: 0;
  top: 10%;
  width: 280px;
  height: 76%;
  background: linear-gradient(90deg, #d81f26, #ff4a2a);
  clip-path: polygon(0 0, 100% 0, 75% 100%, 0 100%);
}

.band::after {
  content: "";
  position: absolute;
  right: 0;
  top: 10%;
  width: 700px;
  height: 76%;
  background: linear-gradient(90deg, transparent, #ffd21a 30%, #ffe45a);
  clip-path: polygon(25% 0, 100% 0, 100% 100%, 0 100%);
}

.words {
  position: absolute;
  z-index: 1;
  inset: 0;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 20px;
  padding-top: 26px;
  font-style: italic;
  font-weight: 900;
  line-height: 1;
  text-transform: uppercase;
  background: linear-gradient(180deg, #ffe94a 10%, #ff9a1a 55%, #ff4a12 90%);
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 4px 0 #3a0a00);
}

.small {
  font-size: 128px;
}

.to {
  font-size: 72px;
}

.big {
  font-size: 176px;
}

.banner:focus-visible .band {
  outline: 6px solid #fff;
}

.flourish {
  animation: flourish 0.6s ease-out;
}

.flourish .band {
  animation: flash 0.6s ease-out;
}

@keyframes slide-in {
  from {
    transform: rotate(-6deg) translateX(-110%);
  }
}

@keyframes flourish {
  30% {
    transform: rotate(-6deg) scale(1.08);
  }
}

@keyframes flash {
  0% {
    filter: brightness(2.4);
  }
}

@media (prefers-reduced-motion: reduce) {
  .banner,
  .flourish,
  .flourish .band {
    animation: none;
  }
}
</style>
