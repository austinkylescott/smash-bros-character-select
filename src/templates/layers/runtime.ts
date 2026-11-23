/**
 * The part of the layer setup that needs three.js. It is only ever imported dynamically, once a
 * screen with 3D layers opens and WebGL is there to draw them, so no other page downloads three.
 */
import { OrthographicCamera, WebGLRenderer } from "three";

import type { Size } from "../stage";
import type { LayerScene, SceneFactory, TemplateLayers } from "./scene";
import { drawingBuffer, stageView } from "./view";

export interface LayerCanvases {
  readonly under: HTMLCanvasElement | null;
  readonly over: HTMLCanvasElement | null;
}

export interface RunningLayers {
  /** Sizes every canvas's drawing buffer for the stage at this scale. */
  resize(scale: number, devicePixelRatio: number): void;
  /** Poses and draws every layer at `seconds` into its loop. */
  render(seconds: number): void;
  /** Frees every scene and renderer, and releases the WebGL contexts. */
  dispose(): void;
}

interface Layer {
  readonly renderer: WebGLRenderer;
  readonly content: LayerScene;
  readonly canvas: HTMLCanvasElement;
}

/** Deep enough that geometry turned in depth is never clipped. */
const DEPTH = 4000;

/**
 * Starts a renderer on each canvas the template has a scene for. Throws if WebGL will not start,
 * after freeing whatever it had started. `onLost` is called if a context is lost later.
 */
export function startLayers(
  canvases: LayerCanvases,
  layers: TemplateLayers,
  stage: Size,
  onLost: () => void,
): RunningLayers {
  const view = stageView(stage);
  const camera = new OrthographicCamera(
    view.left,
    view.right,
    view.top,
    view.bottom,
    -DEPTH,
    DEPTH,
  );
  const lost = (event: Event) => {
    event.preventDefault();
    onLost();
  };

  const running: Layer[] = [];
  const dispose = () => {
    for (const { renderer, content, canvas } of running) {
      canvas.removeEventListener("webglcontextlost", lost);
      content.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    }
    running.length = 0;
  };

  const start = (
    canvas: HTMLCanvasElement | null,
    factory: SceneFactory | undefined,
    over: boolean,
  ) => {
    if (!canvas || !factory) return;
    const renderer = new WebGLRenderer({ canvas, alpha: over, antialias: true });
    let content: LayerScene;
    try {
      content = factory(stage);
    } catch (error) {
      renderer.dispose();
      renderer.forceContextLoss();
      throw error;
    }
    renderer.setClearColor(0x000000, over ? 0 : 1);
    canvas.addEventListener("webglcontextlost", lost);
    running.push({ renderer, content, canvas });
  };

  try {
    start(canvases.under, layers.under, false);
    start(canvases.over, layers.over, true);
  } catch (error) {
    dispose();
    throw error;
  }

  return {
    resize(scale, devicePixelRatio) {
      for (const { renderer, content } of running) {
        const { width, height } = drawingBuffer(
          stage,
          scale,
          devicePixelRatio,
          content.maxPixelRatio,
        );
        renderer.setPixelRatio(1);
        // The canvas keeps its CSS size, the stage's; only its drawing buffer changes.
        renderer.setSize(width, height, false);
      }
    },
    render(seconds) {
      for (const { renderer, content } of running) {
        content.update(seconds);
        renderer.render(content.scene, camera);
      }
    },
    dispose,
  };
}
