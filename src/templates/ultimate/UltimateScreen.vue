<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";

import type { ScreenRoster } from "../screen";
import { ultimateGrid } from "./grid";
import { slotLabel } from "./label";
import UltimatePanels from "./UltimatePanels.vue";
import UltimateTopBar from "./UltimateTopBar.vue";

/** The Ultimate template: renders any roster as Ultimate's character select screen. */
const props = defineProps<{ roster: ScreenRoster }>();

const grid = computed(() =>
  ultimateGrid(props.roster.fighters.length + (props.roster.randomSlot ? 1 : 0)),
);

const fighterSlots = computed(() =>
  props.roster.fighters.map((fighter, index) => ({
    fighter,
    lines: slotLabel(fighter.name),
    box: grid.value.slots[index]!,
  })),
);

const randomBox = computed(() =>
  props.roster.randomSlot ? grid.value.slots[props.roster.fighters.length]! : undefined,
);

const boxStyle = ({
  x,
  y,
  width,
  height,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}) => ({
  left: `${x}px`,
  top: `${y}px`,
  width: `${width}px`,
  height: `${height}px`,
  "--slot-width": `${width}px`,
});

// Ultimate squeezes a name sideways rather than shrink it when it is too wide for its slot.
const labels = ref<HTMLElement[]>([]);
async function squeezeLabels() {
  await nextTick();
  for (const label of labels.value) {
    for (const line of label.querySelectorAll<HTMLElement>(".line")) {
      line.style.transform = "";
      const room = label.clientWidth;
      const natural = line.scrollWidth;
      if (natural > room) line.style.transform = `scaleX(${room / natural})`;
    }
  }
}
onMounted(() => {
  void squeezeLabels();
  void document.fonts?.ready.then(squeezeLabels);
});
watch(() => props.roster, squeezeLabels);
</script>

<template>
  <div class="ultimate">
    <div class="backdrop" />
    <UltimateTopBar />

    <ol class="grid" aria-label="Fighters">
      <li
        v-for="{ fighter, lines, box } in fighterSlots"
        :key="fighter.id"
        class="slot"
        :style="boxStyle(box)"
      >
        <img class="portrait" :src="fighter.portrait" :alt="fighter.name" draggable="false" />
        <span ref="labels" class="label" aria-hidden="true">
          <span v-for="line in lines" :key="line" class="line ult-outlined" :data-text="line">{{
            line
          }}</span>
        </span>
      </li>
      <li v-if="randomBox" class="slot random" :style="boxStyle(randomBox)" aria-label="Random">
        <span class="random-face">
          <span v-if="randomBox.width > 200" class="question ult-outlined" data-text="?">?</span>
          <span class="coin"><span class="ult-outlined" data-text="CPU">CPU</span></span>
        </span>
      </li>
    </ol>

    <UltimatePanels />
  </div>
</template>

<style scoped>
.ultimate {
  --ult-font:
    "FOT-Rodin Pro", "Rodin Pro", "Arial Black", "Inter", "Helvetica Neue", Arial, sans-serif;
  position: absolute;
  inset: 0;
  overflow: hidden;
  font-family: var(--ult-font);
  user-select: none;
}

.backdrop {
  position: absolute;
  inset: 0 0 400px;
  background:
    repeating-linear-gradient(
      115deg,
      transparent 0 140px,
      rgb(255 255 255 / 2%) 140px 141px,
      transparent 141px 260px
    ),
    linear-gradient(160deg, #202022 0%, #151516 55%, #19191b 100%);
}

.grid {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.slot {
  position: absolute;
  box-sizing: border-box;
  border: 1px solid #0d0d0e;
  overflow: hidden;
  background: linear-gradient(135deg, #3b8fe0 0%, #5fb6f0 50%, #2f7ed6 100%);
}

.portrait {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 20%;
}

.label {
  position: absolute;
  inset: auto 3px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: calc(var(--slot-width) * 0.005);
  color: #fff;
  font-size: calc(var(--slot-width) * 0.13);
  font-weight: 800;
  line-height: 0.96;
  letter-spacing: -0.02em;
  text-align: center;
  --stroke: calc(var(--slot-width) * 0.06);
}

.line {
  display: block;
  white-space: nowrap;
  transform-origin: 50% 50%;
}

.random {
  border: 2px solid #b7b7b7;
  background:
    radial-gradient(circle at 30% 30%, rgb(255 255 255 / 35%), transparent 60%),
    linear-gradient(135deg, #f2cf2a, #f7e04a 50%, #e6c21c);
  box-shadow: inset 0 0 0 calc(var(--slot-width) * 0.03) #f5d93a;
}

.random-face {
  position: absolute;
  inset: calc(var(--slot-width) * 0.04);
  display: grid;
  place-items: center;
  border: 2px solid #505050;
  border-radius: 2px;
}

.question {
  grid-area: 1 / 1;
  color: #fff;
  font-size: calc(var(--slot-width) * 0.62);
  font-weight: 900;
  line-height: 1;
  --stroke: calc(var(--slot-width) * 0.07);
  --stroke-color: #3c3c3c;
}

.coin {
  grid-area: 1 / 1;
  display: grid;
  place-items: center;
  width: calc(var(--slot-width) * 0.36);
  aspect-ratio: 1;
  border: calc(var(--slot-width) * 0.022) solid #e9e9e9;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #c9c9c9, #8a8a8a 70%);
  box-shadow: 0 0 0 calc(var(--slot-width) * 0.01) #6a6a6a;
  color: #f4f4f4;
  font-size: calc(var(--slot-width) * 0.11);
  font-weight: 800;
  --stroke: calc(var(--slot-width) * 0.024);
  --stroke-color: #5a5a5a;
}
</style>

<style>
/*
 * Outlined text, as Ultimate prints names and labels. Chromium ignores paint-order on HTML text,
 * so the stroke is a copy of the text drawn behind it. Set the text in data-text too.
 */
.ult-outlined {
  position: relative;
  z-index: 0;
}

.ult-outlined::before {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  z-index: -1;
  color: var(--stroke-color, #111);
  -webkit-text-stroke: var(--stroke, 6px) var(--stroke-color, #111);
}
</style>
