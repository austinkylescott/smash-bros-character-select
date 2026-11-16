<script setup lang="ts">
/**
 * Shows the roster on screen in another template. Always on screen, above any template. Each
 * choice is a link naming the template, so the screen it opens can be shared. Links put in the
 * slot stand beside the choices.
 */
import "@fontsource/rubik/700.css";

import { type AvailableTemplate, availableTemplates, templateName } from "../templates/catalogue";
import { followLink } from "./navigation";

defineProps<{
  template: AvailableTemplate;
  /** The link to the roster's screen in a template. */
  linkTo: (template: AvailableTemplate) => string;
}>();
</script>

<template>
  <div class="switcher">
    <nav aria-label="Template">
      <a
        v-for="choice in availableTemplates"
        :key="choice"
        :href="linkTo(choice)"
        :aria-current="choice === template ? 'page' : undefined"
        @click="followLink"
      >
        {{ templateName(choice) }}
      </a>
    </nav>
    <slot />
  </div>
</template>

<style scoped>
.switcher {
  position: fixed;
  z-index: 10;
  top: 12px;
  /* Top centre, over each template's inert rules bar: clear of Back and the mute button. */
  left: 50%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2px 10px;
  width: max-content;
  max-width: calc(100vw - 136px);
  transform: translateX(-50%);
  min-height: 44px;
  padding: 4px;
  border: 2px solid rgb(255 255 255 / 70%);
  border-radius: 22px;
  background: rgb(0 0 0 / 60%);
  font:
    700 14px/1 Rubik,
    system-ui,
    sans-serif;
}

nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2px;
}

/* Slotted links are styled here too, so they match the choices. */
a,
.switcher :slotted(a) {
  display: grid;
  place-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 16px;
  color: #fff;
  text-decoration: none;
}

a:hover,
.switcher :slotted(a:hover) {
  background: rgb(255 255 255 / 20%);
}

a[aria-current] {
  background: #fff;
  color: #000;
}

a:focus-visible,
.switcher :slotted(a:focus-visible) {
  outline: 3px solid #ffcf1a;
  outline-offset: 2px;
}

.switcher :slotted(a) {
  border: 2px solid rgb(255 255 255 / 70%);
}
</style>
