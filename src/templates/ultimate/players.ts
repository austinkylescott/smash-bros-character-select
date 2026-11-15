/** How Ultimate colours and labels each player's panel, token and hand. */
import type { PanelKind } from "../../selection/selection";

/** Player 1 to 8, in Ultimate's order: red, blue, yellow, green, orange, cyan, pink, purple. */
const PLAYER_COLOURS = [
  "#e8141c",
  "#1f6ff2",
  "#f2c40c",
  "#22b04a",
  "#f08a1c",
  "#1fc2d8",
  "#ee5fa6",
  "#8a4ad8",
] as const;
const CPU_COLOUR = "#8f8f8f";

/** A panel's colour: its player's own for a human, grey for a CPU or a switched-off panel. */
export function playerColour(index: number, kind: PanelKind): string {
  return kind === "human" ? PLAYER_COLOURS[index % PLAYER_COLOURS.length]! : CPU_COLOUR;
}

/** The tag on a panel and its token: "P1" for a human, "CPU" for the computer. */
export function playerTag(index: number, kind: PanelKind): string {
  return kind === "human" ? `P${index + 1}` : kind === "cpu" ? "CPU" : "Off";
}
