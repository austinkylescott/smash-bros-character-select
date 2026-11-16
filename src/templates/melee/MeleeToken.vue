<script setup lang="ts">
/** A player's coin, as Melee draws it: a bevelled disc in their colour, stamped with their tag. */
defineProps<{ colour: string; tag: string; size: number }>();
</script>

<template>
  <span class="coin" :style="{ '--colour': colour, '--size': `${size}px` }">
    <span class="tag">{{ tag }}</span>
  </span>
</template>

<style scoped>
.coin {
  display: grid;
  place-items: center;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background:
    radial-gradient(circle at 34% 28%, rgb(255 255 255 / 70%) 0 8%, transparent 26%),
    radial-gradient(
      circle,
      color-mix(in srgb, var(--colour) 80%, #fff) 0 52%,
      var(--colour) 53% 66%,
      color-mix(in srgb, var(--colour) 55%, #000) 67% 100%
    );
  box-shadow:
    inset 0 0 0 calc(var(--size) * 0.05) color-mix(in srgb, var(--colour) 35%, #000),
    0 calc(var(--size) * 0.06) calc(var(--size) * 0.12) rgb(0 0 0 / 55%);
  color: #fff;
  font-size: calc(var(--size) * 0.36);
  font-style: italic;
  font-weight: 900;
  line-height: 1;
}

.tag {
  text-shadow:
    0 0 calc(var(--size) * 0.04) color-mix(in srgb, var(--colour) 40%, #000),
    0 calc(var(--size) * 0.03) 0 color-mix(in srgb, var(--colour) 40%, #000);
}
</style>
