import { describe, expect, it } from "vite-plus/test";

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
