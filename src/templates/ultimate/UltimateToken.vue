<script setup lang="ts">
/** A player's token, round, in their colour and with their tag, as Ultimate draws it. */
defineProps<{ colour: string; tag: string; size: number }>();
</script>

<template>
  <span class="token" :style="{ '--colour': colour, '--size': `${size}px` }">
    <span class="ult-outlined" :data-text="tag">{{ tag }}</span>
  </span>
</template>

<style scoped>
.token {
  display: grid;
  place-items: center;
  width: var(--size);
  height: var(--size);
  border: calc(var(--size) * 0.07) solid #f4f4f4;
  border-radius: 50%;
  background: radial-gradient(
    circle at 38% 32%,
    color-mix(in srgb, var(--colour) 55%, #fff),
    var(--colour) 62%,
    color-mix(in srgb, var(--colour) 70%, #000)
  );
  box-shadow:
    0 0 0 calc(var(--size) * 0.03) #222,
    0 calc(var(--size) * 0.06) calc(var(--size) * 0.1) rgb(0 0 0 / 45%);
  color: #fff;
  font-size: calc(var(--size) * 0.34);
  font-weight: 900;
  line-height: 1;
  --stroke: calc(var(--size) * 0.09);
  --stroke-color: color-mix(in srgb, var(--colour) 45%, #000);
}
</style>
