<script setup lang="ts">
/**
 * A fighter's portrait in a slot or a player panel. An official portrait is the image itself, for
 * the template to frame; a fighter added by image shows the crop chosen for that place, and its
 * root carries the class `cropped`.
 */
import CroppedImage from "../portraits/CroppedImage.vue";
import type { CropKind } from "../rosters/roster";
import type { ScreenFighter } from "./screen";

defineProps<{ fighter: ScreenFighter; place: CropKind }>();
</script>

<template>
  <CroppedImage
    v-if="fighter.crops"
    class="cropped"
    :src="fighter.portrait"
    :image="fighter.crops"
    :crop="fighter.crops[place]"
  />
  <img v-else :src="fighter.portrait" alt="" draggable="false" />
</template>
