<script setup lang="ts">
/**
 * Melee's header: the "MELEE" wordmark, the vs badge, the rules bar and Back. Only Back responds.
 * Every Melee stage is 1280 wide, so the header is drawn on fixed coordinates.
 */
defineEmits<{ back: [] }>();
</script>

<template>
  <div class="header">
    <svg class="shapes" viewBox="0 0 1280 144" aria-hidden="true">
      <defs>
        <linearGradient id="melee-bar-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#c3c8d0" />
          <stop offset="1" stop-color="#7d8592" />
        </linearGradient>
      </defs>

      <!-- The dark sweep the rules bar sits in, rising from the grid on the left. -->
      <path d="M352 144c18-40 40-84 92-84h836v84z" fill="#0b1527" />
      <path d="M1180 0h100v40l-60 0z" fill="#121a24" />
      <path d="M1150 0h30l-56 72h-24z" fill="#e8c21a" />

      <!-- The rules bar: a light rim around a dark pill, with chevrons at either end. -->
      <path
        d="M396 76h650l-18 56H382c-10 0-16-8-12-18l10-26c4-8 8-12 16-12z"
        fill="url(#melee-bar-rim)"
      />
      <path d="M404 84h626l-12 40H398c-6 0-9-4-7-10l7-22c2-6 4-8 6-8z" fill="#0d1a30" />
      <path d="M380 84h18l-14 40h-16zM404 84h10l-14 40h-10z" fill="#9aa2ae" />
      <path d="M1036 84h14l-12 40h-14zM1056 84h8l-12 40h-8z" fill="#9aa2ae" />

      <!-- The vs badge. -->
      <circle cx="304" cy="98" r="33" fill="#0d1a30" stroke="#8f98a6" stroke-width="5" />
      <text x="304" y="111" text-anchor="middle" class="vs">vs</text>

      <!-- Back's yellow rule, running off to the right edge. -->
      <path d="M1088 114h192v10H1080z" fill="#f2cf18" />
    </svg>

    <span class="wordmark" aria-hidden="true">MELEE</span>
    <span class="rules" aria-hidden="true">2-minute KO fest!</span>

    <button type="button" class="back" aria-label="Back" @click="$emit('back')">
      <svg class="chevron" viewBox="0 0 40 44" aria-hidden="true">
        <path d="M40 0 4 22l36 22-6-22z" fill="#e8251f" />
        <path d="M40 6 14 22l26 16-4-16z" fill="#f2cf18" />
      </svg>
      <span class="back-text">BACK</span>
    </button>
  </div>
</template>

<style scoped>
.header {
  position: absolute;
  inset: 0 0 auto;
  height: 144px;
}

.shapes {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.vs {
  fill: #a6aebb;
  font-family: var(--melee-font);
  font-size: 38px;
  font-weight: 800;
}

/* Melee's wordmark: black, heavily slanted, cut through by thin horizontal rules. */
.wordmark {
  position: absolute;
  left: 82px;
  top: 58px;
  color: #000;
  font-size: 84px;
  font-style: italic;
  font-weight: 900;
  letter-spacing: -0.06em;
  line-height: 1;
  transform: skewX(-12deg) scaleX(0.66);
  transform-origin: 0 100%;
  -webkit-mask: repeating-linear-gradient(180deg, #000 0 9px, transparent 9px 11px);
  mask: repeating-linear-gradient(180deg, #000 0 9px, transparent 9px 11px);
}

.rules {
  position: absolute;
  left: 400px;
  top: 84px;
  width: 620px;
  height: 40px;
  color: #fff;
  font-size: 40px;
  font-weight: 700;
  line-height: 40px;
  text-align: center;
  letter-spacing: 0.02em;
}

.back {
  position: absolute;
  left: 1036px;
  top: 70px;
  width: 244px;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 0 4px 4px;
  border: 0;
  background: transparent;
  font: inherit;
}

.chevron {
  width: 36px;
  height: 40px;
}

.back-text {
  color: #f2cf18;
  font-size: 38px;
  font-weight: 800;
  letter-spacing: 0.06em;
  line-height: 1;
  text-shadow: 0 2px 0 #3a2a00;
}

.back:hover .back-text,
.back:focus-visible .back-text {
  color: #fff27a;
}

.back:focus-visible {
  outline: 4px solid #fff;
  outline-offset: -4px;
}
</style>
