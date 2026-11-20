/**
 * The franchise sources, reached from the browser (ADR 0003). Each action is one call of the
 * FranchiseSource interface; AniList is the only source so far.
 *
 * Convex hides a plain error's message from the browser in production, so every failure is passed
 * on as a ConvexError carrying its message, which is written for the user.
 */
import { ConvexError, v } from "convex/values";

import { aniListSource } from "../src/franchises/anilist";
import { action } from "./_generated/server";

const source = aniListSource();

/** The longest search passed on to a source. */
const MAX_QUERY = 100;

/** Runs a call of the source, passing on any failure's message to the browser. */
async function passingOnFailure<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    throw new ConvexError(error instanceof Error ? error.message : "The franchise source failed.");
  }
}

/** The franchises whose names match a search, the likeliest first. */
export const searchFranchises = action({
  args: { query: v.string() },
  handler: (_, { query }) =>
    passingOnFailure(() => source.searchFranchises(query.slice(0, MAX_QUERY))),
});

/** A page of a franchise's cast, counted from 1, most prominent first. */
export const castPage = action({
  args: { franchiseId: v.string(), page: v.number() },
  handler: (_, { franchiseId, page }) =>
    passingOnFailure(async () => {
      if (!Number.isInteger(page) || page < 1) throw new Error("Pages count from 1.");
      return source.castPage(franchiseId, page);
    }),
});

/** Fetches one of a source's own images, for the browser to keep its own copy of. */
export const image = action({
  args: { url: v.string() },
  handler: (_, { url }) => passingOnFailure(() => source.image(url)),
});
