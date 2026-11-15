<script setup lang="ts">
/**
 * One of Ultimate's player panels: the picked fighter's portrait and name, or a glove while the
 * player has not picked. Its tag switches the panel between human, CPU and off. The name plate,
 * handicap and CPU level are drawn but do nothing.
 */
import { computed, nextTick, ref, watch } from "vue";

import type { Box } from "../../selection/navigate";
import { type Panel, RANDOM } from "../../selection/selection";
import type { ScreenFighter } from "../screen";
import { playerColour, playerTag } from "./players";
import UltimateGlove from "./UltimateGlove.vue";

const props = defineProps<{
  box: Box;
  index: number;
  panel: Panel;
  /** The picked fighter, when the panel's token is on one. */
  fighter: ScreenFighter | undefined;
}>();
defineEmits<{ cycle: [] }>();

/** Panel widths shrink as players join; text shrinks with them, though never past legibility. */
const REFERENCE_WIDTH = 909;
const scale = computed(() => Math.min(1, Math.max(0.42, props.box.width / REFERENCE_WIDTH)));
/** Panels this narrow, four or more to a screen, stretch their plate across the full width. */
const narrow = computed(() => props.box.width < 500);

const colour = computed(() => playerColour(props.index, props.panel.kind));
const tag = computed(() => playerTag(props.index, props.panel.kind));
const random = computed(() => props.panel.pick === RANDOM);
const name = computed(() => (random.value ? "Random" : props.fighter?.name));
const tagLabel = computed(
  () =>
    `Player ${props.index + 1}: ${{ human: "human", cpu: "CPU", off: "off" }[props.panel.kind]}. Switch.`,
);

// A name too wide for its panel is squeezed sideways, as Ultimate does.
const nameEl = ref<HTMLElement | null>(null);
watch(
  [name, () => props.box.width],
  async () => {
    await nextTick();
    const el = nameEl.value;
    if (!el) return;
    el.style.transform = "";
    const room = props.box.width * 0.6;
    if (el.scrollWidth > room) el.style.transform = `scaleX(${room / el.scrollWidth})`;
  },
  { immediate: true, flush: "post" },
);
</script>

