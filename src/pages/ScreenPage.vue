<script setup lang="ts">
/** An official roster's screen in one template, with the switcher to show it in another. */
import { computed } from "vue";

import type { Game } from "../asset-layer/manifest";
import { officialRosters } from "../official";
import { HOME_LINK } from "../routes/route";
import TemplateSwitcher from "../routes/TemplateSwitcher.vue";
import { navigate } from "../routes/useRoute";
import type { AvailableTemplate } from "../templates/catalogue";
import { meleeLayout } from "../templates/melee/layout";
import MeleeScreen from "../templates/melee/MeleeScreen.vue";
import { screenRoster } from "../templates/screen";
import { orientationOf } from "../templates/stage";
import StageFrame from "../templates/StageFrame.vue";
import { ultimateLayout } from "../templates/ultimate/layout";
import UltimateScreen from "../templates/ultimate/UltimateScreen.vue";
import { useViewport } from "../templates/useViewport";

const props = defineProps<{ roster: Game; template: AvailableTemplate }>();

const roster = computed(() => screenRoster(officialRosters[props.roster], props.template));

/** Turning a phone upright swaps in the stacked layout; the screen, and its picks, carry over. */
const viewport = useViewport();
const orientation = computed(() => orientationOf(viewport.value));
const melee = computed(() => meleeLayout(orientation.value));
const ultimate = computed(() => ultimateLayout(orientation.value));
const stage = computed(() => (props.template === "melee" ? melee.value : ultimate.value).stage);

/**
 * A screen is rebuilt for each roster and template, so its picks never carry over to another:
 * every screen starts with the selection its own template starts with.
 */
const screenKey = computed(() => `${props.roster}/${props.template}`);

const back = () => navigate(HOME_LINK);
</script>

<template>
  <StageFrame :width="stage.width" :height="stage.height">
    <MeleeScreen
      v-if="template === 'melee'"
      :key="screenKey"
      :roster="roster"
      :layout="melee"
      @back="back"
    />
    <UltimateScreen v-else :key="screenKey" :roster="roster" :layout="ultimate" @back="back" />
  </StageFrame>
  <TemplateSwitcher :roster="props.roster" :template="template" />
</template>
