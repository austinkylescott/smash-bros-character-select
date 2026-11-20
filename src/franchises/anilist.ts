/**
 * AniList, the franchise source for anime and manga (ADR 0002). Each anime or manga is a
 * franchise; its characters, main roles first, are its cast. Runs on the server.
 */
import type { CastMember, CastPage, Franchise, FranchiseSource, SourceImage } from "./source";

const API = "https://graphql.anilist.co";
/** Where every AniList image is, and the only place this source fetches images from. */
const IMAGE_ORIGIN = "https://s4.anilist.co";
/** The image AniList gives a character that has none of its own. */
const STAND_IN = /\/default\.(jpe?g|png)$/;
/** The largest image fetched, in bytes: the most the site takes as an upload. */
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const MEDIA_PREFIX = "anilist-media-";
const CHARACTER_PREFIX = "anilist-character-";

/** AniList's formats, as people name them. */
const FORMATS: Readonly<Record<string, string>> = {
  TV: "TV anime",
  TV_SHORT: "TV anime",
  MOVIE: "Anime film",
  SPECIAL: "Anime special",
  OVA: "OVA",
  ONA: "Web anime",
  MUSIC: "Music video",
  MANGA: "Manga",
  NOVEL: "Light novel",
  ONE_SHOT: "One-shot manga",
};

const SEARCH = `query ($search: String) {
  Page(perPage: 10) {
    media(search: $search, isAdult: false, sort: [SEARCH_MATCH]) {
      id type format title { userPreferred } startDate { year } coverImage { medium }
    }
  }
}`;

const CAST = `query ($id: Int, $page: Int) {
  Media(id: $id) {
    characters(page: $page, perPage: 50, sort: [ROLE, RELEVANCE, ID]) {
      pageInfo { hasNextPage }
      nodes { id name { userPreferred } image { large } }
    }
  }
}`;

interface AniListMedia {
  id: number;
  type: string | null;
  format: string | null;
  title: { userPreferred: string | null };
  startDate: { year: number | null } | null;
  coverImage: { medium: string | null } | null;
}

interface AniListCharacter {
  id: number;
  name: { userPreferred: string | null } | null;
  image: { large: string | null } | null;
}

/** An image of AniList's own, or nothing for its stand-in. */
const ownImage = (url: string | null | undefined) => (url && !STAND_IN.test(url) ? url : undefined);

function franchiseFrom(media: AniListMedia): Franchise {
  const kind =
    (media.format && FORMATS[media.format]) ?? (media.type === "MANGA" ? "Manga" : "Anime");
  const year = media.startDate?.year;
  const image = ownImage(media.coverImage?.medium);
  return {
    id: `${MEDIA_PREFIX}${media.id}`,
    name: media.title.userPreferred ?? "Untitled",
    detail: year ? `${kind}, ${year}` : kind,
    ...(image && { image }),
  };
}

function memberFrom(character: AniListCharacter): CastMember {
  const image = ownImage(character.image?.large);
  return {
    id: `${CHARACTER_PREFIX}${character.id}`,
    name: character.name?.userPreferred ?? "Unnamed",
    ...(image && { image }),
  };
}

/** AniList as a franchise source, reached through a fetch. */
export function aniListSource(fetch: typeof globalThis.fetch = globalThis.fetch): FranchiseSource {
  async function ask<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const response = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    const answer = (await response.json().catch(() => ({}))) as {
      data?: T;
      errors?: { message: string }[];
    };
    if (!response.ok || answer.errors?.length || !answer.data)
      throw new Error(
        `AniList could not answer: ${answer.errors?.[0]?.message ?? response.statusText}`,
      );
    return answer.data;
  }

  return {
    async searchFranchises(query) {
      const search = query.trim();
      if (!search) return [];
      const data = await ask<{ Page: { media: AniListMedia[] } }>(SEARCH, { search });
      return data.Page.media.map(franchiseFrom);
    },

    async castPage(franchiseId, page): Promise<CastPage> {
      const id = Number(franchiseId.slice(MEDIA_PREFIX.length));
      if (!franchiseId.startsWith(MEDIA_PREFIX) || !Number.isInteger(id))
        throw new Error(`${franchiseId} is not an AniList franchise.`);
      const data = await ask<{
        Media: {
          characters: { pageInfo: { hasNextPage: boolean }; nodes: AniListCharacter[] };
        } | null;
      }>(CAST, { id, page });
      if (!data.Media) throw new Error("AniList has no such franchise.");
      const { pageInfo, nodes } = data.Media.characters;
      return { members: nodes.map(memberFrom), more: pageInfo.hasNextPage };
    },

    async image(url): Promise<SourceImage> {
      let parsed: URL;
      try {
        parsed = new URL(url);
      } catch {
        throw new Error("That is not an image's address.");
      }
      if (parsed.origin !== IMAGE_ORIGIN) throw new Error("That image is not one of AniList's.");
      const response = await fetch(parsed);
      if (!response.ok) throw new Error("AniList no longer has that image.");
      // Refused before downloading when AniList says how large it is, and after if it does not.
      if (Number(response.headers.get("Content-Length")) > MAX_IMAGE_BYTES)
        throw new Error("That image is too large.");
      const type = response.headers.get("Content-Type")?.split(";")[0]?.trim() ?? "";
      if (!type.startsWith("image/")) throw new Error("AniList did not give an image.");
      const bytes = await response.arrayBuffer();
      if (bytes.byteLength > MAX_IMAGE_BYTES) throw new Error("That image is too large.");
      return { bytes, type };
    },
  };
}
