import { describe, expect, it } from "vite-plus/test";

import { WII_U_UPRIGHT } from "./layout";
import { wiiUPanels } from "./panels";

// Measured from docs/references/smash-4-wii-u/SSBWiiUStarters.jpg, scaled to the 1280x720 stage.
const near = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected), `${actual} is not near ${expected}`).toBeLessThanOrEqual(4);

describe("Smash for Wii U player panels", () => {
  it("puts Smash's four panels side by side below the grid, as on the reference", () => {
    const panels = wiiUPanels(4);

    expect(panels).toHaveLength(4);
    for (const [index, left] of [42, 345, 647, 948].entries()) {
      near(panels[index]!.x, left);
      near(panels[index]!.width, 290);
      near(panels[index]!.y, 430);
      near(panels[index]!.y + panels[index]!.height, 720);
    }
  });

  it("squeezes 8-Player Smash's eight panels into the same row", () => {
    const panels = wiiUPanels(8);
    const four = wiiUPanels(4);

    expect(panels).toHaveLength(8);
    expect(panels[0]!.x).toBe(four[0]!.x);
    near(panels[7]!.x + panels[7]!.width, four[3]!.x + four[3]!.width);
    for (const panel of panels) expect(panel.y).toBe(four[0]!.y);
  });

  it.each([4, 8])("puts %i panels in two rows below the grid on a phone held upright", (count) => {
    const panels = wiiUPanels(count, WII_U_UPRIGHT);
    const { gridArea, stage } = WII_U_UPRIGHT;

    expect(new Set(panels.map((panel) => panel.y)).size).toBe(2);
    for (const panel of panels) {
      expect(panel.y).toBeGreaterThanOrEqual(gridArea.y + gridArea.height);
      expect(panel.x + panel.width).toBeLessThanOrEqual(stage.width);
      expect(panel.y + panel.height).toBeLessThanOrEqual(stage.height);
    }
  });
});
