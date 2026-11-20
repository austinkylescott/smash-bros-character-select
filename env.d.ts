/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The Convex deployment the site's server functions run on. */
  readonly VITE_CONVEX_URL?: string;
}

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, unknown>;
  export default component;
}
