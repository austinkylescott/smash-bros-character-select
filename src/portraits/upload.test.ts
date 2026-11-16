import { describe, expect, it } from "vite-plus/test";

import { imageFileProblem, resizedSize } from "./upload";

const MB = 1024 * 1024;

describe("which image files can be uploaded", () => {
  it("takes PNG, JPEG, WebP and GIF images up to 10 MB", () => {
    for (const type of ["image/png", "image/jpeg", "image/webp", "image/gif"])
      expect(imageFileProblem({ type, size: 10 * MB }), type).toBeUndefined();
  });

  it("refuses other kinds of file, saying which it takes", () => {
    for (const type of ["image/svg+xml", "image/tiff", "application/pdf", ""])
      expect(imageFileProblem({ type, size: 1000 }), type).toBe(
        "That file is not an image this site can use. Choose a PNG, JPEG, WebP or GIF.",
      );
  });

  it("refuses a file over 10 MB, saying how large it may be", () => {
    expect(imageFileProblem({ type: "image/png", size: 10 * MB + 1 })).toBe(
      "That image is too large. Choose one of 10 MB or less.",
    );
  });
});

describe("the size an uploaded image is resized to", () => {
  it("shrinks it to fit 512 pixels on its longer side, keeping its shape", () => {
    expect(resizedSize({ width: 2048, height: 1024 })).toEqual({ width: 512, height: 256 });
    expect(resizedSize({ width: 600, height: 1200 })).toEqual({ width: 256, height: 512 });
  });

  it("leaves a smaller image its own size", () => {
    expect(resizedSize({ width: 300, height: 200 })).toEqual({ width: 300, height: 200 });
  });

  it("rounds to whole pixels, never below one", () => {
    expect(resizedSize({ width: 1000, height: 333 })).toEqual({ width: 512, height: 170 });
    expect(resizedSize({ width: 5000, height: 2 })).toEqual({ width: 512, height: 1 });
  });
});
