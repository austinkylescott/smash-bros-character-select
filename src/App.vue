<script setup lang="ts">
import MuteButton from "./audio/MuteButton.vue";
import HomePage from "./pages/HomePage.vue";
import ScreenPage from "./pages/ScreenPage.vue";
import { route } from "./routes/useRoute";
</script>

<template>
  <HomePage v-if="route.page === 'home'" />
  <ScreenPage v-else :roster="route.roster" :template="route.template" />
  <MuteButton />
</template>
