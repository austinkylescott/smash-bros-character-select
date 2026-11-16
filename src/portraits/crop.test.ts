import { describe, expect, it } from "vite-plus/test";

import { centreCrop, moveCrop, zoomCrop } from "./crop";

const landscape = { width: 400, height: 200 };

describe("the crop an image starts with", () => {
  it("is the largest region of the shape asked for, centred", () => {
    expect(centreCrop(landscape, 1)).toEqual({ x: 100, y: 0, width: 200, height: 200 });
    expect(centreCrop({ width: 300, height: 600 }, 3 / 2)).toEqual({
      x: 0,
      y: 200,
      width: 300,
      height: 200,
    });
  });
});

describe("moving a crop", () => {
  const crop = { x: 100, y: 50, width: 100, height: 100 };

  it("moves it by the distance given", () => {
    expect(moveCrop(crop, { x: 20, y: -30 }, landscape)).toEqual({ ...crop, x: 120, y: 20 });
  });

  it("stops it at the image's edges", () => {
    expect(moveCrop(crop, { x: 1000, y: 1000 }, landscape)).toEqual({ ...crop, x: 300, y: 100 });
    expect(moveCrop(crop, { x: -1000, y: -1000 }, landscape)).toEqual({ ...crop, x: 0, y: 0 });
  });
});

describe("zooming a crop", () => {
  const crop = { x: 150, y: 50, width: 100, height: 100 };

  it("resizes it about its centre, keeping its shape", () => {
    expect(zoomCrop(crop, 50, landscape)).toEqual({ x: 175, y: 75, width: 50, height: 50 });
  });

  it("grows no larger than the image allows", () => {
    expect(zoomCrop(crop, 1000, landscape)).toEqual({ x: 100, y: 0, width: 200, height: 200 });
  });

  it("stays inside the image as it grows near an edge", () => {
    const nearEdge = { x: 280, y: 0, width: 100, height: 100 };

    expect(zoomCrop(nearEdge, 160, landscape)).toEqual({ x: 240, y: 0, width: 160, height: 160 });
  });

  it("shrinks no smaller than a tenth of the largest it could be", () => {
    expect(zoomCrop(crop, 1, landscape)).toEqual({ x: 190, y: 90, width: 20, height: 20 });
  });
});
