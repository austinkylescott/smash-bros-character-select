import { describe, expect, it } from "vite-plus/test";

import { aniListSource } from "./anilist";

interface Call {
  readonly url: string;
  readonly body?: { query: string; variables: Record<string, unknown> };
}

/** A fetch that answers every call with one response, and records the calls made. */
function fakeFetch(respond: (call: Call) => Response) {
  const calls: Call[] = [];
  const fetch = async (input: string | URL | Request, init?: RequestInit) => {
    const call: Call = {
      url: input instanceof Request ? input.url : input.toString(),
      body: typeof init?.body === "string" ? JSON.parse(init.body) : undefined,
    };
    calls.push(call);
    return respond(call);
  };
  return { fetch: fetch as typeof globalThis.fetch, calls };
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

const IMAGE_HOST = "https://s4.anilist.co/file/anilistcdn";

describe("searching AniList for a franchise", () => {
  it("gives anime and manga as franchises, with what tells them apart", async () => {
    const { fetch, calls } = fakeFetch(() =>
      json({
        data: {
          Page: {
            media: [
              {
                id: 20,
                type: "ANIME",
                format: "TV",
                title: { userPreferred: "NARUTO" },
                startDate: { year: 2002 },
                coverImage: { medium: `${IMAGE_HOST}/media/anime/cover/small/bx20.jpg` },
              },
              {
                id: 30011,
                type: "MANGA",
                format: "MANGA",
                title: { userPreferred: "NARUTO" },
                startDate: { year: null },
                coverImage: { medium: null },
              },
            ],
          },
        },
      }),
    );

    const found = await aniListSource(fetch).searchFranchises("naruto");

    expect(found).toEqual([
      {
        id: "anilist-media-20",
        name: "NARUTO",
        detail: "TV anime, 2002",
        image: `${IMAGE_HOST}/media/anime/cover/small/bx20.jpg`,
      },
      { id: "anilist-media-30011", name: "NARUTO", detail: "Manga" },
    ]);
    expect(calls[0]?.url).toBe("https://graphql.anilist.co");
    expect(calls[0]?.body?.variables).toMatchObject({ search: "naruto" });
  });

  it("asks nothing for a blank search", async () => {
    const { fetch, calls } = fakeFetch(() => json({}));

    expect(await aniListSource(fetch).searchFranchises("   ")).toEqual([]);
    expect(calls).toEqual([]);
  });

  it("fails when AniList cannot be reached or refuses", async () => {
    const { fetch } = fakeFetch(() => json({ errors: [{ message: "Too Many Requests." }] }, 429));

    await expect(aniListSource(fetch).searchFranchises("naruto")).rejects.toThrow();
  });
});

describe("pulling a cast from AniList", () => {
  const castResponse = (hasNextPage: boolean) =>
    json({
      data: {
        Media: {
          characters: {
            pageInfo: { hasNextPage },
            nodes: [
              {
                id: 17,
                name: { userPreferred: "Naruto Uzumaki" },
                image: { large: `${IMAGE_HOST}/character/large/b17.png` },
              },
              {
                id: 99,
                name: { userPreferred: "Nameless Villager" },
                image: { large: `${IMAGE_HOST}/character/large/default.jpg` },
              },
            ],
          },
        },
      },
    });

  it("gives a page of characters, leaving out AniList's stand-in image", async () => {
    const { fetch, calls } = fakeFetch(() => castResponse(true));

    const page = await aniListSource(fetch).castPage("anilist-media-20", 2);

    expect(page).toEqual({
      members: [
        {
          id: "anilist-character-17",
          name: "Naruto Uzumaki",
          image: `${IMAGE_HOST}/character/large/b17.png`,
        },
        { id: "anilist-character-99", name: "Nameless Villager" },
      ],
      more: true,
    });
    expect(calls[0]?.body?.variables).toMatchObject({ id: 20, page: 2 });
  });

  it("says when the cast ends", async () => {
    const { fetch } = fakeFetch(() => castResponse(false));

    expect((await aniListSource(fetch).castPage("anilist-media-20", 1)).more).toBe(false);
  });

  it("fails for a franchise that is not AniList's, without asking it", async () => {
    const { fetch, calls } = fakeFetch(() => castResponse(false));

    await expect(aniListSource(fetch).castPage("igdb-game-20", 1)).rejects.toThrow();
    expect(calls).toEqual([]);
  });

  it("fails for a franchise AniList does not have", async () => {
    const { fetch } = fakeFetch(() =>
      json({ errors: [{ message: "Not Found.", status: 404 }], data: { Media: null } }, 404),
    );

    await expect(aniListSource(fetch).castPage("anilist-media-999999999", 1)).rejects.toThrow();
  });
});

describe("fetching an AniList image", () => {
  const png = new Uint8Array([137, 80, 78, 71]);

  it("gives the image's bytes and type", async () => {
    const { fetch } = fakeFetch(
      () => new Response(png, { headers: { "Content-Type": "image/png" } }),
    );

    const image = await aniListSource(fetch).image(`${IMAGE_HOST}/character/large/b17.png`);

    expect(image.type).toBe("image/png");
    expect(new Uint8Array(image.bytes)).toEqual(png);
  });

  it("fetches nothing from anywhere but AniList's image host", async () => {
    const { fetch, calls } = fakeFetch(
      () => new Response(png, { headers: { "Content-Type": "image/png" } }),
    );
    const source = aniListSource(fetch);

    for (const url of [
      "https://example.com/b17.png",
      "http://s4.anilist.co/file/anilistcdn/character/large/b17.png",
      "https://s4.anilist.co.example.com/file/anilistcdn/b17.png",
      "https://graphql.anilist.co",
    ])
      await expect(source.image(url)).rejects.toThrow();
    expect(calls).toEqual([]);
  });

  it("fails for something that is not an image", async () => {
    const { fetch } = fakeFetch(
      () => new Response("<html></html>", { headers: { "Content-Type": "text/html" } }),
    );

    await expect(
      aniListSource(fetch).image(`${IMAGE_HOST}/character/large/b17.png`),
    ).rejects.toThrow();
  });

  it("fails for an image that is gone", async () => {
    const { fetch } = fakeFetch(() => new Response("Not found", { status: 404 }));

    await expect(
      aniListSource(fetch).image(`${IMAGE_HOST}/character/large/b17.png`),
    ).rejects.toThrow();
  });
});
