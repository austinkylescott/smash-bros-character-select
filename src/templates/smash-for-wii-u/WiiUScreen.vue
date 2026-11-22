<script setup lang="ts">
// Rubik stands in for the rounded bold sans the game's menus are set in.
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
import { wiiUGrid } from "./grid";
import { wiiUSlotLabel } from "./label";
import type { WiiULayout } from "./layout";
import { EIGHT_PLAYER_PANELS, SMASH_PANELS, wiiUPanels, wiiUTokenHome } from "./panels";
import { playerColour, playerTag } from "./players";
import WiiUBanner from "./WiiUBanner.vue";
import WiiUHand from "./WiiUHand.vue";
import WiiUHeader from "./WiiUHeader.vue";
import WiiUPanel from "./WiiUPanel.vue";
import WiiUToken from "./WiiUToken.vue";

/**
 * The Smash for Wii U template: renders any roster as the Wii U game's character select screen,
 * on whichever stage the layout gives. Swapping the layout keeps every pick. The game has its own
 * random slot, grey with a question mark, placed after the last fighter.
 */
const props = defineProps<{ roster: ScreenRoster; layout: WiiULayout }>();
const emit = defineEmits<{ back: [] }>();

/**
 * Smash shows four panels; 8-Player Smash, switched to by the header's mode tab, eight. Player 1
 * starts joined; the rest are None until switched.
 */
const RULES: SelectionRules = {
  minPanels: SMASH_PANELS,
  maxPanels: EIGHT_PLAYER_PANELS,
  startingPanels: ["human", "off", "off", "off"],
};

const grid = computed(() =>
  wiiUGrid(props.roster.fighters.length + (props.roster.randomSlot ? 1 : 0), props.layout),
);

