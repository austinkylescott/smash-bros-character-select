/** Where the visitor is on the site, and moving between its links without a reload. */
import { readonly, shallowRef } from "vue";

import { routeOf } from "./route";

const read = () => routeOf(location.pathname, location.search);

const current = shallowRef(read());
window.addEventListener("popstate", () => {
  current.value = read();
});

/** The page the address bar is on, kept current as the visitor moves around the site. */
export const route = readonly(current);

/** Opens one of the site's own links without reloading the site. */
export function navigate(link: string) {
  history.pushState(null, "", link);
  current.value = read();
}

/** Opens a link in place of the page being left, so that Back does not return to that page. */
export function replaceWith(link: string) {
  history.replaceState(null, "", link);
  current.value = read();
}

/**
 * For an `<a>`'s click: opens its link in place. A click meant for the browser, such as one that
 * opens a new tab, is left to it.
 */
export function followLink(event: MouseEvent) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return;
  event.preventDefault();
  navigate((event.currentTarget as HTMLAnchorElement).getAttribute("href")!);
}
