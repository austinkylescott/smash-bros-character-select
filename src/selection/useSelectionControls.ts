/**
 * The controls of a character select screen, for any template: the selection, the hand, and how
 * mouse, touch and keyboard drive them. A template supplies its panel rules and layout and wires
 * the handlers to its own elements.
 *
 * The markup contract: every slot's button carries `data-slot` with that slot's index, and every
 * token sitting on a slot carries `data-on-slot` with the same. Drops and focus find slots by them.
 */
import { computed, type Ref, ref, shallowRef, watch } from "vue";

import { type Box, type Direction, neighbour } from "./navigate";
import {
  addPanel,
  choose,
  cycleKind,
  drop,
  isReady,
  type Pick,
  press,
  RANDOM,
  release,
  removePanel,
  type Selection,
  type SelectionRules,
  startSelection,
} from "./selection";
import { type Point, useHand } from "./useHand";

export interface SelectionLayout {
  /** The screen's root element, which the hand moves over. */
  readonly root: Ref<HTMLElement | null>;
  /** The width of the template's stage, in its own pixels. */
  readonly stageWidth: number;
  readonly rules: SelectionRules;
  /** Each slot's box on the stage, in slot order. */
  readonly slots: () => readonly Box[];
  /** What each slot picks, in slot order. */
  readonly picks: () => readonly Pick[];
  /** Where a panel's token waits when it is neither held nor on a slot. */
  readonly homeOf: (panel: number, selection: Selection) => Point;
}

const ARROWS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

const samePick = (a: Pick, b: Pick) =>
  a === RANDOM || b === RANDOM ? a === b : a.fighter === b.fighter;

const centre = (box: Box): Point => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });

export function useSelectionControls(layout: SelectionLayout) {
  const { root, rules, slots, picks } = layout;

  const selection = shallowRef(startSelection(rules));
  const update = (change: (current: Selection) => Selection) => {
    selection.value = change(selection.value);
  };
  const ready = computed(() => isReady(selection.value));

  /** The slot a pick sits on, or -1 when this screen has no slot for it. */
  const slotOf = (pick: Pick) => picks().findIndex((slot) => samePick(slot, pick));

  // The hand starts on the first human's token, in their panel, as Ultimate's does.
  const firstHuman = selection.value.panels.findIndex((panel) => panel.kind === "human");
  const hand = useHand(
    root,
    layout.stageWidth,
    layout.homeOf(Math.max(0, firstHuman), selection.value),
  );

  /** The pick under a dropped token: a slot, or a token sitting on one. */
  function pickUnder(target: Element | null): Pick | undefined {
    const element = target?.closest<HTMLElement>("[data-slot], [data-on-slot]");
    const slot = element?.dataset.slot ?? element?.dataset.onSlot;
    return slot === undefined ? undefined : picks()[Number(slot)];
  }

  // Mouse and touch: press a token to pick it up, then drag it to a slot or tap one.
  function pressToken(panel: number, event: PointerEvent) {
    if (event.button !== 0) return;
    event.preventDefault();
    update((current) => press(current, panel));
    if (selection.value.held !== panel) return;
    hand.drag(event, (target) => {
      const pick = pickUnder(target);
      if (pick) update((current) => drop(current, pick));
    });
  }

  function chooseSlot(slot: number) {
    update((current) => choose(current, picks()[slot]!));
  }

  // Keyboard: arrows move between slots, Enter picks, Escape lets go of a held token.
  /** The slot that takes the grid's one tab stop. */
  const focused = ref(0);
  watch(
    () => picks().length,
    (count) => (focused.value = Math.max(0, Math.min(focused.value, count - 1))),
  );

  function focusSlot(slot: number) {
    focused.value = slot;
    root.value?.querySelector<HTMLElement>(`[data-slot="${slot}"]`)?.focus();
    hand.moveTo(centre(slots()[slot]!));
  }

  function onGridKey(event: KeyboardEvent) {
    const direction = ARROWS[event.key];
    if (!direction) return;
    event.preventDefault();
    focusSlot(neighbour(slots(), focused.value, direction));
  }

  function onSlotFocus(slot: number, event: FocusEvent) {
    focused.value = slot;
    if ((event.target as HTMLElement).matches(":focus-visible"))
      hand.moveTo(centre(slots()[slot]!));
  }

  function keyToken(panel: number) {
    const pick = selection.value.panels[panel]?.pick;
    update((current) => press(current, panel));
    const slot = pick ? slotOf(pick) : -1;
    focusSlot(slot === -1 ? focused.value : slot);
  }

  function onKey(event: KeyboardEvent) {
    if (event.key === "Escape") update(release);
  }

  return {
    selection,
    ready,
    hand,
    focused,
    slotOf,
    pressToken,
    keyToken,
    chooseSlot,
    onGridKey,
    onSlotFocus,
    onKey,
    addPanel: () => update(addPanel),
    removePanel: () => update(removePanel),
    cycleKind: (panel: number) => update((current) => cycleKind(current, panel)),
  };
}
