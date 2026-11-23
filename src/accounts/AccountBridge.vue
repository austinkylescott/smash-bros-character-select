<script setup lang="ts">
/**
 * Passes who is signed in with Clerk on to the accounts module. It shows nothing, and is only put
 * on the page when the site offers signing in, as Clerk's composables need its plugin.
 */
import { useAuth } from "@clerk/vue";
import { watch } from "vue";

import { followSignIn } from ".";

const { isLoaded, userId, getToken } = useAuth();

watch(
  [isLoaded, userId],
  ([loaded, user]) =>
    followSignIn({
      loaded,
      user,
      fetchToken: ({ forceRefreshToken }) =>
        getToken.value({ template: "convex", skipCache: forceRefreshToken }),
    }),
  { immediate: true },
);
</script>

<template>
  <slot />
</template>
