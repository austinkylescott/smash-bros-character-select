import { describe, expect, it } from "vite-plus/test";

import { PAGE_CAPACITY, smash3dsPages } from "./grid";
import { SMASH_3DS_LAYOUT } from "./layout";

// Expected positions are measured from the reference screenshots in docs/references/smash-4-3ds/,
// whose top screens are 400x240, tripled for the stage. Measurements are good to a few pixels.
const near = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected), `${actual} is not near ${expected}`).toBeLessThanOrEqual(6);

const { topScreen } = SMASH_3DS_LAYOUT;
const inside = (slot: { x: number; y: number; width: number; height: number }) => {
  expect(slot.x).toBeGreaterThanOrEqual(topScreen.x - 1e-6);
  expect(slot.y).toBeGreaterThanOrEqual(topScreen.y - 1e-6);
  expect(slot.x + slot.width).toBeLessThanOrEqual(topScreen.x + topScreen.width + 1e-6);
  expect(slot.y + slot.height).toBeLessThanOrEqual(topScreen.y + topScreen.height + 1e-6);
};

describe("Smash for 3DS fighter grid", () => {
  it("lays out the full screen: 49 fighters and Random, nine to a row, on one page", () => {
    const pages = smash3dsPages(49, true);

    expect(pages).toHaveLength(1);
    const [{ slots, button }] = pages as [(typeof pages)[0]];
    expect(button).toBeUndefined();
    expect(slots).toHaveLength(50);
    // Mario, top left, and Mr. Game & Watch ending the first row at the screen's edge.
    near(slots[0]!.x, 0);
    near(slots[0]!.y, 0);
    near(slots[0]!.width, 133);
    near(slots[0]!.height, 120);
    near(slots[8]!.x + slots[8]!.width, 1200);
    // The short last row of five is centred; Random ends it at the screen's foot.
    near(slots[45]!.x, 267);
    near(slots[49]!.y + slots[49]!.height, 720);
  });

  it("lays out the starter screen: bigger slots in rows of 8, the last row centred", () => {
    const [{ slots }] = smash3dsPages(36, true) as [ReturnType<typeof smash3dsPages>[0]];

    near(slots[0]!.width, 150);
    near(slots[0]!.height, 144);
    near(slots[8]!.y, 144);
    // Shulk opens the last row of five, a slot and a half in.
    near(slots[32]!.x, 225);
    near(slots[32]!.y, 576);
  });

  it("never grows a slot past the starter screen's, however few fighters there are", () => {
    const [{ slots }] = smash3dsPages(1, true) as [ReturnType<typeof smash3dsPages>[0]];

    expect(slots[1]!.y).toBe(slots[0]!.y);
    near(slots[0]!.width, 150);
    near(slots[0]!.height, 144);
  });

  it("keeps a full screen's worth on one page", () => {
    expect(smash3dsPages(PAGE_CAPACITY - 1, true)).toHaveLength(1);
    expect(smash3dsPages(PAGE_CAPACITY, false)).toHaveLength(1);
  });

  it("pages the game's Extra Fighters: 56 fighters split 49 and 7, each page with Random", () => {
    const [first, extra] = smash3dsPages(56, true);

    expect(first).toMatchObject({ first: 0, count: 49, random: true });
    expect(first!.slots).toHaveLength(50);
    // The first page keeps the full screen's grid; its last row runs in from the left.
    near(first!.slots[45]!.x, 0);
    near(first!.slots[45]!.y, 600);
    near(first!.slots[49]!.x, 533);
    expect(first!.button?.to).toBe("extra");
    near(first!.button!.box.x, 672);
    near(first!.button!.box.y, 609);

    // The Extra Fighters page: Mewtwo to Bayonetta and Random, four to a row, two rows deep.
    expect(extra).toMatchObject({ first: 49, count: 7, random: true });
    expect(extra!.slots).toHaveLength(8);
    near(extra!.slots[0]!.x, 0);
    near(extra!.slots[0]!.y, 0);
    near(extra!.slots[0]!.width, 300);
    near(extra!.slots[4]!.y, 300);
    expect(extra!.button?.to).toBe("original");
  });

  it("puts every fighter on exactly one page, with or without Random", () => {
    for (const random of [true, false]) {
      const pages = smash3dsPages(120, random);
      expect(pages.reduce((total, page) => total + page.count, 0)).toBe(120);
      expect(pages[1]!.first).toBe(pages[0]!.count);
      for (const page of pages) expect(page.slots).toHaveLength(page.count + (random ? 1 : 0));
    }
  });

  it.each([1, 13, 37, 50, 55, 101, 121])(
    "keeps %i slots inside the top screen, between the game's shapes, clear of the button",
    (slotCount) => {
      for (const page of smash3dsPages(slotCount - 1, true)) {
        for (const slot of page.slots) {
          inside(slot);
          const aspect = slot.width / slot.height;
          expect(aspect).toBeGreaterThanOrEqual(1 - 1e-6);
          expect(aspect).toBeLessThanOrEqual(400 / 9 / 40 + 1e-6);
          const button = page.button?.box;
          if (button)
            expect(
              slot.x + slot.width <= button.x + 1e-6 || slot.y + slot.height <= button.y + 1e-6,
            ).toBe(true);
        }
      }
    },
  );

  it("keeps a 120-fighter roster's slots big enough to tell apart", () => {
    for (const page of smash3dsPages(120, true)) {
      expect(page.slots[0]!.width).toBeGreaterThanOrEqual(90);
      expect(page.slots[0]!.height).toBeGreaterThanOrEqual(90);
    }
  });

  it("rejects a grid with no slots", () => {
    expect(() => smash3dsPages(0, false)).toThrow();
  });
});
