/** The user's rosters, kept in the browser's storage so they outlive the page. No account needed. */
import { isRecord, readRoster } from "./read";
import { type Roster, rosterProblems } from "./roster";

/** The part of a browser's storage the rosters are kept in. */
export type RosterStorage = Pick<Storage, "getItem" | "setItem">;

const ROSTERS_KEY = "rosters";

/** What is stored: the rosters, latest saved first. The version lets the shape change later. */
interface Stored {
  readonly version: 1;
  readonly rosters: readonly unknown[];
}

/** The images the browser keeps: data URLs of the formats the site resizes uploads to. */
const KEPT_IMAGE = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/;

/** A stored roster, or nothing if it is not one that could have been saved in the browser. */
const rosterFrom = (stored: unknown) => readRoster(stored, (image) => KEPT_IMAGE.test(image));

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
     * roster breaks a rule, shows an image the browser does not keep, or the browser will not
     * store it.
     */
    save(roster: Roster) {
      const [problem] = rosterProblems(roster);
      if (problem) throw new Error(problem);
      // Such as an image from an account, which only the account keeps.
      if (!rosterFrom(roster))
        throw new Error("This browser cannot keep a fighter's image. Choose the image again.");
      write([roster, ...without(roster.id)]);
    },
    /** Forgets the roster with an id. */
    remove(id: string) {
      write(without(id));
    },
  };
}
