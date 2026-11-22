<script setup lang="ts">
/**
 * Smash 64's hand: a white glove pointing up and to the left, carrying whichever token it holds.
 * The game puts no tag under its hand; the token it holds says whose it is. On touch there is no
 * glove: a held token simply follows the finger.
 */
import type { HandInput, Point } from "../../selection/useHand";
import Smash64Token from "./Smash64Token.vue";

defineProps<{
  position: Point;
  input: HandInput;
  held: { colour: string; tag: string } | undefined;
}>();
</script>

<template>
  <div class="hand" :style="{ transform: `translate(${position.x}px, ${position.y}px)` }">
    <Smash64Token v-if="held" class="held" :colour="held.colour" :tag="held.tag" :size="72" />
    <svg v-if="input !== 'touch'" class="glove" viewBox="0 0 90 110" aria-hidden="true">
      <g fill="#f4f4f6" stroke="#303036" stroke-width="4" stroke-linejoin="round">
        <!-- The pointing finger runs from the knuckles up to the fingertip, the hot spot. -->
        <path
          d="M4 4c6-4 12-2 16 4l22 28c4-2 9-2 13 1 4-1 9 0 12 4 5-1 10 2 12 7l6 20c4 14-2 28-16 34l-8 4c-12 4-24 0-30-10L14 68c-3-5-1-10 4-12 4-2 8-1 11 2l4 5L6 18C1 12 0 7 4 4z"
        />
        <path d="M42 36l8 16M55 37l6 15M67 41l4 13" fill="none" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.hand {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 10;
  pointer-events: none;
}

/* The fingertip is the hot spot; the glove hangs below and to the right of it. */
.glove {
  position: absolute;
  left: -4px;
  top: -4px;
  width: 84px;
  filter: drop-shadow(0 4px 2px rgb(0 0 0 / 50%));
}

.held {
  position: absolute;
  left: 8px;
  top: 40px;
}
</style>
