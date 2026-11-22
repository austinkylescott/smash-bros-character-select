<script setup lang="ts">
/**
 * Brawl's hand: a white glove pointing up, its owner's tag slanting below it, carrying whichever
 * token it holds. On touch there is no glove: a held token simply follows the finger.
 */
import type { HandInput, Point } from "../../selection/useHand";
import BrawlToken from "./BrawlToken.vue";

defineProps<{
  position: Point;
  input: HandInput;
  /** The hand's owner, whose tag hangs under the glove. */
  owner: { colour: string; tag: string } | undefined;
  held: { colour: string; tag: string } | undefined;
}>();
</script>

<template>
  <div class="hand" :style="{ transform: `translate(${position.x}px, ${position.y}px)` }">
    <BrawlToken v-if="held" class="held" :colour="held.colour" :tag="held.tag" :size="64" />
    <template v-if="input !== 'touch'">
      <svg class="glove" viewBox="0 0 80 100" aria-hidden="true">
        <g fill="#fbfbfd" stroke="#8a8e98" stroke-width="3" stroke-linejoin="round">
          <!-- The raised forefinger, whose tip is the hot spot, then the curled fingers. -->
          <path
            d="M14 4c5-4 12-2 13 5l3 30c3-3 8-3 11 0 3-3 9-3 12 1 4-2 10 0 11 5l4 22c3 14-4 26-18 29H34C22 96 14 88 12 76L4 54c-2-5 1-10 6-10 4 0 7 3 8 6l1 4L8 12C7 8 10 6 14 4z"
          />
          <path d="M30 39l2 14M42 40l1 13M54 42l1 12" fill="none" />
        </g>
        <path d="M30 92h34l2 8H28z" fill="#f2c3c8" stroke="#8a8e98" stroke-width="3" />
      </svg>
      <span v-if="owner" class="tag" :style="{ '--colour': owner.colour }">{{ owner.tag }}</span>
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
  left: -16px;
  top: -4px;
  width: 76px;
  filter: drop-shadow(0 3px 3px rgb(0 0 0 / 35%));
}

.tag {
  position: absolute;
  left: 40px;
  top: 78px;
  color: var(--colour);
  font-size: 42px;
  font-style: italic;
  font-weight: 900;
  line-height: 1;
  transform: rotate(-14deg);
  -webkit-text-stroke: 4px #fff;
  paint-order: stroke fill;
  text-shadow: 0 2px 2px rgb(0 0 0 / 45%);
}

.held {
  position: absolute;
  left: -32px;
  top: -32px;
}
</style>
