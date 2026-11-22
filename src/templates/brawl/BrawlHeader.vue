<script setup lang="ts">
/**
 * Brawl's header: Back on its grey tab, the "BRAWL" badge and the rules bar with its arrows. Only
 * Back responds. Every Brawl stage is 1280 wide, so the header is drawn on fixed coordinates.
 */
defineEmits<{ back: [] }>();
</script>

<template>
  <div class="header">
    <svg class="shapes" viewBox="0 0 1280 168" aria-hidden="true">
      <defs>
        <linearGradient id="brawl-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#8a3c44" />
          <stop offset="1" stop-color="#5e2228" />
        </linearGradient>
        <linearGradient id="brawl-tab" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#b8b8bc" />
          <stop offset="1" stop-color="#8c8c92" />
        </linearGradient>
      </defs>

      <!-- Charcoal across the top, and the dark red band the badge and rules bar sit on. -->
      <rect width="1280" height="168" fill="#2e2e32" />
      <path d="M232 56h1048v104H200z" fill="url(#brawl-band)" />
      <path d="M200 160h1080v8H196z" fill="#3a1418" />

      <!-- Back's grey tab, cut away on a slant. -->
      <path d="M0 0h232L160 160H0z" fill="url(#brawl-tab)" />
      <path d="M232 0l-72 160h-10L222 0z" fill="#e6e6ea" />

      <!-- The rules bar: a white pill with a grey arrow at each end of the number. -->
      <rect
        x="528"
        y="84"
        width="728"
        height="68"
        rx="34"
        fill="#f4f4f4"
        stroke="#9c9ca2"
        stroke-width="4"
      />
      <rect x="590" y="90" width="110" height="56" fill="#cfd0d4" />
      <path d="M582 92v52l-30-26z" fill="#6c6e74" />
      <path d="M708 92v52l30-26z" fill="#6c6e74" />
    </svg>

    <span class="badge" aria-hidden="true"><span class="wordmark">Brawl</span></span>
    <span class="minutes" aria-hidden="true">2</span>
    <span class="rules" aria-hidden="true">-minute KO fest!</span>

    <button type="button" class="back" aria-label="Back" @click="$emit('back')">BACK</button>
  </div>
</template>

<style scoped>
.header {
  position: absolute;
  inset: 0 0 auto;
  height: 168px;
}

.shapes {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* Brawl's badge: a cream pill, ringed dark red, with the name brushed in black across it. */
.badge {
  position: absolute;
  left: 248px;
  top: 76px;
  width: 248px;
  height: 72px;
  display: grid;
  place-items: center;
  border: 5px solid #2a0c10;
  border-radius: 36px;
  background: linear-gradient(180deg, #f0d4cc, #c86a6a);
  box-shadow: inset 0 0 0 4px #e7b2ac;
  transform: skewX(-14deg);
}

.wordmark {
  color: #1a0608;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 54px;
  font-style: italic;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1;
  text-transform: uppercase;
  -webkit-text-stroke: 1px #1a0608;
}

.minutes {
  position: absolute;
  left: 590px;
  top: 86px;
  width: 110px;
  color: #6c6e74;
  font-size: 60px;
  font-weight: 800;
  line-height: 64px;
  text-align: center;
}

.rules {
  position: absolute;
  left: 746px;
  top: 88px;
  color: #141414;
  font-size: 44px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 60px;
}

.back {
  position: absolute;
  left: 60px;
  top: 104px;
  width: 140px;
  height: 52px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #f4f4f6;
  font: inherit;
  font-size: 38px;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 52px;
  text-align: left;
  text-shadow:
    0 2px 0 #55565c,
    0 0 4px #55565c;
}

.back:hover,
.back:focus-visible {
  color: #fff6a8;
}

.back:focus-visible {
  outline: 4px solid #fff;
  outline-offset: 0;
}
</style>
