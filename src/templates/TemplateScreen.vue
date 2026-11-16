<script setup lang="ts">
/**
 * Any roster's screen in any available template, on a stage scaled to fit: the window, or when
 * `preview` is set, the box it is put in. A preview is only looked at, so it takes no input.
 */
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import type { AvailableTemplate } from "./catalogue";
import { meleeLayout } from "./melee/layout";
import MeleeScreen from "./melee/MeleeScreen.vue";
import { screenRoster, type ShowableRoster } from "./screen";
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

/** The roster as the template is given it, with this template's portraits. */
const shown = computed(() => screenRoster(props.roster, props.template));

/** Turning a phone upright swaps in the stacked layout; the screen, and its picks, carry over. */
const viewport = useViewport();
const orientation = computed(() => (props.preview ? "landscape" : orientationOf(viewport.value)));
const melee = computed(() => meleeLayout(orientation.value));
const ultimate = computed(() => ultimateLayout(orientation.value));
const stage = computed(() => (props.template === "melee" ? melee.value : ultimate.value).stage);

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
      <MeleeScreen
        v-if="template === 'melee'"
        :roster="shown"
        :layout="melee"
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
