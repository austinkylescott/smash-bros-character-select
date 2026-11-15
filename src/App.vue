<script setup lang="ts">
import { officialRosters } from "./official";
import { screenRoster } from "./templates/screen";
import StageFrame from "./templates/StageFrame.vue";
import { ULTIMATE_STAGE } from "./templates/ultimate/grid";
import UltimateScreen from "./templates/ultimate/UltimateScreen.vue";

const roster = screenRoster(officialRosters.ultimate, "ultimate");
</script>

<template>
  <StageFrame :width="ULTIMATE_STAGE.width" :height="ULTIMATE_STAGE.height">
    <UltimateScreen :roster="roster" />
  </StageFrame>
</template>
