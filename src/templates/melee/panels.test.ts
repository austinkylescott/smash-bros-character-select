import { describe, expect, it } from "vite-plus/test";

import { MELEE_UPRIGHT } from "./layout";
import { meleePanels } from "./panels";

// Measured from docs/references/melee/, doubled for the 1280x960 stage.
const near = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected), `${actual} is not near ${expected}`).toBeLessThanOrEqual(3);

describe("Melee player panels", () => {
  it("lays out the four panels as the reference screen does", () => {
    const panels = meleePanels();

    expect(panels).toHaveLength(4);
    for (const [index, left] of [84, 366, 648, 928].entries()) {
      near(panels[index]!.x, left);
      near(panels[index]!.width, 267);
      // From the top of the tab to the foot of the frame.
      near(panels[index]!.y, 514);
      near(panels[index]!.y + panels[index]!.height, 900);
    }
  });

  it("puts the four panels in one row below the grid on a phone held upright", () => {
    const panels = meleePanels(MELEE_UPRIGHT);
    const { gridArea, stage } = MELEE_UPRIGHT;

    for (const panel of panels) {
      expect(panel.y).toBeGreaterThanOrEqual(gridArea.y + gridArea.height);
      expect(panel.y + panel.height).toBeLessThanOrEqual(stage.height);
      expect(panel.y).toBe(panels[0]!.y);
    }
  });
});
