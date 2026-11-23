import { Color, type Mesh, type MeshStandardMaterial, type Object3D } from "three";
import { describe, expect, it } from "vite-plus/test";

import type { HandPiece, PieceLook, ScreenPieces, TokenPiece } from "../layers/pieces";
import { MELEE_LANDSCAPE } from "./layout";
import { meleePieces } from "./pieces";
import { PRESS_SECONDS } from "./press";

const red = { colour: "#e0262c", tag: "P1" };
const blue = { colour: "#2f5fe8", tag: "P2" };
const grey = { colour: "#8c8f96", tag: "CP" };
const token = (panel: number, x: number, y: number, look = red): TokenPiece => ({
  panel,
  x,
  y,
  size: 60,
  ...look,
});
/** P1's glove at (300, 200), holding nothing unless told. */
const glove = (held?: PieceLook): HandPiece => ({
  x: 300,
  y: 200,
  glove: true,
  owner: red,
  held,
});
const nothing: ScreenPieces = { hand: undefined, heldPanel: undefined, tokens: [] };

/** Builds the scene with no text painted, as there is no canvas outside a browser. */
function build(first: ScreenPieces = nothing) {
  let pieces = first;
  const layer = meleePieces(
    MELEE_LANDSCAPE.stage,
    { pieces: () => pieces, redraw: () => {} },
    { paint: () => undefined },
  );
  const named = (name: string) => layer.scene.getObjectByName(name)!;
  return {
    named,
    show: (next: Partial<ScreenPieces>, seconds = 0) => {
      pieces = { ...nothing, ...next };
      layer.update(seconds);
    },
    tilt: () => named("glove").rotation.x,
  };
}

const shown = (object: Object3D) => {
  for (let at: Object3D | null = object; at; at = at.parent) if (!at.visible) return false;
  return true;
};
const colourOf = (object: Object3D) =>
  `#${((object as Mesh).material as MeshStandardMaterial).color.getHexString()}`;
const hex = (colour: string) => `#${new Color(colour).getHexString()}`;
const MID_PRESS = PRESS_SECONDS / 2;

describe("Melee's 3D hand and tokens", () => {
  it("puts the hand's fingertip exactly where the DOM puts the hand", () => {
    const { named, show } = build();
    show({ hand: glove() });

    const hand = named("hand");
    expect(shown(hand)).toBe(true);
    expect(hand.position.x).toBe(300);
    expect(hand.position.y).toBe(-200);
    expect(shown(named("glove"))).toBe(true);
    expect(shown(named("hand-tag"))).toBe(true);
  });

  it("follows the hand to wherever it moves next, in the same frame", () => {
    const { named, show } = build();
    show({ hand: glove() });
    show({ hand: { ...glove(), x: 900, y: 40 } });

    expect(named("hand").position.x).toBe(900);
    expect(named("hand").position.y).toBe(-40);
  });

  it("draws nothing of the hand while it is off screen", () => {
    const { named, show } = build();
    show({ hand: undefined });

    expect(shown(named("hand"))).toBe(false);
  });

  it("carries a held token, in its player's colour, under the glove", () => {
    const { named, show } = build();
    show({ hand: glove(blue), heldPanel: 1 });

    const held = named("held-token");
    expect(shown(held)).toBe(true);
    expect(colourOf(held.getObjectByName("body")!)).toBe(hex(blue.colour));
    expect(held.getWorldPosition(held.position.clone()).z).toBeLessThan(
      named("glove").getWorldPosition(held.position.clone()).z,
    );
  });

  it("shows only the held token on touch: no glove, no tag", () => {
    const { named, show } = build();
    show({ hand: { ...glove(blue), glove: false, owner: undefined }, heldPanel: 1 });

    expect(shown(named("glove"))).toBe(false);
    expect(shown(named("hand-tag"))).toBe(false);
    expect(shown(named("held-token"))).toBe(true);
  });

  it("puts each resting token where the DOM puts it, in its player's colour and size", () => {
    const { named, show } = build();
    // Two tokens spread across one slot, as MeleeScreen spreads them.
    show({ tokens: [token(0, 100, 190), token(1, 136, 190, blue)] });

    for (const [panel, x, look] of [
      [0, 100, red],
      [1, 136, blue],
    ] as const) {
      const piece = named(`token-${panel}`);
      expect(shown(piece)).toBe(true);
      expect(piece.position.x).toBe(x);
      expect(piece.position.y).toBe(-190);
      expect(piece.scale.x).toBe(60);
      expect(colourOf(piece.getObjectByName("body")!)).toBe(hex(look.colour));
    }
    expect(shown(named("token-2"))).toBe(false);
  });

  it("lays each later token over the one before, as the DOM paints them", () => {
    const { named, show } = build();
    show({ tokens: [token(2, 100, 190), token(0, 136, 190)] });

    expect(named("token-0").position.z).toBeGreaterThan(named("token-2").position.z);
  });

  it("hides a token once it leaves the board, as when its panel is switched off", () => {
    const { named, show } = build();
    show({ tokens: [token(0, 100, 190)] });
    show({ tokens: [] });

    expect(shown(named("token-0"))).toBe(false);
  });
});

