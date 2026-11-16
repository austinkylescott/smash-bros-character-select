<script setup lang="ts">
/** The home page: the official rosters, each a link to its screen in its default template. */
import "@fontsource/rubik/400.css";
import "@fontsource/rubik/700.css";
import "@fontsource/rubik/900.css";

import { GAMES } from "../asset-layer/manifest";
import { officialRosters } from "../official";
import { officialScreenLink } from "../routes/route";
import { followLink } from "../routes/useRoute";
import { defaultTemplate, templateName } from "../templates/catalogue";

const rosters = GAMES.map((game) => ({
  game,
  name: templateName(game),
  fighters: officialRosters[game].fighters.length,
  template: templateName(defaultTemplate(game)),
  link: officialScreenLink(game),
}));
</script>

<template>
  <main class="home">
    <h1>Character Select</h1>
    <p class="intro">Every Smash roster, shown as any game's character select screen.</p>

    <section aria-labelledby="official-rosters">
      <h2 id="official-rosters">Official rosters</h2>
      <ul class="rosters">
        <li v-for="roster in rosters" :key="roster.game">
          <a :href="roster.link" @click="followLink">
            <span class="name">{{ roster.name }}</span>
            <span class="detail">{{ roster.fighters }} fighters</span>
            <span class="detail">Opens in the {{ roster.template }} template</span>
          </a>
        </li>
      </ul>
    </section>

    <footer class="disclaimer">
      <p>
        This is a non-commercial fan project. It is not affiliated with, endorsed by or sponsored by
        Nintendo. Super Smash Bros. and its fighters, art, music and sounds belong to Nintendo and
        their respective owners.
      </p>
    </footer>
  </main>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 960px;
  min-height: 100%;
  margin: 0 auto;
  /* The top leaves room for the mute button. */
  padding: 72px 20px 32px;
  color: #fff;
  font:
    400 16px/1.5 Rubik,
    system-ui,
    sans-serif;
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  font-size: clamp(36px, 8vw, 64px);
  font-weight: 900;
  line-height: 1.05;
  text-wrap: balance;
}

h2 {
  margin-bottom: 12px;
  font-size: 20px;
  font-weight: 700;
}

.intro {
  color: #c9c9c9;
  font-size: 18px;
}

.rosters {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.rosters a {
  display: flex;
  flex-direction: column;
  gap: 2px;
  height: 100%;
  padding: 16px 18px;
  border: 2px solid #3a3a3a;
  border-radius: 12px;
  background: #161616;
  color: inherit;
  text-decoration: none;
}

.rosters a:hover {
  border-color: #fff;
  background: #222;
}

.rosters a:focus-visible {
  outline: 3px solid #ffcf1a;
  outline-offset: 2px;
}

.name {
  font-size: 24px;
  font-weight: 900;
  line-height: 1.2;
}

.detail {
  color: #c9c9c9;
  font-size: 14px;
}

.disclaimer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #3a3a3a;
  color: #a8a8a8;
  font-size: 14px;
}
</style>
