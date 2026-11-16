<script setup lang="ts">
/** What a link to a roster shows when this browser has no such roster saved. */
import "@fontsource/rubik/400.css";
import "@fontsource/rubik/900.css";

import { followLink } from "../routes/navigation";
import { HOME_LINK } from "../routes/route";
</script>

<template>
  <main class="missing">
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

h1 {
  font-weight: 900;
  line-height: 1.1;
}

a {
  color: #ffcf1a;
}
</style>
