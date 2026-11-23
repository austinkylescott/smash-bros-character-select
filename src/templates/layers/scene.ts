/**
 * What a template gives the shared layer setup to draw (ADR 0007): a scene for the canvas under
 * its DOM screen, one for the canvas over it, or both. Scenes are built in code from shaders and
 * primitive geometry.
 */
import type { Scene } from "three";

import type { Size } from "../stage";
import type { ScreenPieces } from "./pieces";

export interface LayerScene {
  /** Drawn through a camera that shows the stage in stage pixels (see `stageView`). */
  readonly scene: Scene;
  /** The most device pixels per CSS pixel worth drawing this scene at. */
  readonly maxPixelRatio?: number;
  /**
   * Poses the scene at `seconds` into its loop, with its pieces where they are now. A still scene
   * is posed at 0.
   */
  update(seconds: number): void;
  /** Frees the scene's geometry, materials and textures. */
  dispose(): void;
}

/** What a scene may ask of the screen it is drawn over. */
export interface LayerScreen {
  /**
   * Where the screen's hand and tokens are right now. A scene that draws them reads it on every
   * `update`, so it is never a frame behind the DOM.
   */
  readonly pieces: () => ScreenPieces;
  /** Asks for another frame after something changed outside `update`, such as a font loading. */
  readonly redraw: () => void;
}

/** Builds a scene for a stage. */
export type SceneFactory = (stage: Size, screen: LayerScreen) => LayerScene;

export interface TemplateLayers {
  readonly under?: SceneFactory;
  readonly over?: SceneFactory;
}
