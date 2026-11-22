import { describe, expect, it } from "vite-plus/test";

import { availableTemplates, defaultTemplate, templateName } from "./catalogue";

describe("the templates a roster can be shown in", () => {
  it("offers the templates that have been built, oldest game first", () => {
    expect(availableTemplates).toEqual([
      "smash-64",
      "melee",
      "brawl",
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
    expect(defaultTemplate("smash-for-wii-u")).toBe("smash-for-wii-u");
    expect(defaultTemplate("ultimate")).toBe("ultimate");
  });

  it("is the nearest built template when its own is not built yet", () => {
    // The 3DS game sits between Brawl and the Wii U game; on a tie the later one wins.
    expect(defaultTemplate("smash-for-3ds")).toBe("smash-for-wii-u");
  });
});
