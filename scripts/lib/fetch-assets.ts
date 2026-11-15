import { mkdir, readdir, rm, rmdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";

import type { Manifest } from "../../src/asset-layer/manifest.ts";

export interface FetchAssetsOptions {
  manifest: Manifest;
  /** Folder the assets are written under, at their manifest paths. */
  destDir: string;
  /** Access token for the private bucket. */
  token: string | undefined;
  /** Reads one file from the bucket, or returns null if the bucket does not have it. */
  download: (path: string, token: string) => Promise<Uint8Array | null>;
}

interface FailedDownload {
  path: string;
  reason: string;
}

export type FetchAssetsResult =
  | { status: "skipped" }
  | {
      status: "done";
      /** Paths written to `destDir`. */
      fetched: string[];
      /** Manifest paths the bucket does not have. They resolve to placeholders. */
      missing: string[];
      /** Downloads that went wrong, for example a rejected token. */
      failed: FailedDownload[];
      /** Files deleted from `destDir` because the manifest or the bucket no longer has them. */
      removed: string[];
    };

export async function fetchAssets({
  manifest,
  destDir,
  token,
  download,
}: FetchAssetsOptions): Promise<FetchAssetsResult> {
  if (!token) return { status: "skipped" };

  const fetched: string[] = [];
  const missing: string[] = [];
  const failed: FailedDownload[] = [];

  for (const { path } of manifest.assets) {
    let content: Uint8Array | null;
    try {
      content = await download(path, token);
    } catch (error) {
      failed.push({ path, reason: error instanceof Error ? error.message : String(error) });
      continue;
    }
    if (content === null) {
      missing.push(path);
      continue;
    }
    const file = join(destDir, path);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, content);
    fetched.push(path);
  }

  // Keep only what the manifest lists and the bucket still has (or may still have, if the
  // download failed), so an asset withdrawn from either stops being served.
  const removed = await removeAllExcept(
    destDir,
    new Set([...fetched, ...failed.map(({ path }) => path)]),
  );

  return { status: "done", fetched, missing, failed, removed };
}

async function removeAllExcept(destDir: string, kept: Set<string>): Promise<string[]> {
  const entries = await readdir(destDir, { recursive: true, withFileTypes: true }).catch(() => []);
  const pathOf = (entry: { parentPath: string; name: string }) =>
    relative(destDir, join(entry.parentPath, entry.name)).split(sep).join("/");

  const removed: string[] = [];
  for (const entry of entries) {
    const path = pathOf(entry);
    if (entry.isDirectory() || kept.has(path)) continue;
    await rm(join(destDir, path));
    removed.push(path);
  }

  // Deepest first, so a folder emptied by the loop above goes along with its parents.
  const folders = entries.filter((entry) => entry.isDirectory()).map(pathOf);
  for (const folder of folders.sort((a, b) => b.length - a.length)) {
    await rmdir(join(destDir, folder)).catch(() => {});
  }

  return removed;
}
