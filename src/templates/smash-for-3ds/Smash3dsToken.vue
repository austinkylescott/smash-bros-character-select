<script setup lang="ts">
/** A player's token, as Smash for 3DS draws it: a flat coin in their colour, rimmed in white. */
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
  box-sizing: border-box;
  width: var(--size);
  height: var(--size);
  border: calc(var(--size) * 0.09) solid #fff;
  border-radius: 50%;
  background: radial-gradient(
    circle at 50% 30%,
    color-mix(in srgb, var(--colour) 70%, #fff),
    var(--colour) 55%,
    color-mix(in srgb, var(--colour) 70%, #000)
  );
  box-shadow:
    0 0 0 calc(var(--size) * 0.03) rgb(0 0 0 / 55%),
    0 calc(var(--size) * 0.06) calc(var(--size) * 0.1) rgb(0 0 0 / 45%);
  color: #fff;
  font-size: calc(var(--size) * 0.34);
  font-style: italic;
  font-weight: 900;
  line-height: 1;
}

.tag {
  letter-spacing: -0.03em;
  -webkit-text-stroke: calc(var(--size) * 0.03) color-mix(in srgb, var(--colour) 40%, #000);
  paint-order: stroke fill;
}
</style>
