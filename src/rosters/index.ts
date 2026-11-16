/** The user's own rosters, as saved in this browser, kept current as they are saved and removed. */
import { readonly, shallowRef } from "vue";

import { browserStorage } from "../browser-storage";
import type { Roster } from "./roster";
import { createRosterStore } from "./store";

const store = createRosterStore(browserStorage());
const saved = shallowRef(store.list());
const refresh = () => {
  saved.value = store.list();
};
// Another tab of the site may save or remove a roster.
window.addEventListener("storage", refresh);

/** Every roster saved in this browser, the latest saved first. */
export const myRosters = readonly(saved);

export const myRoster = (id: string): Roster | undefined =>
  saved.value.find((roster) => roster.id === id);

/** Saves a roster in this browser. Throws if it breaks a rule or the browser will not store it. */
export function saveRoster(roster: Roster) {
  store.save(roster);
  refresh();
}

export function removeRoster(id: string) {
  store.remove(id);
  refresh();
}

/** An id for a new roster, short enough for a link. */
export const newRosterId = (): string => crypto.randomUUID().slice(0, 8);
