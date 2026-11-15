<script setup lang="ts">
/** Ultimate's white glove, with a player's tag on its palm when it has an owner. */
defineProps<{ colour: string; tag?: string }>();
</script>

<template>
  <svg class="glove" viewBox="0 0 120 150" aria-hidden="true">
    <g
      stroke="color-mix(in srgb, var(--colour) 40%, #000)"
      stroke-width="5"
      stroke-linejoin="round"
      fill="#fdf3f4"
      :style="{ '--colour': colour }"
    >
      <path
        d="M30 88V34a9 9 0 0 1 18 0v40V22a9 9 0 0 1 18 0v50V26a9 9 0 0 1 18 0v48V42a9 9 0 0 1 18 0v52c0 26-14 44-40 44H52c-14 0-22-8-28-20L8 92a9 9 0 0 1 14-10z"
      />
      <path d="M42 132h48v14H42z" fill="#e8c9cd" />
    </g>
    <text v-if="tag" x="62" y="104" text-anchor="middle" class="tag" :fill="colour">
      {{ tag }}
    </text>
  </svg>
</template>

<style scoped>
.glove {
  display: block;
  overflow: visible;
}

.tag {
  font-family: var(--ult-font);
  font-size: 34px;
  font-weight: 900;
  stroke: #fff;
  stroke-width: 6px;
  paint-order: stroke fill;
}
</style>
