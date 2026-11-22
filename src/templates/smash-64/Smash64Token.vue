<script setup lang="ts">
/** A player's token, as Smash 64 draws it: a silver coin stamped with their tag in their colour. */
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
    radial-gradient(circle at 36% 30%, #fff 0 10%, transparent 34%),
    radial-gradient(circle, #e4e4e8 0 50%, #a8a8b0 66%, #6c6c74 100%);
  box-shadow:
    inset 0 0 0 calc(var(--size) * 0.05) #55555c,
    0 calc(var(--size) * 0.06) calc(var(--size) * 0.12) rgb(0 0 0 / 55%);
  color: color-mix(in srgb, var(--colour) 80%, #fff);
  font-size: calc(var(--size) * 0.4);
  font-weight: 900;
  line-height: 1;
}

.tag {
  letter-spacing: -0.04em;
  -webkit-text-stroke: calc(var(--size) * 0.035) #fff;
  paint-order: stroke fill;
}
</style>
