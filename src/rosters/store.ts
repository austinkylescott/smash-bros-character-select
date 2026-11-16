/** The user's rosters, kept in the browser's storage so they outlive the page. No account needed. */
import { GAMES } from "../asset-layer/manifest";
import { isOfficialFighter } from "../official";
import { type Roster, type RosterFighter, rosterProblems } from "./roster";

export type RosterStorage = Pick<Storage, "getItem" | "setItem">;

const ROSTERS_KEY = "rosters";

/** What is stored: the rosters, latest saved first. The version lets the shape change later. */
interface Stored {
  readonly version: 1;
  readonly rosters: readonly Roster[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function fighterFrom(stored: unknown): RosterFighter | undefined {
  if (!isRecord(stored) || typeof stored.id !== "string" || !isOfficialFighter(stored.id)) return;
  if (stored.name === undefined) return { id: stored.id };
  return typeof stored.name === "string" ? { id: stored.id, name: stored.name } : undefined;
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

/**
 * The rosters saved in a browser's storage. It reads the storage afresh each time, so what it
 * gives is what a reload would find. Without storage there are no rosters and none can be saved.
 */
export function createRosterStore(storage: RosterStorage | undefined) {
  function list(): readonly Roster[] {
    try {
      const stored: unknown = JSON.parse(storage?.getItem(ROSTERS_KEY) ?? "null");
      if (!isRecord(stored) || !Array.isArray(stored.rosters)) return [];
      return stored.rosters.flatMap((each) => rosterFrom(each) ?? []);
    } catch {
      return [];
    }
  }

  function write(rosters: readonly Roster[]) {
    if (!storage) throw new Error("This browser cannot save rosters.");
    storage.setItem(ROSTERS_KEY, JSON.stringify({ version: 1, rosters } satisfies Stored));
  }

  const without = (id: string) => list().filter((roster) => roster.id !== id);

  return {
    /** Every saved roster, the latest saved first. */
    list,
    get: (id: string): Roster | undefined => list().find((roster) => roster.id === id),
    /**
     * Saves a roster, in place of any saved before with its id. Throws, saving nothing, if the
     * roster breaks a rule or the browser will not store it.
     */
    save(roster: Roster) {
      const [problem] = rosterProblems(roster);
      if (problem) throw new Error(problem);
      write([roster, ...without(roster.id)]);
    },
    remove(id: string) {
      write(without(id));
    },
  };
}

export type RosterStore = ReturnType<typeof createRosterStore>;
