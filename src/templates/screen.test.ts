import { describe, expect, it } from "vite-plus/test";

import { officialRosters } from "../official";
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
});
