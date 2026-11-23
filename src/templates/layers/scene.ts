/**
 * What a template gives the shared layer setup to draw (ADR 0007): a scene for the canvas under
 * its DOM screen, one for the canvas over it, or both. Scenes are built in code from shaders and
 * primitive geometry.
 */
import type { Scene } from "three";

import type { Size } from "../stage";

export interface LayerScene {
  /** Drawn through a camera that shows the stage in stage pixels (see `stageView`). */
  readonly scene: Scene;
  /** The most device pixels per CSS pixel worth drawing this scene at. */
  readonly maxPixelRatio?: number;
  /** Poses the scene at `seconds` into its loop. A still scene is posed at 0. */
  update(seconds: number): void;
  /** Frees the scene's geometry, materials and textures. */
  dispose(): void;
}

export type SceneFactory = (stage: Size) => LayerScene;

export interface TemplateLayers {
  readonly under?: SceneFactory;
  readonly over?: SceneFactory;
}
