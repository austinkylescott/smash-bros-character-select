/** The user's rosters, kept in the browser's storage so they outlive the page. No account needed. */
import { GAMES } from "../asset-layer/manifest";
import { isOfficialFighter } from "../official";
import { type Crop, cropFits } from "../portraits/crop";
import { type CustomPortrait, type Roster, type RosterFighter, rosterProblems } from "./roster";

/** The part of a browser's storage the rosters are kept in. */
export type RosterStorage = Pick<Storage, "getItem" | "setItem">;

const ROSTERS_KEY = "rosters";

/** What is stored: the rosters, latest saved first. The version lets the shape change later. */
interface Stored {
  readonly version: 1;
  readonly rosters: readonly unknown[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/** The images the site keeps: data URLs of the formats it resizes uploads to. */
const KEPT_IMAGE = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/;

const isSize = (value: unknown) => typeof value === "number" && Number.isFinite(value) && value > 0;

function cropFrom(stored: unknown): Crop | undefined {
  if (!isRecord(stored)) return;
  const { x, y, width, height } = stored;
  if (typeof x !== "number" || typeof y !== "number") return;
  if (typeof width !== "number" || typeof height !== "number") return;
  return { x, y, width, height };
}

function portraitFrom(stored: unknown): CustomPortrait | undefined {
  if (!isRecord(stored)) return;
  const { image, width, height } = stored;
  if (typeof image !== "string" || !KEPT_IMAGE.test(image)) return;
  if (!isSize(width) || !isSize(height)) return;
  const size = { width: width as number, height: height as number };
  const slot = cropFrom(stored.slot);
  const panel = cropFrom(stored.panel);
  if (!slot || !panel || !cropFits(slot, size) || !cropFits(panel, size)) return;
  return { image, ...size, slot, panel };
}

function fighterFrom(stored: unknown): RosterFighter | undefined {
  if (!isRecord(stored) || typeof stored.id !== "string") return;
  const { id, name } = stored;
  if (stored.portrait !== undefined) {
    // A fighter added by name and image.
    const portrait = portraitFrom(stored.portrait);
    if (isOfficialFighter(id) || typeof name !== "string" || !name.trim() || !portrait) return;
    return { id, name, portrait };
  }
  if (!isOfficialFighter(id)) return;
  if (name === undefined) return { id };
  return typeof name === "string" ? { id, name } : undefined;
}

/** A stored roster, or nothing if it is not one that could have been saved. */
function rosterFrom(stored: unknown): Roster | undefined {
  if (!isRecord(stored)) return;
  const { id, name, description, defaultTemplate, randomSlot, fighters } = stored;
  if (typeof id !== "string" || typeof name !== "string" || typeof description !== "string") return;
  if (typeof randomSlot !== "boolean" || !Array.isArray(fighters)) return;
  const template = GAMES.find((game) => game === defaultTemplate);
  if (!template) return;

  const read = fighters.map(fighterFrom);
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

const idOf = (stored: unknown) => (isRecord(stored) ? stored.id : undefined);

/**
 * The rosters saved in a browser's storage. It reads the storage afresh each time, so what it
 * gives is what a reload would find. Without storage there are no rosters and none can be saved.
 *
 * A stored roster it cannot read is left out of the list but kept in the storage, as a later
 * version of the site may have saved it.
 */
export function createRosterStore(storage: RosterStorage | undefined) {
  /** Everything stored as a roster, readable or not. */
  function entries(): readonly unknown[] {
    try {
      const stored: unknown = JSON.parse(storage?.getItem(ROSTERS_KEY) ?? "null");
      if (!isRecord(stored) || stored.version !== 1 || !Array.isArray(stored.rosters)) return [];
      return stored.rosters;
    } catch {
      return [];
    }
  }

  const list = (): readonly Roster[] => entries().flatMap((each) => rosterFrom(each) ?? []);

  function write(rosters: readonly unknown[]) {
    if (!storage) throw new Error("This browser cannot save rosters.");
    try {
      storage.setItem(ROSTERS_KEY, JSON.stringify({ version: 1, rosters } satisfies Stored));
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError")
        throw new Error(
          "This browser has no room left to save the roster. Remove some fighters added by image, or other rosters, and try again.",
          { cause: error },
        );
      throw error;
    }
  }

  const without = (id: string) => entries().filter((each) => idOf(each) !== id);

  return {
    /** Every saved roster, the latest saved first. */
    list,
    /**
     * Saves a roster, in place of any saved before with its id. Throws, saving nothing, if the
     * roster breaks a rule or the browser will not store it.
     */
    save(roster: Roster) {
      const [problem] = rosterProblems(roster);
      if (problem) throw new Error(problem);
      write([roster, ...without(roster.id)]);
    },
    /** Forgets the roster with an id. */
    remove(id: string) {
      write(without(id));
    },
  };
}
