<script setup lang="ts">
// Rubik stands in for Rodin, the typeface Ultimate's menus use.
import "@fontsource/rubik/800.css";
import "@fontsource/rubik/900.css";
import { computed, nextTick, onMounted, ref, watch } from "vue";

import type { Box } from "../../selection/navigate";
import { type Pick, RANDOM, type SelectionRules } from "../../selection/selection";
import { useSelectionControls } from "../../selection/useSelectionControls";
import type { ScreenRoster } from "../screen";
import { ultimateGrid } from "./grid";
import { slotLabel } from "./label";
import type { UltimateLayout } from "./layout";
import { ultimatePanels, ultimateTokenHome } from "./panels";
import { playerColour, playerTag } from "./players";
import UltimateBanner from "./UltimateBanner.vue";
import UltimateHand from "./UltimateHand.vue";
import UltimatePanels from "./UltimatePanels.vue";
import UltimateToken from "./UltimateToken.vue";
import UltimateTopBar from "./UltimateTopBar.vue";

/**
 * The Ultimate template: renders any roster as Ultimate's character select screen, on whichever
 * stage the layout gives. Swapping the layout keeps every pick.
 */
const props = defineProps<{ roster: ScreenRoster; layout: UltimateLayout }>();
defineEmits<{ back: [] }>();

/** Ultimate starts with Player 1 and a CPU, and seats up to eight. */
const RULES: SelectionRules = { minPanels: 2, maxPanels: 8, startingPanels: ["human", "cpu"] };

const grid = computed(() =>
  ultimateGrid(props.roster.fighters.length + (props.roster.randomSlot ? 1 : 0), props.layout),
);

const fighterSlots = computed(() =>
  props.roster.fighters.map((fighter, index) => ({
    fighter,
    lines: slotLabel(fighter.name),
    box: grid.value.slots[index]!,
  })),
);

const randomIndex = computed(() => (props.roster.randomSlot ? props.roster.fighters.length : -1));
const randomBox = computed(() => grid.value.slots[randomIndex.value]);

/** What each slot picks, in slot order: the fighters, then Ultimate's random slot. */
const slotPicks = computed<Pick[]>(() => [
  ...props.roster.fighters.map(({ id }): Pick => ({ fighter: id })),
  ...(props.roster.randomSlot ? [RANDOM] : []),
]);
const fightersById = computed(() => new Map(props.roster.fighters.map((f) => [f.id, f])));

/** Where a panel's token waits in it, on the glove, with this many panels on screen. */
const tokenHome = (panel: number, panelCount: number) =>
  ultimateTokenHome(ultimatePanels(panelCount, props.layout)[panel]!);

const root = ref<HTMLElement | null>(null);
const controls = useSelectionControls({
  root,
  stageWidth: () => props.layout.stage.width,
  rules: RULES,
  slots: () => grid.value.slots,
  picks: () => slotPicks.value,
  homeOf: (panel, current) => tokenHome(panel, current.panels.length),
});
const { selection, ready, hand, focused } = controls;

const homeOf = (index: number) => tokenHome(index, selection.value.panels.length);

const look = (index: number) => {
  const { kind } = selection.value.panels[index]!;
  return { colour: playerColour(index, kind), tag: playerTag(index, kind) };
};

interface Token {
  readonly index: number;
  /** The slot the token sits on, or -1 while it waits in its panel. */
  readonly slot: number;
  readonly colour: string;
  readonly tag: string;
  /** Its centre, in stage pixels. */
  readonly x: number;
  readonly y: number;
  readonly size: number;
}

/**
 * Every token not in the hand: on its slot, or at home in its panel. Tokens sharing a slot are
 * fanned out across it, overlapping more as more of them pile up.
 */
const tokens = computed<Token[]>(() => {
  const { panels, held } = selection.value;
  const slotOfPanel = panels.map((panel, index) =>
    panel.kind === "off" || held === index || !panel.pick ? -1 : controls.slotOf(panel.pick),
  );
  const sharing = (slot: number) => slotOfPanel.filter((other) => other === slot).length;
  const placed = new Map<number, number>();

  return panels.flatMap((panel, index): Token[] => {
    if (panel.kind === "off" || held === index) return [];
    const slot = slotOfPanel[index]!;
    const box = grid.value.slots[slot];
    if (!box) return [{ index, slot: -1, size: 64, ...homeOf(index), ...look(index) }];

    const size = Math.min(64, box.height * 0.72);
    const count = sharing(slot);
    const order = placed.get(slot) ?? 0;
    placed.set(slot, order + 1);
    const step = count > 1 ? Math.min(size * 0.55, (box.width * 0.9 - size) / (count - 1)) : 0;
    const first = count > 1 ? box.x + box.width * 0.05 + size / 2 : box.x + box.width * 0.32;
    return [
      {
        index,
        slot,
        size,
        x: first + order * step,
        y: box.y + box.height * 0.45,
        ...look(index),
      },
    ];
  });
});

const tokenLabel = (token: Token) => {
  const pick = slotPicks.value[token.slot];
  const where = !pick
    ? "in its panel"
    : pick === RANDOM
      ? "on Random"
      : `on ${fightersById.value.get(pick.fighter)?.name}`;
  return `Player ${token.index + 1}'s token, ${where}`;
};

