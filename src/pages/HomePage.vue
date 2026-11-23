<script setup lang="ts">
/**
 * The home page: the user's rosters, in this browser or their account, and the official rosters,
 * each a link to its screen in its default template.
 */
import "@fontsource/rubik/400.css";
import "@fontsource/rubik/700.css";
import "@fontsource/rubik/900.css";

import { accountsAvailable } from "../accounts";
import AccountControls from "../accounts/AccountControls.vue";
import { GAMES } from "../asset-layer/manifest";
import { officialRosters } from "../official";
import { myRosters, removeRoster, rostersKeptIn, rostersKnown, rostersProblem } from "../rosters";
import type { Roster } from "../rosters/roster";
import {
  newRosterLink,
  officialScreenLink,
  rosterEditorLink,
  rosterScreenLink,
} from "../routes/route";
import { followLink } from "../routes/navigation";
import { defaultTemplate, showableTemplate, templateName } from "../templates/catalogue";

const rosters = GAMES.map((game) => ({
  game,
  name: templateName(game),
  fighterCount: officialRosters[game].fighters.length,
  template: templateName(defaultTemplate(game)),
  link: officialScreenLink(game),
  copyLink: newRosterLink(game),
}));

const fighterCount = (count: number) => (count === 1 ? "1 fighter" : `${count} fighters`);

async function remove(roster: Roster) {
  if (!confirm(`Delete "${roster.name}"? It cannot be brought back.`)) return;
  try {
    await removeRoster(roster.id);
  } catch (error) {
    alert(error instanceof Error ? error.message : "The roster could not be deleted.");
  }
}
</script>

<template>
  <main class="home">
    <h1>Character Select</h1>
    <p class="intro">
      Every Smash roster, and rosters of your own, shown as any game's character select screen.
    </p>

    <section aria-labelledby="my-rosters">
      <h2 id="my-rosters">My rosters</h2>
      <AccountControls v-if="accountsAvailable" />
      <p v-if="rostersProblem" class="problem" role="alert">{{ rostersProblem }}</p>
      <p v-if="!rostersKnown" class="note" role="status">Loading your rosters&hellip;</p>
      <p v-else-if="myRosters.length === 0" class="note">
        No rosters saved {{ rostersKeptIn === "account" ? "to your account" : "in this browser" }}
        yet. Start one from scratch, or copy an official roster below.
      </p>
      <ul v-else class="rosters">
        <li v-for="roster in myRosters" :key="roster.id">
          <a class="card" :href="rosterScreenLink(roster.id)" @click="followLink">
            <span class="name">{{ roster.name }}</span>
            <span v-if="roster.description" class="detail">{{ roster.description }}</span>
            <span class="detail">{{ fighterCount(roster.fighters.length) }}</span>
            <span class="detail">
              Opens in the {{ templateName(showableTemplate(roster.defaultTemplate)) }} template
            </span>
          </a>
          <div class="actions">
            <a :href="rosterEditorLink(roster.id)" @click="followLink">
              Edit<span class="visually-hidden"> {{ roster.name }}</span>
            </a>
            <button type="button" @click="remove(roster)">
              Delete<span class="visually-hidden"> {{ roster.name }}</span>
            </button>
          </div>
        </li>
      </ul>
      <a class="new" :href="newRosterLink()" @click="followLink">New roster</a>
    </section>

    <section aria-labelledby="official-rosters">
      <h2 id="official-rosters">Official rosters</h2>
      <ul class="rosters">
        <li v-for="roster in rosters" :key="roster.game">
          <a class="card" :href="roster.link" @click="followLink">
            <span class="name">{{ roster.name }}</span>
            <span class="detail">{{ fighterCount(roster.fighterCount) }}</span>
            <span class="detail">Opens in the {{ roster.template }} template</span>
          </a>
          <div class="actions">
            <a :href="roster.copyLink" @click="followLink">
              Copy to a new roster<span class="visually-hidden">, from {{ roster.name }}</span>
            </a>
          </div>
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

.rosters li {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  padding: 16px 18px;
  border: 2px solid #3a3a3a;
  border-radius: 12px;
  background: #161616;
  color: inherit;
  text-decoration: none;
}

.card:hover {
  border-color: #fff;
  background: #222;
}

:is(a, button):focus-visible {
  outline: 3px solid #ffcf1a;
  outline-offset: 2px;
}

.actions {
  display: flex;
  gap: 4px 16px;
  padding: 0 6px;
}

.actions :is(a, button) {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0;
  border: 0;
  background: none;
  color: #ffcf1a;
  font: inherit;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
}

.new {
  display: inline-grid;
  place-items: center;
  min-height: 44px;
  margin-top: 12px;
  padding: 0 20px;
  border-radius: 8px;
  background: #ffcf1a;
  color: #000;
  font-weight: 700;
  text-decoration: none;
}

.new:hover {
  background: #ffe066;
}

.note {
  color: #c9c9c9;
}

.problem {
  margin-bottom: 12px;
  color: #ff8a80;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
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
