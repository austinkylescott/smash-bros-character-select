# smash-bros-character-select

A site for making custom Smash rosters with some premade character options, as well as the ability to add user selected submissions.

This template should help get you started developing with Vue 3 in Vite.

## Official assets

Nintendo's portraits, music, sound effects, announcer lines and UI art are not in this repository ([ADR 0005](docs/adr/0005-official-assets-live-outside-git.md)). They live in a private bucket and reach the app through the asset layer in `src/asset-layer/`:

- `manifest.json` lists every official asset by game and kind. Adding, replacing or removing an asset is a change to this file only.
- `resolveAsset(id)` is the one lookup the app uses. Nothing else may reference an asset's location.
- `vp run assets:fetch` downloads the manifest's assets into `src/asset-layer/official/` (gitignored). It needs `BLOB_READ_WRITE_TOKEN` in the environment or in `.env.local`, and also runs as part of `vp run build`.

A fresh clone needs none of this: without a token, or for any asset the bucket lacks, `resolveAsset` returns a placeholder.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```
