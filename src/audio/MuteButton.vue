<script setup lang="ts">
/** Mutes and unmutes all sound. Always on screen, above any template, and remembered. */
import { audio } from ".";

const { muted } = audio;
</script>

<template>
  <button
    type="button"
    class="mute"
    :aria-label="muted ? 'Unmute sound' : 'Mute sound'"
    :aria-pressed="muted"
    @click="muted = !muted"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
      <path
        v-if="muted"
        d="m16 9 5 6m0-6-5 6"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
      <path
        v-else
        d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  </button>
</template>

<style scoped>
.mute {
  position: fixed;
  z-index: 10;
  top: 12px;
  right: 12px;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 2px solid rgb(255 255 255 / 70%);
  border-radius: 50%;
  background: rgb(0 0 0 / 60%);
  color: #fff;
  cursor: pointer;
}

.mute:hover {
  background: rgb(0 0 0 / 80%);
}

.mute:focus-visible {
  outline: 3px solid #ffcf1a;
  outline-offset: 2px;
}

.mute svg {
  width: 24px;
  height: 24px;
}
</style>
