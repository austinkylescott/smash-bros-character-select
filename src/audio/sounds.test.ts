import { describe, expect, it } from "vite-plus/test";

import {
  addPanel,
  choose,
  cycleKind,
  grab,
  RANDOM,
  release,
  startSelection,
  type SelectionRules,
} from "../selection/selection";
import { handSounds, selectionSounds } from "./sounds";

const RULES: SelectionRules = { minPanels: 2, maxPanels: 8, startingPanels: ["human", "cpu"] };
const mario = { fighter: "mario" };
/** Two people, so one picking does not make the screen ready. */
const twoPlayers = () => startSelection({ ...RULES, startingPanels: ["human", "human"] });

describe("selection sounds", () => {
  it("plays the pick-up effect when the hand picks up a token", () => {
    const before = choose(startSelection(RULES), mario);

    expect(selectionSounds("ultimate", before, grab(before, 0))).toEqual([
      "ultimate/sound-effect/token-pick-up",
    ]);
  });

  it("plays the back effect when a held token is sent home", () => {
    const holding = twoPlayers();

    expect(selectionSounds("ultimate", holding, release(holding))).toEqual([
      "ultimate/sound-effect/back",
    ]);
  });

  it("plays the drop effect and the announcer's call when a token lands on a fighter", () => {
    const before = twoPlayers();

    expect(selectionSounds("ultimate", before, choose(before, mario))).toEqual([
      "ultimate/sound-effect/token-drop",
      "ultimate/announcer-line/mario",
    ]);
  });

  it("plays the Ready to Fight sound after the call when the last player picks", () => {
    const before = startSelection(RULES);
    const ready = choose(before, mario);
    const stillReady = choose(grab(ready, 1), { fighter: "luigi" });

    expect(selectionSounds("ultimate", before, ready)).toEqual([
      "ultimate/sound-effect/token-drop",
      "ultimate/announcer-line/mario",
      "ultimate/sound-effect/ready-to-fight",
    ]);
    expect(selectionSounds("ultimate", grab(ready, 1), stillReady)).toContain(
      "ultimate/sound-effect/ready-to-fight",
    );
    expect(selectionSounds("ultimate", ready, ready)).toEqual([]);
  });

  it("calls no name for the random slot, or for a fighter the game has no line for", () => {
    const before = twoPlayers();

    expect(selectionSounds("ultimate", before, choose(before, RANDOM))).toEqual([
      "ultimate/sound-effect/token-drop",
    ]);
    // Inkling is not in Melee, so Melee's announcer never recorded the name.
    expect(selectionSounds("melee", before, choose(before, { fighter: "inkling" }))).toEqual([
      "melee/sound-effect/token-drop",
    ]);
    expect(selectionSounds("melee", before, choose(before, { fighter: "my-own-fighter" }))).toEqual(
      ["melee/sound-effect/token-drop"],
    );
  });

  it("plays the panel effect, and no drop, when a panel is switched, added or removed", () => {
    const before = startSelection(RULES);
    const added = addPanel(before);

    // Player 2 goes from CPU to off, Player 1 from human to a CPU on the random slot.
    expect(selectionSounds("ultimate", before, cycleKind(before, 1))).toEqual([
      "ultimate/sound-effect/panel-toggle",
    ]);
    expect(selectionSounds("ultimate", before, cycleKind(before, 0))).toEqual([
      "ultimate/sound-effect/panel-toggle",
    ]);
    expect(selectionSounds("ultimate", before, added)).toEqual([
      "ultimate/sound-effect/panel-toggle",
    ]);
    expect(selectionSounds("ultimate", added, before)).toEqual([
      "ultimate/sound-effect/panel-toggle",
    ]);
  });
});

describe("the hand's sound", () => {
  const slots = [
    { x: 0, y: 0, width: 100, height: 100 },
    { x: 100, y: 0, width: 100, height: 100 },
  ];

  it("plays the move effect when the hand reaches a different slot", () => {
    expect(handSounds("brawl", slots, { x: 50, y: 50 }, { x: 150, y: 50 })).toEqual([
      "brawl/sound-effect/hand-move",
    ]);
    expect(handSounds("brawl", slots, { x: 50, y: 300 }, { x: 50, y: 50 })).toEqual([
      "brawl/sound-effect/hand-move",
    ]);
  });

  it("is quiet while the hand stays on one slot or off the grid", () => {
    expect(handSounds("brawl", slots, { x: 10, y: 10 }, { x: 90, y: 90 })).toEqual([]);
    expect(handSounds("brawl", slots, { x: 50, y: 50 }, { x: 50, y: 300 })).toEqual([]);
  });
});
