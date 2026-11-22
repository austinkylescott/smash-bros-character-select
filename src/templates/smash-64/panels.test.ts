import { describe, expect, it } from "vite-plus/test";

import { SMASH_64_UPRIGHT } from "./layout";
import { smash64Panels } from "./panels";

// Measured from docs/references/smash-64/, quadrupled for the 1280x960 stage.
const near = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected), `${actual} is not near ${expected}`).toBeLessThanOrEqual(4);

describe("Smash 64 player panels", () => {
  it("puts the four panels where the reference screen has them", () => {
    const panels = smash64Panels();

    expect(panels).toHaveLength(4);
    for (const [index, left] of [88, 364, 640, 916].entries()) {
      near(panels[index]!.x, left);
      near(panels[index]!.width, 264);
      near(panels[index]!.y, 500);
      near(panels[index]!.y + panels[index]!.height, 862);
    }
  });

  it("puts the four panels in one row below the grid on a phone held upright", () => {
    const panels = smash64Panels(SMASH_64_UPRIGHT);
    const { gridArea, stage } = SMASH_64_UPRIGHT;

    for (const panel of panels) {
      expect(panel.y).toBeGreaterThanOrEqual(gridArea.y + gridArea.height);
      expect(panel.y + panel.height).toBeLessThanOrEqual(stage.height);
      expect(panel.y).toBe(panels[0]!.y);
    }
  });
});
