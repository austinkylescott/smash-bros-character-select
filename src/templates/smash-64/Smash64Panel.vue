<script setup lang="ts">
/**
 * One of Smash 64's four player panels. The pill on its top right is the game's panel control:
 * pressing it switches the panel from HMN to CP to N/A and round again. A playing panel is striped
 * in its port's colour with its tag large and faded across the top, the picked fighter standing
 * over a faint emblem and their name along the foot. A port nobody uses is dark grey with the
 * Smash emblem. The CPU level is drawn but does nothing.
 */
import { computed, nextTick, ref, watch } from "vue";

import type { Box } from "../../selection/navigate";
import { type Panel, RANDOM } from "../../selection/selection";
import FighterPortrait from "../FighterPortrait.vue";
import type { ScreenFighter } from "../screen";
import { kindLabel, playerColour, playerTag } from "./players";

const props = defineProps<{
  box: Box;
  index: number;
  panel: Panel;
  /** The picked fighter, when the panel's token is on one. */
  fighter: ScreenFighter | undefined;
}>();
defineEmits<{ cycle: [] }>();

const colour = computed(() => playerColour(props.index, props.panel.kind));
const random = computed(() => props.panel.pick === RANDOM);
const name = computed(() => (random.value ? "Random" : props.fighter?.name));
const controlLabel = computed(
  () =>
    `Player ${props.index + 1}: ${{ human: "human", cpu: "CPU", off: "not playing" }[props.panel.kind]}. Switch.`,
);

// A name too wide for the panel is squeezed sideways, from its left edge.
const nameEl = ref<HTMLElement | null>(null);
watch(
  name,
  async () => {
    await nextTick();
    const el = nameEl.value;
    if (!el) return;
    el.style.transform = "";
    const room = el.parentElement!.clientWidth;
    if (el.scrollWidth > room) el.style.transform = `scaleX(${room / el.scrollWidth})`;
  },
  { immediate: true, flush: "post" },
);
</script>

