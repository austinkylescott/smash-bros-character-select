<script setup lang="ts">
/**
 * The hand, drawn where the pointer is, carrying whichever token it holds. On touch there is no
 * glove: a held token simply follows the finger.
 */
import type { HandInput, Point } from "../../selection/useHand";
import UltimateGlove from "./UltimateGlove.vue";
import UltimateToken from "./UltimateToken.vue";

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
    <UltimateToken v-if="held" class="held" :colour="held.colour" :tag="held.tag" :size="64" />
    <UltimateGlove
      v-if="input !== 'touch'"
      class="glove"
      :colour="owner?.colour ?? '#555'"
      :tag="owner?.tag"
    />
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
  left: -44px;
  top: -10px;
  width: 92px;
  transform: rotate(-24deg);
  transform-origin: 44px 10px;
}

.held {
  position: absolute;
  left: -32px;
  top: -32px;
}
</style>
