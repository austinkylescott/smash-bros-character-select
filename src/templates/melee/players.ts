/** How Melee colours and labels each player's panel, token and hand. */
import type { PanelKind } from "../../selection/selection";

/** Ports 1 to 4, in Melee's order: red, blue, yellow, green. */
const PLAYER_COLOURS = ["#e0262c", "#2f5fe8", "#e8b812", "#21a447"] as const;
const CPU_COLOUR = "#8c8f96";

/** A panel's colour: its port's own for a human, grey for a CPU or a switched-off panel. */
export function playerColour(index: number, kind: PanelKind): string {
  return kind === "human" ? PLAYER_COLOURS[index % PLAYER_COLOURS.length]! : CPU_COLOUR;
}

/** The tag on a token and the hand: "P1" for a human, "CP" for the computer. */
export function playerTag(index: number, kind: PanelKind): string {
  return kind === "human" ? `P${index + 1}` : kind === "cpu" ? "CP" : "";
}

/** The panel control's label: Melee's "HMN", "CPU" and "N/A". */
export function kindLabel(kind: PanelKind): string {
  return { human: "HMN", cpu: "CPU", off: "N/A" }[kind];
}
