<script setup lang="ts">
import { computed } from "vue";

import { officialRosters } from "./official";
import { screenRoster } from "./templates/screen";
import { orientationOf } from "./templates/stage";
import StageFrame from "./templates/StageFrame.vue";
import { ultimateLayout } from "./templates/ultimate/layout";
import UltimateScreen from "./templates/ultimate/UltimateScreen.vue";
import { useViewport } from "./templates/useViewport";

const roster = screenRoster(officialRosters.ultimate, "ultimate");

/** Turning a phone upright swaps in the stacked layout; the screen, and its picks, carry over. */
const viewport = useViewport();
const layout = computed(() => ultimateLayout(orientationOf(viewport.value)));

/** Back leaves the screen for wherever the visitor came from. */
const back = () => history.back();
</script>

<template>
  <StageFrame :width="layout.stage.width" :height="layout.stage.height">
    <UltimateScreen :roster="roster" :layout="layout" @back="back" />
  </StageFrame>
</template>
