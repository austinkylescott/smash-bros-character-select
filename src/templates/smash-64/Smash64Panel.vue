<script setup lang="ts">
/**
 * One of Smash 64's four player panels: a card with rounded top corners and the game's fine
 * horizontal stripes. Its tag in the top right is the game's panel control: pressing it switches
 * the panel from HMN to CP to N/A and round again. A playing panel shows its port ("1P", "CP")
 * large and faded in the corner, the picked fighter, and their name in white capitals at the
 * foot. A switched-off panel is dark grey with the Smash emblem. The CPU level is drawn but does
 * nothing.
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
const tabLabel = computed(
  () =>
    `Player ${props.index + 1}: ${{ human: "human", cpu: "CPU", off: "not playing" }[props.panel.kind]}. Switch.`,
);

// A name too wide for the panel is squeezed sideways.
const nameEl = ref<HTMLElement | null>(null);
watch(
  name,
  async () => {
    await nextTick();
    const el = nameEl.value;
    if (!el) return;
    el.style.transform = "";
    const room = el.parentElement!.clientWidth - 24;
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
      <span class="seam" aria-hidden="true" />
      <span class="emblem" aria-hidden="true" />
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
        <span class="level-label">C P<br />LEVEL</span>
        <span class="level-value">: 3</span>
        <span class="level-arrow right" />
      </span>
      <span v-else-if="name" class="name-row" aria-hidden="true">
        <span ref="nameEl" class="name">{{ name }}</span>
      </span>
      <p class="visually-hidden" aria-live="polite">{{ name ?? "No fighter picked" }}</p>
    </template>

    <button type="button" class="tab" :aria-label="tabLabel" @click="$emit('cycle')">
      {{ kindLabel(panel.kind) }}
    </button>
  </section>
</template>

<style scoped>
/* The card: rounded at the top, striped finely across, in the port's colour. */
.panel {
  position: absolute;
  overflow: hidden;
  box-sizing: border-box;
  border: 4px solid color-mix(in srgb, var(--colour) 45%, #000);
  border-radius: 20px 20px 8px 8px;
  background:
    repeating-linear-gradient(180deg, rgb(255 255 255 / 10%) 0 6px, rgb(0 0 0 / 12%) 6px 12px),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--colour) 85%, #fff),
      var(--colour) 30%,
      color-mix(in srgb, var(--colour) 70%, #000)
    );
  box-shadow: 0 6px 8px rgb(0 0 0 / 60%);
}

/* Big faded letters in the top left: the port for a human, "CP" for the computer. */
.mark {
  position: absolute;
  left: 12px;
  top: 4px;
  color: rgb(0 0 0 / 38%);
  font-size: 110px;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1;
}

/* The Smash emblem, faint behind the fighter. */
.emblem {
  position: absolute;
  left: 50%;
  top: 38%;
  width: 66%;
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    linear-gradient(90deg, transparent 0 34%, var(--emblem) 34% 41%, transparent 41%) 0 0 / 100%
      100%,
    linear-gradient(180deg, transparent 0 56%, var(--emblem) 56% 61%, transparent 61%),
    radial-gradient(circle, rgb(0 0 0 / 22%) 0 69%, transparent 70%);
  transform: translate(-50%, -50%);
  --emblem: color-mix(in srgb, var(--colour) 80%, #000);
}

.off .emblem {
  top: 52%;
  width: 72%;
  background:
    linear-gradient(90deg, transparent 0 34%, #3a3a3c 34% 41%, transparent 41%) 0 0 / 100% 100%,
    linear-gradient(180deg, transparent 0 56%, #3a3a3c 56% 61%, transparent 61%),
    radial-gradient(circle, #262628 0 69%, transparent 70%);
}

/* The zigzag seam down a switched-off panel, as if its two halves had slid shut. */
.seam {
  position: absolute;
  inset: 0 auto 0 50%;
  width: 60px;
  translate: -50% 0;
  background: repeating-linear-gradient(
    180deg,
    transparent 0 40px,
    rgb(0 0 0 / 30%) 40px 44px,
    transparent 44px 80px
  );
  border-inline: 4px solid rgb(0 0 0 / 30%);
}

.portrait-window {
  position: absolute;
  inset: 40px 8px 64px;
  overflow: hidden;
}

/* Fallback portraits from other games may print a name along their foot; it is cropped away. */
.portrait {
  position: absolute;
  left: 50%;
  top: 0;
  width: 104%;
  height: 140%;
  object-fit: cover;
  object-position: 50% 0;
  transform: translateX(-50%);
}

/* A fighter added by image fills the window with its panel crop. */
.portrait.cropped {
  inset: 0;
  width: 100%;
  height: 100%;
  transform: none;
}

.question {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: rgb(255 255 255 / 75%);
  font-size: 160px;
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 6px 0 rgb(0 0 0 / 40%);
}

/* The fighter's name: white capitals at the foot, outlined black. */
.name-row {
  position: absolute;
  inset: auto 0 10px;
  height: 56px;
  overflow: hidden;
}

.name {
  position: absolute;
  left: 12px;
  bottom: 0;
  color: #fff;
  font-size: 50px;
  font-weight: 900;
  line-height: 1.1;
  text-transform: uppercase;
  white-space: nowrap;
  transform-origin: 0 50%;
  -webkit-text-stroke: 7px #141414;
  paint-order: stroke fill;
}

/* The CPU's level, between two gold arrows. */
.level {
  position: absolute;
  inset: auto 8px 12px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #e8e8f0;
  font-weight: 900;
}

.level-label {
  font-size: 22px;
  letter-spacing: 0.08em;
  line-height: 1;
  text-align: center;
  -webkit-text-stroke: 3px #3a3a4c;
  paint-order: stroke fill;
}

.level-value {
  font-size: 54px;
  line-height: 1;
  -webkit-text-stroke: 4px #3a3a4c;
  paint-order: stroke fill;
}

.level-arrow {
  width: 22px;
  height: 40px;
  background: linear-gradient(180deg, #fff0a0, #c88a00);
}

.level-arrow.left {
  clip-path: polygon(0 50%, 100% 0, 100% 100%);
}

.level-arrow.right {
  clip-path: polygon(100% 50%, 0 0, 0 100%);
}

/* The panel control: a small pill in the top right, gold for HMN, grey for CP, black for N/A. */
.tab {
  position: absolute;
  right: 12px;
  top: 12px;
  min-width: 84px;
  height: 36px;
  padding: 0 10px;
  border: 3px solid #1a1a1a;
  border-radius: 12px;
  background: #1c1c1e;
  color: #f4f4f4;
  font: inherit;
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
}

.human .tab {
  background: linear-gradient(180deg, #fff0a0, #e0a810);
  color: #3a2400;
}

.cpu .tab {
  background: linear-gradient(180deg, #e4e4ec, #8c8c98);
  color: #26262e;
}

.tab:focus-visible {
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
