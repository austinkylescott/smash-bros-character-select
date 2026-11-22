<script setup lang="ts">
/**
 * Smash for Wii U's header: Go Back, the red mode tab, the rules bar and the Custom Fighters box.
 * Go Back responds, and so does the mode tab, which switches between Smash's four players and
 * 8-Player Smash's eight. Every stage is 1280 wide, so the header is drawn on fixed coordinates.
 */
defineProps<{ eightPlayer: boolean }>();
defineEmits<{ back: []; mode: [] }>();
</script>

<template>
  <div class="header">
    <svg class="shapes" viewBox="0 0 1280 87" aria-hidden="true">
      <defs>
        <linearGradient id="wii-u-segment" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#e4e4e4" />
          <stop offset="1" stop-color="#bdbdbd" />
        </linearGradient>
        <linearGradient id="wii-u-mode" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f0383c" />
          <stop offset="1" stop-color="#b8121a" />
        </linearGradient>
      </defs>

      <!-- The charcoal bar the segments sit in, cut away on a slant at its left end. -->
      <path d="M176 16h1104v71H150z" fill="#1e1e1e" />
      <!-- The rules bar: Time, then the minutes between their arrows. -->
      <path d="M404 26h420l-30 52H374z" fill="url(#wii-u-segment)" />
      <path d="M834 26h170l-30 52H804z" fill="url(#wii-u-segment)" />
      <path d="M871 40v24l-16-12z" fill="#8a8a8a" />
      <path d="M960 40v24l16-12z" fill="#8a8a8a" />
      <!-- The clock before Time. -->
      <circle cx="520" cy="52" r="15" fill="#2a2a2a" />
      <path d="M520 42v11h8" fill="none" stroke="#e4e4e4" stroke-width="4" />
      <!-- The Custom Fighters box, light grey in a dark frame, its left side slanted. -->
      <path d="M1046 4h230v80H1000z" fill="#1e1e1e" />
      <path d="M1054 10h214v68H1016z" fill="url(#wii-u-segment)" />
    </svg>

    <button type="button" class="back" aria-label="Back" @click="$emit('back')">
      <svg class="back-arrow" viewBox="0 0 64 56" aria-hidden="true">
        <path
          d="M24 4L4 20l20 16V27h18c6 0 9 3 9 8s-3 8-9 8H12v9h30c11 0 18-7 18-17S53 18 42 18H24z"
          fill="#fff"
          stroke="#222"
          stroke-width="4"
          stroke-linejoin="round"
        />
      </svg>
      <span class="b-button" aria-hidden="true">B</span>
      <span class="go-back" aria-hidden="true">Go Back<br />(Hold)</span>
    </button>

    <button
      type="button"
      class="mode"
      :class="{ eight: eightPlayer }"
      :aria-label="
        eightPlayer ? '8-Player Smash. Switch to Smash.' : 'Smash. Switch to 8-Player Smash.'
      "
      @click="$emit('mode')"
    >
      <svg class="smash-ball" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="18" fill="#1c1c1c" />
        <path d="M2 24h36v4H2zM17 2h6v36h-6z" fill="#f0383c" />
        <path d="M8 6a18 18 0 0 1 24 0L20 18z" fill="#1c1c1c" />
      </svg>
      <span class="mode-name">{{ eightPlayer ? "8-Player Smash" : "Smash" }}</span>
    </button>

    <span class="time" aria-hidden="true">Time</span>
    <span class="minutes" aria-hidden="true">2<small>min.</small></span>
    <span class="custom" aria-hidden="true">
      <span class="custom-label">Custom Fighters</span>
      <span class="custom-value">
        <svg viewBox="0 0 24 24">
          <path
            d="M4 3l6 6-2 2-6-6 2-2zm9 2a6 6 0 0 1 7 7l-3-1-2 2 1 3a6 6 0 0 1-7-7L3 20l-1-1 8-8a6 6 0 0 1 3-6z"
            fill="#1e1e1e"
          /></svg
        >Off
      </span>
    </span>
  </div>
</template>

<style scoped>
.header {
  position: absolute;
  inset: 0 0 auto;
  height: 87px;
}

.shapes {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* The curved white arrow, the B button over its tip and "Go Back (Hold)" beside it. */
.back {
  position: absolute;
  left: 18px;
  top: 12px;
  width: 132px;
  height: 66px;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
}

.back-arrow {
  position: absolute;
  left: 4px;
  top: 6px;
  width: 64px;
}

.b-button {
  position: absolute;
  left: 70px;
  top: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #1e1e1e;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  line-height: 20px;
  text-align: center;
}

.go-back {
  position: absolute;
  left: 64px;
  top: 21px;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  text-align: center;
  -webkit-text-stroke: 3px #1e1e1e;
  paint-order: stroke fill;
}

.back:hover .back-arrow path,
.back:focus-visible .back-arrow path {
  fill: #fff6a8;
}

.back:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 2px;
}

/* The red mode tab: the Smash ball and the mode's name, cut away on a slant at its right. */
.mode {
  position: absolute;
  left: 166px;
  top: 22px;
  width: 238px;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 28px 0 12px;
  border: 0;
  background: linear-gradient(180deg, #f0383c, #b8121a);
  clip-path: polygon(0 0, 100% 0, calc(100% - 34px) 100%, 0 100%);
  color: #fff;
  font: inherit;
}

.smash-ball {
  flex: none;
  width: 40px;
}

.mode-name {
  font-size: 38px;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1;
  white-space: nowrap;
  -webkit-text-stroke: 5px #1e1e1e;
  paint-order: stroke fill;
}

/* 8-Player Smash is set smaller and squeezed, to fit the same tab. */
.mode.eight .mode-name {
  font-size: 25px;
  transform: scaleX(0.76);
  transform-origin: 0 50%;
}

.mode:hover,
.mode:focus-visible {
  filter: brightness(1.15);
}

.mode:focus-visible {
  outline: 3px solid #fff;
  outline-offset: -5px;
}

.time {
  position: absolute;
  left: 548px;
  top: 30px;
  color: #1e1e1e;
  font-size: 34px;
  font-weight: 700;
  line-height: 44px;
}

.minutes {
  position: absolute;
  left: 888px;
  top: 28px;
  color: #1e1e1e;
  font-size: 42px;
  font-weight: 800;
  line-height: 48px;
  -webkit-text-stroke: 1.5px #1e1e1e;
}

.minutes small {
  margin-left: 2px;
  font-size: 16px;
  -webkit-text-stroke: 0;
}

.custom {
  position: absolute;
  left: 1040px;
  top: 12px;
  width: 226px;
  display: grid;
  justify-items: center;
  color: #1e1e1e;
  font-weight: 700;
  line-height: 1;
}

.custom-label {
  font-size: 18px;
}

.custom-value {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 4px;
  font-size: 38px;
  font-weight: 800;
}

.custom-value svg {
  width: 34px;
}
</style>
