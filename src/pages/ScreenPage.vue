<script setup lang="ts">
/**
 * A roster's screen in one template, with the switcher to show it in another. Anything put in the
 * slot joins the switcher.
 */
import { HOME_LINK } from "../routes/route";
import TemplateSwitcher from "../routes/TemplateSwitcher.vue";
import { navigate } from "../routes/navigation";
import type { AvailableTemplate } from "../templates/catalogue";
import type { ShowableRoster } from "../templates/screen";
import TemplateScreen from "../templates/TemplateScreen.vue";

defineProps<{
  roster: ShowableRoster;
  template: AvailableTemplate;
  /**
   * Names the roster. A screen is rebuilt for each roster and template, so its picks never carry
   * over to another: every screen starts with the selection its own template starts with.
   */
  rosterKey: string;
  /** The link to this roster's screen in a template. */
  linkTo: (template: AvailableTemplate) => string;
}>();
</script>

<template>
  <TemplateScreen
    :key="`${rosterKey}/${template}`"
    :roster="roster"
    :template="template"
    @back="navigate(HOME_LINK)"
  />
  <TemplateSwitcher :template="template" :link-to="linkTo"><slot /></TemplateSwitcher>
</template>
