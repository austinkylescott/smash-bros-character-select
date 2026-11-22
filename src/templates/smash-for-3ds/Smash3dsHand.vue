<script setup lang="ts">
/**
 * Smash for 3DS's hand: a white glove pointing up, its owner's tag on a badge across its back,
 * carrying whichever token it holds. On touch there is no glove: a held token follows the finger.
 */
import type { HandInput, Point } from "../../selection/useHand";
import Smash3dsToken from "./Smash3dsToken.vue";

defineProps<{
  position: Point;
  input: HandInput;
  /** The hand's owner, whose tag is on the glove. */
  owner: { colour: string; tag: string } | undefined;
  held: { colour: string; tag: string } | undefined;
}>();
</script>

<template>
  <div class="hand" :style="{ transform: `translate(${position.x}px, ${position.y}px)` }">
    <Smash3dsToken v-if="held" class="held" :colour="held.colour" :tag="held.tag" :size="84" />
    <template v-if="input !== 'touch'">
      <svg class="glove" viewBox="0 0 80 100" aria-hidden="true">
        <g fill="#fbfbfd" stroke="#6c707a" stroke-width="3" stroke-linejoin="round">
          <!-- The raised forefinger, whose tip is the hot spot, then the curled fingers. -->
          <path
            d="M14 4c5-4 12-2 13 5l3 30c3-3 8-3 11 0 3-3 9-3 12 1 4-2 10 0 11 5l4 22c3 14-4 26-18 29H34C22 96 14 88 12 76L4 54c-2-5 1-10 6-10 4 0 7 3 8 6l1 4L8 12C7 8 10 6 14 4z"
          />
          <path d="M30 39l2 14M42 40l1 13M54 42l1 12" fill="none" />
        </g>
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
  left: -20px;
  top: -5px;
  width: 96px;
  filter: drop-shadow(0 4px 4px rgb(0 0 0 / 40%));
}

/* The badge across the glove's back, in the owner's colour. */
.tag {
  position: absolute;
  left: 18px;
  top: 78px;
  padding: 2px 8px 4px;
  border: 3px solid #fff;
  border-radius: 10px;
  background: var(--colour);
  box-shadow: 0 2px 3px rgb(0 0 0 / 40%);
  color: #fff;
  font-size: 30px;
  font-style: italic;
  font-weight: 900;
  line-height: 1;
}

.held {
  position: absolute;
  left: -42px;
  top: -42px;
}
</style>
