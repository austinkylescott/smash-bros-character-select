import { describe, expect, it } from "vite-plus/test";

import { addFighter, nameFighter, newRoster, type Roster } from "./roster";
import { createRosterStore, type RosterStorage } from "./store";

/** A browser's storage, which outlives the page. */
function browserStorage(): RosterStorage & { readonly items: Map<string, string> } {
  const items = new Map<string, string>();
  return {
    items,
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
  };
}

const roster = (id: string, ...fighters: string[]): Roster =>
  fighters.reduce(addFighter, { ...newRoster(id), name: `Roster ${id}` });

describe("rosters saved in the browser", () => {
  it("survive a page reload, whole", () => {
    const storage = browserStorage();
    const saved: Roster = {
      ...nameFighter(roster("r1", "kirby", "fox"), "fox", "Star Fox"),
      name: "Favourites",
      description: "The ones I play.",
      defaultTemplate: "melee",
      randomSlot: false,
    };
    createRosterStore(storage).save(saved);

    const afterReload = createRosterStore(storage);

    expect(afterReload.get("r1")).toEqual(saved);
    expect(afterReload.list()).toEqual([saved]);
  });

  it("keeps several rosters, the latest saved first", () => {
    const store = createRosterStore(browserStorage());
    store.save(roster("r1", "kirby"));
    store.save(roster("r2", "fox"));

    expect(store.list().map(({ id }) => id)).toEqual(["r2", "r1"]);
  });

  it("replaces a roster saved again, rather than keeping both", () => {
    const store = createRosterStore(browserStorage());
    store.save(roster("r1", "kirby"));
    store.save(roster("r2", "fox"));
    store.save(roster("r1", "kirby", "ness"));

    expect(store.list().map(({ id }) => id)).toEqual(["r1", "r2"]);
    expect(store.get("r1")?.fighters).toEqual([{ id: "kirby" }, { id: "ness" }]);
  });

  it("refuses a roster with no fighters, and keeps what was saved", () => {
    const store = createRosterStore(browserStorage());
    store.save(roster("r1", "kirby"));

    expect(() => store.save(roster("r1"))).toThrow("A roster needs at least one fighter.");
    expect(() => store.save(roster("r2"))).toThrow();
    expect(store.list()).toEqual([roster("r1", "kirby")]);
  });

  it("refuses a roster with the same fighter twice", () => {
    const store = createRosterStore(browserStorage());
    const twice = { ...roster("r1"), fighters: [{ id: "kirby" }, { id: "kirby" }] };

    expect(() => store.save(twice)).toThrow("A roster holds each fighter once.");
    expect(store.list()).toEqual([]);
  });

  it("refuses a roster with more than 120 fighters", () => {
    const store = createRosterStore(browserStorage());
    const tooMany = {
      ...roster("r1"),
      fighters: Array.from({ length: 121 }, (_, index) => ({ id: `fighter-${index}` })),
    };

    expect(() => store.save(tooMany)).toThrow("A roster holds at most 120 fighters.");
  });

  it("forgets a removed roster", () => {
    const storage = browserStorage();
    const store = createRosterStore(storage);
    store.save(roster("r1", "kirby"));
    store.save(roster("r2", "fox"));

    store.remove("r1");

    expect(createRosterStore(storage).list()).toEqual([roster("r2", "fox")]);
    expect(store.get("r1")).toBeUndefined();
  });

  it("has no rosters in a browser that has saved none", () => {
    expect(createRosterStore(browserStorage()).list()).toEqual([]);
  });

  it("has no rosters, and cannot save, where the browser gives no storage", () => {
    const store = createRosterStore(undefined);

    expect(store.list()).toEqual([]);
    expect(() => store.save(roster("r1", "kirby"))).toThrow("This browser cannot save rosters.");
  });

  it("has no rosters when what is stored cannot be read", () => {
    for (const stored of ["not json", "null", "{}", '{"version":1}', '{"version":1,"rosters":5}']) {
      const storage = browserStorage();
      storage.items.set("rosters", stored);

      expect(createRosterStore(storage).list(), stored).toEqual([]);
    }
  });

  it("leaves out a stored roster that breaks the rules, and keeps the rest", () => {
    const storage = browserStorage();
    const store = createRosterStore(storage);
    store.save(roster("good", "kirby"));
    const { rosters } = JSON.parse(storage.items.get("rosters")!) as { rosters: unknown[] };
    const good = rosters[0] as Roster;
    storage.items.set(
      "rosters",
      JSON.stringify({
        version: 1,
        rosters: [
          { ...good, id: "empty", fighters: [] },
          { ...good, id: "twice", fighters: [{ id: "kirby" }, { id: "kirby" }] },
          { ...good, id: "stranger", fighters: [{ id: "goku" }] },
          { ...good, id: "no-template", defaultTemplate: "smash-7" },
          { ...good, id: "odd-name", fighters: [{ id: "kirby", name: 7 }] },
          { ...good, id: 12 },
          "nonsense",
          null,
          good,
        ],
      }),
    );

    expect(createRosterStore(storage).list()).toEqual([roster("good", "kirby")]);
  });
});
