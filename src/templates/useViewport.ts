import { onBeforeUnmount, onMounted, readonly, ref } from "vue";

import type { Size } from "./stage";

const measure = (): Size => ({ width: window.innerWidth, height: window.innerHeight });

/** The window's size, kept current as it is resized or the device is turned. */
export function useViewport() {
  // Measured at once, so a stage is fitted before the first paint and never flashes at full size.
  const viewport = ref(measure());
  const remeasure = () => {
    viewport.value = measure();
  };
  onMounted(() => window.addEventListener("resize", remeasure));
  onBeforeUnmount(() => window.removeEventListener("resize", remeasure));
  return readonly(viewport);
}
