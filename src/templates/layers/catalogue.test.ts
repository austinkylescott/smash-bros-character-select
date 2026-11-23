import { describe, expect, it } from "vite-plus/test";

import { availableTemplates } from "../catalogue";
import { templateLayers } from "./catalogue";

describe("which templates draw 3D layers", () => {
  it("gives Melee its layers, loaded only when asked for", () => {
    expect(templateLayers("melee")).toBeTypeOf("function");
  });

  it("leaves every other template as its CSS screen, so it never loads three.js", () => {
    const others = availableTemplates.filter((template) => template !== "melee");
    expect(others.map(templateLayers)).toEqual(others.map(() => undefined));
  });
});
