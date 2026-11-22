import { describe, expect, it } from "vite-plus/test";

import { availableTemplates, defaultTemplate, templateName } from "./catalogue";

describe("the templates a roster can be shown in", () => {
  it("offers the templates that have been built, oldest game first", () => {
    expect(availableTemplates).toEqual([
      "smash-64",
      "melee",
      "brawl",
      "smash-for-3ds",
      "smash-for-wii-u",
      "ultimate",
    ]);
  });

  it("names each template after its game", () => {
    expect(templateName("melee")).toBe("Melee");
    expect(templateName("smash-for-wii-u")).toBe("Smash for Wii U");
  });
});

describe("the template an official roster opens in", () => {
  it("is its own game's template", () => {
    expect(defaultTemplate("smash-64")).toBe("smash-64");
    expect(defaultTemplate("melee")).toBe("melee");
    expect(defaultTemplate("brawl")).toBe("brawl");
    expect(defaultTemplate("smash-for-3ds")).toBe("smash-for-3ds");
    expect(defaultTemplate("smash-for-wii-u")).toBe("smash-for-wii-u");
    expect(defaultTemplate("ultimate")).toBe("ultimate");
  });
});
