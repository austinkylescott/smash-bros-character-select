<script setup lang="ts">
/**
 * Smash 64's header: "Free-for-all" in yellow, the gold TIME bar with its arrows, and Back. Only
 * Back responds. Every Smash 64 stage is 1280 wide, so the header is drawn on fixed coordinates.
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
      <span class="back-arrows" aria-hidden="true" />
      <span class="back-text">BACK</span>
    </button>
  </div>
</template>

<style scoped>
.header {
  position: absolute;
  inset: 0 0 auto;
  height: 140px;
}

.mode {
  position: absolute;
  left: 104px;
  top: 82px;
  color: #f0c020;
  font-size: 56px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1;
  -webkit-text-stroke: 3px #3a2400;
  paint-order: stroke fill;
}

/* The gold TIME bar: a rounded pill, an arrow pressed into each end. */
.time {
  position: absolute;
  left: 564px;
  top: 78px;
  width: 352px;
  height: 60px;
  border: 4px solid #4a3200;
  border-radius: 30px;
  background: linear-gradient(180deg, #fff3a0 0%, #f2c82a 40%, #c48e08 100%);
  box-sizing: border-box;
}

.arrow {
  position: absolute;
  top: 8px;
  width: 34px;
  height: 36px;
  background: linear-gradient(180deg, #fff, #b8b8c0);
}

.arrow.left {
  left: 12px;
  clip-path: polygon(0 50%, 100% 0, 100% 100%);
}

.arrow.right {
  right: 12px;
  clip-path: polygon(100% 50%, 0 0, 0 100%);
}

.time-word {
  position: absolute;
  left: 76px;
  top: 6px;
  color: #f4f0e0;
  font-size: 40px;
  font-weight: 900;
  letter-spacing: 0.04em;
  line-height: 44px;
  -webkit-text-stroke: 6px #2a1c00;
  paint-order: stroke fill;
}

.time-value {
  position: absolute;
  left: 224px;
  top: 2px;
  color: #2a1c00;
  font-size: 48px;
  font-style: italic;
  font-weight: 900;
  line-height: 48px;
}

/* Back: gold outlined capitals in a dark rounded box, with two arrows pointing back. */
.back {
  position: absolute;
  left: 976px;
  top: 82px;
  width: 204px;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0 0 0 16px;
  border: 4px solid #e0aa10;
  border-radius: 10px;
  background: #140e04;
  color: #f0c020;
  font: inherit;
}

.back-arrows {
  width: 34px;
  height: 26px;
  background: currentcolor;
  clip-path: polygon(0 50%, 50% 0, 50% 40%, 100% 0, 100% 100%, 50% 60%, 50% 100%);
}

.back-text {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: 0.1em;
  line-height: 1;
}

.back:hover,
.back:focus-visible {
  color: #fff27a;
  border-color: #fff27a;
}

.back:focus-visible {
  outline: 4px solid #fff;
  outline-offset: 2px;
}
</style>
