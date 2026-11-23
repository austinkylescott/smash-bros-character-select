import { Color, type Mesh, type MeshStandardMaterial, type Object3D } from "three";
import { describe, expect, it } from "vite-plus/test";

import type { ScreenPieces, TokenPiece } from "../layers/pieces";
import { MELEE_LANDSCAPE } from "./layout";
import { meleePieces } from "./pieces";
import { PRESS_SECONDS } from "./press";

const red = { colour: "#e0262c", tag: "P1" };
const blue = { colour: "#2f5fe8", tag: "P2" };
const token = (panel: number, x: number, y: number, look = red): TokenPiece => ({
  panel,
  x,
  y,
  size: 60,
  ...look,
});

/** Builds the scene with no text painted, as there is no canvas outside a browser. */
function build(first: ScreenPieces) {
  let pieces = first;
  const layer = meleePieces(MELEE_LANDSCAPE.stage, () => pieces, { paint: () => undefined });
  const named = (name: string) => layer.scene.getObjectByName(name)!;
  return {
    layer,
    named,
    show: (next: ScreenPieces, seconds = 0) => {
      pieces = next;
      layer.update(seconds);
    },
  };
}

const shown = (object: Object3D) => {
  for (let at: Object3D | null = object; at; at = at.parent) if (!at.visible) return false;
  return true;
};
const colourOf = (object: Object3D) =>
  `#${((object as Mesh).material as MeshStandardMaterial).color.getHexString()}`;
const hex = (colour: string) => `#${new Color(colour).getHexString()}`;

describe("Melee's 3D hand and tokens", () => {
  it("puts the hand's fingertip exactly where the DOM puts the hand", () => {
    const { named, show } = build({ hand: undefined, tokens: [] });
    show({ hand: { x: 300, y: 200, glove: true, owner: red, held: undefined }, tokens: [] });

    const hand = named("hand");
    expect(shown(hand)).toBe(true);
    expect(hand.position.x).toBe(300);
    expect(hand.position.y).toBe(-200);
    expect(shown(named("glove"))).toBe(true);
    expect(shown(named("hand-tag"))).toBe(true);
  });

  it("follows the hand to wherever it moves next, in the same frame", () => {
    const { named, show } = build({ hand: undefined, tokens: [] });
    show({ hand: { x: 300, y: 200, glove: true, owner: red, held: undefined }, tokens: [] });
    show({ hand: { x: 900, y: 40, glove: true, owner: red, held: undefined }, tokens: [] });

    expect(named("hand").position.x).toBe(900);
    expect(named("hand").position.y).toBe(-40);
  });

  it("draws nothing of the hand while it is off screen", () => {
    const { named, show } = build({ hand: undefined, tokens: [] });
    show({ hand: undefined, tokens: [] });

    expect(shown(named("hand"))).toBe(false);
  });

  it("carries a held token, in its player's colour, under the glove", () => {
    const { named, show } = build({ hand: undefined, tokens: [] });
    show({ hand: { x: 300, y: 200, glove: true, owner: red, held: blue }, tokens: [] });

    const held = named("held-token");
    expect(shown(held)).toBe(true);
    expect(colourOf(held.getObjectByName("coin")!)).toBe(hex(blue.colour));
    expect(held.getWorldPosition(held.position.clone()).z).toBeLessThan(
      named("glove").getWorldPosition(held.position.clone()).z,
    );
  });

  it("shows only the held token on touch: no glove, no tag", () => {
    const { named, show } = build({ hand: undefined, tokens: [] });
    show({ hand: { x: 300, y: 200, glove: false, owner: undefined, held: blue }, tokens: [] });

    expect(shown(named("glove"))).toBe(false);
    expect(shown(named("hand-tag"))).toBe(false);
    expect(shown(named("held-token"))).toBe(true);
  });

  it("puts each resting token where the DOM puts it, in its player's colour and size", () => {
    const { named, show } = build({ hand: undefined, tokens: [] });
    // Two tokens spread across one slot, as MeleeScreen spreads them.
    show({ hand: undefined, tokens: [token(0, 100, 190), token(1, 136, 190, blue)] });

    for (const [panel, x, look] of [
      [0, 100, red],
      [1, 136, blue],
    ] as const) {
      const piece = named(`token-${panel}`);
      expect(shown(piece)).toBe(true);
      expect(piece.position.x).toBe(x);
      expect(piece.position.y).toBe(-190);
      expect(piece.scale.x).toBe(60);
      expect(colourOf(piece.getObjectByName("coin")!)).toBe(hex(look.colour));
    }
    expect(shown(named("token-2"))).toBe(false);
  });

  it("hides a token once it leaves the board, as when its panel is switched off", () => {
    const { named, show } = build({ hand: undefined, tokens: [] });
    show({ hand: undefined, tokens: [token(0, 100, 190)] });
    show({ hand: undefined, tokens: [] });

    expect(shown(named("token-0"))).toBe(false);
  });

  it("tilts the glove when it picks up a token, and stands it back up after", () => {
    const { named, show } = build({ hand: undefined, tokens: [] });
    const hand = { x: 300, y: 200, glove: true, owner: red };
    show({ hand: { ...hand, held: undefined }, tokens: [token(1, 100, 190, blue)] }, 10);
    const resting = named("glove").rotation.x;

    show({ hand: { ...hand, held: blue }, tokens: [] }, 11);
    show({ hand: { ...hand, held: blue }, tokens: [] }, 11 + PRESS_SECONDS / 2);
    expect(named("glove").rotation.x).not.toBe(resting);

    show({ hand: { ...hand, held: blue }, tokens: [] }, 12);
    expect(named("glove").rotation.x).toBe(resting);
  });

  it("tilts again when it drops the token", () => {
    const { named, show } = build({ hand: undefined, tokens: [] });
    const hand = { x: 300, y: 200, glove: true, owner: red };
    show({ hand: { ...hand, held: blue }, tokens: [] }, 10);
    const resting = named("glove").rotation.x;

    show({ hand: { ...hand, held: undefined }, tokens: [token(1, 100, 190, blue)] }, 20);
    show({ hand: { ...hand, held: undefined }, tokens: [] }, 20 + PRESS_SECONDS / 2);
    expect(named("glove").rotation.x).not.toBe(resting);
  });

  it("never moves when still: a still scene is always posed at 0", () => {
    const { named, show } = build({ hand: undefined, tokens: [] });
    const hand = { x: 300, y: 200, glove: true, owner: red };
    show({ hand: { ...hand, held: undefined }, tokens: [] });
    const resting = named("glove").rotation.x;

    show({ hand: { ...hand, held: blue }, tokens: [] });
    expect(named("glove").rotation.x).toBe(resting);
  });
});
