<script setup lang="ts">
/**
 * One of Smash for Wii U's player panels. Its name plate is the panel's control: pressing it
 * switches the panel from Player to CPU to None and round again. A playing panel is a card in its
 * player's colour, or grey for a CPU, with the picked fighter on it and their name large across
 * its foot; an empty one is only the dark frame round a None plate, under the game's prompt to
 * press a button. The CPU level is drawn but does nothing.
 *
 * Panels are as wide as Smash's four or as narrow as 8-Player Smash's eight, so everything in one
 * is sized by the panel itself.
 */
import { computed, nextTick, ref, watch } from "vue";

import type { Box } from "../../selection/navigate";
import { type Panel, RANDOM } from "../../selection/selection";
import FighterPortrait from "../FighterPortrait.vue";
import type { ScreenFighter } from "../screen";
import { plateLabel, playerColour, playerTag } from "./players";

const props = defineProps<{
  box: Box;
  index: number;
  panel: Panel;
  /** The picked fighter, when the panel's token is on one. */
  fighter: ScreenFighter | undefined;
}>();
defineEmits<{ cycle: [] }>();

const colour = computed(() => playerColour(props.index, props.panel.kind));
const tag = computed(() => playerTag(props.index, props.panel.kind));
const random = computed(() => props.panel.pick === RANDOM);
const name = computed(() => (random.value ? "Random" : props.fighter?.name));
const plateAriaLabel = computed(
  () =>
    `Player ${props.index + 1}: ${{ human: "human", cpu: "CPU", off: "not playing" }[props.panel.kind]}. Switch.`,
);

// A name too wide for the card is squeezed sideways, as the game squeezes it.
const nameEl = ref<HTMLElement | null>(null);
async function squeezeName() {
  await nextTick();
  const el = nameEl.value;
  if (!el) return;
  el.style.transform = "";
  const room = el.parentElement!.clientWidth;
  if (el.scrollWidth > room) el.style.transform = `scaleX(${room / el.scrollWidth})`;
}
watch([name, () => props.box.width], squeezeName, { immediate: true, flush: "post" });
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
      <span class="prompt" aria-hidden="true">
        <svg class="pad" viewBox="0 0 64 40">
          <path
            d="M14 4h36c7 0 11 5 12 12l1 10c1 8-7 12-12 7l-6-6H19l-6 6c-5 5-13 1-12-7l1-10C3 9 7 4 14 4z"
            fill="#f4f4f6"
            stroke="#9a9aa2"
            stroke-width="3"
          />
          <path d="M16 13v11M10.5 18.5h11" stroke="#9a9aa2" stroke-width="4" />
          <circle cx="45" cy="15" r="3.5" fill="#9a9aa2" />
          <circle cx="51" cy="22" r="3.5" fill="#9a9aa2" />
        </svg>
        <span class="press">Press<br />any button</span>
      </span>
      <span class="frame" aria-hidden="true" />
    </template>
    <div v-else class="card">
      <span class="emblem" aria-hidden="true" />
      <span class="corner" aria-hidden="true">{{ tag }}</span>
      <span class="portrait-window">
        <FighterPortrait v-if="fighter" class="portrait" :fighter="fighter" place="panel" />
        <span v-else-if="random" class="question" aria-hidden="true">?</span>
      </span>
      <span class="name-row" aria-hidden="true">
        <span v-if="name" ref="nameEl" class="name">{{ name }}</span>
      </span>
      <p class="visually-hidden" aria-live="polite">{{ name ?? "No fighter picked" }}</p>
    </div>

    <button type="button" class="plate" :aria-label="plateAriaLabel" @click="$emit('cycle')">
      <span class="pill">
        <svg v-if="panel.kind === 'human'" class="plate-pad" viewBox="0 0 64 40" aria-hidden="true">
          <rect x="2" y="6" width="60" height="28" rx="8" fill="#3a3a3e" />
          <rect x="18" y="11" width="28" height="18" rx="2" fill="#9ab4d8" />
        </svg>
        <span v-else-if="panel.kind === 'off'" class="dot" aria-hidden="true" />
        <span class="plate-text">{{ plateLabel(index, panel.kind) }}</span>
      </span>
      <span v-if="panel.kind === 'cpu'" class="level" aria-hidden="true">
        <span class="level-value">3</span>
        <span class="level-label">CPU Lv.</span>
      </span>
    </button>
  </section>
</template>

<style scoped>
.panel {
  position: absolute;
  container-type: size;
}

/* An empty panel's prompt: a controller and the words under it, in pale grey. */
.prompt {
  position: absolute;
  inset: 8cqh 0 auto;
  display: grid;
  justify-items: center;
  gap: 1cqh;
}

.pad {
  width: min(26cqw, 24cqh);
}

.press {
  color: #8a8a92;
  font-size: min(6.6cqw, 6cqh);
  font-weight: 800;
  line-height: 1;
  text-align: center;
  text-transform: uppercase;
}

