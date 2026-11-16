<script setup lang="ts">
/**
 * A region of an image filling whatever box it is put in. Where the box's shape differs from the
 * region's, the region is scaled to cover it and centred, so the edges are what is lost.
 */
import type { Crop, ImageSize } from "./crop";

defineProps<{ src: string; image: ImageSize; crop: Crop }>();
</script>

<template>
  <svg
    :viewBox="`${crop.x} ${crop.y} ${crop.width} ${crop.height}`"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
    focusable="false"
  >
    <image :href="src" :width="image.width" :height="image.height" preserveAspectRatio="none" />
  </svg>
</template>
