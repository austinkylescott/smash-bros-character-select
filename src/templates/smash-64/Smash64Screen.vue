<script setup lang="ts">
// Rubik stands in for the heavy sans the game's menus are set in.
import "@fontsource/rubik/700.css";
import "@fontsource/rubik/900.css";
import "@fontsource/rubik/900-italic.css";
import { computed, nextTick, onMounted, ref, watch } from "vue";

import { useScreenAudio } from "../../audio";
import type { Box } from "../../selection/navigate";
import { type Pick, RANDOM, type SelectionRules } from "../../selection/selection";
import { useSelectionControls } from "../../selection/useSelectionControls";
import FighterPortrait from "../FighterPortrait.vue";
import type { ScreenRoster } from "../screen";
import { smash64Grid } from "./grid";
import { smash64SlotLabel } from "./label";
import type { Smash64Layout } from "./layout";
import { PANEL_COUNT, smash64Panels, smash64TokenHome } from "./panels";
import { playerColour, playerTag } from "./players";
import Smash64Banner from "./Smash64Banner.vue";
import Smash64Hand from "./Smash64Hand.vue";
import Smash64Header from "./Smash64Header.vue";
import Smash64Panel from "./Smash64Panel.vue";
import Smash64Token from "./Smash64Token.vue";

/**
 * The Smash 64 template: renders any roster as the original game's character select screen, on
 * whichever stage the layout gives. Swapping the layout keeps every pick.
 *
 * The game had no random slot. Ours borrows the look of the slots its starter screen shows for
 * fighters not yet unlocked, a big grey "?" on the usual flames, and is placed after the last
 * fighter.
 */
const props = defineProps<{ roster: ScreenRoster; layout: Smash64Layout }>();
const emit = defineEmits<{ back: [] }>();

/** The game always shows its four ports. Player 1 starts joined; the rest are N/A until switched. */
const RULES: SelectionRules = {
  minPanels: PANEL_COUNT,
  maxPanels: PANEL_COUNT,
  startingPanels: ["human", "off", "off", "off"],
};

const grid = computed(() =>
  smash64Grid(props.roster.fighters.length + (props.roster.randomSlot ? 1 : 0), props.layout),
);
const panelBoxes = computed(() => smash64Panels(props.layout));

const fighterSlots = computed(() =>
  props.roster.fighters.map((fighter, index) => ({
    fighter,
    label: smash64SlotLabel(fighter.name),
    box: grid.value.slots[index]!,
  })),
);

const randomIndex = computed(() => (props.roster.randomSlot ? props.roster.fighters.length : -1));
const randomBox = computed(() => grid.value.slots[randomIndex.value]);

/** What each slot picks, in slot order: the fighters, then the random slot if there is one. */
const slotPicks = computed<Pick[]>(() => [
  ...props.roster.fighters.map(({ id }): Pick => ({ fighter: id })),
  ...(props.roster.randomSlot ? [RANDOM] : []),
]);
const fightersById = computed(() => new Map(props.roster.fighters.map((f) => [f.id, f])));

const tokenHome = (panel: number) => smash64TokenHome(panelBoxes.value[panel]!);

const root = ref<HTMLElement | null>(null);
const controls = useSelectionControls({
  root,
  stageWidth: () => props.layout.stage.width,
  rules: RULES,
  slots: () => grid.value.slots,
  picks: () => slotPicks.value,
  homeOf: (panel) => tokenHome(panel),
});
const { selection, ready, hand, focused } = controls;

const { playBack } = useScreenAudio({
  template: () => "smash-64",
  selection,
  hand: hand.position,
  slots: () => grid.value.slots,
});
function back() {
  playBack();
  emit("back");
}

const look = (index: number) => {
  const { kind } = selection.value.panels[index]!;
  return { colour: playerColour(index, kind), tag: playerTag(index, kind) };
};

