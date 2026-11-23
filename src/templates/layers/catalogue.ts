/**
 * Which templates draw 3D layers, and where their code is. Each is a dynamic import, so three.js
 * is fetched only when a screen in one of these templates opens with WebGL to draw it.
 */
import type { AvailableTemplate } from "../catalogue";
import type { TemplateLayers } from "./scene";

const LAYERS: Partial<Record<AvailableTemplate, () => Promise<TemplateLayers>>> = {
  melee: () => import("../melee/layers"),
};

/** How to load a template's 3D layers, or nothing for a template that is only its CSS screen. */
export const templateLayers = (
  template: AvailableTemplate,
): (() => Promise<TemplateLayers>) | undefined => LAYERS[template];
