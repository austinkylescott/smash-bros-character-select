/**
 * The shared 3D layer setup (ADR 0007): draws a template's scenes into a canvas under its DOM
 * screen and one over it, and keeps them in step with the page.
 *
 * - three.js and the template's scenes are loaded only when the template has layers, the screen
 *   is not a preview, and WebGL starts.
 * - Without WebGL, or once its context is lost, nothing is drawn and `drawn` stays false, so the
 *   template shows exactly its CSS screen.
 * - Under reduced motion the scene is drawn once, still. In a hidden tab nothing renders.
 * - Every GPU resource is freed when the screen unmounts, or the template or stage changes.
 */
import {
  computed,
  type InjectionKey,
  onBeforeUnmount,
  onMounted,
  type Ref,
  readonly,
  ref,
  watch,
} from "vue";

import type { AvailableTemplate } from "../catalogue";
import type { Size } from "../stage";
import { templateLayers } from "./catalogue";
import { layerMode } from "./mode";
import type { RunningLayers } from "./runtime";

/**
 * Whether a screen's 3D layers are drawing. A template hides the CSS it draws in 3D instead, such
 * as its Backdrop, only while this is true.
 */
export const LAYERS_DRAWN: InjectionKey<Readonly<Ref<boolean>>> = Symbol("layers drawn");

let webglSupport: boolean | undefined;

/** Whether this browser will start WebGL at all, found once with a throwaway canvas. */
function hasWebgl(): boolean {
  if (webglSupport === undefined) {
    try {
      const probe = document.createElement("canvas");
      const context = probe.getContext("webgl2") ?? probe.getContext("webgl");
      webglSupport = context !== null;
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export interface StageLayersOptions {
  readonly template: () => AvailableTemplate;
  readonly stage: () => Size;
  /** The `fitStage` scale the stage, and so the canvases, are shown at. */
  readonly scale: () => number;
  /** False for a preview, which is only looked at and never draws 3D. */
  readonly enabled: () => boolean;
  readonly under: Ref<HTMLCanvasElement | null>;
  readonly over: Ref<HTMLCanvasElement | null>;
}

export function useStageLayers(options: StageLayersOptions) {
  const started = ref(false);
  const contextLost = ref(false);
  const reducedMotion = ref(false);
  const hidden = ref(false);

  const mode = computed(() =>
    layerMode({
      webgl: started.value,
      contextLost: contextLost.value,
      reducedMotion: reducedMotion.value,
      hidden: hidden.value,
    }),
  );
  /** Only once a first frame is on the canvas, so the CSS backdrop never gives way to black. */
  const drawn = ref(false);

  let running: RunningLayers | undefined;
  /** Bumped on every start and stop, so a load that finishes late is dropped. */
  let generation = 0;
  let frame = 0;
  /** How far into the loop the scene is. It only advances while moving. */
  let seconds = 0;
  let last: number | undefined;

  function stopLoop() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = undefined;
  }

  function stop() {
    generation++;
    stopLoop();
    running?.dispose();
    running = undefined;
    started.value = false;
    drawn.value = false;
  }

  function draw() {
    if (!running) return;
    running.render(mode.value === "still" ? 0 : seconds);
    drawn.value = true;
  }

  function tick(now: number) {
    seconds += last === undefined ? 0 : Math.min(now - last, 100) / 1000;
    last = now;
    draw();
    frame = requestAnimationFrame(tick);
  }

  /** Renders every frame while moving, once when still, and not at all otherwise. */
  function schedule() {
    stopLoop();
    if (mode.value === "moving") frame = requestAnimationFrame(tick);
    else if (mode.value === "still") draw();
  }

  function resize() {
    running?.resize(options.scale(), window.devicePixelRatio || 1);
  }

  async function start() {
    stop();
    const id = generation;
    const load = options.enabled() ? templateLayers(options.template()) : undefined;
    if (!load || contextLost.value || !hasWebgl()) return;

    let layers;
    let runtime;
    try {
      [runtime, layers] = await Promise.all([import("./runtime"), load()]);
    } catch {
      return; // The chunk would not load: the CSS screen stands.
    }
    if (id !== generation || (!options.under.value && !options.over.value)) return;

    try {
      running = runtime.startLayers(
        { under: options.under.value, over: options.over.value },
        layers,
        options.stage(),
        () => {
          contextLost.value = true;
          stop();
        },
      );
    } catch {
      return; // WebGL would not start on this canvas: the CSS screen stands.
    }
    resize();
    started.value = true;
    schedule();
  }

  let motionQuery: MediaQueryList | undefined;
  const onMotion = () => {
    reducedMotion.value = motionQuery?.matches ?? false;
  };
  const onVisibility = () => {
    hidden.value = document.visibilityState === "hidden";
  };

  onMounted(() => {
    motionQuery = window.matchMedia?.(REDUCED_MOTION);
    motionQuery?.addEventListener("change", onMotion);
    onMotion();
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();

    watch(mode, schedule);
    watch(options.scale, () => {
      resize();
      if (mode.value === "still") draw();
    });
    // A new template, or a turn of the phone to another stage, builds the layers afresh.
    watch(
      () => [options.template(), options.stage(), options.enabled(), options.under.value] as const,
      () => void start(),
      { immediate: true, flush: "post" },
    );
  });

  onBeforeUnmount(() => {
    stop();
    motionQuery?.removeEventListener("change", onMotion);
    document.removeEventListener("visibilitychange", onVisibility);
  });

  return { drawn: readonly(drawn) };
}
