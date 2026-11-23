<script setup lang="ts">
import { accountsAvailable } from "./accounts";
import AccountBridge from "./accounts/AccountBridge.vue";
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
  <RosterEditor v-else :id="route.roster" :copy-of="route.copyOf" />
  <MuteButton />
  <AccountBridge v-if="accountsAvailable" />
</template>
