<script setup lang="ts">
import MuteButton from "./audio/MuteButton.vue";
import HomePage from "./pages/HomePage.vue";
import OfficialScreen from "./pages/OfficialScreen.vue";
import { route } from "./routes/navigation";
</script>

<template>
  <HomePage v-if="route.name === 'home'" />
  <OfficialScreen v-else :roster="route.roster" :template="route.template" />
  <MuteButton />
</template>
