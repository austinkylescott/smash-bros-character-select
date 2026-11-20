/**
 * The pool: a franchise's cast pulled from its source, from which fighters are picked into a
 * roster. It fills 100 characters at a time, in the source's own order, however the source pages.
 */
import type { UploadedImage } from "../portraits/upload";
import { addCustomFighter, type Roster } from "../rosters/roster";
import type { CastMember, Franchise, FranchiseSource } from "./source";

/** How many characters each pull adds to the pool. */
export const POOL_STEP = 100;

/** Where in the source's pages the next pull starts. */
interface Resume {
  readonly page: number;
  /** How many of that page's characters the pool has already been through. */
  readonly skip: number;
}

/** A franchise's cast, as much of it as has been pulled. */
export interface Pool {
  readonly franchise: Franchise;
  readonly members: readonly CastMember[];
  /** Whether more of the cast can be loaded. */
  readonly more: boolean;
  /** Where the next pull starts, while there is more. */
  readonly resume?: Resume;
}

/** Pulls from where a pool left off until it holds another 100, or the cast runs out. */
async function fill(source: FranchiseSource, pool: Pool, from: Resume): Promise<Pool> {
  const members = [...pool.members];
  const seen = new Set(members.map((member) => member.id));
  const wanted = members.length + POOL_STEP;
  let at = from;

  while (members.length < wanted) {
    const page = await source.castPage(pool.franchise.id, at.page);
    let index = at.skip;
    for (; index < page.members.length && members.length < wanted; index++) {
      const member = page.members[index]!;
      if (seen.has(member.id)) continue;
      seen.add(member.id);
      members.push(member);
    }
    if (index < page.members.length)
      return { ...pool, members, more: true, resume: { page: at.page, skip: index } };
    // An empty page ends the cast, whatever the source says, so a pull always ends.
    if (!page.more || page.members.length === 0)
      return { franchise: pool.franchise, members, more: false };
    at = { page: at.page + 1, skip: 0 };
  }
  return { ...pool, members, more: true, resume: at };
}

/** Pulls the first 100 of a franchise's cast. Throws if the source fails. */
export const pullCast = (source: FranchiseSource, franchise: Franchise): Promise<Pool> =>
  fill(source, { franchise, members: [], more: true }, { page: 1, skip: 0 });

/** Adds the next 100 of the cast to a pool, or gives the pool back if it has it all. */
export const loadMore = (source: FranchiseSource, pool: Pool): Promise<Pool> =>
  pool.more && pool.resume ? fill(source, pool, pool.resume) : Promise.resolve(pool);

/**
 * Adds a character from the pool to the end of a roster, as a fighter of the user's own. Its
 * portrait is the site's copy of the source's image, so the fighter outlives the source losing it.
 * The image starts centre-cropped. A character already in the roster is not added again.
 */
export const pickFromPool = (roster: Roster, member: CastMember, copy: UploadedImage): Roster =>
  addCustomFighter(roster, member.id, member.name, copy);
