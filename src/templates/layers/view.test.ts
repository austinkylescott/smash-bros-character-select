import { describe, expect, it } from "vite-plus/test";

import { MELEE_LANDSCAPE, MELEE_UPRIGHT } from "../melee/layout";
import { drawingBuffer, stageView, toScene } from "./view";

describe("the view a 3D layer is drawn through", () => {
  it("spans Melee's 4:3 stage, measured in stage pixels", () => {
    expect(stageView(MELEE_LANDSCAPE.stage)).toEqual({
      left: 0,
      right: 1280,
      top: 0,
      bottom: -960,
    });
  });

  it("spans the taller upright stage when the phone is held upright", () => {
    expect(stageView(MELEE_UPRIGHT.stage)).toEqual({
      left: 0,
      right: 1280,
      top: 0,
      bottom: -2048,
    });
  });

  it("puts a point given in stage pixels where the DOM puts it", () => {
    // Stage y runs down the screen; the scene's runs up, so a point 144px down sits at y = -144.
    expect(toScene({ x: 68, y: 144 })).toEqual({ x: 68, y: -144 });
    expect(toScene({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
  });
});

describe("how many pixels a layer's canvas draws", () => {
  it("draws Melee's stage at the size it is shown on a 640x480 screen", () => {
    // The 1280x960 stage is shown at half size, on a screen with one pixel per CSS pixel.
    expect(drawingBuffer(MELEE_LANDSCAPE.stage, 0.5, 1)).toEqual({ width: 640, height: 480 });
  });

  it("draws sharper on a high-density screen", () => {
    expect(drawingBuffer(MELEE_LANDSCAPE.stage, 0.5, 2)).toEqual({ width: 1280, height: 960 });
  });

  it("caps the pixel ratio a layer draws at, so a soft Backdrop costs no more than it shows", () => {
    expect(drawingBuffer(MELEE_LANDSCAPE.stage, 0.5, 3, 1)).toEqual({ width: 640, height: 480 });
  });

  it("rounds to whole pixels and never draws an empty canvas", () => {
    // A 360px-wide upright phone shows the 1280px stage at 0.28125.
    expect(drawingBuffer(MELEE_UPRIGHT.stage, 0.28125, 3, 2)).toEqual({ width: 720, height: 1152 });
    expect(drawingBuffer(MELEE_LANDSCAPE.stage, 0, 1)).toEqual({ width: 1, height: 1 });
  });
});
