import { describe, expect, it } from "vite-plus/test";

import { handPiece } from "./pieces";

const red = { colour: "#e0262c", tag: "P1" };
const blue = { colour: "#2f5fe8", tag: "P2" };
const at = { x: 300, y: 200 };

describe("which parts of the hand a 3D layer draws", () => {
  it("draws the glove and its owner's tag where the mouse is", () => {
    expect(
      handPiece({ position: at, input: "mouse", inside: true, owner: red, held: undefined }),
    ).toEqual({ x: 300, y: 200, glove: true, owner: red, held: undefined });
  });

  it("draws nothing once the mouse has left the screen", () => {
    expect(
      handPiece({ position: at, input: "mouse", inside: false, owner: red, held: blue }),
    ).toBeUndefined();
  });

  it("keeps the glove on screen for the keyboard, even with the mouse outside", () => {
    expect(
      handPiece({ position: at, input: "keyboard", inside: false, owner: red, held: blue }),
    ).toEqual({ x: 300, y: 200, glove: true, owner: red, held: blue });
  });

  it("has no glove on touch: a held token simply follows the finger", () => {
    expect(
      handPiece({ position: at, input: "touch", inside: true, owner: red, held: blue }),
    ).toEqual({ x: 300, y: 200, glove: false, owner: undefined, held: blue });
  });
});
