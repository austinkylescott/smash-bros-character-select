<script setup lang="ts">
import { officialRosters } from "./official";
import { screenRoster } from "./templates/screen";
import StageFrame from "./templates/StageFrame.vue";
import UltimateScreen from "./templates/ultimate/UltimateScreen.vue";

const roster = screenRoster(officialRosters.ultimate, "ultimate");
</script>

<template>
  <StageFrame :width="1920" :height="1080">
    <UltimateScreen :roster="roster" />
  </StageFrame>
</template>
