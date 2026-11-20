/**
 * The franchise sources as the browser reaches them: through the site's server, which holds any
 * keys they need (ADR 0003).
 */
import { ConvexHttpClient } from "convex/browser";
import { ConvexError } from "convex/values";

import { api } from "../../convex/_generated/api";
import type { FranchiseSource } from "./source";

export { loadMore, pickFromPool, type Pool, POOL_STEP, pullCast } from "./pool";
export type { CastMember, Franchise, FranchiseSource } from "./source";

let client: ConvexHttpClient | undefined;
function server(): ConvexHttpClient {
  const url = import.meta.env.VITE_CONVEX_URL;
  if (!url) throw new Error("This copy of the site has no server to pull casts from.");
  return (client ??= new ConvexHttpClient(url));
}

/** Makes a server call, failing with the server's message for the user when it has one. */
async function ask<T>(call: (client: ConvexHttpClient) => Promise<T>): Promise<T> {
  try {
    return await call(server());
  } catch (error) {
    if (error instanceof ConvexError && typeof error.data === "string")
      throw new Error(error.data, { cause: error });
    throw new Error("The site's server could not be reached. Try again later.", { cause: error });
  }
}

/** The franchise sources, behind the site's server, as one source. */
export const franchiseSources: FranchiseSource = {
  searchFranchises: (query) =>
    ask((client) => client.action(api.franchises.searchFranchises, { query })),
  castPage: (franchiseId, page) =>
    ask((client) => client.action(api.franchises.castPage, { franchiseId, page })),
  image: (url) => ask((client) => client.action(api.franchises.image, { url })),
};
