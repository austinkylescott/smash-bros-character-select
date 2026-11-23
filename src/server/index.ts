/**
 * The one way the browser reaches the site's server (ADR 0003). Convex has no official Vue SDK, so
 * this thin wrapper gives its client to the rest of the app as plain calls and Vue refs.
 *
 * A copy of the site with no server configured, such as a fresh clone, has `hasServer` false:
 * calls fail with a message for the user and live queries never give a result.
 */
import { ConvexClient } from "convex/browser";
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server";
import { ConvexError } from "convex/values";
import { readonly, type Ref, shallowRef, watch } from "vue";

const url = import.meta.env.VITE_CONVEX_URL;

/** Whether this copy of the site has a server to talk to. */
export const hasServer = !!url;

let client: ConvexClient | undefined;
function connection(): ConvexClient {
  if (!url) throw new Error("This copy of the site has no server.");
  return (client ??= new ConvexClient(url));
}

/** The server's failure as an error for the user: its own message when it gave one. */
function forUser(error: unknown): Error {
  if (error instanceof ConvexError && typeof error.data === "string")
    return new Error(error.data, { cause: error });
  return new Error("The site's server could not be reached. Try again later.", { cause: error });
}

/** Runs one of the server's actions. Throws with a message for the user if it fails. */
export async function callAction<Action extends FunctionReference<"action">>(
  action: Action,
  args: FunctionArgs<Action>,
): Promise<FunctionReturnType<Action>> {
  try {
    return await connection().action(action, args);
  } catch (error) {
    throw forUser(error);
  }
}

/** Runs one of the server's mutations. Throws with a message for the user if it fails. */
export async function callMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
  args: FunctionArgs<Mutation>,
): Promise<FunctionReturnType<Mutation>> {
  try {
    return await connection().mutation(mutation, args);
  } catch (error) {
    throw forUser(error);
  }
}

/** A query's latest result, kept current by the server, or the error it last failed with. */
export interface LiveQuery<Result> {
  /** Nothing until the first result arrives, and again whenever the query stops. */
  readonly result: Readonly<Ref<Result | undefined>>;
  readonly error: Readonly<Ref<Error | undefined>>;
}

/**
 * Follows a query's result. The query runs while `args` gives its arguments and stops while it
 * gives nothing, and runs again with new arguments whenever they change.
 */
export function liveQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: () => FunctionArgs<Query> | undefined,
): LiveQuery<FunctionReturnType<Query>> {
  const result = shallowRef<FunctionReturnType<Query>>();
  const error = shallowRef<Error>();
  watch(
    () => (hasServer ? args() : undefined),
    (current, _, onCleanup) => {
      result.value = error.value = undefined;
      if (current === undefined) return;
      const stop = connection().onUpdate(
        query,
        current,
        (latest) => {
          result.value = latest;
          error.value = undefined;
        },
        (failure) => {
          error.value = forUser(failure);
        },
      );
      onCleanup(() => stop());
    },
    { immediate: true, deep: true },
  );
  return { result: readonly(result), error: readonly(error) };
}

/** A sign-in token for the server, fetched afresh when asked to; null when there is none. */
export type TokenFetcher = (options: { forceRefreshToken: boolean }) => Promise<string | null>;

/**
 * Signs the server's connection in with tokens from the sign-in service. `onChange` hears whether
 * the server took them, and again whenever that changes.
 */
export function signInToServer(fetchToken: TokenFetcher, onChange: (signedIn: boolean) => void) {
  connection().setAuth(fetchToken, onChange);
}

/** Signs the server's connection out, so it acts for no one. */
export function signOutOfServer() {
  client?.client.clearAuth();
}
