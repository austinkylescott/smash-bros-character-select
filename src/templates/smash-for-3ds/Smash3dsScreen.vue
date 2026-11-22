<script setup lang="ts">
// Rubik stands in for the bold sans the 3DS game's menus are set in.
import "@fontsource/rubik/700.css";
import "@fontsource/rubik/800.css";
import "@fontsource/rubik/900.css";
import "@fontsource/rubik/900-italic.css";
import { computed, ref, watch } from "vue";

import { useScreenAudio } from "../../audio";
import type { Box } from "../../selection/navigate";
import { type Pick, RANDOM, type SelectionRules } from "../../selection/selection";
import { useSelectionControls } from "../../selection/useSelectionControls";
import FighterPortrait from "../FighterPortrait.vue";
import type { ScreenRoster } from "../screen";
import { smash3dsPages } from "./grid";
import type { Smash3dsLayout } from "./layout";
import { PANEL_COUNT, smash3dsCards, smash3dsTokenHome } from "./panels";
import { playerColour, playerTag } from "./players";
import Smash3dsBanner from "./Smash3dsBanner.vue";
import Smash3dsCard from "./Smash3dsCard.vue";
import Smash3dsHand from "./Smash3dsHand.vue";
import Smash3dsHeader from "./Smash3dsHeader.vue";
import Smash3dsToken from "./Smash3dsToken.vue";
import { tileOf } from "./tiles";

/**
 * The Smash for 3DS template: renders any roster as the 3DS game's character select screen, its
 * two displays stacked: the fighter grid on the top screen, the player cards on the touch screen.
 * Portraits sit unnamed on coloured tiles. A roster too big for one page gets the game's
 * "Extra Fighters" page; each page ends with the game's white "?" random slot.
 */
const props = defineProps<{ roster: ScreenRoster; layout: Smash3dsLayout }>();
const emit = defineEmits<{ back: [] }>();

/** The game always shows four cards. Player 1 starts joined; the rest are "---" until switched. */
const RULES: SelectionRules = {
  minPanels: PANEL_COUNT,
  maxPanels: PANEL_COUNT,
  startingPanels: ["human", "off", "off", "off"],
};

const pages = computed(() =>
  smash3dsPages(props.roster.fighters.length, props.roster.randomSlot, props.layout),
);
/** The page shown. A roster that shrinks to one page takes the screen back to it. */
const pageIndex = ref(0);
const page = computed(() => pages.value[Math.min(pageIndex.value, pages.value.length - 1)]!);
function turnPage() {
  pageIndex.value = page.value.button?.to === "extra" ? 1 : 0;
}

const pageFighters = computed(() =>
  props.roster.fighters.slice(page.value.first, page.value.first + page.value.count),
);
const fighterSlots = computed(() =>
  pageFighters.value.map((fighter, index) => ({
    fighter,
    tile: tileOf(fighter.id),
    box: page.value.slots[index]!,
  })),
);
const randomIndex = computed(() => (page.value.random ? page.value.count : -1));
const randomBox = computed(() => page.value.slots[randomIndex.value]);

/** What each slot on the page picks, in slot order: its fighters, then its random slot. */
const slotPicks = computed<Pick[]>(() => [
  ...pageFighters.value.map(({ id }): Pick => ({ fighter: id })),
  ...(page.value.random ? [RANDOM] : []),
]);
const fightersById = computed(() => new Map(props.roster.fighters.map((f) => [f.id, f])));

const cardBoxes = computed(() => smash3dsCards(props.layout));
const tokenHome = (panel: number) => smash3dsTokenHome(cardBoxes.value[panel]!);

const root = ref<HTMLElement | null>(null);
const controls = useSelectionControls({
  root,
  stageWidth: () => props.layout.stage.width,
  rules: RULES,
  slots: () => page.value.slots,
  picks: () => slotPicks.value,
  homeOf: (panel) => tokenHome(panel),
});
const { selection, ready, hand, focused } = controls;

