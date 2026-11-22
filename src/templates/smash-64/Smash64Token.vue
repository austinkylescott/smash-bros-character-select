<script setup lang="ts">
/** A player's token, as Smash 64 draws it: a domed disc in their colour, its tag pressed in. */
defineProps<{ colour: string; tag: string; size: number }>();
</script>

<template>
  <span class="token" :style="{ '--colour': colour, '--size': `${size}px` }">
    <span class="tag">{{ tag }}</span>
  </span>
</template>

<style scoped>
.token {
  display: grid;
  place-items: center;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background:
    radial-gradient(circle at 38% 30%, rgb(255 255 255 / 45%) 0 12%, transparent 30%),
    radial-gradient(
      circle,
      color-mix(in srgb, var(--colour) 85%, #fff) 0 40%,
      var(--colour) 62%,
      color-mix(in srgb, var(--colour) 50%, #000) 100%
    );
  box-shadow:
    inset 0 0 0 calc(var(--size) * 0.06) color-mix(in srgb, var(--colour) 60%, #000),
    0 calc(var(--size) * 0.06) calc(var(--size) * 0.1) rgb(0 0 0 / 55%);
  color: color-mix(in srgb, var(--colour) 45%, #000);
  font-size: calc(var(--size) * 0.42);
  font-weight: 900;
  line-height: 1;
}

.tag {
  letter-spacing: -0.04em;
  text-shadow: 0 calc(var(--size) * 0.03) 0 rgb(255 255 255 / 40%);
}
</style>