<template>
  <section
    class="panel"
    :class="[panel.kind, { narrow }]"
    :aria-label="`Player ${index + 1}`"
    :style="{
      left: `${box.x}px`,
      top: `${box.y}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
      '--colour': colour,
      '--s': scale,
    }"
  >
    <div class="face">
      <img
        v-if="fighter && panel.kind !== 'off'"
        class="portrait"
        :src="fighter.portrait"
        alt=""
        draggable="false"
      />
      <span v-else-if="random" class="question ult-outlined" data-text="?" aria-hidden="true"
        >?</span
      >
      <UltimateGlove v-else-if="panel.kind === 'human'" class="glove" :colour="colour" :tag="tag" />
    </div>

    <template v-if="panel.kind !== 'off'">
      <span v-if="name" ref="nameEl" class="name ult-outlined" :data-text="name">{{ name }}</span>
      <p class="visually-hidden" aria-live="polite">{{ name ?? "No fighter picked" }}</p>

      <span v-if="panel.kind === 'cpu'" class="level" aria-hidden="true">
        <span class="level-label">CPU Lv.</span>
        <span class="level-value ult-outlined" data-text="9">9</span>
      </span>
      <span v-else class="plate" :class="{ picked: panel.pick }" aria-hidden="true">
        Player {{ index + 1 }}
      </span>
      <span v-if="panel.pick && !narrow" class="handicap" aria-hidden="true">0%</span>
    </template>

    <button type="button" class="tag" :aria-label="tagLabel" @click="$emit('cycle')">
      <span class="tag-text ult-outlined" :data-text="tag">{{ tag }}</span>
    </button>
  </section>
</template>

<style scoped>
.panel {
  position: absolute;
  --cut: calc(82px * var(--s));
  clip-path: polygon(var(--cut) 0, 100% 0, 100% 100%, 0 100%, 0 var(--cut));
  background: #141414;
}

.face {
  position: absolute;
  inset: 10px 10px 0;
  overflow: hidden;
  clip-path: polygon(calc(var(--cut) - 4px) 0, 100% 0, 100% 100%, 0 100%, 0 calc(var(--cut) - 4px));
  background:
    linear-gradient(118deg, transparent 0 46%, rgb(255 255 255 / 22%) 46% 50%, transparent 50%),
    linear-gradient(
      118deg,
      color-mix(in srgb, var(--colour) 15%, #fff) 0 18%,
      color-mix(in srgb, var(--colour) 70%, #fff) 18% 48%,
      var(--colour) 48%
    );
}

.cpu .face {
  background:
    linear-gradient(118deg, transparent 0 46%, rgb(0 0 0 / 14%) 46% 52%, transparent 52%),
    linear-gradient(118deg, #f2f2f2 0 22%, #c8c8c8 22% 60%, #a8a8a8 60%);
}

.off .face {
  background: linear-gradient(118deg, #3a3a3a 0 30%, #2c2c2c 30%);
}

.portrait {
  position: absolute;
  inset: 0 auto 0 0;
  width: 62%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 20%;
}

.question {
  position: absolute;
  left: 15%;
  top: 30px;
  color: #fff;
  font-size: calc(290px * var(--s));
  font-weight: 900;
  line-height: 1;
  --stroke: calc(26px * var(--s));
  --stroke-color: #2a2a2a;
  text-shadow: calc(10px * var(--s)) calc(10px * var(--s)) 0 #555;
}

.glove {
  position: absolute;
  left: 66%;
  top: 70px;
  width: calc(124px * var(--s));
  transform: translateX(-50%);
}

.name {
  position: absolute;
  right: 4%;
  top: 152px;
  color: #fff;
  font-size: calc(66px * var(--s));
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
  transform-origin: 100% 50%;
  --stroke: calc(14px * var(--s));
}

.plate,
.handicap,
.level {
  position: absolute;
  top: 234px;
  height: calc(60px * var(--s));
  border: 5px solid color-mix(in srgb, var(--colour) 30%, #000);
  font-size: calc(40px * var(--s));
  font-weight: 800;
  line-height: calc(50px * var(--s));
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
}

.plate {
  left: 53%;
  width: 39%;
  background: color-mix(in srgb, var(--colour) 40%, #fff);
  color: #3b2a2d;
}

.plate.picked {
  left: 47%;
  width: 29%;
}

.handicap {
  left: 77%;
  width: 19%;
  background: color-mix(in srgb, var(--colour) 40%, #fff);
  color: #3b2a2d;
  font-style: italic;
}

.level {
  left: 52%;
  width: 40%;
  display: flex;
  border-color: #1b1b1b;
  background: linear-gradient(105deg, #2f2f2f 0 60%, #f4f4f4 60%);
}

.panel:has(.handicap) .level {
  width: 29%;
  font-size: calc(32px * var(--s));
}

.narrow :is(.plate, .plate.picked, .level) {
  left: 8%;
  width: 84%;
  height: 46px;
  font-size: 28px;
  line-height: 36px;
}

.narrow .tag {
  left: 8%;
  right: 8%;
}

.level-label {
  flex: 0 0 60%;
  color: #c8c8c8;
}

.level-value {
  flex: 1;
  color: #e8141c;
  --stroke: 6px;
}

.tag {
  position: absolute;
  left: 52%;
  right: 7%;
  bottom: 0;
  height: calc(76px * var(--s));
  min-height: 40px;
  padding: 0;
  border: 6px solid #2a0c0e;
  border-bottom: 0;
  clip-path: polygon(4% 0, 96% 0, 100% 25%, 100% 100%, 0 100%, 0 25%);
  background: linear-gradient(
    110deg,
    color-mix(in srgb, var(--colour) 80%, #000) 0 35%,
    var(--colour) 35%
  );
  color: #fff;
  font: inherit;
  font-size: calc(66px * var(--s));
  font-weight: 800;
  line-height: 1;
  --stroke: calc(14px * var(--s));
}

.cpu .tag {
  border-color: #1b1b1b;
  background: linear-gradient(110deg, #b1b1b1 0 35%, #cfcfcf 35%);
}

.off .tag {
  border-color: #111;
  background: #3b3b3b;
  color: #9a9a9a;
}

.tag:focus-visible {
  outline: 4px solid #fff;
  outline-offset: -10px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  overflow: hidden;
  clip-path: inset(50%);
}
</style>
