<script setup lang="ts">
/** Ultimate's top bar: back and info tabs, and the rules bar. Only Back responds. */
defineEmits<{ back: [] }>();
</script>

<template>
  <div class="top-bar">
    <svg class="shapes" aria-hidden="true" viewBox="0 0 1920 84" preserveAspectRatio="none">
      <defs>
        <linearGradient id="ult-sky" x1="0" x2="1">
          <stop offset="0" stop-color="#fff6c8" />
          <stop offset="0.55" stop-color="#ffe14a" />
          <stop offset="1" stop-color="#f7b42c" />
        </linearGradient>
        <linearGradient id="ult-red" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#d81f26" />
          <stop offset="1" stop-color="#a5121a" />
        </linearGradient>
        <linearGradient id="ult-pill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff04a" />
          <stop offset="1" stop-color="#f3d60c" />
        </linearGradient>
      </defs>

      <!-- The bright sky and red band to the right of the rules bar. -->
      <polygon points="960,0 1920,0 1920,8 980,26" fill="url(#ult-sky)" />
      <polygon points="980,26 1920,8 1920,44 972,46" fill="url(#ult-red)" />

      <!-- Back and info tabs. -->
      <polygon points="0,0 312,0 286,72 0,72" fill="url(#ult-red)" />
      <polygon points="138,0 176,0 150,72 112,72" fill="#8e0f15" opacity="0.55" />
      <polygon points="298,0 334,0 306,58 286,72 276,72" fill="#f0f0f0" />
      <polygon points="306,58 330,10 336,10 316,58" fill="#c8151d" />

      <!-- The rules bar. -->
      <polygon points="352,4 978,4 958,80 332,80" fill="#121212" />
      <polygon points="360,10 968,10 952,74 344,74" fill="url(#ult-pill)" />
      <polygon points="923,34 955,34 939,54" fill="#5a5200" />
    </svg>

    <!-- Back: a curled arrow. -->
    <button type="button" class="back-button" aria-label="Back" @click="$emit('back')" />
    <svg class="icon back" viewBox="0 0 64 56" aria-hidden="true">
      <path
        d="M22 6 4 22l18 16V28h14c8 0 13 5 13 11s-5 11-13 11h-8v6h8c12 0 20-8 20-17S48 22 36 22H22z"
        fill="#e2858a"
        stroke="#7a0b10"
        stroke-width="3"
        stroke-linejoin="round"
      />
    </svg>
    <!-- Info: a closed book. -->
    <svg class="icon book" viewBox="0 0 44 48" aria-hidden="true">
      <rect
        x="2"
        y="4"
        width="40"
        height="42"
        rx="3"
        fill="#e2858a"
        stroke="#7a0b10"
        stroke-width="3"
      />
      <rect x="2" y="4" width="40" height="8" fill="#f1b4b7" />
    </svg>

    <span class="rules" aria-hidden="true">Solo Battle</span>
  </div>
</template>

<style scoped>
.top-bar {
  position: absolute;
  inset: 0 0 auto;
  height: 84px;
}

.shapes {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.icon {
  position: absolute;
  pointer-events: none;
}

/* Covers the back tab, up to the dark stripe that divides it from the info tab. */
.back-button {
  position: absolute;
  left: 0;
  top: 0;
  width: 150px;
  height: 72px;
  padding: 0;
  border: 0;
  background: transparent;
  clip-path: polygon(0 0, 100% 0, 75% 100%, 0 100%);
}

.back-button:hover,
.back-button:focus-visible {
  background: rgb(255 255 255 / 18%);
  outline: none;
}

.back {
  left: 40px;
  top: 8px;
  width: 58px;
}

.book {
  left: 193px;
  top: 12px;
  width: 42px;
}

.rules {
  position: absolute;
  left: 352px;
  top: 10px;
  width: 600px;
  height: 64px;
  color: #141414;
  font-size: 44px;
  font-weight: 800;
  line-height: 64px;
  text-align: center;
  letter-spacing: 0.01em;
}
</style>
