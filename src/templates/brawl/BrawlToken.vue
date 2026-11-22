<script setup lang="ts">
/** A player's token, as Brawl draws it: a glossy disc in their colour inside a white ring. */
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
    radial-gradient(ellipse 60% 38% at 50% 24%, rgb(255 255 255 / 55%) 0 60%, transparent 62%),
    radial-gradient(
      circle,
      color-mix(in srgb, var(--colour) 85%, #fff) 0 30%,
      var(--colour) 52%,
      color-mix(in srgb, var(--colour) 55%, #000) 70%,
      #f4f4f4 71% 84%,
      #9a9ca2 85% 100%
    );
  box-shadow: 0 calc(var(--size) * 0.06) calc(var(--size) * 0.12) rgb(0 0 0 / 45%);
  color: #fff;
  font-size: calc(var(--size) * 0.3);
  font-weight: 900;
  line-height: 1;
}

.tag {
  letter-spacing: -0.02em;
  -webkit-text-stroke: calc(var(--size) * 0.04) color-mix(in srgb, var(--colour) 40%, #000);
  paint-order: stroke fill;
}
</style>
