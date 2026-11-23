/**
 * Signed-in users' rosters (ADR 0004). Each is kept under its owner's sign-in identity, and only
 * its owner can read or change it. They are held to the same rules as rosters saved in the browser.
 *
 * A fighter added by image keeps its image in file storage (ADR 0003). The browser uploads the
 * file, then saves the roster naming it; the first roster to name a file makes it its owner's, and
 * a file is deleted once none of its owner's rosters shows it.
 */
import { ConvexError, type Infer, v } from "convex/values";

import { readRoster } from "../src/rosters/read";
import { rosterProblems } from "../src/rosters/roster";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, type MutationCtx, query, type QueryCtx } from "./_generated/server";
import { sentRoster } from "./schema";

type SentRoster = Infer<typeof sentRoster>;

/** The image formats the browser resizes uploads to. */
const KEPT_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

/** The largest image file kept. The browser's resized images are well under it. */
const MAX_IMAGE_BYTES = 512 * 1024;

/** The signed-in user's identity, or nothing when no one is signed in. */
async function ownerOf(ctx: QueryCtx): Promise<string | undefined> {
  return (await ctx.auth.getUserIdentity())?.tokenIdentifier;
}

async function signedIn(ctx: QueryCtx): Promise<string> {
  const owner = await ownerOf(ctx);
  if (!owner) throw new ConvexError("Sign in to save rosters to your account.");
  return owner;
}

/** The roster as the shared rules see it, with each portrait's file standing for its image. */
const asRoster = (roster: SentRoster) => ({
  ...roster,
  fighters: roster.fighters.map((fighter) =>
    "portrait" in fighter
      ? { ...fighter, portrait: { ...fighter.portrait, image: fighter.portrait.file } }
      : fighter,
  ),
});

/** Throws, for the user, if a roster breaks a rule the browser holds it to. */
function check(roster: SentRoster) {
  const candidate = asRoster(roster);
  const [problem] = rosterProblems(candidate);
  if (problem) throw new ConvexError(problem);
  if (!readRoster(candidate, () => true))
    throw new ConvexError("That roster has a fighter this site cannot show.");
}

/** The image files a roster shows. */
const filesOf = (roster: SentRoster): Id<"_storage">[] =>
  roster.fighters.flatMap((fighter) => ("portrait" in fighter ? [fighter.portrait.file] : []));

const claimOf = (ctx: QueryCtx, file: Id<"_storage">) =>
  ctx.db
    .query("portraits")
    .withIndex("by_file", (q) => q.eq("file", file))
    .unique();

/** Makes each of a roster's image files the owner's, refusing any that is not theirs to use. */
async function claim(ctx: MutationCtx, owner: string, roster: SentRoster) {
  for (const file of new Set(filesOf(roster))) {
    const claimed = await claimOf(ctx, file);
    if (claimed?.owner === owner) continue;
    if (claimed) throw new ConvexError("That roster uses an image from another account.");
    const stored = await ctx.db.system.get(file);
    if (!stored || !KEPT_TYPES.has(stored.contentType ?? "") || stored.size > MAX_IMAGE_BYTES)
      throw new ConvexError("A fighter's image could not be kept. Choose the image again.");
    await ctx.db.insert("portraits", { owner, file });
  }
}

const rostersOf = (ctx: QueryCtx, owner: string) =>
  ctx.db
    .query("rosters")
    .withIndex("by_owner_and_saved", (q) => q.eq("owner", owner))
    .order("desc")
    .collect();

/** Deletes those of some image files that none of the owner's rosters shows any more. */
async function deleteUnshown(ctx: MutationCtx, owner: string, files: Iterable<Id<"_storage">>) {
  const shown = new Set((await rostersOf(ctx, owner)).flatMap((saved) => filesOf(saved.roster)));
  for (const file of new Set(files)) {
    if (shown.has(file)) continue;
    const claimed = await claimOf(ctx, file);
    if (claimed?.owner !== owner) continue;
    await ctx.db.delete(claimed._id);
    await ctx.storage.delete(file);
  }
}

/** Deletes image files uploaded but never shown by a roster, so no account owns them. */
async function deleteUnclaimed(ctx: MutationCtx, files: Iterable<Id<"_storage">>) {
  for (const file of new Set(files)) {
    if (await claimOf(ctx, file)) continue;
    if (await ctx.db.system.get(file)) await ctx.storage.delete(file);
  }
}

const savedRoster = (ctx: QueryCtx, owner: string, id: string) =>
  ctx.db
    .query("rosters")
    .withIndex("by_owner_and_roster", (q) => q.eq("owner", owner).eq("roster.id", id))
    .unique();

/** Saves a roster under its owner, in place of what was saved before, which is given. */
async function write(
  ctx: MutationCtx,
  owner: string,
  roster: SentRoster,
  before: Doc<"rosters"> | null,
) {
  check(roster);
  await claim(ctx, owner, roster);
  if (before) await ctx.db.patch(before._id, { roster, savedAt: Date.now() });
  else await ctx.db.insert("rosters", { owner, roster, savedAt: Date.now() });
  if (before) await deleteUnshown(ctx, owner, filesOf(before.roster));
}

/**
 * The signed-in user's rosters, the latest saved first, or nothing when no one is signed in. Each
 * image file comes with a link to the image.
 */
export const mine = query({
  args: {},
  handler: async (ctx) => {
    const owner = await ownerOf(ctx);
    if (!owner) return null;
    const saved = await rostersOf(ctx, owner);
    return Promise.all(
      saved.map(async ({ roster }) => ({
        ...roster,
        fighters: await Promise.all(
          roster.fighters.map(async (fighter) =>
            "portrait" in fighter
              ? {
                  ...fighter,
                  portrait: {
                    ...fighter.portrait,
                    image: (await ctx.storage.getUrl(fighter.portrait.file)) ?? "",
                  },
                }
              : fighter,
          ),
        ),
      })),
    );
  },
});

/** Where the signed-in user can upload a fighter's image, to name in a roster they save. */
export const uploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await signedIn(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

/** Saves a roster to the signed-in user's account, in place of any saved before with its id. */
export const save = mutation({
  args: { roster: sentRoster },
  handler: async (ctx, { roster }) => {
    const owner = await signedIn(ctx);
    await write(ctx, owner, roster, await savedRoster(ctx, owner, roster.id));
  },
});

/**
 * Adds a roster to the signed-in user's account unless it already has one with its id, which it
 * keeps, deleting the images uploaded for this one, so moving a roster in twice moves it once.
 * Gives whether it was added.
 */
export const add = mutation({
  args: { roster: sentRoster },
  handler: async (ctx, { roster }) => {
    const owner = await signedIn(ctx);
    if (await savedRoster(ctx, owner, roster.id)) {
      await deleteUnclaimed(ctx, filesOf(roster));
      return false;
    }
    await write(ctx, owner, roster, null);
    return true;
  },
});

/** Removes one of the signed-in user's rosters, and the images only it showed. */
export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const owner = await signedIn(ctx);
    const saved = await savedRoster(ctx, owner, id);
    if (!saved) return;
    await ctx.db.delete(saved._id);
    await deleteUnshown(ctx, owner, filesOf(saved.roster));
  },
});

/** Deletes images uploaded for a roster that then was not saved. Images a roster shows are kept. */
export const discardUploads = mutation({
  args: { files: v.array(v.id("_storage")) },
  handler: (ctx, { files }) => deleteUnclaimed(ctx, files),
});
