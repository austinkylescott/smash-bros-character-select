<script setup lang="ts">
// Rubik stands in for the blocky sans Melee's menus are set in.
import "@fontsource/rubik/700.css";
import "@fontsource/rubik/800.css";
import "@fontsource/rubik/900.css";
import "@fontsource/rubik/900-italic.css";
import { computed, nextTick, onMounted, ref, watch } from "vue";

import { useScreenAudio } from "../../audio";
import type { Box } from "../../selection/navigate";
import { type Pick, RANDOM, type SelectionRules } from "../../selection/selection";
import { useSelectionControls } from "../../selection/useSelectionControls";
import CroppedImage from "../../portraits/CroppedImage.vue";
import type { ScreenRoster } from "../screen";
import { meleeGrid } from "./grid";
import { meleeSlotLabel } from "./label";
import type { MeleeLayout } from "./layout";
import MeleeBanner from "./MeleeBanner.vue";
import MeleeHand from "./MeleeHand.vue";
import MeleeHeader from "./MeleeHeader.vue";
import MeleePanel from "./MeleePanel.vue";
import MeleeToken from "./MeleeToken.vue";
import { meleePanels, meleeTokenHome, PANEL_COUNT } from "./panels";
import { playerColour, playerTag } from "./players";

/**
 * The Melee template: renders any roster as Melee's character select screen, on whichever stage
 * the layout gives. Swapping the layout keeps every pick.
 *
 * Melee had no random slot. When a roster switches one on, it is drawn as one of the "?" slots
 * Melee shows for fighters not yet unlocked, with "RANDOM" on its name strip: Melee's own sign
 * for a fighter you cannot see, labelled so it is not mistaken for a locked one.
 */
const props = defineProps<{ roster: ScreenRoster; layout: MeleeLayout }>();
const emit = defineEmits<{ back: [] }>();

/** Melee always shows its four ports. Player 1 starts joined; the rest are N/A until switched. */
const RULES: SelectionRules = {
  minPanels: PANEL_COUNT,
  maxPanels: PANEL_COUNT,
  startingPanels: ["human", "off", "off", "off"],
};

const grid = computed(() =>
  meleeGrid(props.roster.fighters.length + (props.roster.randomSlot ? 1 : 0), props.layout),
);
const panelBoxes = computed(() => meleePanels(props.layout));

