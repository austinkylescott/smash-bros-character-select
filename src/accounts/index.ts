/**
 * Accounts: signing in with Discord or Google through Clerk, with no passwords (ADR 0004). Only
 * saving to the server needs an account; everything else works signed out.
 *
 * A copy of the site without Clerk or a server configured, such as a fresh clone, has
 * `accountsAvailable` false and is always signed out.
 */
import { readonly, shallowRef } from "vue";

import { hasServer, signInToServer, signOutOfServer, type TokenFetcher } from "../server";

/** The key of the Clerk application users sign in through. */
export const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

/** Whether this copy of the site offers signing in. */
export const accountsAvailable = hasServer && !!clerkKey;

/** Who is signed in, as far as the site's server is concerned. */
export type AccountState =
  /** Not known yet: the sign-in service or the server has still to answer. */
  | { readonly status: "unknown" }
  /** No one, with why when someone signed in but the server would not take it. */
  | { readonly status: "signed-out"; readonly problem?: string }
  | { readonly status: "signed-in"; readonly user: string };

const state = shallowRef<AccountState>(
  accountsAvailable ? { status: "unknown" } : { status: "signed-out" },
);

/** Who is signed in. */
export const account = readonly(state);

/** How long to wait for the sign-in service before carrying on signed out without it. */
const SIGN_IN_PATIENCE_MS = 10_000;

let heard = false;
if (accountsAvailable)
  setTimeout(() => {
    // The sign-in service may be blocked or down; the site still works without it.
    if (!heard) state.value = { status: "signed-out" };
  }, SIGN_IN_PATIENCE_MS);

/** What the sign-in service says. */
export interface SignIn {
  /** Whether the service has loaded and knows who, if anyone, is signed in. */
  readonly loaded: boolean;
  /** The signed-in user's id, if someone is. */
  readonly user: string | null | undefined;
  /** Fetches a token for the site's server. */
  readonly fetchToken: TokenFetcher;
}

let following: string | null = null;

/** Follows the sign-in service, signing the server in and out with it. */
export function followSignIn({ loaded, user, fetchToken }: SignIn) {
  if (!loaded) return;
  heard = true;
  if ((user ?? null) === following && state.value.status !== "unknown") return;
  following = user ?? null;

  if (!user) {
    signOutOfServer();
    state.value = { status: "signed-out" };
    return;
  }
  state.value = { status: "unknown" };
  signInToServer(fetchToken, (taken) => {
    if (following !== user) return;
    state.value = taken
      ? { status: "signed-in", user }
      : {
          status: "signed-out",
          problem: "You are signed in, but the site's server would not take it. Try again later.",
        };
  });
}
