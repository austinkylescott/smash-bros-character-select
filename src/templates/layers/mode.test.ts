import { describe, expect, it } from "vite-plus/test";

import { layerMode } from "./mode";

const fine = { webgl: true, contextLost: false, reducedMotion: false, hidden: false };

describe("how a screen's 3D layers run", () => {
  it("moves when WebGL is there and the tab is in view", () => {
    expect(layerMode(fine)).toBe("moving");
  });

  it("falls back to the CSS screen without WebGL", () => {
    expect(layerMode({ ...fine, webgl: false })).toBe("css");
  });

  it("falls back to the CSS screen once the WebGL context is lost", () => {
    expect(layerMode({ ...fine, contextLost: true })).toBe("css");
  });

  it("draws the scene but keeps it still under reduced motion", () => {
    expect(layerMode({ ...fine, reducedMotion: true })).toBe("still");
  });

  it("stops rendering while the tab is hidden, keeping what it last drew", () => {
    expect(layerMode({ ...fine, hidden: true })).toBe("paused");
    expect(layerMode({ ...fine, hidden: true, reducedMotion: true })).toBe("paused");
  });

  it("keeps the CSS screen in a hidden tab without WebGL", () => {
    expect(layerMode({ ...fine, webgl: false, hidden: true })).toBe("css");
  });
});
