/** How Smash 64 colours and labels each player's panel, token and hand. */
import type { PanelKind } from "../../selection/selection";

/** Ports 1 to 4, in the game's order: red, blue, yellow, green. */
const PLAYER_COLOURS = ["#943131", "#3a4fa8", "#b8961c", "#2f8a3a"] as const;
/** The computer's lavender grey, and the dark grey of a port nobody is using. */
const CPU_COLOUR = "#9a9cb2";
const OFF_COLOUR = "#3a3a3a";

/** A panel's colour: its port's own for a human, lavender for a CPU, dark grey when off. */
export function playerColour(index: number, kind: PanelKind): string {
  if (kind === "cpu") return CPU_COLOUR;
  if (kind === "off") return OFF_COLOUR;
  return PLAYER_COLOURS[index % PLAYER_COLOURS.length]!;
}

/** The tag on a token, the hand and the panel: "1P" for a human, "CP" for the computer. */
export function playerTag(index: number, kind: PanelKind): string {
  return kind === "human" ? `${index + 1}P` : kind === "cpu" ? "CP" : "";
}

/** The panel control's label: the game's "HMN", "CP" and "N/A". */
export function kindLabel(kind: PanelKind): string {
  return { human: "HMN", cpu: "CP", off: "N/A" }[kind];
}
