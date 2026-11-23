/**
 * Reading back a roster that was saved somewhere, in this browser or on the site's server, where
 * what is found may not be a roster at all, or one these rules would not have let be saved.
 */
import { GAMES } from "../asset-layer/manifest";
import { isOfficialFighter } from "../official";
import { type Crop, cropFits } from "../portraits/crop";
import { type CustomPortrait, type Roster, type RosterFighter, rosterProblems } from "./roster";

/** Whether a value is an object whose fields can be read. */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isSize = (value: unknown) => typeof value === "number" && Number.isFinite(value) && value > 0;

function cropFrom(stored: unknown): Crop | undefined {
  if (!isRecord(stored)) return;
  const { x, y, width, height } = stored;
  if (typeof x !== "number" || typeof y !== "number") return;
  if (typeof width !== "number" || typeof height !== "number") return;
  return { x, y, width, height };
}

/** Whether a portrait's image is one the place it was saved in keeps. */
export type KeptImage = (image: string) => boolean;

function portraitFrom(stored: unknown, kept: KeptImage): CustomPortrait | undefined {
  if (!isRecord(stored)) return;
  const { image, width, height } = stored;
  if (typeof image !== "string" || !kept(image)) return;
  if (!isSize(width) || !isSize(height)) return;
  const size = { width: width as number, height: height as number };
  const slot = cropFrom(stored.slot);
  const panel = cropFrom(stored.panel);
  if (!slot || !panel || !cropFits(slot, size) || !cropFits(panel, size)) return;
  return { image, ...size, slot, panel };
}

function fighterFrom(stored: unknown, kept: KeptImage): RosterFighter | undefined {
  if (!isRecord(stored) || typeof stored.id !== "string") return;
  const { id, name } = stored;
  if (stored.portrait !== undefined) {
    // A fighter added by name and image.
    const portrait = portraitFrom(stored.portrait, kept);
    if (isOfficialFighter(id) || typeof name !== "string" || !name.trim() || !portrait) return;
    return { id, name, portrait };
  }
  if (!isOfficialFighter(id)) return;
  if (name === undefined) return { id };
  return typeof name === "string" ? { id, name } : undefined;
}

/** A saved roster, or nothing if it is not one that could have been saved. */
export function readRoster(stored: unknown, kept: KeptImage): Roster | undefined {
  if (!isRecord(stored)) return;
  const { id, name, description, defaultTemplate, randomSlot, fighters } = stored;
  if (typeof id !== "string" || typeof name !== "string" || typeof description !== "string") return;
  if (typeof randomSlot !== "boolean" || !Array.isArray(fighters)) return;
  const template = GAMES.find((game) => game === defaultTemplate);
  if (!template) return;

  const read = fighters.map((fighter) => fighterFrom(fighter, kept));
  if (read.includes(undefined)) return;
  const roster: Roster = {
    id,
    name,
    description,
    defaultTemplate: template,
    randomSlot,
    fighters: read as RosterFighter[],
  };
  return rosterProblems(roster).length === 0 ? roster : undefined;
}
