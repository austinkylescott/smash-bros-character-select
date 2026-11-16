import { describe, expect, it } from "vite-plus/test";

import { officialRosters } from "../official";
import { addFighter, nameFighter, newRoster } from "../rosters/roster";
import { availableTemplates } from "./catalogue";
import { screenRoster } from "./screen";

const byAssetId = (id: string) => `asset:${id}`;

describe("what a template is given to render", () => {
  it("gives the Ultimate template the Ultimate roster, in order, with Ultimate portraits", () => {
    const roster = screenRoster(officialRosters.ultimate, "ultimate", byAssetId);

    expect(roster.randomSlot).toBe(true);
    expect(roster.fighters).toHaveLength(86);
    expect(roster.fighters[0]).toEqual({
      id: "mario",
      name: "Mario",
      portrait: "asset:ultimate/portrait/mario",
    });
    expect(roster.fighters.at(-1)).toEqual({
      id: "mii-gunner",
      name: "Mii Gunner",
      portrait: "asset:ultimate/portrait/mii-gunner",
    });
  });

  it("shows any roster in any template, with portraits from the template's game", () => {
    const roster = screenRoster(officialRosters["smash-64"], "ultimate", byAssetId);

    expect(roster.randomSlot).toBe(false);
    expect(roster.fighters[0]).toEqual({
      id: "luigi",
      name: "Luigi",
      portrait: "asset:ultimate/portrait/luigi",
    });
  });

  it("finds a portrait in the asset layer for every Ultimate fighter", () => {
    const roster = screenRoster(officialRosters.ultimate, "ultimate");

    for (const fighter of roster.fighters) expect(fighter.portrait, fighter.id).toMatch(/./);
  });

  it("gives the Melee template Melee's own portraits for the Melee roster", () => {
    const roster = screenRoster(officialRosters.melee, "melee", byAssetId);

    expect(roster.randomSlot).toBe(false);
    expect(roster.fighters).toHaveLength(25);
    expect(roster.fighters[0]!.portrait).toBe("asset:melee/portrait/dr-mario");
  });

  it("takes a portrait from the nearest game the asset layer has portraits for", () => {
    // Snake was in Brawl and Ultimate. Brawl is nearer Melee, but has no portraits gathered yet.
    const roster = screenRoster(officialRosters.ultimate, "melee", byAssetId);
    const snake = roster.fighters.find((fighter) => fighter.id === "snake");

    expect(snake?.portrait).toBe("asset:ultimate/portrait/snake");
  });

  it("finds a portrait in the asset layer for every fighter on a Melee screen", () => {
    const roster = screenRoster(officialRosters.ultimate, "melee");

    for (const fighter of roster.fighters) expect(fighter.portrait, fighter.id).toMatch(/./);
  });
});

describe("a fighter whose portrait has not been gathered for any game", () => {
  it("is still shown, with a stand-in portrait", () => {
    // Charizard stood alone only on the 3DS and Wii U, whose portraits are not gathered yet.
    for (const template of availableTemplates) {
      const roster = screenRoster(officialRosters["smash-for-wii-u"], template);
      const charizard = roster.fighters.find((fighter) => fighter.id === "charizard");

      expect(charizard?.portrait, template).toMatch(/./);
    }
  });
});

describe("what a template is given to render for a roster a user made", () => {
  const made = {
    ...nameFighter(["snake", "kirby"].reduce(addFighter, newRoster("r1")), "snake", "Solid Snake"),
    randomSlot: false,
  };

  it("gives the fighters in the roster's order, with an edited name in place of the fighter's own", () => {
    expect(screenRoster(made, "ultimate", byAssetId)).toEqual({
      randomSlot: false,
      fighters: [
        { id: "snake", name: "Solid Snake", portrait: "asset:ultimate/portrait/snake" },
        { id: "kirby", name: "Kirby", portrait: "asset:ultimate/portrait/kirby" },
      ],
    });
  });

  it("shows it in every available template, with that template's portraits", () => {
    const melee = screenRoster(made, "melee", byAssetId);
    expect(melee.fighters.map((fighter) => fighter.portrait)).toEqual([
      // Snake was never in Melee, so his portrait comes from the nearest game that has it.
      "asset:ultimate/portrait/snake",
      "asset:melee/portrait/kirby",
    ]);

    for (const template of availableTemplates) {
      const shown = screenRoster({ ...made, randomSlot: true }, template);
      expect(shown.randomSlot, template).toBe(true);
      expect(
        shown.fighters.map((fighter) => fighter.name),
        template,
      ).toEqual(["Solid Snake", "Kirby"]);
      for (const fighter of shown.fighters) expect(fighter.portrait, template).toMatch(/./);
    }
  });
});
