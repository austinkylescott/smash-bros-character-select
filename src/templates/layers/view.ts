/**
 * How a template's 3D layers line up with its DOM stage (ADR 0007). Each layer's canvas is the
 * stage's size and sits inside the stage, so it takes the same `fitStage` scale; its camera is
 * measured in stage pixels, so anything drawn at a slot's stage coordinates lands on that slot.
 */
import type { Point } from "../../selection/useHand";
import type { Size } from "../stage";

/** An orthographic camera's bounds, in stage pixels. */
export interface StageView {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

/**
 * The camera bounds that show exactly the stage. The scene's y runs up, as three.js expects, so
 * the stage's top edge is y = 0 and its foot is y = -height.
 */
export const stageView = (stage: Size): StageView => ({
  left: 0,
  right: stage.width,
  top: 0,
  bottom: -stage.height,
});

/** Where a point given in stage pixels (y running down) sits in the scene (y running up). */
export const toScene = ({ x, y }: Point): Point => ({ x, y: y === 0 ? 0 : -y });

/** The most device pixels per CSS pixel a layer draws at unless it asks for fewer. */
export const MAX_PIXEL_RATIO = 2;

/**
 * The size of a layer's drawing buffer: the stage as large as it is shown, in device pixels. A
 * layer may cap the pixel ratio lower, as a soft Backdrop does to save fill on a dense phone.
 */
export function drawingBuffer(
  stage: Size,
  scale: number,
  devicePixelRatio: number,
  maxPixelRatio = MAX_PIXEL_RATIO,
): Size {
  const ratio = scale * Math.min(devicePixelRatio, maxPixelRatio);
  return {
    width: Math.max(1, Math.round(stage.width * ratio)),
    height: Math.max(1, Math.round(stage.height * ratio)),
  };
}
