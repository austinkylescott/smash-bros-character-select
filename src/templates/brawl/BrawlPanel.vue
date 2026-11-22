<script setup lang="ts">
/**
 * One of Brawl's four player panels. Its name plate is Brawl's panel control: pressing it switches
 * the panel from PLAYER to CPU to NONE and round again. A playing panel shows the picked fighter
 * on a card in its port's colour, their name large across it; an empty one is only Brawl's faint
 * "no entry" mark above a NONE plate. The CPU level is drawn but does nothing.
 */
import { computed, nextTick, ref, watch } from "vue";

import type { Box } from "../../selection/navigate";
import { type Panel, RANDOM } from "../../selection/selection";
import FighterPortrait from "../FighterPortrait.vue";
import type { ScreenFighter } from "../screen";
import { plateLabel, playerColour } from "./players";

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
const plateAriaLabel = computed(
  () =>
    `Player ${props.index + 1}: ${{ human: "human", cpu: "CPU", off: "not playing" }[props.panel.kind]}. Switch.`,
);

// A name too wide for the card is squeezed sideways.
const nameEl = ref<HTMLElement | null>(null);
watch(
  name,
  async () => {
    await nextTick();
    const el = nameEl.value;
    if (!el) return;
    el.style.transform = "";
    const room = el.parentElement!.clientWidth - 8;
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
    <span v-if="panel.kind === 'off'" class="no-entry" aria-hidden="true" />
    <div v-else class="card">
      <span class="emblem" aria-hidden="true" />
      <span class="portrait-window">
        <FighterPortrait v-if="fighter" class="portrait" :fighter="fighter" place="panel" />
        <span v-else-if="random" class="question" aria-hidden="true">?</span>
      </span>
      <span class="name-row" aria-hidden="true">
        <span v-if="name" ref="nameEl" class="name">{{ name }}</span>
      </span>
      <p class="visually-hidden" aria-live="polite">{{ name ?? "No fighter picked" }}</p>
    </div>

    <span v-if="panel.kind === 'cpu'" class="level" aria-hidden="true">
      <span class="level-label">CPU Lv.</span>
      <span class="level-value">3</span>
    </span>

    <button type="button" class="plate" :aria-label="plateAriaLabel" @click="$emit('cycle')">
      <svg v-if="panel.kind === 'human'" class="pad" viewBox="0 0 60 40" aria-hidden="true">
        <path
          d="M14 4h32c8 0 12 6 13 14l1 10c1 8-8 12-13 6l-5-6H18l-5 6c-5 6-14 2-13-6l1-10C2 10 6 4 14 4z"
          fill="#4a5ccc"
          stroke="#1c2260"
          stroke-width="3"
        />
        <path d="M14 12v12M8 18h12" stroke="#dfe4ff" stroke-width="4" />
        <circle cx="42" cy="14" r="3.5" fill="#dfe4ff" />
        <circle cx="48" cy="21" r="3.5" fill="#dfe4ff" />
      </svg>
      <span class="plate-text">{{ plateLabel(index, panel.kind) }}</span>
    </button>
  </section>
</template>

<style scoped>
.panel {
  position: absolute;
}

/* Brawl's faint "no entry" mark where an empty panel's fighter would stand. */
.no-entry {
  position: absolute;
  left: 50%;
  top: 46%;
  width: 96px;
  aspect-ratio: 1;
  border: 14px solid rgb(120 120 128 / 28%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.no-entry::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 120%;
  height: 14px;
  background: rgb(120 120 128 / 28%);
  transform: translate(-50%, -50%) rotate(-45deg);
}

/* The card a playing panel's fighter stands on, rounded at the top, in the port's colour. */
.card {
  position: absolute;
  inset: 0 6px 70px;
  overflow: hidden;
  border-radius: 28px 28px 6px 6px;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 18%), transparent 40%),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--colour) 70%, #fff) 0%,
      var(--colour) 45%,
      color-mix(in srgb, var(--colour) 55%, #000) 100%
    );
  box-shadow: 0 4px 8px rgb(0 0 0 / 30%);
}

/* Each port's emblem, faint behind the fighter. */
.emblem {
  position: absolute;
  left: 50%;
  top: 8%;
  width: 82%;
  aspect-ratio: 1;
  border: 22px solid rgb(0 0 0 / 14%);
  border-radius: 50%;
  transform: translateX(-50%);
}

.portrait-window {
  position: absolute;
  inset: 0 0 24%;
  overflow: hidden;
}

/* Fallback portraits from other games may print a name along their foot; it is cropped away. */
.portrait {
  position: absolute;
  left: 50%;
  top: 0;
  width: 104%;
  height: 150%;
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
  color: rgb(255 255 255 / 80%);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 170px;
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 4px 0 rgb(0 0 0 / 40%);
}

/* Brawl sets fighters' names in a heavy serif, white, outlined dark. */
.name-row {
  position: absolute;
  inset: auto 0 2px;
  height: 72px;
  overflow: hidden;
}

/* Centred on the row, so a name squeezed to fit stays centred. */
.name {
  position: absolute;
  left: 50%;
  bottom: 0;
  translate: -50% 0;
  color: #fff;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 66px;
  font-weight: 900;
  line-height: 1.05;
  white-space: nowrap;
  transform-origin: 50% 50%;
  -webkit-text-stroke: 7px #1c1c20;
  paint-order: stroke fill;
}

.level {
  position: absolute;
  right: -4px;
  bottom: 4px;
  display: grid;
  justify-items: center;
  width: 64px;
  color: #222;
}

.level-label {
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
}

.level-value {
  color: #3c4a8c;
  font-size: 44px;
  font-weight: 900;
  line-height: 1;
  -webkit-text-stroke: 3px #fff;
  paint-order: stroke fill;
}

/* The name plate: a rounded bar in Brawl's dark grey, lit in the port's colour for a person. */
.plate {
  position: absolute;
  left: 34px;
  bottom: 14px;
  width: 204px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 10px 0 22px;
  border: 4px solid #3c3c42;
  border-radius: 10px;
  background:
    linear-gradient(90deg, #b8b8be 0 14px, transparent 14px),
    linear-gradient(180deg, #74747c, #4c4c54);
  box-shadow: 0 6px 0 #2a2a2e;
  color: #e6e6ea;
  font: inherit;
}

.human .plate {
  background:
    linear-gradient(90deg, rgb(255 255 255 / 55%) 0 14px, transparent 14px),
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--colour) 80%, #fff),
      color-mix(in srgb, var(--colour) 75%, #000)
    );
  color: #fff;
}

.cpu .plate {
  width: 176px;
}

.pad {
  position: absolute;
  left: -48px;
  width: 62px;
}

.plate-text {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1;
  white-space: nowrap;
  text-shadow: 0 2px 0 rgb(0 0 0 / 45%);
}

.human .plate-text {
  font-size: 32px;
}

.plate:focus-visible {
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
