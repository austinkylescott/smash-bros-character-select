<script setup lang="ts">
/**
 * The touch screen's header and status bar. Across the top: Back, the "Smash" mode tab, the
 * time limit with its arrows, the "Time" rule and the green team toggle. Across the foot: the
 * handheld's own status bar, with its battery and clock. Only Back responds. Drawn on the touch
 * screen's own coordinates, three times the game's 320x240.
 */
import { onBeforeUnmount, ref } from "vue";

defineEmits<{ back: [] }>();

/** The clock in the status bar, as the handheld shows it: 24-hour, to the minute. */
const now = () =>
  new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
const clock = ref(now());
const timer = setInterval(() => (clock.value = now()), 15_000);
onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
  <div class="header">
    <button type="button" class="back" aria-label="Back" @click="$emit('back')">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M9 5L3 10l6 5v-3h6c2.5 0 4 1.5 4 3.5S17.5 19 15 19h-3v3h3c4.4 0 7-2.7 7-6.5S19.4 9 15 9H9z"
          fill="#fff"
        />
      </svg>
    </button>
    <span class="tab" aria-hidden="true">Smash</span>
    <span class="limit" aria-hidden="true">
      <span class="arrow left" />
      <span class="number">2</span>
      <span class="arrow right" />
    </span>
    <span class="rule" aria-hidden="true">Time</span>
    <span class="toggle" aria-hidden="true">
      <span class="icon" />
      <span class="off">Off</span>
    </span>
  </div>

  <div class="status" aria-hidden="true">
    <span class="battery" />
    <span class="clock-icon" />
    <span class="time">{{ clock }}</span>
  </div>
</template>

<style scoped>
.header {
  position: absolute;
  inset: 0 0 auto;
  height: 84px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 6px;
  background: linear-gradient(180deg, #4a4a4e, #2a2a2e);
  border-bottom: 3px solid #141416;
  color: #fff;
}

.header > * {
  box-sizing: border-box;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #6a6a70;
  border-radius: 12px;
  background: linear-gradient(180deg, #3c3c40, #1c1c1e);
  font-style: italic;
  font-weight: 800;
  line-height: 1;
}

.back {
  width: 84px;
  flex: none;
  padding: 0;
  font: inherit;
}

.back svg {
  width: 56px;
}

.back:focus-visible {
  outline: 4px solid #fff;
  outline-offset: 2px;
}

.tab {
  width: 288px;
  font-size: 46px;
  transform: skewX(-8deg);
}

.limit {
  width: 180px;
  gap: 14px;
  background: #0c0c0e;
}

.number {
  font-size: 46px;
  font-style: normal;
}

.arrow {
  width: 0;
  height: 0;
  border-block: 14px solid transparent;
}

.arrow.left {
  border-right: 18px solid #d8d8dc;
}

.arrow.right {
  border-left: 18px solid #d8d8dc;
}

.rule {
  width: 180px;
  font-size: 42px;
}

/* The green toggle with its gear, set to "Off". */
.toggle {
  flex: 1;
  gap: 10px;
  border-color: #9ae69a;
  background: linear-gradient(180deg, #4cc84c, #1c8a2a);
}

.icon {
  width: 40px;
  height: 40px;
  border: 7px dotted #fff;
  border-radius: 50%;
  box-sizing: border-box;
}

.off {
  font-size: 46px;
  font-style: normal;
}

/* The handheld's status bar along the foot of the touch screen. */
.status {
  position: absolute;
  inset: auto 0 0;
  height: 36px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  background: #0e0e10;
  border-top: 3px solid #4a4a4e;
  color: #e8e8ec;
  font-size: 28px;
  font-weight: 700;
}

.battery {
  width: 40px;
  height: 20px;
  border: 3px solid #e8e8ec;
  border-radius: 3px;
  box-sizing: border-box;
  background: linear-gradient(90deg, #4cd84c 0 80%, transparent 80%);
}

.clock-icon {
  width: 22px;
  height: 22px;
  border: 3px solid #e8e8ec;
  border-radius: 50%;
  box-sizing: border-box;
}
</style>
