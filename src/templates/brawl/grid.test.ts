import { describe, expect, it } from "vite-plus/test";

import { fitStage } from "../stage";
import { brawlGrid } from "./grid";
import { BRAWL_UPRIGHT } from "./layout";

// Expected positions are measured from the reference screenshots in docs/references/brawl/,
// which are 640x480, doubled for the 1280x960 stage. Measurements are good to a few pixels.
const near = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected), `${actual} is not near ${expected}`).toBeLessThanOrEqual(4);

describe("Brawl fighter grid", () => {
  it("lays out the full screen: 35 fighters and Random in four rows of 9", () => {
    const grid = brawlGrid(36);

    expect(grid.columns).toBe(9);
    expect(grid.slots).toHaveLength(36);
    // Mario, top left.
    near(grid.slots[0]!.x, 78);
    near(grid.slots[0]!.y, 184);
    near(grid.slots[0]!.width, 125);
    near(grid.slots[0]!.height, 96);
    // Mr. Game & Watch ends the first row.
    near(grid.slots[8]!.x + grid.slots[8]!.width, 1202);
    // Random, bottom right.
    near(grid.slots[35]!.y, 472);
    near(grid.slots[35]!.y + grid.slots[35]!.height, 568);
  });

  it("lays out the starter screen: bigger slots in rows of 8, 8 and 6, centred", () => {
    const grid = brawlGrid(22);

    expect(grid.columns).toBe(8);
    near(grid.slots[0]!.x, 110);
    near(grid.slots[0]!.y, 192);
    near(grid.slots[0]!.width, 132);
    near(grid.slots[0]!.height, 123);
    near(grid.slots[8]!.y, 316);
    // King Dedede opens the short last row a slot in.
    near(grid.slots[16]!.x, 242);
    near(grid.slots[16]!.y, 438);
  });

  it("never grows a slot past the starter screen's, however few fighters there are", () => {
    const grid = brawlGrid(2);

    expect(grid.columns).toBe(2);
    expect(grid.slots[1]!.y).toBe(grid.slots[0]!.y);
    near(grid.slots[0]!.width, 132);
    near(grid.slots[0]!.height, 123);
  });

  it.each([1, 13, 36, 60, 101, 121])(
    "keeps %i slots between Brawl's two shapes, inside the band above the panels",
    (count) => {
      const { slots } = brawlGrid(count);

      expect(slots).toHaveLength(count);
      for (const slot of slots) {
        const aspect = slot.width / slot.height;
        expect(aspect).toBeGreaterThanOrEqual(132.5 / 123 - 1e-9);
        expect(aspect).toBeLessThanOrEqual(1124 / 9 / 96 + 1e-9);
        expect(slot.x).toBeGreaterThanOrEqual(78 - 1e-9);
        expect(slot.x + slot.width).toBeLessThanOrEqual(1202 + 1e-9);
        expect(slot.y).toBeGreaterThanOrEqual(184 - 1e-9);
        expect(slot.y + slot.height).toBeLessThanOrEqual(568 + 1e-9);
      }
    },
  );

  it("keeps a 100-fighter roster legible: slots at least half as wide as Brawl's own", () => {
    const { slots } = brawlGrid(101);

    expect(slots[0]!.width).toBeGreaterThanOrEqual(62);
    expect(slots[0]!.height).toBeGreaterThanOrEqual(44);
  });

  it("rejects an empty grid", () => {
    expect(() => brawlGrid(0)).toThrow(/at least one slot/);
  });
});

describe("Brawl fighter grid on a phone held upright", () => {
  // A 360x640 phone, less the browser's address and navigation bars.
  const phone = fitStage({ width: 360, height: 560 }, BRAWL_UPRIGHT.stage);

  it.each([36, 60, 121])("keeps every one of %i slots big enough to tap at 360px wide", (count) => {
    const { slots } = brawlGrid(count, BRAWL_UPRIGHT);

    for (const slot of slots) {
      // In CSS pixels on the phone: at least WCAG's 24px minimum target size.
      expect(slot.width * phone.scale).toBeGreaterThanOrEqual(24);
      expect(slot.height * phone.scale).toBeGreaterThanOrEqual(24);
    }
  });

  it.each([1, 36, 60, 121])("fits %i slots across the stage, above the player panels", (count) => {
    const { slots } = brawlGrid(count, BRAWL_UPRIGHT);

    for (const slot of slots) {
      expect(slot.x).toBeGreaterThanOrEqual(0);
      expect(slot.x + slot.width).toBeLessThanOrEqual(BRAWL_UPRIGHT.stage.width + 1e-9);
      expect(slot.y).toBeGreaterThanOrEqual(184);
      expect(slot.y + slot.height).toBeLessThanOrEqual(BRAWL_UPRIGHT.panelBand.y + 1e-9);
    }
  });

  it("gives Brawl's own roster bigger slots than on Brawl's screen", () => {
    expect(brawlGrid(36, BRAWL_UPRIGHT).slots[0]!.width).toBeGreaterThan(200);
  });
});
