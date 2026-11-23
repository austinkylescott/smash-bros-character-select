// @vitest-environment edge-runtime
/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vite-plus/test";

import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob("./**/*.*s");

const server = () => {
  const t = convexTest(schema, modules);
  return {
    t,
    ada: t.withIdentity({ tokenIdentifier: "clerk|ada", subject: "ada" }),
    bob: t.withIdentity({ tokenIdentifier: "clerk|bob", subject: "bob" }),
  };
};

const roster = (id: string, ...fighters: string[]) => ({
  id,
  name: `Roster ${id}`,
  description: "",
  defaultTemplate: "ultimate" as const,
  randomSlot: true,
  fighters: fighters.map((fighter) => ({ id: fighter })),
});

describe("rosters saved to an account", () => {
  it("are listed for their owner", async () => {
    const { ada } = server();
    await ada.mutation(api.rosters.save, { roster: roster("r1", "kirby", "fox") });

    expect(await ada.query(api.rosters.mine)).toEqual([roster("r1", "kirby", "fox")]);
  });

  it("are not listed for anyone else", async () => {
    const { t, ada, bob } = server();
    await ada.mutation(api.rosters.save, { roster: roster("r1", "kirby") });

    expect(await bob.query(api.rosters.mine)).toEqual([]);
    expect(await t.query(api.rosters.mine)).toBeNull();
  });
});

describe("saving a roster to an account", () => {
  it("replaces the one saved before with its id, and lists the latest saved first", async () => {
    const { ada } = server();
    await ada.mutation(api.rosters.save, { roster: roster("r1", "kirby") });
    await ada.mutation(api.rosters.save, { roster: roster("r2", "fox") });
    await ada.mutation(api.rosters.save, { roster: roster("r1", "kirby", "ness") });

    expect(await ada.query(api.rosters.mine)).toEqual([
      roster("r1", "kirby", "ness"),
      roster("r2", "fox"),
    ]);
  });

  it("needs someone signed in", async () => {
    const { t } = server();

    await expect(t.mutation(api.rosters.save, { roster: roster("r1", "kirby") })).rejects.toThrow(
      "Sign in",
    );
  });

  it("refuses a roster that breaks the rules, as the browser does", async () => {
    const { ada } = server();

    await expect(ada.mutation(api.rosters.save, { roster: roster("r1") })).rejects.toThrow(
      "A roster needs at least one fighter.",
    );
    await expect(
      ada.mutation(api.rosters.save, { roster: { ...roster("r1", "kirby"), name: " " } }),
    ).rejects.toThrow("A roster needs a name.");
    await expect(
      ada.mutation(api.rosters.save, { roster: roster("r1", "kirby", "kirby") }),
    ).rejects.toThrow("A roster holds each fighter once.");
    await expect(
      ada.mutation(api.rosters.save, { roster: roster("r1", "not-a-smash-fighter") }),
    ).rejects.toThrow();
    expect(await ada.query(api.rosters.mine)).toEqual([]);
  });

  it("leaves another user's roster with the same id alone", async () => {
    const { ada, bob } = server();
    await ada.mutation(api.rosters.save, { roster: roster("r1", "kirby") });
    await bob.mutation(api.rosters.save, { roster: roster("r1", "fox") });

    expect(await ada.query(api.rosters.mine)).toEqual([roster("r1", "kirby")]);
    expect(await bob.query(api.rosters.mine)).toEqual([roster("r1", "fox")]);
  });
});

describe("removing a roster from an account", () => {
  it("forgets it", async () => {
    const { ada } = server();
    await ada.mutation(api.rosters.save, { roster: roster("r1", "kirby") });
    await ada.mutation(api.rosters.save, { roster: roster("r2", "fox") });

    await ada.mutation(api.rosters.remove, { id: "r1" });

    expect(await ada.query(api.rosters.mine)).toEqual([roster("r2", "fox")]);
  });

  it("cannot remove another user's roster", async () => {
    const { ada, bob } = server();
    await ada.mutation(api.rosters.save, { roster: roster("r1", "kirby") });

    await bob.mutation(api.rosters.remove, { id: "r1" });

    expect(await ada.query(api.rosters.mine)).toEqual([roster("r1", "kirby")]);
  });
});

/** A portrait image uploaded to the server's file storage. */
const uploaded = (t: ReturnType<typeof server>["t"], type = "image/webp", bytes = 100) =>
  t.run((ctx) => ctx.storage.store(new Blob([new Uint8Array(bytes)], { type })));

const fileExists = async (t: ReturnType<typeof server>["t"], file: Id<"_storage">) =>
  (await t.run((ctx) => ctx.db.system.get(file))) !== null;