const fighterOf = (index: number) => {
  const pick = selection.value.panels[index]!.pick;
  return pick && pick !== RANDOM ? fightersById.value.get(pick.fighter) : undefined;
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
 * Every token not in the hand: on its slot, or at home in its panel. The game drops a token high
 * on the portrait; tokens sharing a slot are spread across it, overlapping more as they pile up.
 */
const tokens = computed<Token[]>(() => {
  const { panels, held } = selection.value;
  const slotOfPanel = panels.map((panel, index) =>
    panel.kind === "off" || held === index || !panel.pick ? -1 : controls.slotOf(panel.pick),
  );
  const placed = new Map<number, number>();

  return panels.flatMap((panel, index): Token[] => {
    if (panel.kind === "off" || held === index) return [];
    const slot = slotOfPanel[index]!;
    const box = grid.value.slots[slot];
    if (!box) return [{ index, slot: -1, size: 72, ...tokenHome(index), ...look(index) }];

    const size = Math.min(72, box.height * 0.45);
    const count = slotOfPanel.filter((other) => other === slot).length;
    const order = placed.get(slot) ?? 0;
    placed.set(slot, order + 1);
    const step = count > 1 ? Math.min(size * 0.6, (box.width * 0.9 - size) / (count - 1)) : 0;
    const first = count > 1 ? box.x + box.width * 0.05 + size / 2 : box.x + box.width * 0.5;
    return [
      { index, slot, size, x: first + order * step, y: box.y + box.height * 0.36, ...look(index) },
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

/** The slot under the hand, lit in the hand owner's colour. */
const pointedSlot = computed(() => {
  const { x, y } = hand.position.value;
  return grid.value.slots.findIndex(
    (box) => x >= box.x && x < box.x + box.width && y >= box.y && y < box.y + box.height,
  );
});

/** "PRESS START" sits under the panels once everyone has picked. */
const pressStartY = computed(() => props.layout.panelBand.y + props.layout.panelBand.height + 6);

// A name too wide for its slot is squeezed sideways, as the game squeezes JIGGLYPUFF.
const labels = ref<HTMLElement[]>([]);
async function squeezeLabels() {
  await nextTick();
  for (const label of labels.value) {
    label.style.transform = "";
    const room = label.parentElement!.clientWidth * 0.94;
    const natural = label.scrollWidth;
    if (natural > room) label.style.transform = `scaleX(${room / natural})`;
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
  "--slot-height": `${height}px`,
});
</script>

<template>
  <div
    ref="root"
    class="smash-64"
    :style="{ '--pointer-colour': owner?.colour ?? '#b8282c' }"
    @pointermove="hand.follow"
    @pointerdown="hand.follow"
    @pointerleave="hand.leave"
    @keydown="controls.onKey"
  >
    <div class="backdrop" aria-hidden="true" />
    <Smash64Header @back="back" />

    <ol class="grid" aria-label="Fighters" @keydown="controls.onGridKey">
      <li
        v-for="({ fighter, label, box }, index) in fighterSlots"
        :key="fighter.id"
        class="slot"
        :class="{ pointed: index === pointedSlot }"
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
          <FighterPortrait class="portrait" :fighter="fighter" place="slot" />
          <span ref="labels" class="label" aria-hidden="true">{{ label }}</span>
        </button>
      </li>
      <li
        v-if="randomBox"
        class="slot random"
        :class="{ pointed: randomIndex === pointedSlot }"
        :style="boxStyle(randomBox)"
      >
        <button
          type="button"
          class="slot-button"
          :data-slot="randomIndex"
          :tabindex="randomIndex === focused ? 0 : -1"
          aria-label="Random"
          @click="controls.chooseSlot(randomIndex)"
          @focus="controls.onSlotFocus(randomIndex, $event)"
        >
          <span class="question" aria-hidden="true">?</span>
        </button>
      </li>
    </ol>

    <Smash64Panel
      v-for="(panel, index) in selection.panels"
      :key="index"
      :box="panelBoxes[index]!"
      :index="index"
      :panel="panel"
      :fighter="fighterOf(index)"
      @cycle="controls.cycleKind(index)"
    />

    <Transition name="banner">
      <Smash64Banner v-if="ready" :y="layout.bannerY" />
    </Transition>
    <p v-if="ready" class="press-start" aria-hidden="true" :style="{ top: `${pressStartY}px` }">
      PRESS <span class="start">START</span>
    </p>

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
        <Smash64Token :colour="token.colour" :tag="token.tag" :size="token.size" />
      </button>
    </div>

    <Smash64Hand
      v-show="hand.inside.value || hand.input.value !== 'mouse'"
      :position="hand.position.value"
      :input="hand.input.value"
      :held="heldLook"
    />
  </div>
</template>

<style scoped>
.smash-64 {
  --smash-64-font: "Rubik", "Arial Black", "Helvetica Neue", Arial, sans-serif;
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #000;
  font-family: var(--smash-64-font);
  user-select: none;
}

/* The hand takes the place of the system cursor wherever there is a mouse to move it. */
@media (hover: hover) and (pointer: fine) {
  .smash-64,
  .smash-64 :deep(*) {
    cursor: none;
  }
}

/*
 * The game's dark stone wall, inside the black border its picture had round it: near-black,
 * mottled with faint grey veins.
 */
.backdrop {
  position: absolute;
  inset: 36px 40px 44px;
  background:
    repeating-linear-gradient(
      28deg,
      transparent 0 34px,
      rgb(70 70 70 / 30%) 34px 38px,
      transparent 38px 90px
    ),
    repeating-linear-gradient(
      -34deg,
      transparent 0 52px,
      rgb(60 60 60 / 30%) 52px 55px,
      transparent 55px 120px
    ),
    radial-gradient(circle at 30% 40%, #262626, #101010 70%);
}

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

.press-start {
  position: absolute;
  left: 0;
  right: 0;
  margin: 0;
  color: #e8e8d8;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.16em;
  line-height: 40px;
  text-align: center;
}

.press-start .start {
  color: #ff5c8c;
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
}

/* Slots touch, each ringed in thin brown, the fighter standing in front of dark red flames. */
.slot-button {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  border: calc(var(--slot-width) * 0.022) solid #4a3a2c;
  background:
    radial-gradient(ellipse 70% 55% at 50% 100%, #c04010 0%, transparent 70%),
    linear-gradient(180deg, #1a0204 0%, #4a0408 45%, #8a1408 100%);
  font: inherit;
}

/* The slot under the hand is ringed in its owner's colour. */
.pointed .slot-button {
  border-color: var(--pointer-colour);
  box-shadow: inset 0 0 calc(var(--slot-width) * 0.06) var(--pointer-colour);
}

.slot-button:focus-visible {
  outline: 4px solid #fff;
  outline-offset: -4px;
}

/*
 * The portrait fills the slot. Until the game's own portraits are gathered the nearest game's
 * stand in, and Melee's print a name along their foot, so the foot is cropped off.
 */
.portrait {
  position: absolute;
  left: 0;
  top: 10%;
  display: block;
  width: 100%;
  height: 110%;
  object-fit: cover;
  object-position: 50% 0;
}

/* A fighter added by image fills the slot with its crop. */
.portrait.cropped {
  inset: 0;
  height: 100%;
}

/* The name across the top left: pale grey capitals, outlined dark. */
.label {
  position: absolute;
  left: 4%;
  top: 2%;
  color: #d8d8d4;
  font-size: calc(var(--slot-width) * 0.15);
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
  white-space: nowrap;
  transform-origin: 0 50%;
  -webkit-text-stroke: calc(var(--slot-width) * 0.018) #1a1a1a;
  paint-order: stroke fill;
}

/* The random slot: the starter screen's locked slot, a big grey "?" on the flames. */
.question {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #b4b4b4;
  font-size: calc(var(--slot-height) * 0.7);
  font-weight: 900;
  line-height: 1;
  -webkit-text-stroke: calc(var(--slot-width) * 0.02) #3a3a3a;
  paint-order: stroke fill;
  text-shadow: 0 calc(var(--slot-width) * 0.02) 0 #000;
}
</style>
