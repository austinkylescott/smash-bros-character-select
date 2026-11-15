import { describe, expect, it } from "vite-plus/test";

import { fitStage } from "./stage";

const HD = { width: 1920, height: 1080 };

describe("fitting a template's stage to the viewport", () => {
  it("shows a 1920x1080 stage at full size in a 1920x1080 window", () => {
    expect(fitStage({ width: 1920, height: 1080 }, HD)).toEqual({ scale: 1, x: 0, y: 0 });
  });

  it("letterboxes a desktop window that is taller than 16:9", () => {
    // 1440 / 1920 = 0.75, so the stage is 1440x810, with 45px above and below.
    expect(fitStage({ width: 1440, height: 900 }, HD)).toEqual({ scale: 0.75, x: 0, y: 45 });
  });

  it("pillarboxes a landscape phone that is wider than 16:9", () => {
    // 432 / 1080 = 0.4, so the stage is 768x432, with 16px either side.
    expect(fitStage({ width: 800, height: 432 }, HD)).toEqual({ scale: 0.4, x: 16, y: 0 });
  });
});
