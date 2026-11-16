<script setup lang="ts">
/**
 * One of Melee's four player panels. Its tab is Melee's panel control: pressing it switches the
 * panel from HMN to CPU to N/A and round again. A playing panel shows the picked fighter and their
 * name plate over its port's colour; a switched-off one is greyed with Melee's empty-port mark.
 * The CPU level is drawn but does nothing.
 */
import { computed, nextTick, ref, watch } from "vue";

import type { Box } from "../../selection/navigate";
import { type Panel, RANDOM } from "../../selection/selection";
import type { ScreenFighter } from "../screen";
import { kindLabel, playerColour, playerTag } from "./players";

const props = defineProps<{
  box: Box;
  index: number;
  panel: Panel;
  /** The picked fighter, when the panel's token is on one. */
  fighter: ScreenFighter | undefined;
}>();
defineEmits<{ cycle: [] }>();

const colour = computed(() => playerColour(props.index, props.panel.kind));
const random = computed(() => props.panel.pick === RANDOM);
const name = computed(() => (random.value ? "Random" : props.fighter?.name));
const tabLabel = computed(
  () =>
    `Player ${props.index + 1}: ${{ human: "human", cpu: "CPU", off: "not playing" }[props.panel.kind]}. Switch.`,
);
/** The big faded letters at the panel's foot: the port for a human, "CP" for the computer. */
const mark = computed(() => playerTag(props.index, props.panel.kind));

// A name too wide for its plate is squeezed sideways.
const nameEl = ref<HTMLElement | null>(null);
watch(
  name,
  async () => {
    await nextTick();
    const el = nameEl.value;
    if (!el) return;
    el.style.transform = "";
    const room = el.parentElement!.clientWidth - 16;
    if (el.scrollWidth > room) el.style.transform = `scaleX(${room / el.scrollWidth})`;
  },
  { immediate: true, flush: "post" },
);
</script>

