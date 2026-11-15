<script setup lang="ts">
/** Ultimate's player panels, 2 to 8 below the grid, with the "+" and "-" tabs that add and remove them. */
import { computed } from "vue";

import { RANDOM, type Selection } from "../../selection/selection";
import type { ScreenFighter } from "../screen";
import { TAB, type UltimateLayout } from "./layout";
import { ultimatePanels } from "./panels";
import UltimatePanel from "./UltimatePanel.vue";

const props = defineProps<{
  selection: Selection;
  fighters: ReadonlyMap<string, ScreenFighter>;
  layout: UltimateLayout;
}>();
defineEmits<{ add: []; remove: []; cycle: [index: number] }>();

const boxes = computed(() => ultimatePanels(props.selection.panels.length, props.layout));
const canAdd = computed(() => props.selection.panels.length < props.selection.rules.maxPanels);
const canRemove = computed(() => props.selection.panels.length > props.selection.rules.minPanels);

const fighterOf = (index: number) => {
  const pick = props.selection.panels[index]!.pick;
  return pick && pick !== RANDOM ? props.fighters.get(pick.fighter) : undefined;
};
</script>

<template>
  <div class="floor" aria-hidden="true" :style="{ top: `${layout.floorTop}px` }">
    <div class="seam" />
  </div>

  <UltimatePanel
    v-for="(panel, index) in selection.panels"
    :key="index"
    :box="boxes[index]!"
    :index="index"
    :panel="panel"
    :fighter="fighterOf(index)"
    @cycle="$emit('cycle', index)"
  />

  <button
    type="button"
    class="tab add"
    :style="{
      left: `${layout.tabs.x}px`,
      top: `${layout.tabs.addTop}px`,
      width: `${TAB.width}px`,
      height: `${TAB.addHeight}px`,
    }"
    aria-label="Add a player"
    :disabled="!canAdd"
    @click="$emit('add')"
  >
    <svg viewBox="0 0 56 100" aria-hidden="true">
      <g>
        <circle cx="30" cy="38" r="11" />
        <path d="M16 76v-14c0-7 6-12 14-12s14 5 14 12v14z" />
        <path d="M2 62h8v-8h6v8h8v6h-8v8h-6v-8H2z" />
      </g>
    </svg>
  </button>
  <button
    type="button"
    class="tab remove"
    :style="{
      left: `${layout.tabs.x}px`,
      top: `${layout.tabs.removeTop}px`,
      width: `${TAB.width}px`,
      height: `${TAB.removeHeight}px`,
    }"
    aria-label="Remove a player"
    :disabled="!canRemove"
    @click="$emit('remove')"
  >
    <svg viewBox="0 0 56 100" aria-hidden="true">
      <g>
        <circle cx="30" cy="38" r="11" />
        <path d="M16 76v-14c0-7 6-12 14-12s14 5 14 12v14z" />
        <rect x="2" y="58" width="22" height="6" />
      </g>
    </svg>
  </button>
</template>

<style scoped>
.floor {
  position: absolute;
  inset: auto 0 0;
  background:
    linear-gradient(115deg, transparent 0 52%, rgb(255 255 255 / 18%) 52% 70%, transparent 70%),
    linear-gradient(90deg, #4b2bb0, #2f6fd8 28%, #5fd0ea 55%, #d9f4f6 80%, #fff);
}

.seam {
  position: absolute;
  inset: 10px 0 auto;
  height: 10px;
  background: linear-gradient(90deg, #5a3ad0, #2d8bf0 35%, #ff5aa0 60%, #ffd86a 75%, #fff);
}

.tab {
  position: absolute;
  padding: 6px;
  border: 0;
  background: #141414;
}

.tab svg {
  display: block;
  width: 100%;
  height: 100%;
}

.add {
  clip-path: polygon(0 0, 100% 22%, 100% 100%, 0 100%);
}

.add svg {
  background: #f5f5f5;
  fill: #f08a1c;
  clip-path: polygon(0 0, 100% 20%, 100% 100%, 0 100%);
}

.remove svg {
  background: #3b3b3b;
  fill: #fff;
}

.tab:disabled svg {
  opacity: 0.4;
}

.tab:focus-visible {
  outline: 4px solid #fff;
  outline-offset: -4px;
}
</style>
