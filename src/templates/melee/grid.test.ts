import { describe, expect, it } from "vite-plus/test";

import { fitStage } from "../stage";
import { meleeGrid } from "./grid";
import { MELEE_UPRIGHT } from "./layout";

// Expected positions are measured from the reference screenshots in docs/references/melee/,
// which are 640x480, doubled for the 1280x960 stage. Measurements are good to a couple of pixels.
const near = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected), `${actual} is not near ${expected}`).toBeLessThanOrEqual(3);

describe("Melee fighter grid", () => {
  it("lays out the full screen: 25 fighters in rows of 9, 9 and 7", () => {
    const grid = meleeGrid(25);

    expect(grid.columns).toBe(9);
    expect(grid.slots).toHaveLength(25);
    // Dr. Mario, top left.
    near(grid.slots[0]!.x, 68);
    near(grid.slots[0]!.y, 144);
    near(grid.slots[0]!.width, 128);
    near(grid.slots[0]!.height, 120);
    // Ganondorf ends the first row.
    near(grid.slots[8]!.x + grid.slots[8]!.width, 1218);
    // Pichu opens the short last row, a slot in, so the row is centred.
    near(grid.slots[18]!.x, 196);
    near(grid.slots[18]!.y, 384);
  });

  it("lays out the starter screen: 14 fighters in two rows of 7, centred", () => {
    const grid = meleeGrid(14);

    expect(grid.columns).toBe(7);
    near(grid.slots[0]!.x, 194);
    near(grid.slots[0]!.y, 144);
    near(grid.slots[7]!.y, 264);
    near(grid.slots[0]!.width, 128);
  });

  it("never grows a slot past Melee's own size, however few fighters there are", () => {
    const grid = meleeGrid(2);

    expect(grid.columns).toBe(2);
    expect(grid.slots[1]!.y).toBe(grid.slots[0]!.y);
    near(grid.slots[0]!.width, 128);
    near(grid.slots[0]!.height, 120);
  });

  it.each([1, 26, 36, 60, 90, 121])(
    "keeps %i slots in Melee's proportions, inside the band above the panels",
    (count) => {
      const { slots } = meleeGrid(count);

      expect(slots).toHaveLength(count);
      for (const slot of slots) {
        expect(slot.width / slot.height).toBeCloseTo(1150 / 9 / 120);
        expect(slot.x).toBeGreaterThanOrEqual(68 - 1e-9);
        expect(slot.x + slot.width).toBeLessThanOrEqual(1218 + 1e-9);
        expect(slot.y).toBeGreaterThanOrEqual(144);
        expect(slot.y + slot.height).toBeLessThanOrEqual(504 + 1e-9);
      }
    },
  );

  it("keeps a 60-fighter roster legible: slots over half Melee's own size", () => {
    const { slots } = meleeGrid(60);

    expect(slots[0]!.width).toBeGreaterThanOrEqual(64);
    expect(slots[0]!.height).toBeGreaterThanOrEqual(60);
  });

  it("rejects an empty grid", () => {
    expect(() => meleeGrid(0)).toThrow(/at least one slot/);
  });
});

describe("Melee fighter grid on a phone held upright", () => {
  // A 360x640 phone, less the browser's address and navigation bars.
  const phone = fitStage({ width: 360, height: 560 }, MELEE_UPRIGHT.stage);

  it.each([25, 60, 121])("keeps every one of %i slots big enough to tap at 360px wide", (count) => {
    const { slots } = meleeGrid(count, MELEE_UPRIGHT);

    for (const slot of slots) {
      // In CSS pixels on the phone: at least WCAG's 24px minimum target size.
      expect(slot.width * phone.scale).toBeGreaterThanOrEqual(24);
      expect(slot.height * phone.scale).toBeGreaterThanOrEqual(24);
    }
  });

  it.each([1, 25, 60, 121])("fits %i slots across the stage, above the player panels", (count) => {
    const { slots } = meleeGrid(count, MELEE_UPRIGHT);

    for (const slot of slots) {
      expect(slot.x).toBeGreaterThanOrEqual(0);
      expect(slot.x + slot.width).toBeLessThanOrEqual(MELEE_UPRIGHT.stage.width + 1e-9);
      expect(slot.y).toBeGreaterThanOrEqual(144);
      expect(slot.y + slot.height).toBeLessThanOrEqual(MELEE_UPRIGHT.panelBand.y + 1e-9);
    }
  });

  it("gives Melee's own roster bigger slots than on Melee's screen", () => {
    expect(meleeGrid(25, MELEE_UPRIGHT).slots[0]!.width).toBeGreaterThan(200);
  });
});