const fighterSlots = computed(() =>
  props.roster.fighters.map((fighter, index) => ({
    fighter,
    lines: meleeSlotLabel(fighter.name),
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

const tokenHome = (panel: number) => meleeTokenHome(panelBoxes.value[panel]!);

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
  template: () => "melee",
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
    if (!box) return [{ index, slot: -1, size: 60, ...tokenHome(index), ...look(index) }];

    const size = Math.min(60, box.height * 0.5);
    const count = slotOfPanel.filter((other) => other === slot).length;
    const order = placed.get(slot) ?? 0;
    placed.set(slot, order + 1);
    const step = count > 1 ? Math.min(size * 0.6, (box.width * 0.9 - size) / (count - 1)) : 0;
    const first = count > 1 ? box.x + box.width * 0.05 + size / 2 : box.x + box.width * 0.5;
    return [
      { index, slot, size, x: first + order * step, y: box.y + box.height * 0.42, ...look(index) },
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

// A name too wide for its strip is squeezed sideways, as Melee squeezes GANONDORF.
const labels = ref<HTMLElement[]>([]);
const randomLabel = ref<HTMLElement | null>(null);
async function squeezeLabels() {
  await nextTick();
  for (const label of [...labels.value, ...(randomLabel.value ? [randomLabel.value] : [])]) {
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
    class="melee"
    @pointermove="hand.follow"
    @pointerdown="hand.follow"
    @pointerleave="hand.leave"
    @keydown="controls.onKey"
  >
    <div class="backdrop" aria-hidden="true" />
    <div
      class="floor"
      aria-hidden="true"
      :style="{ top: `${layout.panelBand.y + layout.panelBand.height + 6}px` }"
    />
    <MeleeHeader @back="back" />

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
          <span class="face">
            <CroppedImage
              v-if="fighter.crops"
              class="cropped"
              :src="fighter.portrait"
              :image="fighter.crops"
              :crop="fighter.crops.slot"
            />
            <img v-else class="portrait" :src="fighter.portrait" alt="" draggable="false" />
            <span ref="labels" class="label" :class="{ two: lines.length > 1 }" aria-hidden="true">
              <span v-for="line in lines" :key="line" class="line">{{ line }}</span>
            </span>
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
          <span class="face">
            <span class="question" aria-hidden="true">?</span>
            <span ref="randomLabel" class="label" aria-hidden="true">
              <span class="line">RANDOM</span>
            </span>
          </span>
        </button>
      </li>
    </ol>

    <MeleePanel
      v-for="(panel, index) in selection.panels"
      :key="index"
      :box="panelBoxes[index]!"
      :index="index"
      :panel="panel"
      :fighter="fighterOf(index)"
      @cycle="controls.cycleKind(index)"
    />

    <Transition name="banner">
      <MeleeBanner v-if="ready" :y="layout.bannerY" />
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
        <MeleeToken :colour="token.colour" :tag="token.tag" :size="token.size" />
      </button>
    </div>

    <MeleeHand
      v-show="hand.inside.value || hand.input.value !== 'mouse'"
      :position="hand.position.value"
      :input="hand.input.value"
      :owner="owner"
      :held="heldLook"
    />
  </div>
</template>

<style scoped>
.melee {
  --melee-font: "Rubik", "Arial Black", "Helvetica Neue", Arial, sans-serif;
  position: absolute;
  inset: 0;
  overflow: hidden;
  font-family: var(--melee-font);
  user-select: none;
}

/* The hand takes the place of the system cursor wherever there is a mouse to move it. */
@media (hover: hover) and (pointer: fine) {
  .melee,
  .melee :deep(*) {
    cursor: none;
  }
}

/* Slate above the header's sweep, deep navy below, crossed by faint diagonal light. */
.backdrop {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, #4a5462 0 120px, transparent 120px),
    linear-gradient(
      152deg,
      transparent 0 30%,
      rgb(80 110 150 / 12%) 30% 44%,
      transparent 44% 62%,
      rgb(80 110 150 / 8%) 62% 70%,
      transparent 70%
    ),
    radial-gradient(ellipse at 30% 60%, #122440 0%, #0a1528 55%, #050c1a 100%);
}

/* The slate floor the panels stand on. */
.floor {
  position: absolute;
  inset: auto 0 0;
  border-top: 3px solid #8d97a6;
  background: linear-gradient(180deg, #56616f, #48525f);
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

/* Slots touch; each draws its own rounded metal rim inside its box. */
.slot {
  position: absolute;
  box-sizing: border-box;
  padding: calc(var(--slot-width) * 0.02);
  pointer-events: auto;
}

.slot-button {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  padding: calc(var(--slot-width) * 0.03);
  border: 0;
  border-radius: calc(var(--slot-width) * 0.06);
  background: linear-gradient(180deg, #c4c9d1, #8c93a0);
  box-shadow: 0 0 0 1px #071022;
  font: inherit;
}

.slot-button:focus-visible {
  outline: 4px solid #fff;
  outline-offset: 0;
  background: linear-gradient(180deg, #fff38a, #e8b812);
}

.face {
  position: relative;
  display: block;
  height: 100%;
  overflow: hidden;
  border-radius: calc(var(--slot-width) * 0.03);
  background:
    repeating-linear-gradient(180deg, rgb(255 255 255 / 7%) 0 2px, transparent 2px 6px),
    linear-gradient(180deg, #5d7392, #3a4a63);
}

/*
 * Official Melee portraits carry their name along their bottom third, on one line or two. Only
 * their top two thirds are shown, above the name strip, so the printed name never shows.
 */
.portrait {
  display: block;
  width: 100%;
  height: 120%;
  object-fit: cover;
  object-position: 50% 0;
}

/* A fighter added by image has no printed name to hide: its crop fills the face above the label. */
.cropped {
  position: absolute;
  inset: 0 0 24%;
  display: block;
  width: 100%;
  height: 76%;
}

.label {
  position: absolute;
  inset: auto 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 24%;
  padding: 0 calc(var(--slot-width) * 0.03);
  background: linear-gradient(180deg, #3a0c0c, #1c0404);
  color: #e6dcdc;
  font-size: calc(var(--slot-width) * 0.15);
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 0.95;
  text-align: center;
  text-shadow: 0 1px 0 #000;
}

.label.two {
  height: 34%;
  font-size: calc(var(--slot-width) * 0.135);
  letter-spacing: 0.02em;
}

.line {
  display: block;
  white-space: nowrap;
  transform-origin: 50% 50%;
}

/* The random slot, drawn as one of Melee's locked "?" slots. */
.random .face {
  background:
    repeating-linear-gradient(180deg, rgb(0 0 0 / 5%) 0 2px, transparent 2px 6px),
    radial-gradient(ellipse at 50% 45%, #dfe3e8 0%, #aab3bc 45%, #5f6b76 100%);
}

.question {
  position: absolute;
  inset: 0 0 24%;
  display: grid;
  place-items: center;
  color: #5c3c44;
  font-size: calc(var(--slot-width) * 0.7);
  font-weight: 900;
  line-height: 1;
  transform: skewX(-6deg);
}
</style>