<template>
  <section
    class="panel"
    :class="panel.kind"
    :aria-label="`Player ${index + 1}`"
    :style="{
      left: `${box.x}px`,
      top: `${box.y}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
      '--colour': colour,
    }"
  >
    <template v-if="panel.kind === 'off'">
      <span class="wave" aria-hidden="true" />
      <span class="smash-emblem" aria-hidden="true" />
    </template>
    <template v-else>
      <span class="mark" aria-hidden="true">{{ playerTag(index, panel.kind) }}</span>
      <span class="emblem" aria-hidden="true" />
      <span class="portrait-window">
        <FighterPortrait v-if="fighter" class="portrait" :fighter="fighter" place="panel" />
        <span v-else-if="random" class="question" aria-hidden="true">?</span>
      </span>
      <span v-if="panel.kind === 'cpu'" class="level" aria-hidden="true">
        <span class="level-arrow left" />
        <span class="level-label">CP<br />LEVEL</span>
        <span class="level-value">:3</span>
        <span class="level-arrow right" />
      </span>
      <span v-else class="name-row" aria-hidden="true">
        <span v-if="name" ref="nameEl" class="name">{{ name }}</span>
      </span>
      <p class="visually-hidden" aria-live="polite">{{ name ?? "No fighter picked" }}</p>
    </template>

    <button type="button" class="control" :aria-label="controlLabel" @click="$emit('cycle')">
      {{ kindLabel(panel.kind) }}
    </button>
  </section>
</template>

<style scoped>
/* Striped in the port's colour, darker every few lines, with rounded corners. */
.panel {
  position: absolute;
  box-sizing: border-box;
  overflow: hidden;
  border: 4px solid color-mix(in srgb, var(--colour) 45%, #000);
  border-radius: 14px;
  background:
    repeating-linear-gradient(
      180deg,
      color-mix(in srgb, var(--colour) 82%, #000) 0 4px,
      color-mix(in srgb, var(--colour) 90%, #000) 4px 12px,
      var(--colour) 12px 24px
    ),
    var(--colour);
  box-shadow: 0 4px 8px rgb(0 0 0 / 60%);
}

.off {
  border-color: #141414;
  background: repeating-linear-gradient(180deg, #2a2a2a 0 6px, #3a3a3a 6px 24px);
}

/* The game's N/A panel: a wavy rule down the middle, over the Smash emblem in shadow. */
.wave {
  position: absolute;
  left: 34%;
  top: 0;
  width: 26%;
  height: 100%;
  background: radial-gradient(
      circle at 0 50%,
      transparent 54%,
      rgb(0 0 0 / 30%) 56% 60%,
      transparent 62%
    )
    0 0 / 100% 90px repeat-y;
}

.smash-emblem {
  position: absolute;
  left: 50%;
  top: 56%;
  width: 66%;
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    linear-gradient(90deg, transparent 0 36%, #3a3a3a 36% 42%, transparent 42%),
    linear-gradient(180deg, transparent 0 58%, #3a3a3a 58% 64%, transparent 64%), #262626;
  transform: translate(-50%, -50%);
}

/* The tag large and faded across the panel's top: "1P", or "CP" for the computer. */
.mark {
  position: absolute;
  left: 14px;
  top: 8px;
  color: transparent;
  font-size: 128px;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1;
  -webkit-text-stroke: 4px rgb(0 0 0 / 30%);
  text-shadow: 0 0 0 rgb(0 0 0 / 22%);
}

/* The faint emblem behind the fighter. */
.emblem {
  position: absolute;
  left: 30%;
  top: 30%;
  width: 62%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: rgb(0 0 0 / 16%);
}

.portrait-window {
  position: absolute;
  inset: 22% 0 18%;
  overflow: hidden;
}

/* Fallback portraits from other games may print a name along their foot; it is cropped away. */
.portrait {
  position: absolute;
  left: 50%;
  top: 0;
  width: 100%;
  height: 130%;
  object-fit: cover;
  object-position: 50% 0;
  transform: translateX(-50%);
}

/* A fighter added by image fills the window with its panel crop. */
.portrait.cropped {
  inset: 0;
  height: 100%;
  transform: none;
}

.question {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #c84040;
  font-size: 200px;
  font-weight: 900;
  line-height: 1;
  -webkit-text-stroke: 6px #2a0808;
  paint-order: stroke fill;
}

/* The fighter's name along the foot: white capitals, outlined black. */
.name-row {
  position: absolute;
  inset: auto 14px 12px;
  height: 60px;
}

.name {
  position: absolute;
  left: 0;
  bottom: 0;
  color: #fff;
  font-size: 54px;
  font-weight: 900;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
  transform-origin: 0 50%;
  -webkit-text-stroke: 8px #141414;
  paint-order: stroke fill;
}

/* The CPU's level, between gold arrows. */
.level {
  position: absolute;
  inset: auto 8px 14px;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #f0f0f4;
  -webkit-text-stroke: 4px #4a4a56;
  paint-order: stroke fill;
}

.level-arrow {
  width: 26px;
  height: 52px;
  background: linear-gradient(180deg, #ffe27a, #c48e08);
}

.level-arrow.left {
  clip-path: polygon(0 50%, 100% 0, 100% 100%);
}

.level-arrow.right {
  clip-path: polygon(100% 50%, 0 0, 0 100%);
}

.level-label {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.1em;
  line-height: 1;
  text-align: center;
}

.level-value {
  font-size: 60px;
  font-weight: 900;
  line-height: 1;
}

/* The game's panel control: a small dark pill on the top right, gold for a human. */
.control {
  position: absolute;
  right: 14px;
  top: 14px;
  min-width: 92px;
  height: 40px;
  padding: 0 10px;
  border: 3px solid #f0f0f0;
  border-radius: 20px;
  background: linear-gradient(180deg, #4a4a4a, #141414);
  color: #f4f4f4;
  font: inherit;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1;
}

.human .control {
  border-color: #6a4800;
  background: linear-gradient(180deg, #fff090, #e0a810);
  color: #2a1c00;
}

.cpu .control {
  border-color: #3a3a44;
  background: linear-gradient(180deg, #e4e4ea, #9a9aa4);
  color: #2a2a32;
}

.control:focus-visible {
  outline: 4px solid #fff;
  outline-offset: 2px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  overflow: hidden;
  clip-path: inset(50%);
}
</style>
