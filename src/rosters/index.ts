/**
 * The user's own rosters, kept current as they are saved and removed: in the account while someone
 * is signed in, and in this browser otherwise (ADR 0004). Pages see the same rosters either way.
 * On signing in, the rosters saved in this browser move into the account.
 */
import { computed, shallowRef, watch } from "vue";

import { api } from "../../convex/_generated/api";
import { account } from "../accounts";
import { browserStorage } from "../browser-storage";
import { callMutation, liveQuery, uploadFile } from "../server";
import { createAccountRosters, type FileId } from "./account";
import type { Roster } from "./roster";
import { createRosterStore } from "./store";

const browser = createRosterStore(browserStorage());
const inBrowser = shallowRef(browser.list());
const refresh = () => {
  inBrowser.value = browser.list();
};
// Another tab of the site may save or remove a roster.
window.addEventListener("storage", refresh);

const inAccount = createAccountRosters({
  // The image is a data URL, which fetch reads as the file it holds.
  uploadImage: async (image) =>
    (await uploadFile(api.rosters.uploadUrl, await (await fetch(image)).blob())) as FileId,
  save: (roster) => callMutation(api.rosters.save, { roster }),
  add: (roster) => callMutation(api.rosters.add, { roster }),
  remove: (id) => callMutation(api.rosters.remove, { id }),
  discardUploads: (files) => callMutation(api.rosters.discardUploads, { files }),
});

const signedIn = computed(() => account.value.status === "signed-in");
const fromAccount = liveQuery(api.rosters.mine, () => (signedIn.value ? {} : undefined));
const accountRosters = computed(() => {
  const rosters = fromAccount.result.value;
  return rosters ? inAccount.received(rosters) : undefined;
});

/** Why the rosters in this browser did not all move into the account, if they did not. */
const moveFailure = shallowRef("");

/** The signed-in user, if someone is. */
const userNow = () => (account.value.status === "signed-in" ? account.value.user : undefined);

watch(
  signedIn,
  async (now) => {
    moveFailure.value = "";
    const user = userNow();
    if (!now || inBrowser.value.length === 0) return;
    const stillSignedIn = () => userNow() === user;
    try {
      await inAccount.moveIn(browser, stillSignedIn);
    } catch (error) {
      if (stillSignedIn())
        moveFailure.value = `Some rosters saved in this browser could not move into your account. ${
          error instanceof Error ? error.message : ""
        }`.trim();
    } finally {
      refresh();
    }
  },
  { immediate: true },
);

/** Where the user's rosters are kept now. */
export const rostersKeptIn = computed(() => (signedIn.value ? "account" : "browser"));

/** Whether the user's rosters are known yet. Until then, a roster that is not listed may yet be. */
export const rostersKnown = computed(() => {
  if (account.value.status === "unknown") return false;
  return !signedIn.value || accountRosters.value !== undefined;
});

/** Why the account's rosters cannot be shown or moved in, if something went wrong. */
export const rostersProblem = computed(
  () =>
    (signedIn.value && fromAccount.error.value?.message) ||
    moveFailure.value ||
    (account.value.status === "signed-out" ? (account.value.problem ?? "") : ""),
);

/** Every one of the user's rosters, the latest saved first. */
export const myRosters = computed(
  (): readonly Roster[] => (signedIn.value ? accountRosters.value : inBrowser.value) ?? [],
);

/** The user's roster with an id, if they have one. */
export const myRoster = (id: string): Roster | undefined =>
  myRosters.value.find((roster) => roster.id === id);

/**
 * Saves a roster, to the account when someone is signed in and in this browser otherwise. Throws,
 * with a message for the user, if it breaks a rule or cannot be kept.
 */
export async function saveRoster(roster: Roster): Promise<void> {
  // Saving now could put the roster in the browser while the user is signing in.
  if (account.value.status === "unknown")
    throw new Error("Still checking whether you are signed in. Try again in a moment.");
  if (signedIn.value) return inAccount.save(roster);
  browser.save(roster);
  refresh();
}

/** Deletes one of the user's rosters. Throws, with a message for the user, if it cannot. */
export async function removeRoster(id: string): Promise<void> {
  if (account.value.status === "unknown")
    throw new Error("Still checking whether you are signed in. Try again in a moment.");
  if (signedIn.value) return inAccount.remove(id);
  browser.remove(id);
  refresh();
}

/** An id for a new roster, short enough for a link. */
export const newRosterId = (): string =>
  Array.from(crypto.getRandomValues(new Uint8Array(4)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
