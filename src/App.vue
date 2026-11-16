<script setup lang="ts">
import { computed } from "vue";

import { GAMES, type Game } from "./asset-layer/manifest";
import MuteButton from "./audio/MuteButton.vue";
import { officialRosters } from "./official";
import { meleeLayout } from "./templates/melee/layout";
import MeleeScreen from "./templates/melee/MeleeScreen.vue";
import { screenRoster } from "./templates/screen";
import { orientationOf } from "./templates/stage";
import StageFrame from "./templates/StageFrame.vue";
import { ultimateLayout } from "./templates/ultimate/layout";
import UltimateScreen from "./templates/ultimate/UltimateScreen.vue";
import { useViewport } from "./templates/useViewport";

/**
 * Until rosters can be chosen, the address picks what is shown: `?template=melee` for a template
 * and `?roster=brawl` for an official roster. Each defaults to Ultimate, and the roster to the
 * template's own game.
 */
const query = new URLSearchParams(location.search);
const gameFrom = (value: string | null): Game | undefined =>
  (GAMES as readonly string[]).includes(value ?? "") ? (value as Game) : undefined;
const template = gameFrom(query.get("template")) === "melee" ? "melee" : "ultimate";
const roster = screenRoster(officialRosters[gameFrom(query.get("roster")) ?? template], template);

/** Turning a phone upright swaps in the stacked layout; the screen, and its picks, carry over. */
const viewport = useViewport();
const orientation = computed(() => orientationOf(viewport.value));
const melee = computed(() => meleeLayout(orientation.value));
const ultimate = computed(() => ultimateLayout(orientation.value));
const stage = computed(() => (template === "melee" ? melee.value : ultimate.value).stage);

/** Back leaves the screen for wherever the visitor came from. */
const back = () => history.back();
</script>

<template>
  <StageFrame :width="stage.width" :height="stage.height">
    <MeleeScreen v-if="template === 'melee'" :roster="roster" :layout="melee" @back="back" />
    <UltimateScreen v-else :roster="roster" :layout="ultimate" @back="back" />
  </StageFrame>
  <MuteButton />
</template>
