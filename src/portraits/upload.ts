/**
 * Taking in an image a user uploads for a fighter: only common formats and sizes are taken, and
 * each is resized before it is kept, so rosters stay small enough for the browser to store.
 */
import type { ImageSize } from "./crop";

/** The image formats taken, by media type, with the names users know them by. */
const FORMATS: Readonly<Record<string, string>> = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/webp": "WebP",
  "image/gif": "GIF",
};

/** The largest file taken, in bytes. */
const MAX_FILE_BYTES = 10 * 1024 * 1024;

/** The longest side, in pixels, an image is kept at. */
const MAX_SIDE = 512;

const formatList = () => {
  const names = Object.values(FORMATS);
  return `${names.slice(0, -1).join(", ")} or ${names.at(-1)}`;
};

/** Why a file cannot be uploaded as a fighter's image, or nothing if it can. */
export function imageFileProblem(file: { readonly type: string; readonly size: number }) {
  if (!(file.type in FORMATS))
    return `That file is not an image this site can use. Choose a ${formatList()}.`;
  if (file.size > MAX_FILE_BYTES)
    return `That image is too large. Choose one of ${MAX_FILE_BYTES / 1024 / 1024} MB or less.`;
  return undefined;
}

/** The size an image is kept at: no more than 512 pixels on its longer side, keeping its shape. */
export function resizedSize(image: ImageSize): ImageSize {
  const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
  return {
    width: Math.max(1, Math.round(image.width * scale)),
    height: Math.max(1, Math.round(image.height * scale)),
  };
}

/** An uploaded image as it is kept: its pixels as a data URL, and its size. */
export interface UploadedImage extends ImageSize {
  readonly image: string;
}

/** A PNG larger than this is kept as a JPEG instead, losing any transparency. */
const MAX_PNG_CHARS = 400_000;

/**
 * Reads, checks and resizes an uploaded image, or one fetched from a franchise source, in the
 * browser. Throws with a message for the user if the image is not one that can be used.
 */
export async function uploadImage(file: Blob): Promise<UploadedImage> {
  const problem = imageFileProblem(file);
  if (problem) throw new Error(problem);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("That image could not be read. It may be damaged; try another.");
  }
  const size = resizedSize(bitmap);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not resize the image.");
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, size.width, size.height);
  bitmap.close();

  // WebP keeps transparency and is small. Browsers that cannot write it give a PNG instead, which
  // is kept unless it is large.
  let image = canvas.toDataURL("image/webp", 0.85);
  if (!image.startsWith("data:image/webp") && image.length > MAX_PNG_CHARS)
    image = canvas.toDataURL("image/jpeg", 0.85);
  return { image, ...size };
}
