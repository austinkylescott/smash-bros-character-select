<script setup lang="ts">
/** An official roster's screen in one template. */
import type { Game } from "../asset-layer/manifest";
import { officialRosters } from "../official";
import { officialScreenLink } from "../routes/route";
import type { AvailableTemplate } from "../templates/catalogue";
import ScreenPage from "./ScreenPage.vue";

defineProps<{ roster: Game; template: AvailableTemplate }>();
</script>

<template>
  <ScreenPage
    :roster="officialRosters[roster]"
    :template="template"
    :roster-key="roster"
    :link-to="(choice) => officialScreenLink(roster, choice)"
  />
</template>
