/** Which templates there are to show a roster in, what they are called, and which one it opens in. */
import { type Game, nearestGames } from "../asset-layer/manifest";
import type { Template } from "./screen";

const NAMES: Readonly<Record<Template, string>> = {
  "smash-64": "Smash 64",
  melee: "Melee",
  brawl: "Brawl",
  "smash-for-3ds": "Smash for 3DS",
  "smash-for-wii-u": "Smash for Wii U",
  ultimate: "Ultimate",
};

/** A template's name, which is also the name of its game's official roster. */
export const templateName = (template: Template): string => NAMES[template];

/** The templates built so far, oldest game first. The rest of the six join as they are built. */
export const availableTemplates = [
  "smash-64",
  "melee",
  "brawl",
  "smash-for-wii-u",
  "ultimate",
] as const satisfies readonly Template[];

export type AvailableTemplate = (typeof availableTemplates)[number];

export const isAvailableTemplate = (value: unknown): value is AvailableTemplate =>
  (availableTemplates as readonly unknown[]).includes(value);

/**
 * The template an official roster opens in: its own game's, or until that is built, the nearest
 * one that is.
 */
export const defaultTemplate = (game: Game): AvailableTemplate =>
  nearestGames(availableTemplates, game)[0]!;

/** A template that can be shown: the one named, or until it is built, the nearest one that is. */
export const showableTemplate = (template: Template): AvailableTemplate =>
  isAvailableTemplate(template) ? template : defaultTemplate(template);
