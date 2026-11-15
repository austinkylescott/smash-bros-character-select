/**
 * Fetches the official assets named in the manifest from the private bucket (ADR 0005).
 *
 *   vp run assets:fetch
 *
 * Needs BLOB_READ_WRITE_TOKEN, from the environment or from `.env.local`. Without it
 * nothing is fetched and the app runs on placeholders.
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { get } from "@vercel/blob";

import { manifest, validateManifest } from "../src/asset-layer/manifest.ts";
import { fetchAssets } from "./lib/fetch-assets.ts";

const envFile = fileURLToPath(new URL("../.env.local", import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);

const problems = validateManifest(manifest);
if (problems.length > 0) {
  console.error(["The asset manifest is invalid:", ...problems].join("\n  "));
  process.exit(1);
}

const result = await fetchAssets({
  manifest,
  destDir: fileURLToPath(new URL("../src/asset-layer/official", import.meta.url)),
  token: process.env.BLOB_READ_WRITE_TOKEN,
  download: async (path, token) => {
    const found = await get(path, { access: "private", token });
    if (!found || found.statusCode !== 200) return null;
    return new Uint8Array(await new Response(found.stream).arrayBuffer());
  },
});

if (result.status === "skipped") {
  console.log("No BLOB_READ_WRITE_TOKEN set: skipping official assets, placeholders will be used.");
} else {
  const { fetched, missing, failed, removed } = result;
  console.log(`Fetched ${fetched.length} of ${manifest.assets.length} official assets.`);
  if (removed.length > 0)
    console.log(["Removed, no longer in the manifest:", ...removed].join("\n  "));
  if (missing.length > 0)
    console.warn(["Not in the bucket yet, placeholders will be used:", ...missing].join("\n  "));
  if (failed.length > 0) {
    console.error(
      ["Failed to download:", ...failed.map(({ path, reason }) => `${path}: ${reason}`)].join(
        "\n  ",
      ),
    );
    process.exit(1);
  }
}
