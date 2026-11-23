/**
 * The franchise sources as the browser reaches them: through the site's server, which holds any
 * keys they need (ADR 0003).
 */
import { api } from "../../convex/_generated/api";
import { callAction, hasServer } from "../server";
import type { FranchiseSource } from "./source";

export { loadMore, pickFromPool, type Pool, POOL_STEP, pullCast } from "./pool";
export type { CastMember, Franchise, FranchiseSource } from "./source";

/** Makes a call of the sources, failing with a message for the user. */
function ask<T>(call: () => Promise<T>): Promise<T> {
  if (!hasServer)
    return Promise.reject(new Error("This copy of the site has no server to pull casts from."));
  return call();
}

/** The franchise sources, behind the site's server, as one source. */
export const franchiseSources: FranchiseSource = {
  searchFranchises: (query) => ask(() => callAction(api.franchises.searchFranchises, { query })),
  castPage: (franchiseId, page) =>
    ask(() => callAction(api.franchises.castPage, { franchiseId, page })),
  image: (url) => ask(() => callAction(api.franchises.image, { url })),
};
