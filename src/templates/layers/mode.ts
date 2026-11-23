/**
 * How a screen's 3D layers run, from what the browser offers and what the visitor asks for
 * (ADR 0007).
 *
 * - `css`: no layers. The screen is exactly its CSS screen.
 * - `moving`: the layers render every frame.
 * - `still`: the layers are drawn, but only when something changes, never animated.
 * - `paused`: nothing renders while the tab is hidden; what was last drawn stays.
 */
export type LayerMode = "css" | "moving" | "still" | "paused";

export interface LayerConditions {
  /** Whether WebGL started. */
  readonly webgl: boolean;
  /** Whether the WebGL context has been lost since. A lost screen stays on CSS for the visit. */
  readonly contextLost: boolean;
  /** `prefers-reduced-motion: reduce`. */
  readonly reducedMotion: boolean;
  /** Whether the tab is hidden. */
  readonly hidden: boolean;
}

export function layerMode({
  webgl,
  contextLost,
  reducedMotion,
  hidden,
}: LayerConditions): LayerMode {
  if (!webgl || contextLost) return "css";
  if (hidden) return "paused";
  return reducedMotion ? "still" : "moving";
}
