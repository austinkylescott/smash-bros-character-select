import { describe, expect, it } from "vite-plus/test";

import { officialScreenLink, routeOf } from "./route";

describe("what a link opens", () => {
  it("opens the home page at the site's root", () => {
    expect(routeOf("/", "")).toEqual({ name: "home" });
  });

  it("opens an official roster in its default template", () => {
    expect(routeOf("/official/melee", "")).toEqual({
      name: "official-screen",
      roster: "melee",
      template: "melee",
    });
  });

  it("opens the Melee roster in the Ultimate template when the link says so", () => {
    expect(routeOf("/official/melee", "?template=ultimate")).toEqual({
      name: "official-screen",
      roster: "melee",
      template: "ultimate",
    });
  });

  it("opens the Ultimate roster in the Melee template when the link says so", () => {
    expect(routeOf("/official/ultimate", "?template=melee")).toEqual({
      name: "official-screen",
      roster: "ultimate",
      template: "melee",
    });
  });

  it("opens a roster whose own template is not built yet in the nearest one that is", () => {
    expect(routeOf("/official/brawl", "")).toMatchObject({ roster: "brawl", template: "melee" });
  });

  it("falls back to the default template when the link names one that cannot be shown", () => {
    expect(routeOf("/official/ultimate", "?template=brawl")).toMatchObject({
      template: "ultimate",
    });
    expect(routeOf("/official/ultimate", "?template=nonsense")).toMatchObject({
      template: "ultimate",
    });
  });

  it("ignores a trailing slash", () => {
    expect(routeOf("/official/melee/", "")).toMatchObject({ roster: "melee" });
  });

  it("opens the home page for anything it does not recognise", () => {
    expect(routeOf("/official/smash-7", "")).toEqual({ name: "home" });
    expect(routeOf("/official", "")).toEqual({ name: "home" });
    expect(routeOf("/somewhere/else", "")).toEqual({ name: "home" });
  });
});

describe("the link to an official roster's screen", () => {
  it("names only the roster, so it opens in the default template", () => {
    expect(officialScreenLink("melee")).toBe("/official/melee");
  });

  it("carries a chosen template, so the same screen can be shared", () => {
    expect(officialScreenLink("melee", "ultimate")).toBe("/official/melee?template=ultimate");
  });

  it("opens the screen it was made for", () => {
    const [path, search = ""] = officialScreenLink("smash-64", "ultimate").split(/(?=\?)/);

    expect(routeOf(path!, search)).toEqual({
      name: "official-screen",
      roster: "smash-64",
      template: "ultimate",
    });
  });
});