describe("how Melee's 3D hand presses", () => {
  it("tilts the glove when it picks up a token, and stands it back up after", () => {
    const { show, tilt } = build();
    show({ hand: glove(), tokens: [token(1, 100, 190, blue)] }, 10);
    const resting = tilt();

    show({ hand: glove(blue), heldPanel: 1 }, 11);
    show({ hand: glove(blue), heldPanel: 1 }, 11 + MID_PRESS);
    expect(tilt()).not.toBe(resting);

    show({ hand: glove(blue), heldPanel: 1 }, 12);
    expect(tilt()).toBe(resting);
  });

  it("tilts again when it drops the token", () => {
    const { show, tilt } = build();
    show({ hand: glove(blue), heldPanel: 1 }, 10);
    const resting = tilt();

    show({ hand: glove(), tokens: [token(1, 100, 190, blue)] }, 20);
    show({ hand: glove(), tokens: [token(1, 100, 190, blue)] }, 20 + MID_PRESS);
    expect(tilt()).not.toBe(resting);
  });

  it("presses when it swaps one CPU's token for another's, though they look the same", () => {
    const { show, tilt } = build();
    show({ hand: glove(grey), heldPanel: 2 }, 10);
    const resting = tilt();

    show({ hand: glove(grey), heldPanel: 3 }, 20);
    show({ hand: glove(grey), heldPanel: 3 }, 20 + MID_PRESS);
    expect(tilt()).not.toBe(resting);
  });

  it("does not press on first showing, already holding a token", () => {
    const { show, tilt } = build();
    show({ hand: glove(), tokens: [] }, 10);
    const resting = tilt();

    // A scene is built with the screen as it is then, as when a template opens or the stage turns.
    const fresh = build({ ...nothing, hand: glove(blue), heldPanel: 1 });
    fresh.show({ hand: glove(blue), heldPanel: 1 }, 10);
    fresh.show({ hand: glove(blue), heldPanel: 1 }, 10 + MID_PRESS);
    expect(fresh.tilt()).toBe(resting);
  });

  it("does not press late for a token that changed hands while the hand was off screen", () => {
    const { show, tilt } = build();
    show({ hand: glove(blue), heldPanel: 1 }, 10);
    const resting = tilt();

    // The mouse is outside the stage when the token is dropped back home.
    show({ hand: undefined, tokens: [token(1, 100, 190, blue)] }, 20);
    // It comes back in long after.
    show({ hand: glove(), tokens: [token(1, 100, 190, blue)] }, 30);
    show({ hand: glove(), tokens: [token(1, 100, 190, blue)] }, 30 + MID_PRESS);
    expect(tilt()).toBe(resting);
  });

  it("never moves when still: a still scene is always posed at 0", () => {
    const { show, tilt } = build();
    show({ hand: glove() });
    const resting = tilt();

    show({ hand: glove(blue), heldPanel: 1 });
    expect(tilt()).toBe(resting);
  });
});
