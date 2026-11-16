<script setup lang="ts">
/**
 * Adjusts one crop of a fighter's image: the whole image with the crop marked on it, to drag, or
 * move with the arrow keys, and a slider to zoom it. Beside it, the crop as it will be shown.
 */
import { computed, ref } from "vue";

import CroppedImage from "./CroppedImage.vue";
import { type Crop, type ImageSize, moveCrop, zoomCrop, zoomRange } from "./crop";

const props = defineProps<{
  /** What the crop is for, as in "Slot". */
  label: string;
  src: string;
  image: ImageSize;
  crop: Crop;
}>();
const emit = defineEmits<{ "update:crop": [crop: Crop] }>();

const move = (x: number, y: number) =>
  emit("update:crop", moveCrop(props.crop, { x, y }, props.image));
const zoom = (width: number) => emit("update:crop", zoomCrop(props.crop, width, props.image));

/**
 * The zoom slider. Sliding right zooms in, so its value runs the other way to the crop's width.
 */
const range = computed(() => zoomRange(props.crop, props.image));
const sliderValue = (width: number) => range.value.min + range.value.max - width;

/** Where a drag of the crop last was, in the image's pixels. */
const svg = ref<SVGSVGElement | null>(null);
const dragFrom = ref<{ x: number; y: number }>();
function imagePoint(event: PointerEvent) {
  const toImage = svg.value!.getScreenCTM()!.inverse();
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(toImage);
  return { x: point.x, y: point.y };
}
function startDrag(event: PointerEvent) {
  (event.currentTarget as Element).setPointerCapture(event.pointerId);
  dragFrom.value = imagePoint(event);
}
function drag(event: PointerEvent) {
  if (!dragFrom.value) return;
  const point = imagePoint(event);
  move(point.x - dragFrom.value.x, point.y - dragFrom.value.y);
  dragFrom.value = point;
}

/** Arrow keys move the crop a small step, or a large one with Shift; + and - zoom it. */
function onKey(event: KeyboardEvent) {
  const step = (event.shiftKey ? 0.1 : 0.02) * Math.max(props.image.width, props.image.height);
  const moves: Record<string, [number, number]> = {
    ArrowLeft: [-step, 0],
    ArrowRight: [step, 0],
    ArrowUp: [0, -step],
    ArrowDown: [0, step],
  };
  const by = moves[event.key];
  if (by) move(...by);
  else if (event.key === "+" || event.key === "=") zoom(props.crop.width * 1.1);
  else if (event.key === "-") zoom(props.crop.width / 1.1);
  else return;
  event.preventDefault();
}
</script>

<template>
  <fieldset class="crop-editor">
    <legend>{{ label }}</legend>
    <div class="views">
      <svg
        ref="svg"
        class="whole"
        :viewBox="`0 0 ${image.width} ${image.height}`"
        :style="{ aspectRatio: `${image.width} / ${image.height}` }"
      >
        <image :href="src" :width="image.width" :height="image.height" />
        <path
          class="shade"
          fill-rule="evenodd"
          :d="`M0 0H${image.width}V${image.height}H0Z M${crop.x} ${crop.y}h${crop.width}v${crop.height}h${-crop.width}Z`"
        />
        <rect
          class="region"
          :class="{ dragging: dragFrom }"
          :x="crop.x"
          :y="crop.y"
          :width="crop.width"
          :height="crop.height"
          tabindex="0"
          role="slider"
          :aria-label="`${label} crop. Arrow keys move it; plus and minus zoom.`"
          :aria-valuetext="`${Math.round(crop.x)}, ${Math.round(crop.y)}`"
          @pointerdown.prevent="startDrag"
          @pointermove="drag"
          @pointerup="dragFrom = undefined"
          @pointercancel="dragFrom = undefined"
          @keydown="onKey"
        />
      </svg>
      <CroppedImage
        class="result"
        :style="{ aspectRatio: `${crop.width} / ${crop.height}` }"
        :src="src"
        :image="image"
        :crop="crop"
      />
    </div>
    <label class="zoom">
      Zoom
      <input
        type="range"
        :min="range.min"
        :max="range.max"
        :step="range.max / 200"
        :value="sliderValue(crop.width)"
        @input="zoom(sliderValue(Number(($event.target as HTMLInputElement).value)))"
      />
    </label>
  </fieldset>
</template>

<style scoped>
.crop-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  margin: 0;
  padding: 10px 12px 12px;
  border: 2px solid #3a3a3a;
  border-radius: 8px;
}

legend {
  padding: 0 6px;
  font-weight: 700;
}

.views {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 1fr);
  align-items: start;
  gap: 10px;
}

.whole {
  display: block;
  width: 100%;
  max-height: 260px;
  background: repeating-conic-gradient(#2a2a2a 0 25%, #1c1c1c 0 50%) 0 0 / 16px 16px;
  touch-action: none;
}

.shade {
  fill: rgb(0 0 0 / 60%);
  pointer-events: none;
}

.region {
  fill: transparent;
  stroke: #ffcf1a;
  stroke-width: 3px;
  vector-effect: non-scaling-stroke;
  cursor: grab;
}

.region.dragging {
  cursor: grabbing;
}

.region:focus-visible {
  outline: none;
  stroke: #fff;
  stroke-width: 4px;
}

.result {
  display: block;
  width: 100%;
  border-radius: 4px;
  background: #222;
}

.zoom {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  font-weight: 700;
}

.zoom input {
  flex: 1;
  min-height: 44px;
  accent-color: #ffcf1a;
}
</style>