<template>
  <section
    class="panel"
    :class="panel.kind"
    :aria-label="`Player ${index + 1}`"
    :style="{
      left: `${box.x}px`,
      top: `${box.y}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
      '--colour': colour,
    }"
  >
    <div class="frame">
      <div class="backing">
        <template v-if="panel.kind === 'off'">
          <span class="empty-mark" aria-hidden="true" />
          <span class="slash" aria-hidden="true" />
        </template>
        <template v-else>
          <span class="emblem" aria-hidden="true" />
          <span class="portrait-window">
            <img v-if="fighter" class="portrait" :src="fighter.portrait" alt="" draggable="false" />
            <span v-else-if="random" class="question" aria-hidden="true">?</span>
          </span>
          <span class="mark" aria-hidden="true">{{ mark }}</span>
          <span v-if="panel.kind === 'cpu'" class="level" aria-hidden="true">
            <span class="level-label">CPU Level</span>
            <span class="level-bar"><span class="level-value">1</span></span>
          </span>
          <span class="plate" aria-hidden="true">
            <span v-if="name" ref="nameEl" class="name">{{ name }}</span>
          </span>
          <p class="visually-hidden" aria-live="polite">{{ name ?? "No fighter picked" }}</p>
        </template>
        <span class="dots" aria-hidden="true" />
      </div>
    </div>

    <button type="button" class="tab" :aria-label="tabLabel" @click="$emit('cycle')">
      <span class="tab-text">{{ kindLabel(panel.kind) }}</span>
    </button>
  </section>
</template>

<style scoped>
.panel {
  position: absolute;
}

/* The light metal frame, below the tab. */
.frame {
  position: absolute;
  inset: 16px 0 0;
  padding: 5px;
  border-radius: 4px;
  background: linear-gradient(180deg, #a9afb9, #6f7682);
  box-shadow: 0 0 0 2px #1f2733;
}

.backing {
  position: relative;
  height: 100%;
  overflow: hidden;
  border-radius: 2px;
  background:
    repeating-linear-gradient(180deg, rgb(255 255 255 / 5%) 0 2px, transparent 2px 6px),
    linear-gradient(
      160deg,
      color-mix(in srgb, var(--colour) 85%, #fff) 0%,
      var(--colour) 45%,
      color-mix(in srgb, var(--colour) 60%, #000) 100%
    );
}

.off .backing {
  background:
    linear-gradient(180deg, transparent 0 66%, rgb(255 255 255 / 4%) 66% 74%, transparent 74%),
    repeating-linear-gradient(180deg, rgb(255 255 255 / 3%) 0 2px, transparent 2px 7px),
    linear-gradient(180deg, #4b4c52, #3b3c42);
}

/* Melee's empty port: a ring struck through, faint on the grey. */
.empty-mark {
  position: absolute;
  left: 50%;
  top: 46%;
  width: 62%;
  aspect-ratio: 1;
  border: 14px solid rgb(0 0 0 / 22%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.slash {
  position: absolute;
  left: 50%;
  top: -10%;
  width: 6px;
  height: 120%;
  background: rgb(0 0 0 / 25%);
  transform: rotate(-33deg);
}

/* The port's emblem, a faint ring behind the fighter. */
.emblem {
  position: absolute;
  left: -20%;
  top: 10%;
  width: 110%;
  aspect-ratio: 1;
  border: 26px solid rgb(0 0 0 / 14%);
  border-radius: 50%;
}

.portrait-window {
  position: absolute;
  inset: 0 0 26%;
  overflow: hidden;
}

/* Official Melee portraits carry their name along the bottom; it is cropped off with the window. */
.portrait {
  position: absolute;
  left: 50%;
  top: 4%;
  width: 104%;
  height: 120%;
  object-fit: cover;
  object-position: 50% 0;
  transform: translateX(-50%);
}

.question {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #5a3a42;
  font-size: 220px;
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 0 6px rgb(255 255 255 / 45%);
}

.mark {
  position: absolute;
  left: 6%;
  bottom: -2px;
  color: rgb(0 0 0 / 28%);
  font-size: 96px;
  font-style: italic;
  font-weight: 900;
  line-height: 1;
}

.level {
  position: absolute;
  left: 8%;
  right: 8%;
  top: 56%;
  display: grid;
  gap: 2px;
}

.level-label {
  color: #f0f0f0;
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  text-shadow: 0 2px 0 #222;
}

.level-bar {
  position: relative;
  height: 26px;
  border: 2px solid #111;
  border-radius: 13px;
  background: linear-gradient(90deg, #d42 0%, #fd2 50%, #2a2a2a 50%);
}

.level-value {
  position: absolute;
  left: -4px;
  top: -6px;
  width: 34px;
  height: 34px;
  border: 3px solid #111;
  border-radius: 50%;
  background: #d8201c;
  color: #fff;
  font-size: 22px;
  font-weight: 900;
  line-height: 28px;
  text-align: center;
}

.plate {
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: 18%;
  height: 46px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 3px solid #9aa0aa;
  border-radius: 2px;
  background: #0b0b0e;
}

.name {
  color: #fff;
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}

/* The row of sockets along the panel's foot. */
.dots {
  position: absolute;
  left: 4%;
  right: 4%;
  bottom: 6px;
  height: 18px;
  background: radial-gradient(circle, rgb(0 0 0 / 30%) 0 7px, transparent 8px) 0 0 / 28px 18px
    repeat-x;
}

/* Melee's panel control: a tab on the frame's top left, pointed on its right. */
.tab {
  position: absolute;
  left: -6px;
  top: 0;
  width: 116px;
  height: 40px;
  padding: 0 18px 0 12px;
  border: 0;
  clip-path: polygon(0 10%, 4% 0, 80% 0, 100% 50%, 80% 100%, 0 100%);
  background: linear-gradient(180deg, #8c929c, #5b616b);
  color: #23272e;
  font: inherit;
}

.human .tab {
  background: linear-gradient(180deg, #f4d248, #c99512);
  color: #3a2600;
}

.tab-text {
  display: block;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 40px;
  text-align: left;
}

.tab:focus-visible {
  outline: 4px solid #fff;
  outline-offset: -4px;
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
