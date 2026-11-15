export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface StageFit {
  /** One scale for both axes, so the stage is never stretched. */
  readonly scale: number;
  /** Offset of the scaled stage from the viewport's top left, centring it. */
  readonly x: number;
  readonly y: number;
}

/** Scales a template's fixed-size stage to fit inside the viewport, centred. */
export function fitStage(viewport: Size, stage: Size): StageFit {
  const scale = Math.min(viewport.width / stage.width, viewport.height / stage.height);
  return {
    scale,
    x: (viewport.width - stage.width * scale) / 2,
    y: (viewport.height - stage.height * scale) / 2,
  };
}
