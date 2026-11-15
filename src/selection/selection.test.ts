import { describe, expect, it } from "vite-plus/test";

import {
  addPanel,
  choose,
  cycleKind,
  drop,
  grab,
  isReady,
  press,
  RANDOM,
  release,
  removePanel,
  type SelectionRules,
  startSelection,
} from "./selection";

const ultimate: SelectionRules = { minPanels: 2, maxPanels: 8, startingPanels: ["human", "cpu"] };

describe("selection", () => {
  it("starts with Player 1's token in the hand and the CPU's token on the random slot", () => {
    const selection = startSelection(ultimate);

    expect(selection.held).toBe(0);
    expect(selection.panels).toEqual([
      { kind: "human", pick: null },
      { kind: "cpu", pick: RANDOM },
    ]);
    expect(isReady(selection)).toBe(false);
  });

  it("drops the held token on a fighter, picking it for that player and emptying the hand", () => {
    const selection = drop(startSelection(ultimate), { fighter: "mario" });

    expect(selection.held).toBeNull();
    expect(selection.panels[0]).toEqual({ kind: "human", pick: { fighter: "mario" } });
    expect(isReady(selection)).toBe(true);
  });

  it("picks up any player's token, unpicking that player's fighter", () => {
    const ready = drop(startSelection(ultimate), { fighter: "mario" });
    const selection = grab(ready, 1);

    expect(selection.held).toBe(1);
    expect(selection.panels[1]!.pick).toBeNull();
    expect(selection.panels[0]!.pick).toEqual({ fighter: "mario" });
    expect(isReady(selection)).toBe(false);
  });

  it("sends a held token home when the hand picks up another", () => {
    const selection = grab(startSelection(ultimate), 1);

    expect(selection.held).toBe(1);
    expect(selection.panels[0]).toEqual({ kind: "human", pick: null });
  });

  it("cannot pick up a switched-off player's token", () => {
    const off: SelectionRules = { ...ultimate, startingPanels: ["human", "off"] };
    const selection = startSelection(off);

    expect(grab(selection, 1)).toBe(selection);
  });

  it("chooses a fighter by dropping the held token there", () => {
    const selection = choose(grab(startSelection(ultimate), 1), { fighter: "kirby" });

    expect(selection.held).toBeNull();
    expect(selection.panels[1]!.pick).toEqual({ fighter: "kirby" });
  });

  it("chooses a fighter with an empty hand by moving the first human's token there", () => {
    const picked = drop(startSelection(ultimate), { fighter: "mario" });
    const selection = choose(picked, { fighter: "link" });

    expect(selection.held).toBeNull();
    expect(selection.panels[0]!.pick).toEqual({ fighter: "link" });
    expect(selection.panels[1]!.pick).toBe(RANDOM);
  });

  it("chooses nothing with an empty hand when nobody is human", () => {
    const cpus = startSelection({ ...ultimate, startingPanels: ["cpu", "cpu"] });

    expect(choose(cpus, { fighter: "link" })).toBe(cpus);
  });

  it("releases the held token back to its panel", () => {
    const selection = release(grab(startSelection(ultimate), 1));

    expect(selection.held).toBeNull();
    expect(selection.panels[1]!.pick).toBeNull();
  });

  it("adds panels as CPUs on the random slot, up to the template's limit", () => {
    let selection = startSelection(ultimate);
    for (let i = 0; i < 10; i++) selection = addPanel(selection);

    expect(selection.panels).toHaveLength(8);
    expect(selection.panels[7]).toEqual({ kind: "cpu", pick: RANDOM });
  });

  it("removes the last panel, down to the template's limit", () => {
    const four = addPanel(addPanel(startSelection(ultimate)));
    let selection = removePanel(four);

    expect(selection.panels).toHaveLength(3);
    for (let i = 0; i < 10; i++) selection = removePanel(selection);
    expect(selection.panels).toHaveLength(2);
  });

  it("empties the hand when the panel whose token it holds is removed", () => {
    const holding = grab(addPanel(startSelection(ultimate)), 2);
    const selection = removePanel(holding);

    expect(selection.held).toBeNull();
  });

  it("cycles a panel from human to CPU to off and back to human", () => {
    const start = startSelection(ultimate);
    const kinds = [];
    let selection = start;
    for (let i = 0; i < 3; i++) {
      selection = cycleKind(selection, 1);
      kinds.push(selection.panels[1]!.kind);
    }

    expect(kinds).toEqual(["off", "human", "cpu"]);
  });

  it("keeps a player's fighter when they become a CPU, and puts an unplaced CPU on random", () => {
    const picked = drop(startSelection(ultimate), { fighter: "mario" });
    expect(cycleKind(picked, 0).panels[0]).toEqual({ kind: "cpu", pick: { fighter: "mario" } });

    const unplaced = release(startSelection(ultimate));
    expect(cycleKind(unplaced, 0).panels[0]).toEqual({ kind: "cpu", pick: RANDOM });
  });

  it("takes a switched-off player's token off the screen, and out of the hand", () => {
    const asCpu = cycleKind(startSelection(ultimate), 0);
    expect(asCpu.held).toBe(0);

    const selection = cycleKind(asCpu, 0);
    expect(selection.panels[0]).toEqual({ kind: "off", pick: null });
    expect(selection.held).toBeNull();
  });

  it("comes back from off as a human with their token at home", () => {
    const off = cycleKind(startSelection(ultimate), 1);
    expect(cycleKind(off, 1).panels[1]).toEqual({ kind: "human", pick: null });
  });

  it("shows the banner when an unpicked player is switched off, and clears it when they return", () => {
    const three = addPanel(drop(startSelection(ultimate), { fighter: "mario" }));
    const unpicked = release(grab(three, 2));
    expect(isReady(unpicked)).toBe(false);

    const switchedOff = cycleKind(unpicked, 2);
    expect(isReady(switchedOff)).toBe(true);
    expect(isReady(cycleKind(switchedOff, 2))).toBe(false);
  });

  it("needs at least two players for the banner", () => {
    const alone = cycleKind(cycleKind(drop(startSelection(ultimate), { fighter: "mario" }), 1), 1);

    expect(alone.panels[1]!.kind).toBe("human");
    expect(isReady(cycleKind(cycleKind(alone, 1), 1))).toBe(false);
  });

  it("presses a token with an empty hand to pick it up", () => {
    const picked = drop(startSelection(ultimate), { fighter: "mario" });

    expect(press(picked, 1).held).toBe(1);
  });

  it("presses a token on a fighter while holding one to drop the held token on that fighter", () => {
    const selection = press(startSelection(ultimate), 1);

    expect(selection.held).toBeNull();
    expect(selection.panels[0]!.pick).toBe(RANDOM);
    expect(selection.panels[1]!.pick).toBe(RANDOM);
  });

  it("presses a token waiting in its panel while holding one to swap them", () => {
    const twoHumans = startSelection({ ...ultimate, startingPanels: ["human", "human"] });
    const selection = press(twoHumans, 1);

    expect(selection.held).toBe(1);
    expect(selection.panels[0]!.pick).toBeNull();
  });
});
