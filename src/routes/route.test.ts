import { describe, expect, it } from "vite-plus/test";

import {
  newRosterLink,
  officialScreenLink,
  rosterEditorLink,
  rosterScreenLink,
  routeOf,
} from "./route";

const open = (link: string) => {
  const [path, search = ""] = link.split(/(?=\?)/);
  return routeOf(path!, search);
};

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
    expect(routeOf("/official/smash-for-wii-u", "")).toMatchObject({
      roster: "smash-for-wii-u",
      template: "ultimate",
    });
  });

  it("opens the Smash 64 roster in its own template", () => {
    expect(routeOf("/official/smash-64", "")).toMatchObject({
      roster: "smash-64",
      template: "smash-64",
    });
  });

  it("opens the Brawl roster in its own template", () => {
    expect(routeOf("/official/brawl", "")).toMatchObject({ roster: "brawl", template: "brawl" });
  });

  it("falls back to the default template when the link names one that cannot be shown", () => {
    expect(routeOf("/official/ultimate", "?template=smash-for-wii-u")).toMatchObject({
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

describe("the links to a user's rosters", () => {
  it("opens the editor on a new roster, started from scratch", () => {
    expect(newRosterLink()).toBe("/rosters/new");
    expect(open(newRosterLink())).toEqual({ name: "roster-editor" });
  });

  it("opens the editor on a new roster, started as a copy of an official one", () => {
    expect(newRosterLink("melee")).toBe("/rosters/new?from=melee");
    expect(open(newRosterLink("melee"))).toEqual({ name: "roster-editor", copyOf: "melee" });
  });

  it("starts from scratch when the link names no official roster to copy", () => {
    expect(routeOf("/rosters/new", "?from=smash-7")).toEqual({ name: "roster-editor" });
  });

  it("opens the editor on a saved roster", () => {
    expect(rosterEditorLink("abc123")).toBe("/rosters/abc123/edit");
    expect(open(rosterEditorLink("abc123"))).toEqual({ name: "roster-editor", roster: "abc123" });
  });

  it("opens a saved roster's screen, leaving the template to the roster's default", () => {
    expect(rosterScreenLink("abc123")).toBe("/rosters/abc123");
    expect(open(rosterScreenLink("abc123"))).toEqual({ name: "roster-screen", roster: "abc123" });
  });

  it("opens a saved roster's screen in a chosen template", () => {
    expect(rosterScreenLink("abc123", "melee")).toBe("/rosters/abc123?template=melee");
    expect(open(rosterScreenLink("abc123", "melee"))).toEqual({
      name: "roster-screen",
      roster: "abc123",
      template: "melee",
    });
  });

  it("leaves the template to the roster when the link names one that cannot be shown", () => {
    expect(routeOf("/rosters/abc123", "?template=smash-for-wii-u")).toEqual({
      name: "roster-screen",
      roster: "abc123",
    });
  });

  it("opens the home page for anything else under rosters", () => {
    expect(routeOf("/rosters", "")).toEqual({ name: "home" });
    expect(routeOf("/rosters/abc123/edit/more", "")).toEqual({ name: "home" });
    expect(routeOf("/rosters/abc123/delete", "")).toEqual({ name: "home" });
  });
});