/* The dark frame an empty panel's plate sits in, its top right corner cut away. */
.frame {
  position: absolute;
  inset: auto 0 0;
  height: 32cqh;
  background: linear-gradient(180deg, #4a4a4e, #2c2c30);
  clip-path: polygon(0 0, calc(100% - 9cqh) 0, 100% 9cqh, 100% 100%, 0 100%);
}

/* A playing panel's card, in the player's colour or a CPU's grey, its top right corner cut. */
.card {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 14%), transparent 30%),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--colour) 82%, #fff) 0%,
      var(--colour) 50%,
      color-mix(in srgb, var(--colour) 60%, #000) 100%
    );
  clip-path: polygon(0 0, calc(100% - 9cqh) 0, 100% 9cqh, 100% 100%, 0 100%);
}

.cpu .card {
  background: linear-gradient(180deg, #f0f0f0, #c4c4c4 60%, #8e8e8e);
}

/* The faint Smash emblem behind the fighter: a ring, crossed by a bar and split by another. */
.emblem {
  position: absolute;
  left: -14cqh;
  top: 8cqh;
  width: 76cqh;
  aspect-ratio: 1;
  box-sizing: border-box;
  border: 9cqh solid rgb(0 0 0 / 13%);
  border-radius: 50%;
}

.emblem::before,
.emblem::after {
  content: "";
  position: absolute;
  background: rgb(0 0 0 / 13%);
}

.emblem::before {
  left: 50%;
  top: -9cqh;
  bottom: -9cqh;
  width: 10cqh;
  transform: translateX(-50%);
}

.emblem::after {
  left: -9cqh;
  right: -9cqh;
  top: 58%;
  height: 7cqh;
}

/* The player's tag in the corner, slanted, as the game stamps P1 or CPU there. */
.corner {
  position: absolute;
  right: 3cqh;
  top: 1cqh;
  z-index: 1;
  color: color-mix(in srgb, var(--colour) 80%, #fff);
  font-size: min(18cqw, 13cqh);
  font-style: italic;
  font-weight: 900;
  line-height: 1;
  -webkit-text-stroke: 1.2cqh #2a2a2a;
  paint-order: stroke fill;
}

.cpu .corner {
  color: #e8e8e8;
  -webkit-text-stroke-color: #6a6a6a;
}

.portrait-window {
  position: absolute;
  inset: 0 0 20cqh;
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
  color: rgb(255 255 255 / 85%);
  font-size: min(48cqw, 44cqh);
  font-weight: 900;
  line-height: 1;
  -webkit-text-stroke: 1.4cqh rgb(0 0 0 / 35%);
  paint-order: stroke fill;
}

/* The game sets a fighter's name in heavy white serif capitals, outlined dark, across the foot. */
.name-row {
  position: absolute;
  left: 4cqw;
  right: 4cqw;
  bottom: 20cqh;
  height: 17cqh;
}

.name {
  position: absolute;
  left: 0;
  bottom: 0;
  color: #fff;
  font-family: Georgia, "Times New Roman", serif;
  font-size: min(17cqw, 15cqh);
  font-weight: 900;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
  transform-origin: 0 50%;
  -webkit-text-stroke: 1.6cqh #1a1a1a;
  paint-order: stroke fill;
  text-shadow: 0.6cqh 0.8cqh 0 rgb(0 0 0 / 50%);
}

/* The name plate along the foot: a pill in the player's pale colour, white for None. */
.plate {
  position: absolute;
  inset: auto 0 0;
  height: 19cqh;
  display: flex;
  align-items: center;
  padding: 0 3cqw;
  border: 0;
  background: color-mix(in srgb, var(--colour) 75%, #000);
  font: inherit;
}

.off .plate {
  bottom: 13cqh;
  height: 15cqh;
  background: transparent;
}

.cpu .plate {
  background: #3e3e42;
}

.pill {
  flex: 1;
  min-width: 0;
  height: 11cqh;
  display: flex;
  align-items: center;
  gap: 2cqw;
  padding: 0 3cqw;
  border-radius: 6cqh;
  background: color-mix(in srgb, var(--colour) 22%, #fff);
  color: #2a2a2a;
}

.off .pill {
  background: #fff;
  box-shadow: inset 0 -0.6cqh 0 #c8c8cc;
}

.cpu .pill {
  background: linear-gradient(180deg, #f4f4f4, #c8c8c8);
}

.plate-pad {
  flex: none;
  width: min(12cqw, 9cqh);
}

/* None's plate opens with a dark dot, as if a slot waits for a controller. */
.dot {
  flex: none;
  width: 8cqh;
  aspect-ratio: 1;
  margin-left: -2cqw;
  border-radius: 50%;
  background: #2a2a2a;
}

.plate-text {
  flex: 1;
  overflow: hidden;
  font-size: min(10cqw, 8cqh);
  font-weight: 800;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
}

/* The CPU level: a blue numeral in a white ring, beside the plate. */
.level {
  flex: none;
  display: grid;
  justify-items: center;
  width: 15cqh;
  height: 15cqh;
  margin-left: 1cqw;
  border-radius: 50%;
  background: radial-gradient(circle, #1e2a4a 0 62%, #fff 64%);
  color: #6cc4ff;
}

.level-value {
  font-size: 9cqh;
  font-weight: 900;
  line-height: 10cqh;
}

.level-label {
  margin-top: -1.5cqh;
  color: #fff;
  font-size: 2.6cqh;
  font-weight: 800;
  line-height: 1;
}

.plate:hover .pill,
.plate:focus-visible .pill {
  filter: brightness(1.08);
}

.plate:focus-visible {
  outline: 4px solid #fff;
  outline-offset: -4px;
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
