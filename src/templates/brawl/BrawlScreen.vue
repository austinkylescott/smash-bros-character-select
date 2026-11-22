<script setup lang="ts">
// Rubik stands in for the bold sans Brawl's menus are set in.
import "@fontsource/rubik/700.css";
import "@fontsource/rubik/800.css";
import "@fontsource/rubik/900.css";
import "@fontsource/rubik/900-italic.css";
import { computed, nextTick, onMounted, ref, watch } from "vue";

import { useScreenAudio } from "../../audio";
import type { Box } from "../../selection/navigate";
import { type Pick, RANDOM, type SelectionRules } from "../../selection/selection";
import { useSelectionControls } from "../../selection/useSelectionControls";
import FighterPortrait from "../FighterPortrait.vue";
import type { ScreenRoster } from "../screen";
import BrawlBanner from "./BrawlBanner.vue";
import BrawlHand from "./BrawlHand.vue";
import BrawlHeader from "./BrawlHeader.vue";
import BrawlPanel from "./BrawlPanel.vue";
import BrawlToken from "./BrawlToken.vue";
import { brawlGrid } from "./grid";
import { brawlSlotLabel } from "./label";
import type { BrawlLayout } from "./layout";
import { brawlPanels, brawlTokenHome, PANEL_COUNT } from "./panels";
import { playerColour, playerTag } from "./players";

/**
 * The Brawl template: renders any roster as Brawl's character select screen, on whichever stage
 * the layout gives. Swapping the layout keeps every pick. Brawl has its own random slot, a plain
 * white one with RANDOM across it, placed after the last fighter.
 */
const props = defineProps<{ roster: ScreenRoster; layout: BrawlLayout }>();
const emit = defineEmits<{ back: [] }>();

/** Brawl always shows its four ports. Player 1 starts joined; the rest are NONE until switched. */
const RULES: SelectionRules = {
  minPanels: PANEL_COUNT,
  maxPanels: PANEL_COUNT,
  startingPanels: ["human", "off", "off", "off"],
};

const grid = computed(() =>
  brawlGrid(props.roster.fighters.length + (props.roster.randomSlot ? 1 : 0), props.layout),
);
const panelBoxes = computed(() => brawlPanels(props.layout));