const owner = computed(() => {
  const index = selection.value.panels.findIndex((panel) => panel.kind === "human");
  return index === -1 ? undefined : look(index);
});
const heldLook = computed(() =>
  selection.value.held === null ? undefined : look(selection.value.held),
);

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
watch(grid, squeezeLabels);
watch(() => props.layout, controls.rehome);

const boxStyle = ({ x, y, width, height }: Box) => ({
  left: `${x}px`,
  top: `${y}px`,
  width: `${width}px`,
  height: `${height}px`,
  "--slot-width": `${width}px`,
});
</script>

<template>
  <div
    ref="root"
    class="ultimate"
    @pointermove="hand.follow"
    @pointerdown="hand.follow"
    @pointerleave="hand.leave"
    @keydown="controls.onKey"
  >
    <div class="backdrop" :style="{ height: `${layout.floorTop}px` }" />
    <UltimateTopBar :width="layout.stage.width" @back="$emit('back')" />

    <ol class="grid" aria-label="Fighters" @keydown="controls.onGridKey">
      <li
        v-for="({ fighter, lines, box }, index) in fighterSlots"
        :key="fighter.id"
        class="slot"
        :style="boxStyle(box)"
      >
        <button
          type="button"
          class="slot-button"
          :data-slot="index"
          :tabindex="index === focused ? 0 : -1"
          :aria-label="fighter.name"
          @click="controls.chooseSlot(index)"
          @focus="controls.onSlotFocus(index, $event)"
        >
          <img class="portrait" :src="fighter.portrait" alt="" draggable="false" />
          <span ref="labels" class="label" aria-hidden="true">
            <span v-for="line in lines" :key="line" class="line ult-outlined" :data-text="line">{{
              line
            }}</span>
          </span>
        </button>
      </li>
      <li v-if="randomBox" class="slot random" :style="boxStyle(randomBox)">
        <button
          type="button"
          class="slot-button"
          :data-slot="randomIndex"
          :tabindex="randomIndex === focused ? 0 : -1"
          aria-label="Random"
          @click="controls.chooseSlot(randomIndex)"
          @focus="controls.onSlotFocus(randomIndex, $event)"
        >
          <span class="random-face">
            <span v-if="randomBox.width > 200" class="question ult-outlined" data-text="?">?</span>
          </span>
        </button>
      </li>
    </ol>

    <UltimatePanels
      :selection="selection"
      :fighters="fightersById"
      :layout="layout"
      @add="controls.addPanel"
      @remove="controls.removePanel"
      @cycle="controls.cycleKind"
    />

    <Transition name="banner">
      <UltimateBanner v-if="ready" :stage-width="layout.stage.width" v-bind="layout.banner" />
    </Transition>

    <div class="tokens">
      <button
        v-for="token in tokens"
        :key="token.index"
        type="button"
        class="token"
        :data-on-slot="token.slot === -1 ? undefined : token.slot"
        :aria-label="tokenLabel(token)"
        :style="{ left: `${token.x - token.size / 2}px`, top: `${token.y - token.size / 2}px` }"
        @pointerdown="controls.pressToken(token.index, $event)"
        @keydown.enter.prevent="controls.keyToken(token.index)"
        @keydown.space.prevent="controls.keyToken(token.index)"
      >
        <UltimateToken :colour="token.colour" :tag="token.tag" :size="token.size" />
      </button>
    </div>

    <UltimateHand
      v-show="hand.inside.value || hand.input.value !== 'mouse'"
      :position="hand.position.value"
      :input="hand.input.value"
      :owner="owner"
      :held="heldLook"
    />
  </div>
</template>

<style scoped>
.tokens > .token {
  position: absolute;
  z-index: 5;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  font: inherit;
  touch-action: none;
}

.tokens > .token:focus-visible {
  outline: 4px solid #fff;
  outline-offset: 4px;
}

.banner-leave-active {
  transition: opacity 0.12s;
}

.banner-leave-to {
  opacity: 0;
}

/* The hand takes the place of the system cursor wherever there is a mouse to move it. */
@media (hover: hover) and (pointer: fine) {
  .ultimate,
  .ultimate :deep(*) {
    cursor: none;
  }
}

.ultimate {
  --ult-font:
    "FOT-Rodin Pro", "Rodin Pro", "Rubik", "Arial Black", "Helvetica Neue", Arial, sans-serif;
  position: absolute;
  inset: 0;
  overflow: hidden;
  font-family: var(--ult-font);
  user-select: none;
}

.backdrop {
  position: absolute;
  inset: 0 0 auto;
  background:
    repeating-linear-gradient(
      115deg,
      transparent 0 140px,
      rgb(255 255 255 / 2%) 140px 141px,
      transparent 141px 260px
    ),
    linear-gradient(160deg, #202022 0%, #151516 55%, #19191b 100%);
}

/* The list spans the stage so slots sit on its coordinates; only the slots take the pointer. */
.grid {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  pointer-events: none;
}

.slot {
  position: absolute;
  box-sizing: border-box;
  pointer-events: auto;
  border: 1px solid #0d0d0e;
  overflow: hidden;
  background: linear-gradient(135deg, #3b8fe0 0%, #5fb6f0 50%, #2f7ed6 100%);
}

.slot-button {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
}

.slot-button:focus-visible {
  outline: 4px solid #fff;
  outline-offset: -4px;
}

.slot-button:focus-visible::after {
  content: "";
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 0 8px #ffcf1a;
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