const crop = { x: 0, y: 0, width: 100, height: 100 };
const withGoku = (id: string, file: Id<"_storage">) => ({
  ...roster(id, "kirby"),
  fighters: [
    { id: "kirby" },
    {
      id: "custom-goku",
      name: "Goku",
      portrait: { file, width: 200, height: 100, slot: crop, panel: crop },
    },
  ],
});

describe("fighters added by image, saved to an account", () => {
  it("are listed with a link to their image", async () => {
    const { t, ada } = server();
    const file = await uploaded(t);
    await ada.mutation(api.rosters.save, { roster: withGoku("r1", file) });

    const [saved] = (await ada.query(api.rosters.mine))!;
    const url = await t.run((ctx) => ctx.storage.getUrl(file));
    expect(saved!.fighters[1]).toEqual({
      id: "custom-goku",
      name: "Goku",
      portrait: { file, image: url, width: 200, height: 100, slot: crop, panel: crop },
    });
  });

  it("can only be uploaded by someone signed in", async () => {
    const { t, ada } = server();

    await expect(t.mutation(api.rosters.uploadUrl)).rejects.toThrow("Sign in");
    expect(await ada.mutation(api.rosters.uploadUrl)).toEqual(expect.any(String));
  });

  it("refuses a file that is not a kept image, or is too large", async () => {
    const { t, ada } = server();
    const text = await uploaded(t, "text/html");
    const huge = await uploaded(t, "image/png", 2 * 1024 * 1024);

    await expect(ada.mutation(api.rosters.save, { roster: withGoku("r1", text) })).rejects.toThrow(
      "image",
    );
    await expect(ada.mutation(api.rosters.save, { roster: withGoku("r1", huge) })).rejects.toThrow(
      "image",
    );
  });

  it("refuses crops that do not fit the image", async () => {
    const { t, ada } = server();
    const file = await uploaded(t);
    const outside = withGoku("r1", file);
    const goku = outside.fighters[1] as { portrait: { width: number } };
    goku.portrait.width = 50;

    await expect(ada.mutation(api.rosters.save, { roster: outside })).rejects.toThrow();
  });

  it("cannot use another user's image", async () => {
    const { t, ada, bob } = server();
    const file = await uploaded(t);
    await ada.mutation(api.rosters.save, { roster: withGoku("r1", file) });

    await expect(bob.mutation(api.rosters.save, { roster: withGoku("r1", file) })).rejects.toThrow(
      "image",
    );
  });

  it("delete an image no roster shows any more", async () => {
    const { t, ada } = server();
    const file = await uploaded(t);
    await ada.mutation(api.rosters.save, { roster: withGoku("r1", file) });

    await ada.mutation(api.rosters.save, { roster: roster("r1", "kirby") });

    expect(await fileExists(t, file)).toBe(false);
  });

  it("delete a removed roster's images", async () => {
    const { t, ada } = server();
    const file = await uploaded(t);
    await ada.mutation(api.rosters.save, { roster: withGoku("r1", file) });

    await ada.mutation(api.rosters.remove, { id: "r1" });

    expect(await fileExists(t, file)).toBe(false);
  });

  it("keep an image another of the user's rosters still shows", async () => {
    const { t, ada } = server();
    const file = await uploaded(t);
    await ada.mutation(api.rosters.save, { roster: withGoku("r1", file) });
    await ada.mutation(api.rosters.save, { roster: withGoku("r2", file) });

    await ada.mutation(api.rosters.remove, { id: "r1" });

    expect(await fileExists(t, file)).toBe(true);
  });

  it("delete uploads the user gave up on, but no image a roster shows", async () => {
    const { t, ada, bob } = server();
    const kept = await uploaded(t);
    const abandoned = await uploaded(t);
    await ada.mutation(api.rosters.save, { roster: withGoku("r1", kept) });

    await bob.mutation(api.rosters.discardUploads, { files: [kept, abandoned] });

    expect(await fileExists(t, kept)).toBe(true);
    expect(await fileExists(t, abandoned)).toBe(false);
  });
});

describe("moving a roster into an account", () => {
  it("adds it when the account has none with its id", async () => {
    const { ada } = server();

    expect(await ada.mutation(api.rosters.add, { roster: roster("r1", "kirby") })).toBe(true);
    expect(await ada.query(api.rosters.mine)).toEqual([roster("r1", "kirby")]);
  });

  it("keeps the account's own roster when it already has one with that id", async () => {
    // As when the move is tried again after the page closed partway through.
    const { t, ada } = server();
    await ada.mutation(api.rosters.add, { roster: roster("r1", "kirby") });
    const upload = await uploaded(t);

    expect(await ada.mutation(api.rosters.add, { roster: withGoku("r1", upload) })).toBe(false);
    expect(await ada.query(api.rosters.mine)).toEqual([roster("r1", "kirby")]);
    expect(await fileExists(t, upload)).toBe(false);
  });
});