const { playBack } = useScreenAudio({
  template: () => "smash-for-3ds",
  selection,
  hand: hand.position,
  slots: () => page.value.slots,
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
  /** The slot the token sits on, or -1 while it waits on its card. */
  readonly slot: number;
  readonly colour: string;
  readonly tag: string;
  /** Its centre, in stage pixels. */
  readonly x: number;
  readonly y: number;
  readonly size: number;
}

/**
 * Every token not in the hand: on its slot, or at home on its card. A token on a fighter on the
 * other page is out of sight until that page is turned to. Tokens sharing a slot are spread
 * across it, overlapping more as more of them pile up.
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
    const box = page.value.slots[slot];
    if (!box) {
      if (panel.pick) return [];
      return [{ index, slot: -1, size: 96, ...tokenHome(index), ...look(index) }];
    }

    const size = Math.min(84, box.height * 0.62);
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
    ? "on its card"
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

/** The slot under the hand, ringed in the hand owner's colour. */
const pointedSlot = computed(() => {
  const { x, y } = hand.position.value;
  return page.value.slots.findIndex(
    (box) => x >= box.x && x < box.x + box.width && y >= box.y && y < box.y + box.height,
  );
});

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
    class="smash-3ds"
    :style="{ '--pointer-colour': owner?.colour ?? '#e2262e' }"
    @pointermove="hand.follow"
    @pointerdown="hand.follow"
    @pointerleave="hand.leave"
    @keydown="controls.onKey"
  >
    <div class="screen top-screen" aria-hidden="true" :style="boxStyle(layout.topScreen)" />
    <div class="screen touch-screen" :style="boxStyle(layout.bottomScreen)">
      <Smash3dsHeader @back="back" />
    </div>

    <ol
      class="grid"
      :aria-label="page.button?.to === 'original' ? 'Extra fighters' : 'Fighters'"
      @keydown="controls.onGridKey"
    >
      <li
        v-for="({ fighter, tile, box }, index) in fighterSlots"
        :key="fighter.id"
        class="slot"
        :class="{ pointed: index === pointedSlot }"
        :style="{ ...boxStyle(box), '--tile-top': tile.top, '--tile-bottom': tile.bottom }"
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

    <button
      v-if="page.button"
      type="button"
      class="page-button"
      :class="page.button.to"
      :style="boxStyle(page.button.box)"
      @click="turnPage"
    >
      <span class="page-word">
        {{ page.button.to === "extra" ? "Extra Fighters" : "Original Fighters" }}
      </span>
      <span class="page-arrow" aria-hidden="true" />
    </button>

    <Smash3dsCard
      v-for="(panel, index) in selection.panels"
      :key="index"
      :box="cardBoxes[index]!"
      :index="index"
      :panel="panel"
      :fighter="fighterOf(index)"
      @cycle="controls.cycleKind(index)"
    />

    <Transition name="banner">
      <Smash3dsBanner v-if="ready" :y="layout.bannerY" :width="layout.topScreen.width" />
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
        <Smash3dsToken :colour="token.colour" :tag="token.tag" :size="token.size" />
      </button>
    </div>

    <Smash3dsHand
      v-show="hand.inside.value || hand.input.value !== 'mouse'"
      :position="hand.position.value"
      :input="hand.input.value"
      :owner="owner"
      :held="heldLook"
    />
  </div>
</template>

<style scoped>
.smash-3ds {
  --smash-3ds-font: "Rubik", "Arial Black", "Helvetica Neue", Arial, sans-serif;
  position: absolute;
  inset: 0;
  overflow: hidden;
  /* The handheld's dark shell, around and between its two screens. */
  background: linear-gradient(180deg, #26262a, #151518 48%, #0c0c0e 50%, #151518 52%, #26262a);
  font-family: var(--smash-3ds-font);
  user-select: none;
}

/* The hand takes the place of the system cursor wherever there is a mouse to move it. */
@media (hover: hover) and (pointer: fine) {
  .smash-3ds,
  .smash-3ds :deep(*) {
    cursor: none;
  }
}

.screen {
  position: absolute;
  overflow: hidden;
}

/* The top screen's dark grey, finely lined across, which shows round a short last row. */
.top-screen {
  background:
    repeating-linear-gradient(180deg, transparent 0 4px, rgb(0 0 0 / 22%) 4px 6px),
    linear-gradient(180deg, #4a4a4c, #3a3a3c);
}

.touch-screen {
  background:
    repeating-linear-gradient(180deg, transparent 0 4px, rgb(0 0 0 / 18%) 4px 6px),
    linear-gradient(180deg, #48484c, #2c2c30);
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

/* Tiles touch, a fine dark line between them. */
.slot {
  position: absolute;
  box-sizing: border-box;
  padding: 1.5px;
  background: #1a1a1c;
  pointer-events: auto;
}

/* The fighter's coloured tile: pale at the top, deeper at the foot. */
.slot-button {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 0;
  border: 0;
  background: linear-gradient(180deg, var(--tile-top), var(--tile-bottom));
  font: inherit;
}

/* The slot under the hand is ringed in its owner's colour. */
.pointed .slot-button::after {
  content: "";
  position: absolute;
  inset: 0;
  box-shadow:
    inset 0 0 0 calc(var(--slot-height) * 0.05) var(--pointer-colour),
    inset 0 0 calc(var(--slot-height) * 0.12) #fff;
}

.slot-button:focus-visible {
  outline: 5px solid #fff;
  outline-offset: -5px;
}

/*
 * The portrait fills the tile. Until the 3DS game's own portraits are gathered the nearest game's
 * stand in, and Melee's print a name along their foot, so the foot is cropped off.
 */
.portrait {
  position: absolute;
  left: 0;
  top: 0;
  display: block;
  width: 100%;
  height: 125%;
  object-fit: cover;
  object-position: 50% 0;
}

/* A fighter added by image fills the tile with its crop. */
.portrait.cropped {
  inset: 0;
  height: 100%;
}

/* The game's random slot: white, a heavy black "?" across it. */
.random .slot-button {
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #ffffff, #dcdce0);
}

.question {
  color: #141416;
  font-size: calc(var(--slot-height) * 0.78);
  font-weight: 900;
  line-height: 1;
}

/* The page button: gold for the Extra Fighters, green back to the Original Fighters. */
.page-button {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 0 18px 0 24px;
  border: 4px solid #2a2208;
  border-radius: 8px;
  background: linear-gradient(180deg, #f2d872, #c89a26 55%, #8e6a10);
  box-shadow: 0 4px 6px rgb(0 0 0 / 45%);
  color: #2a2208;
  font: inherit;
  font-size: 50px;
  font-weight: 800;
  line-height: 1;
}

.page-button.original {
  border-color: #0e3a14;
  background: linear-gradient(180deg, #7ae07a, #2ea83c 55%, #146a20);
  color: #fff;
  -webkit-text-stroke: 5px #0e3a14;
  paint-order: stroke fill;
}

.page-arrow {
  width: 0;
  height: 0;
  border-block: 24px solid transparent;
  border-left: 32px solid #141416;
}

.original .page-arrow {
  border-left: 0;
  border-right: 32px solid #fff;
  filter: drop-shadow(0 0 2px #0e3a14);
}

.page-button:focus-visible {
  outline: 5px solid #fff;
  outline-offset: 2px;
}
</style>
