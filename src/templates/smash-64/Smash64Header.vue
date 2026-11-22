<script setup lang="ts">
/**
 * Smash 64's header: "Free-for-all" in gold, the gold TIME pill with its arrows, and the BACK
 * button outlined in gold. Only BACK responds. Every Smash 64 stage is 1280 wide, so the header
 * is drawn on fixed coordinates.
 */
defineEmits<{ back: [] }>();
</script>

<template>
  <div class="header">
    <span class="mode" aria-hidden="true">Free-for-all</span>

    <span class="time" aria-hidden="true">
      <span class="arrow left" />
      <span class="time-word">TIME</span>
      <span class="time-value">3</span>
      <span class="arrow right" />
    </span>

    <button type="button" class="back" aria-label="Back" @click="$emit('back')">
      <span class="rewind" aria-hidden="true" />
      BACK
    </button>
  </div>
</template>

<style scoped>
.header {
  position: absolute;
  inset: 0 0 auto;
  height: 140px;
}

/* Gold capitals and lower case, heavy and slanted, outlined dark. */
.mode {
  position: absolute;
  left: 106px;
  top: 82px;
  color: #f0c020;
  font-size: 48px;
  font-style: italic;
  font-weight: 900;
  letter-spacing: 0.02em;
  line-height: 52px;
  -webkit-text-stroke: 3px #3a2400;
  paint-order: stroke fill;
}

/* The TIME pill: gold, banded lighter through the middle, a gold arrow at each end. */
.time {
  position: absolute;
  left: 564px;
  top: 84px;
  width: 348px;
  height: 48px;
  border: 4px solid #5a3a00;
  border-radius: 24px;
  box-sizing: border-box;
  background: linear-gradient(180deg, #f8d040 0%, #fff4b0 45%, #e0a010 100%);
  color: #3a2400;
  font-weight: 900;
}

.time-word {
  position: absolute;
  left: 80px;
  top: 0;
  font-size: 34px;
  letter-spacing: 0.06em;
  line-height: 40px;
  -webkit-text-stroke: 2px #fff6c0;
  paint-order: stroke fill;
}

.time-value {
  position: absolute;
  left: 220px;
  top: 0;
  font-size: 38px;
  font-style: italic;
  line-height: 40px;
}

.arrow {
  position: absolute;
  top: 4px;
  width: 30px;
  height: 32px;
  background: linear-gradient(180deg, #fff8d0, #c08000);
}

.arrow.left {
  left: 10px;
  clip-path: polygon(0 50%, 100% 0, 100% 100%);
}

.arrow.right {
  right: 10px;
  clip-path: polygon(100% 50%, 0 0, 0 100%);
}

/* BACK: gold letters in a black pill ringed gold, after a gold rewind mark. */
.back {
  position: absolute;
  left: 976px;
  top: 86px;
  width: 188px;
  height: 44px;
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 0 0 0 16px;
  border: 4px solid #e0a820;
  border-radius: 10px;
  background: #0c0a06;
  color: #f0c020;
  font: inherit;
  font-size: 30px;
  font-weight: 900;
  letter-spacing: 0.1em;
  line-height: 1;
}

.rewind {
  width: 26px;
  height: 22px;
  background: currentcolor;
  clip-path: polygon(0 50%, 50% 0, 50% 50%, 100% 0, 100% 100%, 50% 50%, 50% 100%);
}

.back:hover,
.back:focus-visible {
  color: #fff4b0;
}

.back:focus-visible {
  outline: 4px solid #fff;
  outline-offset: 2px;
}
</style>
