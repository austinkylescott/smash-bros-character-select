/** How Brawl colours and labels each player's panel, token and hand. */
import type { PanelKind } from "../../selection/selection";

/** Ports 1 to 4, in Brawl's order: red, blue, yellow, green. */
const PLAYER_COLOURS = ["#d8242c", "#2a62dc", "#e6b310", "#24a046"] as const;
const CPU_COLOUR = "#7d8088";

/** A panel's colour: its port's own for a human, grey for a CPU or a switched-off panel. */
export function playerColour(index: number, kind: PanelKind): string {
  return kind === "human" ? PLAYER_COLOURS[index % PLAYER_COLOURS.length]! : CPU_COLOUR;
}

/** The tag on a token and the hand: "P1" for a human, "CPU" for the computer. */
export function playerTag(index: number, kind: PanelKind): string {
  return kind === "human" ? `P${index + 1}` : kind === "cpu" ? "CPU" : "";
}

/** The name plate's label, which is Brawl's panel control: "PLAYER 1", "CPU" or "NONE". */
export function plateLabel(index: number, kind: PanelKind): string {
  return { human: `PLAYER ${index + 1}`, cpu: "CPU", off: "NONE" }[kind];
}
