<script setup lang="ts">
/**
 * Smash 64's hand: a plain white glove pointing up and to the left, carrying whichever token it
 * holds. On touch there is no glove: a held token simply follows the finger.
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
    <template v-if="input !== 'touch'">
      <svg class="glove" viewBox="0 0 80 100" aria-hidden="true">
        <g fill="#f4f4f6" stroke="#5c5c64" stroke-width="3" stroke-linejoin="round">
          <!-- The raised forefinger, whose tip is the hot spot, then the curled fingers. -->
          <path
            d="M14 4c5-4 12-2 13 5l3 30c3-3 8-3 11 0 3-3 9-3 12 1 4-2 10 0 11 5l4 22c3 14-4 26-18 29H34C22 96 14 88 12 76L4 54c-2-5 1-10 6-10 4 0 7 3 8 6l1 4L8 12C7 8 10 6 14 4z"
          />
          <path d="M30 39l2 14M42 40l1 13M54 42l1 12" fill="none" />
        </g>
      </svg>
    </template>
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

/* The fingertip is the hot spot; the glove hangs below it, tilted as the game tilts it. */
.glove {
  position: absolute;
  left: -16px;
  top: -4px;
  width: 80px;
  transform: rotate(-18deg);
  transform-origin: 16px 4px;
  filter: drop-shadow(0 3px 2px rgb(0 0 0 / 60%));
}

.held {
  position: absolute;
  left: -36px;
  top: -36px;
}
</style>
