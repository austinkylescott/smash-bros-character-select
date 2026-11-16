<script setup lang="ts">
/** The screen of a roster saved in this browser, with a link to edit it. */
import { computed } from "vue";

import { myRoster } from "../rosters";
import { followLink } from "../routes/navigation";
import { HOME_LINK, rosterEditorLink, rosterScreenLink } from "../routes/route";
import { type AvailableTemplate, showableTemplate } from "../templates/catalogue";
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
  <main v-else class="missing">
    <h1>Roster not found</h1>
    <p>
      This roster is not saved in this browser. Rosters are kept in the browser they were made in.
    </p>
    <a :href="HOME_LINK" @click="followLink">Back to the home page</a>
  </main>
</template>

<style scoped>
.missing {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 640px;
  margin: 0 auto;
  padding: 72px 20px 32px;
  color: #fff;
  font:
    400 16px/1.5 Rubik,
    system-ui,
    sans-serif;
}

h1,
p {
  margin: 0;
}

.missing a {
  color: #ffcf1a;
}
</style>
