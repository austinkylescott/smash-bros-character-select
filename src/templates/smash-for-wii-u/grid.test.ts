import { describe, expect, it } from "vite-plus/test";

import { fitStage } from "../stage";
import { wiiUGrid } from "./grid";
import { WII_U_LANDSCAPE, WII_U_UPRIGHT } from "./layout";

// Expected positions are measured from the reference screenshots in docs/references/smash-4-wii-u/.
// The stage is the game's own 1280x720, so the full roster's screenshot needs no scaling; the
// others are scaled to 1280 wide. Measurements are good to a few pixels.
const near = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected), `${actual} is not near ${expected}`).toBeLessThanOrEqual(4);

const rowLengths = (slots: readonly { y: number }[]) => {
  const rows = new Map<number, number>();
  for (const { y } of slots) rows.set(y, (rows.get(y) ?? 0) + 1);
  return [...rows.values()];
};

describe("Smash for Wii U fighter grid", () => {
  it("lays out the full screen: 56 fighters and Random in rows of 12, 12, 11, 11 and 11", () => {
    const grid = wiiUGrid(57);

    expect(rowLengths(grid.slots)).toEqual([12, 12, 11, 11, 11]);
    // Mario, top left.
    near(grid.slots[0]!.x, 88);
    near(grid.slots[0]!.y, 92);
    near(grid.slots[0]!.width, 92);
    near(grid.slots[0]!.height, 60);
    // Little Mac ends the first row.
    near(grid.slots[11]!.x + grid.slots[11]!.width, 1192);
    // Duck Hunt opens the third row, which is a slot shorter and centred under the first two.
    near(grid.slots[24]!.x, 134);
    // Random, bottom right.
    near(grid.slots[56]!.x + grid.slots[56]!.width, 1146);
    near(grid.slots[56]!.y + grid.slots[56]!.height, 392);
  });

  it("lays out the launch roster: 51 fighters and Random in four rows of 13, edge to edge", () => {
    const grid = wiiUGrid(52);

    expect(rowLengths(grid.slots)).toEqual([13, 13, 13, 13]);
    near(grid.slots[0]!.x, 26);
    near(grid.slots[12]!.x + grid.slots[12]!.width, 1254);
    near(grid.slots[0]!.height, 75);
  });

  it("lays out the starter screen with its big slots, four rows filling the band", () => {
    const grid = wiiUGrid(41);

    expect(rowLengths(grid.slots)).toHaveLength(4);
    near(grid.slots[0]!.width, 99.5);
    near(grid.slots[0]!.height, 75);
    near(grid.slots[0]!.y, 92);
  });

  it("never grows a slot past the starter screen's, however few fighters there are", () => {
    const grid = wiiUGrid(2);

    expect(rowLengths(grid.slots)).toEqual([2]);
    near(grid.slots[0]!.width, 99.5);
    near(grid.slots[0]!.height, 75);
  });

  it("puts the longer rows first and centres every row", () => {
    const { slots } = wiiUGrid(10);
    const lengths = rowLengths(slots);

    expect(lengths).toEqual([...lengths].sort((a, b) => b - a));
    expect(Math.max(...lengths) - Math.min(...lengths)).toBeLessThanOrEqual(1);
    const centre = WII_U_LANDSCAPE.gridArea.x + WII_U_LANDSCAPE.gridArea.width / 2;
    const last = slots.at(-1)!;
    const firstOfLastRow = slots.find((slot) => slot.y === last.y)!;
    near((firstOfLastRow.x + last.x + last.width) / 2, centre);
  });

  it.each([1, 13, 57, 60, 101, 121])(
    "keeps %i slots between the game's two shapes, inside the dark band",
    (count) => {
      const { slots } = wiiUGrid(count);

      expect(slots).toHaveLength(count);
      for (const slot of slots) {
        const aspect = slot.width / slot.height;
        expect(aspect).toBeGreaterThanOrEqual(1228 / 13 / 75 - 1e-9);
        expect(aspect).toBeLessThanOrEqual(92 / 60 + 1e-9);
        expect(slot.x).toBeGreaterThanOrEqual(26 - 1e-9);
        expect(slot.x + slot.width).toBeLessThanOrEqual(1254 + 1e-9);
        expect(slot.y).toBeGreaterThanOrEqual(92 - 1e-9);
        expect(slot.y + slot.height).toBeLessThanOrEqual(392 + 1e-9);
      }
    },
  );

  it("keeps a 100-fighter roster legible: slots at least two thirds as wide as the game's own", () => {
    const { slots } = wiiUGrid(101);

    expect(slots[0]!.width).toBeGreaterThanOrEqual(61);
    expect(slots[0]!.height).toBeGreaterThanOrEqual(40);
  });

  it("rejects an empty grid", () => {
    expect(() => wiiUGrid(0)).toThrow(/at least one slot/);
  });
});

describe("Smash for Wii U fighter grid on a phone held upright", () => {
  // A 360x640 phone, less the browser's address and navigation bars.
  const phone = fitStage({ width: 360, height: 560 }, WII_U_UPRIGHT.stage);

  it.each([57, 60, 121])("keeps every one of %i slots big enough to tap at 360px wide", (count) => {
    const { slots } = wiiUGrid(count, WII_U_UPRIGHT);

    for (const slot of slots) {
      // In CSS pixels on the phone: at least WCAG's 24px minimum target size.
      expect(slot.width * phone.scale).toBeGreaterThanOrEqual(24);
      expect(slot.height * phone.scale).toBeGreaterThanOrEqual(24);
    }
  });

  it.each([1, 57, 121])("fits %i slots across the stage, above the player panels", (count) => {
    const { slots } = wiiUGrid(count, WII_U_UPRIGHT);

    for (const slot of slots) {
      expect(slot.x).toBeGreaterThanOrEqual(0);
      expect(slot.x + slot.width).toBeLessThanOrEqual(WII_U_UPRIGHT.stage.width + 1e-9);
      expect(slot.y).toBeGreaterThanOrEqual(92);
      expect(slot.y + slot.height).toBeLessThanOrEqual(WII_U_UPRIGHT.panelBand.y + 1e-9);
    }
  });

  it("gives the game's own roster bigger slots than on its own screen", () => {
    expect(wiiUGrid(57, WII_U_UPRIGHT).slots[0]!.width).toBeGreaterThan(150);
  });
});
