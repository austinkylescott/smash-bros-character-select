import { describe, expect, it } from "vite-plus/test";

import { officialRosters } from "../official";
import { officialFighters } from "../official";
import {
  addFighter,
  canAddFighter,
  copyOfOfficial,
  moveFighter,
  nameFighter,
  newRoster,
  removeFighter,
  rosterProblems,
  type Roster,
} from "./roster";

/** A roster of this many fighters. There are fewer official fighters than the limit, so the ids are made up. */
const rosterOf = (count: number): Roster => ({
  ...newRoster("r1"),
  fighters: Array.from({ length: count }, (_, index) => ({ id: `fighter-${index}` })),
});

const ids = (roster: { fighters: readonly { id: string }[] }) =>
  roster.fighters.map((fighter) => fighter.id);

describe("starting a roster", () => {
  it("starts from scratch with no fighters", () => {
    const roster = newRoster("r1");

    expect(roster).toMatchObject({ id: "r1", description: "", fighters: [] });
    expect(roster.name).not.toBe("");
  });

  it("starts as a copy of an official roster, with its fighters, order and random slot", () => {
    const roster = copyOfOfficial("r1", officialRosters.brawl);

    expect(roster.id).toBe("r1");
    expect(roster.name).toBe("Copy of Brawl");
    expect(roster.randomSlot).toBe(true);
    expect(roster.defaultTemplate).toBe("brawl");
    expect(ids(roster).slice(0, 3)).toEqual(["mario", "donkey-kong", "link"]);
    expect(roster.fighters).toHaveLength(35);
  });
});

describe("adding a fighter", () => {
  it("puts the fighter at the end of the roster", () => {
    const roster = addFighter(addFighter(newRoster("r1"), "kirby"), "fox");

    expect(ids(roster)).toEqual(["kirby", "fox"]);
  });

  it("never holds the same fighter twice", () => {
    const roster = addFighter(newRoster("r1"), "kirby");

    expect(canAddFighter(roster, "kirby")).toBe(false);
    expect(ids(addFighter(roster, "kirby"))).toEqual(["kirby"]);
  });

  it("takes fighters up to 120 and no further", () => {
    const nearlyFull = rosterOf(119);
    expect(canAddFighter(nearlyFull, "kirby")).toBe(true);

    const full = addFighter(nearlyFull, "kirby");
    expect(full.fighters).toHaveLength(120);
    expect(canAddFighter(full, "fox")).toBe(false);
    expect(addFighter(full, "fox").fighters).toHaveLength(120);
  });

  it("takes only official fighters", () => {
    expect(canAddFighter(newRoster("r1"), "goku")).toBe(false);
    expect(addFighter(newRoster("r1"), "goku").fighters).toEqual([]);
    expect(officialFighters.every(({ id }) => canAddFighter(newRoster("r1"), id))).toBe(true);
  });
});

const trio = () => ["kirby", "fox", "ness"].reduce(addFighter, newRoster("r1"));

describe("removing a fighter", () => {
  it("takes the fighter out and keeps the others in order", () => {
    expect(ids(removeFighter(trio(), "fox"))).toEqual(["kirby", "ness"]);
  });

  it("lets a removed fighter be added again", () => {
    expect(canAddFighter(removeFighter(trio(), "fox"), "fox")).toBe(true);
  });
});

describe("reordering fighters", () => {
  it("moves a fighter later", () => {
    expect(ids(moveFighter(trio(), "kirby", 2))).toEqual(["fox", "ness", "kirby"]);
  });

  it("moves a fighter earlier", () => {
    expect(ids(moveFighter(trio(), "ness", 0))).toEqual(["ness", "kirby", "fox"]);
  });

  it("stops at the ends of the roster", () => {
    expect(ids(moveFighter(trio(), "fox", 99))).toEqual(["kirby", "ness", "fox"]);
    expect(ids(moveFighter(trio(), "fox", -1))).toEqual(["fox", "kirby", "ness"]);
  });

  it("leaves the roster alone when the fighter is not in it", () => {
    expect(ids(moveFighter(trio(), "mario", 0))).toEqual(["kirby", "fox", "ness"]);
  });
});

describe("editing a fighter's displayed name", () => {
  it("shows the edited name for that fighter only", () => {
    expect(nameFighter(trio(), "fox", "Star Fox").fighters).toEqual([
      { id: "kirby" },
      { id: "fox", name: "Star Fox" },
      { id: "ness" },
    ]);
  });

  it("goes back to the fighter's own name when the edit is cleared", () => {
    const renamed = nameFighter(trio(), "fox", "Star Fox");

    expect(nameFighter(renamed, "fox", "  ").fighters[1]).toEqual({ id: "fox" });
  });
});

describe("editing a fighter's displayed name to its own", () => {
  it("counts as no edit", () => {
    const renamed = nameFighter(trio(), "fox", "Star Fox");

    expect(nameFighter(renamed, "fox", "Fox").fighters[1]).toEqual({ id: "fox" });
  });
});

describe("whether a roster can be saved", () => {
  it("can be, with one fighter and a name", () => {
    expect(rosterProblems(addFighter(newRoster("r1"), "kirby"))).toEqual([]);
  });

  it("cannot be with no fighters", () => {
    expect(rosterProblems(newRoster("r1"))).toEqual(["A roster needs at least one fighter."]);
  });

  it("can be with 120 fighters, and cannot be with 121", () => {
    expect(rosterProblems(rosterOf(120))).toEqual([]);
    expect(rosterProblems(rosterOf(121))).toEqual(["A roster holds at most 120 fighters."]);
  });

  it("cannot be with the same fighter twice", () => {
    const twice: Roster = { ...newRoster("r1"), fighters: [{ id: "kirby" }, { id: "kirby" }] };

    expect(rosterProblems(twice)).toEqual(["A roster holds each fighter once."]);
  });

  it("cannot be without a name", () => {
    const unnamed = { ...addFighter(newRoster("r1"), "kirby"), name: "   " };

    expect(rosterProblems(unnamed)).toEqual(["A roster needs a name."]);
  });
});
