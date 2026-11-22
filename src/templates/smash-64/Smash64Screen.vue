<script setup lang="ts">
// Rubik stands in for the rounded bold sans Smash 64's menus are set in.
import "@fontsource/rubik/700.css";
import "@fontsource/rubik/800.css";
import "@fontsource/rubik/900.css";
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
 * The game had no random slot. When a roster switches one on, it is drawn as one of the "?" slots
 * the game shows for fighters not yet unlocked, with RANDOM printed across its top as a fighter's
 * name would be: the game's own sign for a fighter you cannot see, named so it is not taken for a
 * locked one.
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
 * Every token not in the hand: on its slot, or at home in its panel. Tokens sharing a slot are
 * spread across it, overlapping more as more of them pile up.
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
      { index, slot, size, x: first + order * step, y: box.y + box.height * 0.6, ...look(index) },
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

const heldLook = computed(() =>
  selection.value.held === null ? undefined : look(selection.value.held),
);

// A name too wide for its slot is squeezed sideways, as the game squeezes JIGGLYPUFF.
const labels = ref<HTMLElement[]>([]);
const randomLabel = ref<HTMLElement | null>(null);
async function squeezeLabels() {
  await nextTick();
  for (const label of [...labels.value, ...(randomLabel.value ? [randomLabel.value] : [])]) {
    label.style.transform = "";
    const room = label.parentElement!.clientWidth * 0.92;
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
});

/** The grid's frame: the band its slots cover, and a little more for the border. */
const frame = computed(() => {
  const { slots } = grid.value;
  const left = Math.min(...slots.map((slot) => slot.x));
  const right = Math.max(...slots.map((slot) => slot.x + slot.width));
  const bottom = Math.max(...slots.map((slot) => slot.y + slot.height));
  return { x: left, y: slots[0]!.y, width: right - left, height: bottom - slots[0]!.y };
});
</script>

<template>
  <div
    ref="root"
    class="smash-64"
    @pointermove="hand.follow"
    @pointerdown="hand.follow"
    @pointerleave="hand.leave"
    @keydown="controls.onKey"
  >
    <div class="backdrop" aria-hidden="true" />
    <Smash64Header @back="back" />

    <div class="grid-frame" aria-hidden="true" :style="boxStyle(frame)" />
    <ol class="grid" aria-label="Fighters" @keydown="controls.onGridKey">
      <li
        v-for="({ fighter, label, box }, index) in fighterSlots"
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
          <FighterPortrait class="portrait" :fighter="fighter" place="slot" />
          <span ref="labels" class="label" aria-hidden="true">{{ label }}</span>
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
          <span class="question" aria-hidden="true">?</span>
          <span ref="randomLabel" class="label" aria-hidden="true">RANDOM</span>
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
      <Smash64Banner
        v-if="ready"
        :y="layout.bannerY"
        :press-y="layout.panelBand.y + layout.panelBand.height + 12"
      />
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
  position: absolute;
  inset: 0;
  overflow: hidden;
  font-family: "Rubik", "Arial Black", "Helvetica Neue", Arial, sans-serif;
  user-select: none;
}

/* The hand takes the place of the system cursor wherever there is a mouse to move it. */
@media (hover: hover) and (pointer: fine) {
  .smash-64,
  .smash-64 :deep(*) {
    cursor: none;
  }
}

/* The game's backdrop: black rock, cracked with faint grey veins, inside a black border. */
.backdrop {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      28deg,
      transparent 0 52px,
      rgb(255 255 255 / 5%) 52px 56px,
      transparent 56px 98px
    ),
    repeating-linear-gradient(
      -34deg,
      transparent 0 70px,
      rgb(255 255 255 / 4%) 70px 73px,
      transparent 73px 128px
    ),
    radial-gradient(ellipse at 50% 40%, #222 0%, #181818 60%, #101010 100%);
  box-shadow: inset 0 0 0 36px #000;
}

/* The grid's dark brown frame, a step outside its slots. */
.grid-frame {
  position: absolute;
  margin: -6px;
  padding: 6px;
  border-radius: 4px;
  background: #2a1a10;
  box-shadow: 0 0 0 2px #000;
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

/* The list spans the stage so slots sit on its coordinates; only the slots take the pointer. */
.grid {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  pointer-events: none;
}

/* Slots touch, each edged in the game's brown. */
.slot {
  position: absolute;
  box-sizing: border-box;
  pointer-events: auto;
}

.slot-button {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 0;
  border: calc(var(--slot-width) * 0.025) solid #4a3226;
  background:
    radial-gradient(
      ellipse 80% 60% at 50% 100%,
      #e05a10 0%,
      rgb(200 60 10 / 50%) 40%,
      transparent 70%
    ),
    linear-gradient(180deg, #2a0404, #5a0c08);
  font: inherit;
}

.slot-button:focus-visible {
  outline: 4px solid #f0c020;
  outline-offset: -4px;
}

/*
 * The portrait fills the slot. Until the game's own portraits are gathered the nearest game's
 * stand in, and Melee's print a name along their foot, so the foot is cropped off.
 */
.portrait {
  position: absolute;
  left: 0;
  top: 12%;
  display: block;
  width: 100%;
  height: 120%;
  object-fit: cover;
  object-position: 50% 0;
}

/* A fighter added by image fills the slot with its crop. */
.portrait.cropped {
  inset: 0;
  height: 100%;
}

/* The game prints each name in khaki capitals across the slot's top left, outlined dark. */
.label {
  position: absolute;
  left: 4%;
  top: 2%;
  color: #c8c0a0;
  font-size: calc(var(--slot-width) * 0.15);
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.1;
  white-space: nowrap;
  transform-origin: 0 50%;
  -webkit-text-stroke: calc(var(--slot-width) * 0.022) #2a1a10;
  paint-order: stroke fill;
}

/* The random slot, drawn as one of the game's locked "?" slots. */
.random .slot-button {
  background: radial-gradient(ellipse at 50% 50%, #4a3a30 0%, #2a1e18 70%, #1a120e 100%);
}

.question {
  position: absolute;
  inset: 10% 0 0;
  display: grid;
  place-items: center;
  color: #c8b8a0;
  font-size: calc(var(--slot-width) * 0.6);
  font-weight: 900;
  line-height: 1;
  -webkit-text-stroke: calc(var(--slot-width) * 0.02) #000;
  paint-order: stroke fill;
}
</style>
