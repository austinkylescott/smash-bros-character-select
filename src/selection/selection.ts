/**
 * Selection: who is playing, which fighter each player has picked, and the one hand that moves
 * tokens between them. Shared by every template; a template supplies only its panel rules.
 * Every function returns a new selection and leaves the one it was given untouched.
 */

/** A player panel is played by a person, by the computer, or is switched off. */
export type PanelKind = "human" | "cpu" | "off";

/** What a token sits on: a fighter, by id, or the random slot. */
export type Pick = { readonly fighter: string } | typeof RANDOM;
export const RANDOM = "random" as const;

export interface Panel {
  readonly kind: PanelKind;
  /** Where this panel's token sits, or null while it is in the hand or at home in the panel. */
  readonly pick: Pick | null;
}

/** How many player panels a template allows, and which it starts with. */
export interface SelectionRules {
  readonly minPanels: number;
  readonly maxPanels: number;
  readonly startingPanels: readonly PanelKind[];
}

export interface Selection {
  readonly rules: SelectionRules;
  readonly panels: readonly Panel[];
  /** The panel whose token the hand is holding, by index, or null for an empty hand. */
  readonly held: number | null;
}

/** A fresh screen: the first human holds their token; CPUs start on the random slot. */
export function startSelection(rules: SelectionRules): Selection {
  const panels = rules.startingPanels.map((kind): Panel => ({
    kind,
    pick: kind === "cpu" ? RANDOM : null,
  }));
  const firstHuman = panels.findIndex((panel) => panel.kind === "human");
  return { rules, panels, held: firstHuman === -1 ? null : firstHuman };
}

/** Everyone playing has a token on a fighter or the random slot, and there are at least two. */
export function isReady(selection: Selection): boolean {
  const playing = selection.panels.filter((panel) => panel.kind !== "off");
  return playing.length >= 2 && playing.every((panel) => panel.pick !== null);
}

const withPanel = (selection: Selection, index: number, panel: Panel): Selection["panels"] =>
  selection.panels.map((current, i) => (i === index ? panel : current));

/** Puts the held token on a fighter or the random slot. Does nothing with an empty hand. */
export function drop(selection: Selection, pick: Pick): Selection {
  const { held } = selection;
  if (held === null) return selection;
  return {
    ...selection,
    held: null,
    panels: withPanel(selection, held, { ...selection.panels[held]!, pick }),
  };
}

/**
 * Picks up a player's token from wherever it is, unpicking their fighter. A token already in
 * the hand goes home to its panel. Switched-off players have no token to pick up.
 */
export function grab(selection: Selection, index: number): Selection {
  const panel = selection.panels[index];
  if (!panel || panel.kind === "off") return selection;
  return {
    ...selection,
    held: index,
    panels: withPanel(selection, index, { ...panel, pick: null }),
  };
}

/**
 * What tapping a fighter or pressing Enter on it does: drops the held token there, or with an
 * empty hand moves the first human's token there, as the hand belongs to them.
 */
export function choose(selection: Selection, pick: Pick): Selection {
  if (selection.held !== null) return drop(selection, pick);
  const owner = selection.panels.findIndex((panel) => panel.kind === "human");
  if (owner === -1) return selection;
  return drop(grab(selection, owner), pick);
}

/** Sends the held token home to its panel, emptying the hand. */
export function release(selection: Selection): Selection {
  return selection.held === null ? selection : { ...selection, held: null };
}

/** Adds a CPU panel, its token on the random slot, unless the template allows no more. */
export function addPanel(selection: Selection): Selection {
  if (selection.panels.length >= selection.rules.maxPanels) return selection;
  return { ...selection, panels: [...selection.panels, { kind: "cpu", pick: RANDOM }] };
}

/** Removes the last panel, unless the template needs it. */
export function removePanel(selection: Selection): Selection {
  const { panels, held, rules } = selection;
  if (panels.length <= rules.minPanels) return selection;
  const last = panels.length - 1;
  return { ...selection, panels: panels.slice(0, last), held: held === last ? null : held };
}

const NEXT_KIND: Record<PanelKind, PanelKind> = { human: "cpu", cpu: "off", off: "human" };

/**
 * Switches a panel from human to CPU to off and round again. A CPU keeps the human's fighter, or
 * starts on the random slot; switching off takes the token off the screen and out of the hand.
 */
export function cycleKind(selection: Selection, index: number): Selection {
  const panel = selection.panels[index];
  if (!panel) return selection;
  const kind = NEXT_KIND[panel.kind];
  const held = selection.held === index;
  const pick = kind === "off" ? null : panel.pick;
  const next: Panel =
    kind === "cpu" && pick === null && !held ? { kind, pick: RANDOM } : { kind, pick };
  return {
    ...selection,
    held: kind === "off" && held ? null : selection.held,
    panels: withPanel(selection, index, next),
  };
}

/**
 * What pressing a player's token does, by click, tap or Enter. With a token in the hand, pressing
 * one that sits on a fighter drops the held token on that fighter too, since the press lands on
 * it; otherwise the hand picks the pressed token up.
 */
export function press(selection: Selection, index: number): Selection {
  const pick = selection.panels[index]?.pick;
  if (selection.held !== null && pick) return drop(selection, pick);
  return grab(selection, index);
}
