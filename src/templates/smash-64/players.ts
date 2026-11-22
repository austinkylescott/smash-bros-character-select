/** How Smash 64 colours and labels each player's panel, token and hand. */
import type { PanelKind } from "../../selection/selection";

/** Ports 1 to 4, in the game's order: red, blue, yellow, green. */
const PLAYER_COLOURS = ["#b8282c", "#2e48c8", "#d8a810", "#2c9a38"] as const;
const CPU_COLOUR = "#8c8ca8";
const OFF_COLOUR = "#4a4a4c";

/** A panel's colour: its port's own for a human, lilac grey for a CPU, dark grey when off. */
export function playerColour(index: number, kind: PanelKind): string {
  if (kind === "cpu") return CPU_COLOUR;
  if (kind === "off") return OFF_COLOUR;
  return PLAYER_COLOURS[index % PLAYER_COLOURS.length]!;
}

/** The tag on a token, the hand and a panel's corner: "1P" for a human, "CP" for the computer. */
export function playerTag(index: number, kind: PanelKind): string {
  return kind === "human" ? `${index + 1}P` : kind === "cpu" ? "CP" : "";
}

/** The panel control's label: the game's "HMN", "CP" and "N/A". */
export function kindLabel(kind: PanelKind): string {
  return { human: "HMN", cpu: "CP", off: "N/A" }[kind];
}