const fighterSlots = computed(() =>
  props.roster.fighters.map((fighter, index) => ({
    fighter,
    label: wiiUSlotLabel(fighter.name),
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

/** Where a panel's token waits in it, with this many panels on screen. */
const tokenHome = (panel: number, panelCount: number) =>
  wiiUTokenHome(wiiUPanels(panelCount, props.layout)[panel]!);

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

const { playBack } = useScreenAudio({
  template: () => "smash-for-wii-u",
  selection,
  hand: hand.position,
  slots: () => grid.value.slots,
});
function back() {
  playBack();
  emit("back");
}

const panelBoxes = computed(() => wiiUPanels(selection.value.panels.length, props.layout));
const eightPlayer = computed(() => selection.value.panels.length > SMASH_PANELS);

/** The mode tab: Smash's four panels, or 8-Player Smash's eight. */
function switchMode() {
  const change = eightPlayer.value ? controls.removePanel : controls.addPanel;
  for (let panel = 0; panel < EIGHT_PLAYER_PANELS - SMASH_PANELS; panel++) change();
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
    if (!box) {
      const size = Math.min(44, panelBoxes.value[index]!.width * 0.3);
      return [{ index, slot: -1, size, ...tokenHome(index, panels.length), ...look(index) }];
    }

    const size = Math.min(44, box.height * 0.62);
    const count = slotOfPanel.filter((other) => other === slot).length;
    const order = placed.get(slot) ?? 0;
    placed.set(slot, order + 1);
    const step = count > 1 ? Math.min(size * 0.6, (box.width * 0.9 - size) / (count - 1)) : 0;
    const first = count > 1 ? box.x + box.width * 0.05 + size / 2 : box.x + box.width * 0.5;
    return [
      { index, slot, size, x: first + order * step, y: box.y + box.height * 0.45, ...look(index) },
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

/** The slot under the hand, which the game lights up. */
const pointedSlot = computed(() => {
  const { x, y } = hand.position.value;
  return grid.value.slots.findIndex(
    (box) => x >= box.x && x < box.x + box.width && y >= box.y && y < box.y + box.height,
  );
});

// A name too wide for its slot is squeezed sideways, as the game squeezes MR. GAME & WATCH.
const labels = ref<HTMLElement[]>([]);
async function squeezeLabels() {
  await nextTick();
  for (const label of labels.value) {
    const line = label.firstElementChild as HTMLElement | null;
    if (!line) continue;
    line.style.transform = "";
    const room = label.clientWidth;
    const natural = line.scrollWidth;
    if (natural > room) line.style.transform = `scaleX(${room / natural})`;
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
    class="wii-u"
    :style="{ '--pointer-colour': owner?.colour ?? '#e2232b' }"
    @pointermove="hand.follow"
    @pointerdown="hand.follow"
    @pointerleave="hand.leave"
    @keydown="controls.onKey"
  >
    <div class="backdrop" aria-hidden="true" />
    <div class="rays" aria-hidden="true" />
    <div
      class="band"
      aria-hidden="true"
      :style="{ top: `${layout.band.y}px`, height: `${layout.band.height}px` }"
    />
    <WiiUHeader :eight-player="eightPlayer" @back="back" @mode="switchMode" />

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
          <span ref="labels" class="label" aria-hidden="true">
            <span class="line">{{ label }}</span>
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
          <span class="question" aria-hidden="true">?</span>
          <span class="label" aria-hidden="true"><span class="line">RANDOM</span></span>
        </button>
      </li>
    </ol>

    <WiiUPanel
      v-for="(panel, index) in selection.panels"
      :key="index"
      :box="panelBoxes[index]!"
      :index="index"
      :panel="panel"
      :fighter="fighterOf(index)"
      @cycle="controls.cycleKind(index)"
    />

    <Transition name="banner">
      <WiiUBanner v-if="ready" :y="layout.bannerY" />
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
        <WiiUToken :colour="token.colour" :tag="token.tag" :size="token.size" />
      </button>
    </div>

    <WiiUHand
      v-show="hand.inside.value || hand.input.value !== 'mouse'"
      :position="hand.position.value"
      :input="hand.input.value"
      :owner="owner"
      :held="heldLook"
    />
  </div>
</template>

<style scoped>
.wii-u {
  position: absolute;
  inset: 0;
  overflow: hidden;
  font-family: "Rubik", "Arial Rounded MT Bold", "Arial Black", Arial, sans-serif;
  user-select: none;
}

/* The hand takes the place of the system cursor wherever there is a mouse to move it. */
@media (hover: hover) and (pointer: fine) {
  .wii-u,
  .wii-u :deep(*) {
    cursor: none;
  }
}

/* The game's sky: lilac at the top left, warming to peach at the bottom right. */
.backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 50% 40% at 18% 92%, rgb(120 150 230 / 45%), transparent 70%),
    radial-gradient(ellipse 60% 50% at 46% 58%, rgb(255 255 255 / 85%), transparent 70%),
    linear-gradient(160deg, #b9b3dc 0%, #d8d0e8 30%, #efe2e4 55%, #f6cfa8 80%, #f2b07a 100%);
}

/* Soft rays of light fanning out from behind the middle of the screen. */
.rays {
  position: absolute;
  inset: 0;
  background: repeating-conic-gradient(
    from 0deg at 46% 58%,
    rgb(255 255 255 / 0%) 0deg 7deg,
    rgb(255 255 255 / 28%) 9deg 11deg,
    rgb(255 255 255 / 0%) 13deg 19deg
  );
  mask-image: radial-gradient(ellipse 70% 70% at 46% 58%, #000 10%, transparent 80%);
}

/* The charcoal band behind the grid, edge to edge. */
.band {
  position: absolute;
  left: 0;
  right: 0;
  background: #1e1e1e;
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
  outline: 3px solid #fff;
  outline-offset: 3px;
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

/* Slots touch, a thin charcoal seam between them. */
.slot {
  position: absolute;
  box-sizing: border-box;
  padding: 1px;
  pointer-events: auto;
}

/* Each face is the game's orange sunburst, the fighter over it and the name along its foot. */
.slot-button {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  border: 0;
  background:
    repeating-conic-gradient(
      from 0deg at 50% 40%,
      rgb(255 255 255 / 0%) 0deg 10deg,
      rgb(255 236 150 / 35%) 10deg 20deg
    ),
    radial-gradient(circle at 50% 40%, #ffd65a, #f7a51e 60%, #e0800c);
  font: inherit;
}

/*
 * Until the game's own portraits are gathered the nearest game's stand in, and some print a name
 * along their foot, so the portrait is anchored at the top and its foot runs off the slot.
 */
.portrait {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 118%;
  object-fit: cover;
  object-position: 50% 0;
}

/* A fighter added by image fills the face with its crop. */
.portrait.cropped {
  height: 100%;
}

/* The slot under the hand lights up, ringed in the hand owner's colour. */
.pointed .slot-button {
  box-shadow: inset 0 0 0 3px var(--pointer-colour);
  filter: brightness(1.15);
}

.slot-button:focus-visible {
  outline: 3px solid #fff;
  outline-offset: -3px;
}

/* White capitals outlined in black, along the slot's foot. */
.label {
  position: absolute;
  inset: auto 3% 2%;
  display: flex;
  justify-content: center;
  color: #fff;
  font-size: min(calc(var(--slot-height) * 0.19), calc(var(--slot-width) * 0.14));
  font-weight: 800;
  line-height: 1;
}

.line {
  display: block;
  white-space: nowrap;
  transform-origin: 50% 50%;
  -webkit-text-stroke: calc(var(--slot-height) * 0.05) #1a1a1a;
  paint-order: stroke fill;
}

/* The random slot: grey, a white question mark across it. */
.random .slot-button {
  background: linear-gradient(180deg, #a8a8ac, #78787c);
}

.question {
  position: absolute;
  inset: 0 0 18%;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: calc(var(--slot-height) * 0.66);
  font-weight: 900;
  line-height: 1;
  -webkit-text-stroke: calc(var(--slot-height) * 0.04) #6a6a6e;
  paint-order: stroke fill;
}
</style>
