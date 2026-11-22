<script setup lang="ts">
/**
 * One of Smash for 3DS's four player cards on the touch screen. The label atop it is the game's
 * card control: pressing it switches the card from P1 to CPU to "---" and round again. A playing
 * card shows the picked fighter under a strip in the player's colour, their name in the bar at
 * its foot; a CPU's strip is its level, which is drawn but does nothing. A switched-off card is
 * dark, with only the game's amiibo prompt on it.
 */
import { computed, nextTick, ref, watch } from "vue";

import type { Box } from "../../selection/navigate";
import { type Panel, RANDOM } from "../../selection/selection";
import FighterPortrait from "../FighterPortrait.vue";
import type { ScreenFighter } from "../screen";
import { cardLabel, playerColour } from "./players";

const props = defineProps<{
  box: Box;
  index: number;
  panel: Panel;
  /** The picked fighter, when the card's token is on one. */
  fighter: ScreenFighter | undefined;
}>();
defineEmits<{ cycle: [] }>();

const colour = computed(() => playerColour(props.index, props.panel.kind));
const random = computed(() => props.panel.pick === RANDOM);
const name = computed(() => (random.value ? "Random" : props.fighter?.name));
const labelAriaLabel = computed(
  () =>
    `Player ${props.index + 1}: ${{ human: "human", cpu: "CPU", off: "not playing" }[props.panel.kind]}. Switch.`,
);

// A name too wide for the bar is squeezed sideways.
const nameEl = ref<HTMLElement | null>(null);
watch(
  name,
  async () => {
    await nextTick();
    const el = nameEl.value;
    if (!el) return;
    el.style.transform = "";
    const room = el.parentElement!.clientWidth - 12;
    if (el.scrollWidth > room) el.style.transform = `scaleX(${room / el.scrollWidth})`;
  },
  { immediate: true, flush: "post" },
);
</script>

<template>
  <section
    class="card"
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
    <button type="button" class="label" :aria-label="labelAriaLabel" @click="$emit('cycle')">
      {{ cardLabel(index, panel.kind) }}
    </button>

    <template v-if="panel.kind === 'off'">
      <span class="amiibo" aria-hidden="true">
        <span class="zr">ZR</span>
        <span class="word">amiibo</span>
      </span>
    </template>
    <template v-else>
      <span v-if="panel.kind === 'cpu'" class="strip level" aria-hidden="true">
        <span>Lv.</span><span class="level-value">3</span>
      </span>
      <span v-else class="strip" aria-hidden="true">PLAYER {{ index + 1 }}</span>

      <span class="body">
        <FighterPortrait v-if="fighter" class="portrait" :fighter="fighter" place="panel" />
        <span v-else-if="random" class="question" aria-hidden="true">?</span>
      </span>
      <span class="name-bar" aria-hidden="true">
        <span v-if="name" ref="nameEl" class="name">{{ name }}</span>
      </span>
      <p class="visually-hidden" aria-live="polite">{{ name ?? "No fighter picked" }}</p>
    </template>
  </section>
</template>

<style scoped>
.card {
  position: absolute;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px;
  border-radius: 12px;
  background: linear-gradient(180deg, #5a5a60, #3a3a3e);
  box-shadow: inset 0 0 0 3px #1a1a1c;
}

/* The label atop the card: white, rounded, the tag slanting in the player's colour. */
.label {
  flex: none;
  height: 72px;
  border: 4px solid #9a9aa0;
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff, #d8d8dc);
  color: var(--colour);
  font: inherit;
  font-size: 50px;
  font-style: italic;
  font-weight: 900;
  line-height: 1;
}

.cpu .label {
  color: #6a6c72;
}

.off .label {
  border-color: #5a5a60;
  background: linear-gradient(180deg, #7a7a80, #58585e);
  color: #3a3a3e;
}

.label:focus-visible {
  outline: 4px solid #fff;
  outline-offset: 2px;
}

/* Under the label: the player's strip, or a CPU's level. */
.strip {
  flex: none;
  height: 60px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  background: color-mix(in srgb, var(--colour) 70%, #000);
  color: #fff;
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}

.strip.level {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 8px;
  border: 4px solid #3ab8a8;
  background: #f4f4f6;
  color: #2a2a2e;
  font-style: italic;
}

.level-value {
  color: #1a8a7c;
  font-size: 46px;
  font-weight: 900;
}

/* Where the fighter stands: pale, warming to the player's colour at the foot. */
.body {
  position: relative;
  flex: 1;
  overflow: hidden;
  border-radius: 6px;
  background: linear-gradient(
    180deg,
    #ffffff 0%,
    color-mix(in srgb, var(--colour) 22%, #fff) 60%,
    color-mix(in srgb, var(--colour) 55%, #fff) 100%
  );
}

.cpu .body {
  background: linear-gradient(180deg, #ffffff, #c8c8cc);
}

/* Stand-in portraits from other games may print a name along their foot; it is cropped away. */
.portrait {
  position: absolute;
  left: 50%;
  top: 0;
  width: 120%;
  height: 130%;
  object-fit: cover;
  object-position: 50% 0;
  transform: translateX(-50%);
}

/* A fighter added by image fills the body with its panel crop. */
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
  color: #4a4a50;
  font-size: 200px;
  font-weight: 900;
  line-height: 1;
}

/* The fighter's name, white capitals in the dark bar at the card's foot. */
.name-bar {
  position: relative;
  flex: none;
  height: 60px;
  overflow: hidden;
  border-radius: 6px;
  background: linear-gradient(180deg, #3a3a3e, #141416);
}

.name {
  position: absolute;
  left: 50%;
  top: 50%;
  translate: -50% -50%;
  color: #fff;
  font-size: 38px;
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
  transform-origin: 50% 50%;
}

/* A switched-off card: dark, with the game's prompt to tap an amiibo. */
.off {
  background: linear-gradient(180deg, #2e2e32, #222226);
}

.amiibo {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #a8a8ae;
}

.zr {
  padding: 4px 10px;
  border: 3px solid #a8a8ae;
  border-radius: 8px;
  font-size: 28px;
  font-weight: 800;
}

.word {
  font-size: 34px;
  font-weight: 700;
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
