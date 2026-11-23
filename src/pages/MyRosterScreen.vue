<script setup lang="ts">
/** The screen of one of the user's rosters, with a link to edit it. */
import { computed } from "vue";

import { myRoster, rostersKnown } from "../rosters";
import { followLink } from "../routes/navigation";
import { rosterEditorLink, rosterScreenLink } from "../routes/route";
import { type AvailableTemplate, showableTemplate } from "../templates/catalogue";
import RosterMissing from "./RosterMissing.vue";
import ScreenPage from "./ScreenPage.vue";

const props = defineProps<{ id: string; template?: AvailableTemplate }>();

const roster = computed(() => myRoster(props.id));
</script>

<template>
  <ScreenPage
    v-if="roster"
    :roster="roster"
    :template="template ?? showableTemplate(roster.defaultTemplate)"
    :roster-key="roster.id"
    :link-to="(choice) => rosterScreenLink(id, choice)"
  >
    <a class="edit" :href="rosterEditorLink(id)" @click="followLink">Edit</a>
  </ScreenPage>
  <RosterMissing v-else-if="rostersKnown" />
</template>
