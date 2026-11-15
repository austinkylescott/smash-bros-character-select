import { describe, expect, it } from "vite-plus/test";

import type { Box } from "../../selection/navigate";
import { ULTIMATE_UPRIGHT } from "./layout";
import { ultimatePanels } from "./panels";

// Measured from docs/references/ultimate/, scaled to the 1920x1080 stage.
const near = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected), `${actual} is not near ${expected}`).toBeLessThanOrEqual(3);

describe("Ultimate player panels", () => {
  it("lays out two panels as the reference screen does", () => {
    const [p1, p2] = ultimatePanels(2);

    near(p1!.x, 14);
    near(p1!.x + p1!.width, 922);
    near(p2!.x, 930);
    near(p2!.x + p2!.width, 1840);
    near(p1!.y, 694);
    near(p1!.y + p1!.height, 1080);
  });

  it.each([2, 3, 4, 5, 6, 7, 8])(
    "fits %i panels side by side, left of the add and remove tabs",
    (count) => {
      const panels = ultimatePanels(count);

      expect(panels).toHaveLength(count);
      for (const [index, panel] of panels.entries()) {
        expect(panel.x).toBeGreaterThanOrEqual(14);
        expect(panel.x + panel.width).toBeLessThanOrEqual(1840 + 1e-9);
        expect(panel.width).toBeCloseTo(panels[0]!.width);
        const next = panels[index + 1];
        if (next) expect(next.x).toBeGreaterThan(panel.x + panel.width);
      }
    },
  );
});

describe("Ultimate player panels on a phone held upright", () => {
  const overlaps = (a: Box, b: Box) =>
    a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

  it("gives each of two players a panel as wide as on Ultimate's own screen, one above the other", () => {
    const [p1, p2] = ultimatePanels(2, ULTIMATE_UPRIGHT);

    expect(p1!.width).toBeGreaterThanOrEqual(909);
    expect(p2!.x).toBe(p1!.x);
    expect(p2!.y).toBeGreaterThan(p1!.y + p1!.height);
  });

  it.each([2, 3, 4, 5, 6, 7, 8])(
    "stacks %i panels under the grid, inside the stage and clear of the tabs",
    (count) => {
      const panels = ultimatePanels(count, ULTIMATE_UPRIGHT);
      const { stage, floorTop, tabs } = ULTIMATE_UPRIGHT;

      expect(panels).toHaveLength(count);
      for (const [index, panel] of panels.entries()) {
        // Panel contents are laid out on Ultimate's panel height.
        expect(panel.height).toBe(386);
        expect(panel.x).toBeGreaterThanOrEqual(0);
        expect(panel.x + panel.width).toBeLessThan(tabs.x);
        expect(panel.y).toBeGreaterThan(floorTop);
        expect(panel.y + panel.height).toBeLessThanOrEqual(stage.height + 1e-9);
        for (const other of panels.slice(index + 1)) expect(overlaps(panel, other)).toBe(false);
      }
    },
  );
});
