<script setup lang="ts">
/**
 * Signing in and out, with Discord or Google through Clerk, and where the user's rosters are kept.
 * Only put on the page when the site offers signing in, as Clerk's components need its plugin.
 */
import { SignInButton, useAuth, UserButton } from "@clerk/vue";

import { account } from ".";

const { isSignedIn } = useAuth();
</script>

<template>
  <div class="account">
    <UserButton v-if="isSignedIn" />
    <SignInButton v-else-if="account.status !== 'unknown'" mode="modal">
      <button type="button" class="sign-in">Sign in</button>
    </SignInButton>
    <p v-if="account.status === 'signed-in'">
      Your rosters are saved to your account, on every device you sign in on.
    </p>
    <p v-else-if="account.status === 'signed-out' && !account.problem">
      Sign in with Discord or Google to keep your rosters on every device. Rosters saved in this
      browser move into your account.
    </p>
  </div>
</template>

<style scoped>
.account {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: center;
  margin-bottom: 12px;
}

.account p {
  flex: 1 1 240px;
  margin: 0;
  color: #c9c9c9;
  font-size: 14px;
}

.sign-in {
  min-height: 44px;
  padding: 0 20px;
  border: 2px solid #ffcf1a;
  border-radius: 8px;
  background: none;
  color: #ffcf1a;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.sign-in:hover {
  background: rgb(255 207 26 / 15%);
}

.sign-in:focus-visible {
  outline: 3px solid #ffcf1a;
  outline-offset: 2px;
}
</style>
