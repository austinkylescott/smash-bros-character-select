/** How Smash for 3DS colours and labels each player's card, token and hand. */
import type { PanelKind } from "../../selection/selection";

/** Players 1 to 4, in the game's order: red, blue, yellow, green. */
const PLAYER_COLOURS = ["#e2262e", "#2a6ae0", "#f0b400", "#25a848"] as const;
const CPU_COLOUR = "#8a8d92";

/** A card's colour: its player's own for a human, grey for a CPU or a switched-off card. */
export function playerColour(index: number, kind: PanelKind): string {
  return kind === "human" ? PLAYER_COLOURS[index % PLAYER_COLOURS.length]! : CPU_COLOUR;
}

/** The tag on a token and the hand: "P1" for a human, "CPU" for the computer. */
export function playerTag(index: number, kind: PanelKind): string {
  return kind === "human" ? `P${index + 1}` : kind === "cpu" ? "CPU" : "";
}

/** The label atop a card, which is the game's card control: "P1", "CPU" or "---". */
export function cardLabel(index: number, kind: PanelKind): string {
  return { human: `P${index + 1}`, cpu: "CPU", off: "---" }[kind];
}