const fighterSlots = computed(() =>
  props.roster.fighters.map((fighter, index) => ({
    fighter,
    lines: brawlSlotLabel(fighter.name),
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

const tokenHome = (panel: number) => brawlTokenHome(panelBoxes.value[panel]!);

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
  template: () => "brawl",
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
    if (!box) return [{ index, slot: -1, size: 64, ...tokenHome(index), ...look(index) }];

    const size = Math.min(64, box.height * 0.6);
    const count = slotOfPanel.filter((other) => other === slot).length;
    const order = placed.get(slot) ?? 0;
    placed.set(slot, order + 1);
    const step = count > 1 ? Math.min(size * 0.6, (box.width * 0.9 - size) / (count - 1)) : 0;
    const first = count > 1 ? box.x + box.width * 0.05 + size / 2 : box.x + box.width * 0.5;
    return [
      { index, slot, size, x: first + order * step, y: box.y + box.height * 0.58, ...look(index) },
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

/** The slot under the hand, which Brawl outlines in the hand owner's colour. */
const pointedSlot = computed(() => {
  const { x, y } = hand.position.value;
  return grid.value.slots.findIndex(
    (box) => x >= box.x && x < box.x + box.width && y >= box.y && y < box.y + box.height,
  );
});

// A name too wide for its strip is squeezed sideways, as Brawl squeezes JIGGLYPUFF.
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
  "--slot-height": `${height}px`,
});
</script>

<template>
  <div
    ref="root"
    class="brawl"
    :style="{ '--pointer-colour': owner?.colour ?? '#d8242c' }"
    @pointermove="hand.follow"
    @pointerdown="hand.follow"
    @pointerleave="hand.leave"
    @keydown="controls.onKey"
  >
    <div class="backdrop" aria-hidden="true" />
    <div
      class="emblem"
      aria-hidden="true"
      :style="{ top: `${layout.panelBand.y + layout.panelBand.height * 0.1 - 360}px` }"
    />
    <div class="floor" aria-hidden="true" />
    <BrawlHeader @back="back" />

    <ol class="grid" aria-label="Fighters" @keydown="controls.onGridKey">
      <li
        v-for="({ fighter, lines, box }, index) in fighterSlots"
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
          <span class="face">
            <FighterPortrait class="portrait" :fighter="fighter" place="slot" />
            <span ref="labels" class="label" :class="{ two: lines.length > 1 }" aria-hidden="true">
              <span v-for="line in lines" :key="line" class="line">{{ line }}</span>
            </span>
          </span>
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
          <span class="face">
            <span class="random-word" aria-hidden="true">RANDOM</span>
          </span>
        </button>
      </li>
    </ol>

    <BrawlPanel
      v-for="(panel, index) in selection.panels"
      :key="index"
      :box="panelBoxes[index]!"
      :index="index"
      :panel="panel"
      :fighter="fighterOf(index)"
      @cycle="controls.cycleKind(index)"
    />

    <Transition name="banner">
      <BrawlBanner v-if="ready" :y="layout.bannerY" />
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
        <BrawlToken :colour="token.colour" :tag="token.tag" :size="token.size" />
      </button>
    </div>

    <BrawlHand
      v-show="hand.inside.value || hand.input.value !== 'mouse'"
      :position="hand.position.value"
      :input="hand.input.value"
      :owner="owner"
      :held="heldLook"
    />
  </div>
</template>

<style scoped>
.brawl {
  --brawl-font: "Rubik", "Arial Black", "Helvetica Neue", Arial, sans-serif;
  position: absolute;
  inset: 0;
  overflow: hidden;
  font-family: var(--brawl-font);
  user-select: none;
}

/* The hand takes the place of the system cursor wherever there is a mouse to move it. */
@media (hover: hover) and (pointer: fine) {
  .brawl,
  .brawl :deep(*) {
    cursor: none;
  }
}

/* Brawl's pale stage: off-white, greying towards the panels. */
.backdrop {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #f2f1ef 0%, #e9e8e6 55%, #d9d8d6 100%);
}

/* The faint Smash emblem rings the panels stand in front of. */
.emblem {
  position: absolute;
  left: 50%;
  width: 1120px;
  height: 720px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse,
    transparent 0 18%,
    rgb(200 190 186 / 45%) 18.5% 25%,
    transparent 25.5% 36%,
    rgb(205 196 192 / 40%) 36.5% 44%,
    transparent 44.5% 58%,
    rgb(210 202 198 / 30%) 58.5% 66%,
    transparent 66.5%
  );
  transform: translateX(-50%);
}

/* The dark red floor along the screen's foot. */
.floor {
  position: absolute;
  inset: auto 0 0;
  height: 52px;
  border-top: 6px solid #d8a0a4;
  background: linear-gradient(180deg, #a85a62, #7a2e36);
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
  outline: 4px solid #222;
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

/* Slots touch; each draws its own pale frame inside its box, with a soft shadow below it. */
.slot {
  position: absolute;
  box-sizing: border-box;
  padding: calc(var(--slot-width) * 0.015);
  pointer-events: auto;
}

.slot-button {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  padding: calc(var(--slot-width) * 0.022);
  border: 0;
  border-radius: calc(var(--slot-width) * 0.03);
  background: linear-gradient(180deg, #ffffff, #c6c7cb);
  box-shadow:
    0 0 0 1px #8c8d92,
    0 4px 6px rgb(0 0 0 / 28%);
  font: inherit;
}

/* The slot under the hand is ringed in its owner's colour, as Brawl rings it. */
.pointed .slot-button {
  background: var(--pointer-colour);
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--pointer-colour) 60%, #000),
    0 0 10px 2px var(--pointer-colour);
}

.slot-button:focus-visible {
  outline: 4px solid #222;
  outline-offset: 0;
}

.face {
  position: relative;
  display: block;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(180deg, #bfd4e6, #8eaac4);
}

/*
 * The portrait fills the face below the name strip. Until Brawl's own portraits are gathered the
 * nearest game's stand in, and Melee's print a name along their foot, so the foot is cropped off.
 */
.portrait {
  position: absolute;
  left: 0;
  top: 22%;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 0;
}

/* A fighter added by image fills the face below the strip with its crop. */
.portrait.cropped {
  inset: 22% 0 0;
  height: 78%;
}

/* Brawl's name strip: white capitals on black, across the top of the slot. */
.label {
  position: absolute;
  inset: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 22%;
  padding: 0 calc(var(--slot-width) * 0.03);
  background: linear-gradient(180deg, #3a3a3e, #0c0c0e);
  color: #fff;
  font-size: min(calc(var(--slot-width) * 0.15), calc(var(--slot-height) * 0.18));
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1;
  text-align: center;
}

/* Two lines share the strip, squashed flat as Brawl squashes DONKEY KONG. */
.label.two {
  font-size: min(calc(var(--slot-width) * 0.13), calc(var(--slot-height) * 0.13));
  line-height: 0.8;
}

.label.two .line {
  scale: 1 0.82;
}

.line {
  display: block;
  white-space: nowrap;
  transform-origin: 50% 50%;
}

/* Brawl's random slot: plain white, with RANDOM in grey capitals across it. */
.random .face {
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #ffffff, #e6e6e8);
}

.random-word {
  color: #7a7b80;
  font-size: calc(var(--slot-width) * 0.17);
  font-weight: 800;
  letter-spacing: 0.02em;
  -webkit-text-stroke: calc(var(--slot-width) * 0.012) #fff;
  paint-order: stroke fill;
  text-shadow: 0 0 2px #55565c;
}
</style>
