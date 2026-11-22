<script setup lang="ts">
/**
 * Any roster's screen in any available template, on a stage scaled to fit: the window, or when
 * `preview` is set, the box it is put in. A preview is only looked at, so it takes no input and
 * makes no sound.
 */
import { computed, onBeforeUnmount, onMounted, provide, ref } from "vue";

import { SILENT_SCREEN } from "../audio";
import { brawlLayout } from "./brawl/layout";
import BrawlScreen from "./brawl/BrawlScreen.vue";
import type { AvailableTemplate } from "./catalogue";
import { meleeLayout } from "./melee/layout";
import MeleeScreen from "./melee/MeleeScreen.vue";
import { screenRoster, type ShowableRoster } from "./screen";
import { smash64Layout } from "./smash-64/layout";
import Smash64Screen from "./smash-64/Smash64Screen.vue";
import { wiiULayout } from "./smash-for-wii-u/layout";
import WiiUScreen from "./smash-for-wii-u/WiiUScreen.vue";
import { fitStage, orientationOf, type Size } from "./stage";
import { ultimateLayout } from "./ultimate/layout";
import UltimateScreen from "./ultimate/UltimateScreen.vue";
import { useViewport } from "./useViewport";

const props = defineProps<{
  roster: ShowableRoster;
  template: AvailableTemplate;
  preview?: boolean;
}>();
defineEmits<{ back: [] }>();
provide(SILENT_SCREEN, props.preview);

/** The roster as the template is given it, with this template's portraits. */
const shown = computed(() => screenRoster(props.roster, props.template));

/** Turning a phone upright swaps in the stacked layout; the screen, and its picks, carry over. */
const viewport = useViewport();
const orientation = computed(() => (props.preview ? "landscape" : orientationOf(viewport.value)));
const smash64 = computed(() => smash64Layout(orientation.value));
const melee = computed(() => meleeLayout(orientation.value));
const brawl = computed(() => brawlLayout(orientation.value));
const wiiU = computed(() => wiiULayout(orientation.value));
const ultimate = computed(() => ultimateLayout(orientation.value));
const stage = computed(
  () =>
    (
      {
        "smash-64": smash64.value,
        melee: melee.value,
        brawl: brawl.value,
        "smash-for-wii-u": wiiU.value,
        ultimate: ultimate.value,
      } as const
    )[props.template].stage,
);

/** A preview's box, measured as it is resized. Its height follows its width and the stage. */
const frame = ref<HTMLElement | null>(null);
const box = ref<Size>({ width: 0, height: 0 });
const observer = new ResizeObserver(([entry]) => {
  const { width, height } = entry!.contentRect;
  box.value = { width, height };
});
onMounted(() => {
  if (props.preview) observer.observe(frame.value!);
});
onBeforeUnmount(() => observer.disconnect());

const fit = computed(() => fitStage(props.preview ? box.value : viewport.value, stage.value));
</script>

<template>
  <div
    ref="frame"
    class="frame"
    :class="{ preview }"
    :style="preview ? { aspectRatio: `${stage.width} / ${stage.height}` } : undefined"
    :inert="preview"
  >
    <div
      class="stage"
      :style="{
        width: `${stage.width}px`,
        height: `${stage.height}px`,
        transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})`,
      }"
    >
      <Smash64Screen
        v-if="template === 'smash-64'"
        :roster="shown"
        :layout="smash64"
        @back="$emit('back')"
      />
      <MeleeScreen
        v-else-if="template === 'melee'"
        :roster="shown"
        :layout="melee"
        @back="$emit('back')"
      />
      <BrawlScreen
        v-else-if="template === 'brawl'"
        :roster="shown"
        :layout="brawl"
        @back="$emit('back')"
      />
      <WiiUScreen
        v-else-if="template === 'smash-for-wii-u'"
        :roster="shown"
        :layout="wiiU"
        @back="$emit('back')"
      />
      <UltimateScreen v-else :roster="shown" :layout="ultimate" @back="$emit('back')" />
    </div>
  </div>
</template>

<style scoped>
.frame {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #000;
}

.frame.preview {
  position: relative;
  inset: auto;
  width: 100%;
}

.stage {
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  transform-origin: 0 0;
}
</style>
