import { mkdir, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { beforeEach, describe, expect, it } from "vite-plus/test";

import type { Manifest } from "../../src/asset-layer/manifest.ts";
import { fetchAssets } from "./fetch-assets.ts";

const manifest: Manifest = {
  assets: [
    {
      id: "ultimate/portrait/mario",
      game: "ultimate",
      kind: "portrait",
      path: "ultimate/portraits/mario.png",
    },
    { id: "melee/music/menu", game: "melee", kind: "music", path: "melee/music/menu.ogg" },
  ],
};

/** Stands in for the private bucket: serves the given files and nothing else. */
function bucket(files: Record<string, string>) {
  return async (path: string) => {
    const content = files[path];
    return content === undefined ? null : new TextEncoder().encode(content);
  };
}

let destDir: string;
beforeEach(async () => {
  destDir = await mkdtemp(join(tmpdir(), "fetch-assets-"));
});

describe("fetching official assets", () => {
  it("downloads every asset in the manifest to its path", async () => {
    const result = await fetchAssets({
      manifest,
      destDir,
      token: "a-token",
      download: bucket({
        "ultimate/portraits/mario.png": "mario bytes",
        "melee/music/menu.ogg": "menu bytes",
      }),
    });

    expect(await readFile(join(destDir, "ultimate/portraits/mario.png"), "utf8")).toBe(
      "mario bytes",
    );
    expect(await readFile(join(destDir, "melee/music/menu.ogg"), "utf8")).toBe("menu bytes");
    expect(result).toMatchObject({
      status: "done",
      fetched: ["ultimate/portraits/mario.png", "melee/music/menu.ogg"],
    });
  });

  it("does nothing without a token, so placeholders stay in use", async () => {
    const result = await fetchAssets({
      manifest,
      destDir,
      token: undefined,
      download: () => {
        throw new Error("the bucket must not be contacted without a token");
      },
    });

    expect(result).toEqual({ status: "skipped" });
    expect(await readdir(destDir)).toEqual([]);
  });

  it("reports assets the bucket does not have and still fetches the rest", async () => {
    const result = await fetchAssets({
      manifest,
      destDir,
      token: "a-token",
      download: bucket({ "melee/music/menu.ogg": "menu bytes" }),
    });

    expect(result).toMatchObject({
      status: "done",
      fetched: ["melee/music/menu.ogg"],
      missing: ["ultimate/portraits/mario.png"],
    });
    expect(await readdir(destDir)).toEqual(["melee"]);
  });

  it("reports a download that fails and still fetches the rest", async () => {
    const result = await fetchAssets({
      manifest,
      destDir,
      token: "a-token",
      download: async (path) => {
        if (path === "ultimate/portraits/mario.png") throw new Error("403 Forbidden");
        return new TextEncoder().encode("menu bytes");
      },
    });

    expect(result).toMatchObject({
      status: "done",
      fetched: ["melee/music/menu.ogg"],
      failed: [{ path: "ultimate/portraits/mario.png", reason: "403 Forbidden" }],
    });
  });

  it("removes previously fetched files that are no longer in the manifest", async () => {
    await mkdir(join(destDir, "brawl/portraits"), { recursive: true });
    await writeFile(join(destDir, "brawl/portraits/removed.png"), "old bytes");

    const result = await fetchAssets({
      manifest,
      destDir,
      token: "a-token",
      download: bucket({ "melee/music/menu.ogg": "menu bytes" }),
    });

    expect(result).toMatchObject({ removed: ["brawl/portraits/removed.png"] });
    expect(await readdir(destDir)).toEqual(["melee"]);
  });

  it("removes a previously fetched file the bucket no longer has", async () => {
    await mkdir(join(destDir, "ultimate/portraits"), { recursive: true });
    await writeFile(join(destDir, "ultimate/portraits/mario.png"), "old bytes");

    const result = await fetchAssets({
      manifest,
      destDir,
      token: "a-token",
      download: bucket({ "melee/music/menu.ogg": "menu bytes" }),
    });

    expect(result).toMatchObject({
      missing: ["ultimate/portraits/mario.png"],
      removed: ["ultimate/portraits/mario.png"],
    });
    expect(await readdir(destDir)).toEqual(["melee"]);
  });
});
