import { describe, expect, it } from "vite-plus/test";

import { officialRosters } from "../official";
import { officialFighters } from "../official";
import {
  addCustomFighter,
  addFighter,
  canAddFighter,
  copyOfOfficial,
  cropFighter,
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

/** An uploaded image, already resized: wider than tall. */
const upload = { image: "data:image/webp;base64,AAAA", width: 400, height: 200 };

describe("adding a fighter of one's own, by name and image", () => {
  it("puts the fighter at the end, with the image centre-cropped for the slot and the panel", () => {
    const roster = addCustomFighter(trio(), "custom-1", "  Goku ", upload);

    expect(ids(roster)).toEqual(["kirby", "fox", "ness", "custom-1"]);
    expect(roster.fighters[3]).toEqual({
      id: "custom-1",
      name: "Goku",
      portrait: {
        ...upload,
        // A 4:3 slot crop and a square panel crop, each as large as the image allows.
        slot: { x: expect.closeTo(200 / 3), y: 0, width: expect.closeTo(800 / 3), height: 200 },
        panel: { x: 100, y: 0, width: 200, height: 200 },
      },
    });
  });

  it("needs a name", () => {
    expect(addCustomFighter(trio(), "custom-1", "  ", upload)).toEqual(trio());
  });

  it("does not take a fighter when the roster is full", () => {
    expect(addCustomFighter(rosterOf(120), "custom-1", "Goku", upload).fighters).toHaveLength(120);
  });

  it("does not take an id already in the roster or belonging to an official fighter", () => {
    const once = addCustomFighter(trio(), "custom-1", "Goku", upload);

    expect(addCustomFighter(once, "custom-1", "Vegeta", upload)).toEqual(once);
    expect(addCustomFighter(trio(), "mario", "Goku", upload)).toEqual(trio());
  });

  it("can be saved, mixed with official fighters", () => {
    expect(rosterProblems(addCustomFighter(trio(), "custom-1", "Goku", upload))).toEqual([]);
  });

  it("can be moved and removed like any fighter", () => {
    const roster = addCustomFighter(trio(), "custom-1", "Goku", upload);

    expect(ids(moveFighter(roster, "custom-1", 0))).toEqual(["custom-1", "kirby", "fox", "ness"]);
    expect(ids(removeFighter(roster, "custom-1"))).toEqual(["kirby", "fox", "ness"]);
  });
});

describe("renaming a fighter of one's own", () => {
  const roster = addCustomFighter(trio(), "custom-1", "Goku", upload);

  it("changes the name it is shown with", () => {
    expect(nameFighter(roster, "custom-1", "Son Goku").fighters[3]).toMatchObject({
      name: "Son Goku",
    });
  });

  it("keeps its name when the new one is blank, as it has no other", () => {
    expect(nameFighter(roster, "custom-1", "  ").fighters[3]).toMatchObject({ name: "Goku" });
  });
});

describe("re-cropping a fighter of one's own", () => {
  const roster = addCustomFighter(trio(), "custom-1", "Goku", upload);
  const portrait = (each: Roster) => {
    const fighter = each.fighters[3];
    return fighter && "portrait" in fighter ? fighter.portrait : undefined;
  };

  it("changes the slot crop and leaves the panel crop", () => {
    const crop = { x: 0, y: 0, width: 200, height: 150 };
    const cropped = cropFighter(roster, "custom-1", "slot", crop);

    expect(portrait(cropped)?.slot).toEqual(crop);
    expect(portrait(cropped)?.panel).toEqual(portrait(roster)?.panel);
  });

  it("changes the panel crop and leaves the slot crop", () => {
    const crop = { x: 10, y: 20, width: 100, height: 100 };
    const cropped = cropFighter(roster, "custom-1", "panel", crop);

    expect(portrait(cropped)?.panel).toEqual(crop);
    expect(portrait(cropped)?.slot).toEqual(portrait(roster)?.slot);
  });

  it("refuses a crop that leaves the image", () => {
    expect(
      cropFighter(roster, "custom-1", "panel", { x: 300, y: 0, width: 200, height: 200 }),
    ).toBe(roster);
  });

  it("leaves official fighters alone, as they have no image to crop", () => {
    expect(cropFighter(roster, "kirby", "slot", { x: 0, y: 0, width: 10, height: 10 })).toBe(
      roster,
    );
  });
});
