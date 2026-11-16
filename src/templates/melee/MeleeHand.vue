<script setup lang="ts">
/**
 * Melee's hand: a white glove pointing up and to the left, its owner's tag beneath it, carrying
 * whichever coin it holds. On touch there is no glove: a held coin simply follows the finger.
 */
import type { HandInput, Point } from "../../selection/useHand";
import MeleeToken from "./MeleeToken.vue";

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
    <MeleeToken v-if="held" class="held" :colour="held.colour" :tag="held.tag" :size="60" />
    <template v-if="input !== 'touch'">
      <svg class="glove" viewBox="0 0 90 110" aria-hidden="true">
        <g fill="#f7f7fa" stroke="#6c7280" stroke-width="3" stroke-linejoin="round">
          <!-- The pointing finger runs from the knuckles up to the fingertip, the hot spot. -->
          <path
            d="M4 4c6-4 12-2 16 4l22 28c4-2 9-2 13 1 4-1 9 0 12 4 5-1 10 2 12 7l6 20c4 14-2 28-16 34l-8 4c-12 4-24 0-30-10L14 68c-3-5-1-10 4-12 4-2 8-1 11 2l4 5L6 18C1 12 0 7 4 4z"
          />
          <path d="M42 36l8 16M55 37l6 15M67 41l4 13" fill="none" />
        </g>
        <path d="M50 98l24-12 8 12-22 10z" fill="#d4d8e0" stroke="#6c7280" stroke-width="3" />
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

/* The fingertip is the hot spot; the glove hangs below and to the right of it. */
.glove {
  position: absolute;
  left: -4px;
  top: -4px;
  width: 80px;
}

.tag {
  position: absolute;
  left: 4px;
  top: 92px;
  color: var(--colour);
  font-size: 44px;
  font-style: italic;
  font-weight: 900;
  line-height: 1;
  -webkit-text-stroke: 3px #fff;
  paint-order: stroke fill;
  text-shadow: 0 2px 2px rgb(0 0 0 / 50%);
}

.held {
  position: absolute;
  left: -30px;
  top: -30px;
}
</style>
