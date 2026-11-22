<script setup lang="ts">
/**
 * Smash for Wii U's hand: a pointing glove tinted in its owner's colour, their tag slanting beside
 * it, carrying whichever token it holds. On touch there is no glove: a held token simply follows
 * the finger.
 */
import type { HandInput, Point } from "../../selection/useHand";
import WiiUToken from "./WiiUToken.vue";

defineProps<{
  position: Point;
  input: HandInput;
  /** The hand's owner, whose colour tints the glove. */
  owner: { colour: string; tag: string } | undefined;
  held: { colour: string; tag: string } | undefined;
}>();
</script>

<template>
  <div
    class="hand"
    :style="{
      transform: `translate(${position.x}px, ${position.y}px)`,
      '--colour': owner?.colour ?? '#e2232b',
    }"
  >
    <WiiUToken v-if="held" class="held" :colour="held.colour" :tag="held.tag" :size="44" />
    <template v-if="input !== 'touch'">
      <svg class="glove" viewBox="0 0 80 100" aria-hidden="true">
        <!-- The raised forefinger, whose tip is the hot spot, then the curled fingers and cuff. -->
        <path
          class="fill"
          d="M14 4c5-4 12-2 13 5l3 30c3-3 8-3 11 0 3-3 9-3 12 1 4-2 10 0 11 5l4 22c3 14-4 26-18 29H34C22 96 14 88 12 76L4 54c-2-5 1-10 6-10 4 0 7 3 8 6l1 4L8 12C7 8 10 6 14 4z"
          stroke="#5a2a2c"
          stroke-width="3"
          stroke-linejoin="round"
        />
        <path d="M30 39l2 14M42 40l1 13M54 42l1 12" fill="none" stroke="#5a2a2c" stroke-width="3" />
      </svg>
      <span v-if="owner" class="tag">{{ owner.tag }}</span>
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

/* The fingertip is the hot spot; the glove hangs below it. */
.glove {
  position: absolute;
  left: -11px;
  top: -3px;
  width: 52px;
  filter: drop-shadow(0 2px 2px rgb(0 0 0 / 35%));
}

.fill {
  fill: color-mix(in srgb, var(--colour) 45%, #fff);
}

.tag {
  position: absolute;
  left: 26px;
  top: 40px;
  color: var(--colour);
  font-size: 24px;
  font-style: italic;
  font-weight: 900;
  line-height: 1;
  transform: rotate(-12deg);
  -webkit-text-stroke: 3px #fff;
  paint-order: stroke fill;
  text-shadow: 0 1px 2px rgb(0 0 0 / 45%);
}

.held {
  position: absolute;
  left: -22px;
  top: -22px;
}
</style>
