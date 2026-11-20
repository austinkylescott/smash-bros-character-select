import { describe, expect, it } from "vite-plus/test";

import { loadMore, pullCast } from "./pool";
import type { CastMember, Franchise, FranchiseSource } from "./source";

const franchise: Franchise = { id: "f1", name: "Some Show", detail: "Anime, 2013" };

const member = (index: number): CastMember => ({
  id: `c${index}`,
  name: `Character ${index}`,
  image: `https://images.example/c${index}.png`,
});

/** A source whose one franchise has a cast of this many, served this many to a page. */
function fakeSource(castSize: number, pageSize = 25): FranchiseSource & { pagesAsked: number[] } {
  const cast = Array.from({ length: castSize }, (_, index) => member(index + 1));
  const pagesAsked: number[] = [];
  return {
    pagesAsked,
    searchFranchises: async () => [franchise],
    async castPage(franchiseId, page) {
      if (franchiseId !== franchise.id) throw new Error("No such franchise");
      pagesAsked.push(page);
      const start = (page - 1) * pageSize;
      return {
        members: cast.slice(start, start + pageSize),
        more: start + pageSize < cast.length,
      };
    },
    image: async () => {
      throw new Error("Not used");
    },
  };
}

const ids = (pool: { members: readonly CastMember[] }) => pool.members.map((each) => each.id);

describe("pulling a franchise's cast into the pool", () => {
  it("lands the first 100 of the cast, in the source's order", async () => {
    const pool = await pullCast(fakeSource(260), franchise);

    expect(pool.franchise).toBe(franchise);
    expect(pool.members).toHaveLength(100);
    expect(ids(pool).slice(0, 3)).toEqual(["c1", "c2", "c3"]);
    expect(pool.members.at(-1)?.id).toBe("c100");
    expect(pool.more).toBe(true);
  });

  it("loads the next 100 on asking for more, until the cast runs out", async () => {
    const source = fakeSource(260);
    const first = await pullCast(source, franchise);
    const second = await loadMore(source, first);
    const third = await loadMore(source, second);

    expect(second.members).toHaveLength(200);
    expect(second.members.at(-1)?.id).toBe("c200");
    expect(second.more).toBe(true);
    expect(third.members).toHaveLength(260);
    expect(third.members.at(-1)?.id).toBe("c260");
    expect(third.more).toBe(false);
  });

  it("picks up mid-page when the source's pages do not divide into 100", async () => {
    const source = fakeSource(150, 30);
    const first = await pullCast(source, franchise);
    const second = await loadMore(source, first);

    expect(first.members.at(-1)?.id).toBe("c100");
    expect(ids(second).slice(100, 102)).toEqual(["c101", "c102"]);
    expect(new Set(ids(second)).size).toBe(150);
    expect(second.more).toBe(false);
  });

  it("asks for nothing more once the whole cast is in", async () => {
    const source = fakeSource(40);
    const pool = await pullCast(source, franchise);
    const again = await loadMore(source, pool);

    expect(pool.more).toBe(false);
    expect(again).toBe(pool);
    expect(source.pagesAsked).toEqual([1, 2]);
  });

  it("keeps each character once, though the source repeat one", async () => {
    const source = fakeSource(10);
    const repeating: FranchiseSource = {
      ...source,
      castPage: async (id, page) => {
        const { members, more } = await source.castPage(id, page);
        return { members: [...members, member(1)], more };
      },
    };

    const pool = await pullCast(repeating, franchise);

    expect(ids(pool)).toEqual(Array.from({ length: 10 }, (_, index) => `c${index + 1}`));
  });

  it("gives an empty pool for a franchise with no cast", async () => {
    const pool = await pullCast(fakeSource(0), franchise);

    expect(pool.members).toEqual([]);
    expect(pool.more).toBe(false);
  });

  it("stops rather than asking forever when the source gives empty pages it says go on", async () => {
    const source: FranchiseSource = {
      ...fakeSource(0),
      castPage: async () => ({ members: [], more: true }),
    };

    const pool = await pullCast(source, franchise);

    expect(pool.members).toEqual([]);
    expect(pool.more).toBe(false);
  });

  it("fails when the source fails", async () => {
    const source: FranchiseSource = {
      ...fakeSource(10),
      castPage: async () => {
        throw new Error("The source is down");
      },
    };

    await expect(pullCast(source, franchise)).rejects.toThrow("The source is down");
  });
});
