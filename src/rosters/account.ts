/**
 * A signed-in user's rosters, kept on the site's server so every device they sign in on has them
 * (ADR 0004). The server keeps each image of a fighter added by image as a file of its own and
 * gives it back as a link, so a roster goes to the server naming its files and comes back showing
 * their links. A new image, still a data URL, is uploaded as it is saved.
 */
import type { FunctionReturnType } from "convex/server";
import type { Infer } from "convex/values";

import type { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { sentRoster } from "../../convex/schema";
import { isCustomFighter, type Roster, type RosterFighter, rosterProblems } from "./roster";

/** An image file kept on the server. */
export type FileId = Id<"_storage">;

/** A roster as it is sent to the server: each fighter added by image names its file. */
export type SentRoster = Infer<typeof sentRoster>;

/** A roster as the server gives it back. */
export type AccountRoster = NonNullable<FunctionReturnType<typeof api.rosters.mine>>[number];

/** What the account's rosters need of the server. Each call throws with a message for the user. */
export interface AccountServer {
  /** Uploads an image, a data URL, giving the file it is kept as. */
  uploadImage(image: string): Promise<FileId>;
  /** Saves a roster, in place of any the account has with its id. */
  save(roster: SentRoster): Promise<unknown>;
  /** Adds a roster unless the account has one with its id. Gives whether it was added. */
  add(roster: SentRoster): Promise<boolean>;
  remove(id: string): Promise<unknown>;
  /** Gives up images uploaded for a roster that was then not saved. */
  discardUploads(files: FileId[]): Promise<unknown>;
}

/** The rosters in a browser, as far as moving them into an account needs. */
export interface BrowserRosters {
  list(): readonly Roster[];
  remove(id: string): void;
}

const isNewImage = (image: string) => image.startsWith("data:");

/** A signed-in user's rosters, saved through the server. */
export function createAccountRosters(server: AccountServer) {
  /** The file behind each image link the server has given. */
  const fileOf = new Map<string, FileId>();

  /**
   * The roster as it is sent, uploading its new images, which are added to `uploaded`. Throws,
   * sending nothing, if the roster breaks a rule.
   */
  async function sent(roster: Roster, uploaded: FileId[]): Promise<SentRoster> {
    const [problem] = rosterProblems(roster);
    if (problem) throw new Error(problem);
    const fighters = [];
    for (const fighter of roster.fighters) {
      if (!isCustomFighter(fighter)) {
        fighters.push(fighter);
        continue;
      }
      const { image, ...portrait } = fighter.portrait;
      let file = fileOf.get(image);
      if (!file && isNewImage(image)) uploaded.push((file = await server.uploadImage(image)));
      if (!file)
        throw new Error(`The image of ${fighter.name} could not be kept. Choose it again.`);
      fighters.push({ ...fighter, portrait: { ...portrait, file } });
    }
    return { ...roster, fighters };
  }

  /** Sends a roster with one of the server's calls, giving up its uploads if the call fails. */
  async function send<T>(roster: Roster, call: (sent: SentRoster) => Promise<T>): Promise<T> {
    const uploaded: FileId[] = [];
    try {
      return await call(await sent(roster, uploaded));
    } catch (error) {
      // The images may never be used, so they are given up rather than left taking up room.
      if (uploaded.length) await server.discardUploads(uploaded).catch(() => undefined);
      throw error;
    }
  }

  return {
    /** The rosters the server gave, as rosters to show and edit. */
    received(rosters: readonly AccountRoster[]): Roster[] {
      return rosters.map((roster) => ({
        ...roster,
        fighters: roster.fighters.map((fighter): RosterFighter => {
          if (!("portrait" in fighter)) return fighter;
          const { file, ...portrait } = fighter.portrait;
          fileOf.set(portrait.image, file);
          return { ...fighter, portrait };
        }),
      }));
    },

    /** Saves a roster to the account. Throws, with a message for the user, if it is not saved. */
    save: async (roster: Roster): Promise<void> =>
      void (await send(roster, (sent) => server.save(sent))),

    remove: async (id: string): Promise<void> => void (await server.remove(id)),

    /**
     * Moves every roster in the browser into the account, oldest first so the latest saved stays
     * first. Each leaves the browser once the account has it, so trying again moves only the rest,
     * and a roster whose id the account already has is the one it has. Throws with the first
     * failure, having moved what it could.
     */
    async moveIn(browser: BrowserRosters): Promise<void> {
      let failure: unknown;
      for (const roster of [...browser.list()].reverse()) {
        try {
          await send(roster, (sent) => server.add(sent));
          browser.remove(roster.id);
        } catch (error) {
          failure ??= error;
        }
      }
      if (failure) throw failure;
    },
  };
}

export type AccountRosters = ReturnType<typeof createAccountRosters>;
