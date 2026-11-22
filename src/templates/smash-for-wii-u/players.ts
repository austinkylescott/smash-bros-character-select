/** How Smash for Wii U colours and labels each player's panel, token and hand. */
import type { PanelKind } from "../../selection/selection";

/** Player 1 to 8: red, blue, yellow and green, then 8-Player Smash's orange, cyan, pink, purple. */
const PLAYER_COLOURS = [
  "#e2232b",
  "#2a6ee0",
  "#f2bf12",
  "#26a845",
  "#f08a1c",
  "#22b8d4",
  "#ec5ea4",
  "#8a4cd6",
] as const;
const CPU_COLOUR = "#8c8c8c";

/** A panel's colour: its player's own for a human, grey for a CPU or a switched-off panel. */
export function playerColour(index: number, kind: PanelKind): string {
  return kind === "human" ? PLAYER_COLOURS[index % PLAYER_COLOURS.length]! : CPU_COLOUR;
}

/** The tag on a panel, token and hand: "P1" for a human, "CPU" for the computer. */
export function playerTag(index: number, kind: PanelKind): string {
  return kind === "human" ? `P${index + 1}` : kind === "cpu" ? "CPU" : "";
}

/** The name plate's label, which is the panel's control: "Player 1", "CPU 2" or "None". */
export function plateLabel(index: number, kind: PanelKind): string {
  return { human: `Player ${index + 1}`, cpu: `CPU ${index + 1}`, off: "None" }[kind];
}
