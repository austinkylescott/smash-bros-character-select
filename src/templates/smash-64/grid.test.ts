import { describe, expect, it } from "vite-plus/test";

import { fitStage } from "../stage";
import { smash64Grid } from "./grid";
import { SMASH_64_UPRIGHT } from "./layout";

// Expected positions are measured from the reference screenshots in docs/references/smash-64/,
// which are the game's own 320x240, quadrupled for the 1280x960 stage. Good to a few pixels.
const near = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected), `${actual} is not near ${expected}`).toBeLessThanOrEqual(4);

describe("Smash 64 fighter grid", () => {
  it("lays out the game's screen: 12 fighters in two rows of 6", () => {
    const grid = smash64Grid(12);

    expect(grid.columns).toBe(6);
    expect(grid.slots).toHaveLength(12);
    // Luigi, top left.
    near(grid.slots[0]!.x, 96);
    near(grid.slots[0]!.y, 140);
    near(grid.slots[0]!.width, 181);
    near(grid.slots[0]!.height, 172);
    // Captain Falcon ends the first row.
    near(grid.slots[5]!.x + grid.slots[5]!.width, 1180);
    // Jigglypuff, bottom right.
    near(grid.slots[11]!.y, 312);
    near(grid.slots[11]!.y + grid.slots[11]!.height, 484);
  });

  it("never grows a slot past the game's own, and centres a short row", () => {
    const grid = smash64Grid(2);

    expect(grid.columns).toBe(2);
    expect(grid.slots[1]!.y).toBe(grid.slots[0]!.y);
    near(grid.slots[0]!.width, 181);
    near(grid.slots[0]!.height, 172);
    near(grid.slots[0]!.x, 640 - 181);
  });

  it.each([1, 13, 36, 60, 101, 121])(
    "keeps %i slots in the game's proportions, inside the band above the panels",
    (count) => {
      const { slots } = smash64Grid(count);

      expect(slots).toHaveLength(count);
      for (const slot of slots) {
        expect(slot.width / slot.height).toBeCloseTo(1084 / 6 / 172);
        expect(slot.x).toBeGreaterThanOrEqual(96 - 1e-9);
        expect(slot.x + slot.width).toBeLessThanOrEqual(1180 + 1e-9);
        expect(slot.y).toBeGreaterThanOrEqual(140 - 1e-9);
        expect(slot.y + slot.height).toBeLessThanOrEqual(484 + 1e-9);
      }
    },
  );

  it("keeps a 100-fighter roster legible: slots a third of the game's own size", () => {
    const { slots } = smash64Grid(101);

    expect(slots[0]!.width).toBeGreaterThanOrEqual(60);
    expect(slots[0]!.height).toBeGreaterThanOrEqual(57);
  });

  it("rejects an empty grid", () => {
    expect(() => smash64Grid(0)).toThrow(/at least one slot/);
  });
});

describe("Smash 64 fighter grid on a phone held upright", () => {
  // A 360x640 phone, less the browser's address and navigation bars.
  const phone = fitStage({ width: 360, height: 560 }, SMASH_64_UPRIGHT.stage);

  it.each([12, 60, 121])("keeps every one of %i slots big enough to tap at 360px wide", (count) => {
    const { slots } = smash64Grid(count, SMASH_64_UPRIGHT);

    for (const slot of slots) {
      // In CSS pixels on the phone: at least WCAG's 24px minimum target size.
      expect(slot.width * phone.scale).toBeGreaterThanOrEqual(24);
      expect(slot.height * phone.scale).toBeGreaterThanOrEqual(24);
    }
  });

  it.each([1, 12, 60, 121])("fits %i slots across the stage, above the player panels", (count) => {
    const { slots } = smash64Grid(count, SMASH_64_UPRIGHT);

    for (const slot of slots) {
      expect(slot.x).toBeGreaterThanOrEqual(0);
      expect(slot.x + slot.width).toBeLessThanOrEqual(SMASH_64_UPRIGHT.stage.width + 1e-9);
      expect(slot.y).toBeGreaterThanOrEqual(140);
      expect(slot.y + slot.height).toBeLessThanOrEqual(SMASH_64_UPRIGHT.panelBand.y + 1e-9);
    }
  });
});
