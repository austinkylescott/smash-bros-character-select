import { describe, expect, it } from "vite-plus/test";

import { BRAWL_UPRIGHT } from "./layout";
import { brawlPanels } from "./panels";

// Measured from docs/references/brawl/, doubled for the 1280x960 stage.
const near = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected), `${actual} is not near ${expected}`).toBeLessThanOrEqual(4);

describe("Brawl player panels", () => {
  it("centres the four panels on the reference screen's name plates", () => {
    const panels = brawlPanels();

    expect(panels).toHaveLength(4);
    for (const [index, centre] of [204, 496, 790, 1082].entries()) {
      near(panels[index]!.x + panels[index]!.width / 2, centre);
      near(panels[index]!.width, 272);
      // From below the grid to the foot of the name plate's shadow.
      near(panels[index]!.y, 592);
      near(panels[index]!.y + panels[index]!.height, 900);
    }
  });

  it("puts the four panels in one row below the grid on a phone held upright", () => {
    const panels = brawlPanels(BRAWL_UPRIGHT);
    const { gridArea, stage } = BRAWL_UPRIGHT;

    for (const panel of panels) {
      expect(panel.y).toBeGreaterThanOrEqual(gridArea.y + gridArea.height);
      expect(panel.y + panel.height).toBeLessThanOrEqual(stage.height);
      expect(panel.y).toBe(panels[0]!.y);
    }
  });
});
