/**
 * What the site's server keeps: signed-in users' rosters, and the portraits they added by image,
 * which sit in Convex file storage rather than in the roster (ADR 0003).
 */
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { GAMES } from "../src/asset-layer/manifest";

const crop = v.object({ x: v.number(), y: v.number(), width: v.number(), height: v.number() });

/** A fighter's own image, as a stored file, with the regions shown in a slot and a player panel. */
export const storedPortrait = v.object({
  file: v.id("_storage"),
  width: v.number(),
  height: v.number(),
  slot: crop,
  panel: crop,
});

/** A fighter in a roster: an official one, or one the user added by name and image. */
export const storedFighter = v.union(
  v.object({ id: v.string(), name: v.optional(v.string()) }),
  v.object({ id: v.string(), name: v.string(), portrait: storedPortrait }),
);

/** A roster as the browser sends it to be saved. */
export const sentRoster = v.object({
  id: v.string(),
  name: v.string(),
  description: v.string(),
  defaultTemplate: v.union(...GAMES.map((game) => v.literal(game))),
  randomSlot: v.boolean(),
  fighters: v.array(storedFighter),
});

export default defineSchema({
  rosters: defineTable({
    /** The account the roster belongs to: its sign-in identity's `tokenIdentifier`. */
    owner: v.string(),
    roster: sentRoster,
    savedAt: v.number(),
  })
    .index("by_owner_and_roster", ["owner", "roster.id"])
    .index("by_owner_and_saved", ["owner", "savedAt"]),

  /** Which account each uploaded portrait file belongs to, once a roster has used it. */
  portraits: defineTable({ owner: v.string(), file: v.id("_storage") }).index("by_file", ["file"]),
});
