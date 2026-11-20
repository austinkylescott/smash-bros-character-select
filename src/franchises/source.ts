/**
 * Franchise sources (ADR 0002): the services a franchise's cast is pulled from, one per medium,
 * all behind this one interface. A source runs on the server, as its keys cannot sit in the
 * browser; the browser reaches it through the same interface.
 */

/** A franchise a source knows, as its search gives it. */
export interface Franchise {
  /** The source's id for it, unique among every source's. */
  readonly id: string;
  readonly name: string;
  /** A few words telling it from others of the same name, such as its medium and year. */
  readonly detail: string;
  /** Its cover or logo, at the source. */
  readonly image?: string;
}

/** One character of a franchise's cast. */
export interface CastMember {
  /** The source's id for the character, unique among every source's and no official fighter's. */
  readonly id: string;
  readonly name: string;
  /** The character's image, at the source. Some characters have none. */
  readonly image?: string;
}

/** One page of a franchise's cast, in the source's own order of prominence. */
export interface CastPage {
  readonly members: readonly CastMember[];
  /** Whether the cast goes on past this page. */
  readonly more: boolean;
}

/** An image fetched from a source, to be kept as the site's own copy. */
export interface SourceImage {
  readonly bytes: ArrayBuffer;
  /** Its media type, such as image/jpeg. */
  readonly type: string;
}

/** A service franchises and their casts can be pulled from. Every call can fail, and throws if it does. */
export interface FranchiseSource {
  /** The franchises whose names match a search, the likeliest first. */
  searchFranchises(query: string): Promise<readonly Franchise[]>;
  /** A page of a franchise's cast, counted from 1, most prominent first. */
  castPage(franchiseId: string, page: number): Promise<CastPage>;
  /** Fetches one of the source's own images. Throws for an image the source did not give. */
  image(url: string): Promise<SourceImage>;
}
