/** The site's links: which page each one opens, and the link to each screen. */
import { GAMES, type Game } from "../asset-layer/manifest";
import {
  type AvailableTemplate,
  defaultTemplate,
  isAvailableTemplate,
} from "../templates/catalogue";

export type Route =
  | { readonly name: "home" }
  | {
      readonly name: "official-screen";
      /** The official roster shown, named by its game. */
      readonly roster: Game;
      readonly template: AvailableTemplate;
    }
  | {
      readonly name: "roster-screen";
      /** The id of the saved roster shown. */
      readonly roster: string;
      /** The template the link chose. Without one, the roster's default template shows it. */
      readonly template?: AvailableTemplate;
    }
  | {
      readonly name: "roster-editor";
      /** The id of the saved roster to edit. Without one, the editor starts a new roster. */
      readonly roster?: string;
      /** The official roster a new roster starts as a copy of. Without one, it starts empty. */
      readonly copyOf?: Game;
    };

export const HOME_LINK = "/";

const isGame = (value: unknown): value is Game => (GAMES as readonly unknown[]).includes(value);

const HOME: Route = { name: "home" };

/** The page a link under `/rosters` opens: a saved roster's screen, or the editor. */
function rosterRouteOf(segments: readonly string[], query: URLSearchParams): Route {
  const [roster, action, ...rest] = segments;
  if (!roster || rest.length > 0) return HOME;

  if (roster === "new" && !action) {
    const copyOf = query.get("from");
    return isGame(copyOf) ? { name: "roster-editor", copyOf } : { name: "roster-editor" };
  }
  if (action === "edit") return { name: "roster-editor", roster };
  if (action) return HOME;

  const template = query.get("template");
  return isAvailableTemplate(template)
    ? { name: "roster-screen", roster, template }
    : { name: "roster-screen", roster };
}

/**
 * The page a link opens, from its path and query string. A link that names no template, or one
 * that cannot be shown, opens the roster in its default template. Anything unrecognised opens
 * the home page.
 */
export function routeOf(path: string, search: string): Route {
  const [section, roster, ...rest] = path.split("/").filter(Boolean);
  const query = new URLSearchParams(search);
  if (section === "rosters") return rosterRouteOf([...(roster ? [roster] : []), ...rest], query);
  if (section !== "official" || !isGame(roster) || rest.length > 0) return HOME;

  const chosen = query.get("template");
  return {
    name: "official-screen",
    roster,
    template: isAvailableTemplate(chosen) ? chosen : defaultTemplate(roster),
  };
}

/** The link to an official roster's screen: in the given template, or else its default one. */
export const officialScreenLink = (roster: Game, template?: AvailableTemplate): string =>
  template ? `/official/${roster}?template=${template}` : `/official/${roster}`;

/** The link to a saved roster's screen: in the given template, or else its default one. */
export const rosterScreenLink = (roster: string, template?: AvailableTemplate): string =>
  template ? `/rosters/${roster}?template=${template}` : `/rosters/${roster}`;

/** The link to the editor on a saved roster. */
export const rosterEditorLink = (roster: string): string => `/rosters/${roster}/edit`;

/** The link to the editor on a new roster: a copy of an official one, or else an empty one. */
export const newRosterLink = (copyOf?: Game): string =>
  copyOf ? `/rosters/new?from=${copyOf}` : "/rosters/new";
