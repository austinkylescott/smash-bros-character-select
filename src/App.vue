<script setup lang="ts">
import MuteButton from "./audio/MuteButton.vue";
import HomePage from "./pages/HomePage.vue";
import MyRosterScreen from "./pages/MyRosterScreen.vue";
import OfficialScreen from "./pages/OfficialScreen.vue";
import RosterEditor from "./pages/RosterEditor.vue";
import { route } from "./routes/navigation";
</script>

<template>
  <HomePage v-if="route.name === 'home'" />
  <OfficialScreen
    v-else-if="route.name === 'official-screen'"
    :roster="route.roster"
    :template="route.template"
  />
  <MyRosterScreen
    v-else-if="route.name === 'roster-screen'"
    :id="route.roster"
    :template="route.template"
  />
  <!-- Rebuilt for each roster, so one roster's edits never show on another. -->
  <RosterEditor
    v-else
    :key="route.roster ?? `new/${route.copyOf}`"
    :id="route.roster"
    :copy-of="route.copyOf"
  />
  <MuteButton />
</template>
