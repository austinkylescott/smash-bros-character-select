<script setup lang="ts">
/**
 * A player's token, as Smash for Wii U draws it: a flat disc in their colour inside a white ring,
 * the tag in slanted white capitals across it.
 */
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
  box-sizing: border-box;
  border: calc(var(--size) * 0.09) solid #fff;
  border-radius: 50%;
  background:
    radial-gradient(ellipse 70% 40% at 50% 20%, rgb(255 255 255 / 35%), transparent 70%),
    radial-gradient(
      circle,
      color-mix(in srgb, var(--colour) 88%, #fff) 0 45%,
      color-mix(in srgb, var(--colour) 80%, #000) 100%
    );
  box-shadow:
    0 0 0 calc(var(--size) * 0.03) #3a3a3a,
    0 calc(var(--size) * 0.06) calc(var(--size) * 0.1) rgb(0 0 0 / 45%);
  color: #fff;
  font-size: calc(var(--size) * 0.36);
  font-style: italic;
  font-weight: 900;
  line-height: 1;
}

.tag {
  letter-spacing: -0.03em;
  -webkit-text-stroke: calc(var(--size) * 0.05) #2a2a2a;
  paint-order: stroke fill;
}
</style>
