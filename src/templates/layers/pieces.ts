/**
 * The pieces of a screen that a 3D layer over it draws in place of their DOM elements (ADR 0007):
 * the hand and the tokens, where the DOM puts them, in stage pixels. A template hands these to
 * the layer setup; the layer reads them every frame, so its pieces never trail the DOM.
 */
import type { HandInput, Point } from "../../selection/useHand";

/** How a player's pieces look: their colour and their tag, such as "P1". */
export interface PieceLook {
  readonly colour: string;
  readonly tag: string;
}

/** A token resting on a slot or in its panel. */
export interface TokenPiece extends PieceLook {
  /** The token's panel, which keeps it the same piece as it moves. */
  readonly panel: number;
  /** Its centre, in stage pixels. */
  readonly x: number;
  readonly y: number;
  /** Its diameter, in stage pixels. */
  readonly size: number;
}

/** The hand: its hot spot, in stage pixels, and what it shows there. */
export interface HandPiece extends Point {
  /** Whether the glove is drawn. On touch it is not; only a held token follows the finger. */
  readonly glove: boolean;
  /** The hand's owner, whose tag hangs under the glove. */
  readonly owner: PieceLook | undefined;
  /** The token the hand holds, centred on its hot spot. */
  readonly held: PieceLook | undefined;
}

/** One look's identity, for keeping a label painted once per player. */
export const lookId = ({ colour, tag }: PieceLook) => `${colour}|${tag}`;

/** Everything a layer over the screen draws in place of the DOM's hand and tokens. */
export interface ScreenPieces {
  /** Nothing while the hand is off screen. */
  readonly hand: HandPiece | undefined;
  /** The panel whose token the hand holds, known even while the hand is off screen. */
  readonly heldPanel: number | undefined;
  /** Every token not in the hand, in the order the DOM paints them. */
  readonly tokens: readonly TokenPiece[];
}

export const NO_PIECES: ScreenPieces = { hand: undefined, heldPanel: undefined, tokens: [] };

/** The hand as the selection controls know it, which `handPiece` turns into what is drawn. */
export interface HandState {
  readonly position: Point;
  readonly input: HandInput;
  /** Whether the mouse is over the stage. */
  readonly inside: boolean;
  readonly owner: PieceLook | undefined;
  readonly held: PieceLook | undefined;
}

/**
 * The hand as the DOM shows it: on screen while the mouse is over the stage or something else
 * moved it last, with its glove and tag for the mouse and keyboard but not for touch.
 */
export function handPiece({ position, input, inside, owner, held }: HandState) {
  if (input === "mouse" && !inside) return undefined;
  const glove = input !== "touch";
  return {
    x: position.x,
    y: position.y,
    glove,
    owner: glove ? owner : undefined,
    held,
  } satisfies HandPiece;
}
