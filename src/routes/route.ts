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
    };

export const HOME_LINK = "/";

const isGame = (value: unknown): value is Game => (GAMES as readonly unknown[]).includes(value);

/**
 * The page a link opens, from its path and query string. A link that names no template, or one
 * that cannot be shown, opens the roster in its default template. Anything unrecognised opens
 * the home page.
 */
export function routeOf(path: string, search: string): Route {
  const [section, roster, ...rest] = path.split("/").filter(Boolean);
  if (section !== "official" || !isGame(roster) || rest.length > 0) return { name: "home" };

  const chosen = new URLSearchParams(search).get("template");
  return {
    name: "official-screen",
    roster,
    template: isAvailableTemplate(chosen) ? chosen : defaultTemplate(roster),
  };
}

/** The link to an official roster's screen: in the given template, or else its default one. */
export const officialScreenLink = (roster: Game, template?: AvailableTemplate): string =>
  template ? `/official/${roster}?template=${template}` : `/official/${roster}`;
