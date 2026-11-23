/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The Convex deployment the site's server functions run on. */
  readonly VITE_CONVEX_URL?: string;
  /** The Clerk application users sign in through. Without it, the site offers no signing in. */
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
}

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, unknown>;
  export default component;
}
