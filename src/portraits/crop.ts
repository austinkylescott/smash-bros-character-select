/**
 * Crops: the region of a fighter's source image a template shows, in the image's own pixels.
 * Every change keeps a crop's shape and keeps it inside the image.
 */

/** An image's size in pixels. */
export interface ImageSize {
  readonly width: number;
  readonly height: number;
}

/** A region of an image, in its pixels, from its top left. */
export interface Crop {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * The shape, width over height, of the crop shown in a slot of the grid: between Melee's slots and
 * Ultimate's, which are wider still with fewer fighters. A template whose box is another shape
 * shows the crop's centre, scaled to cover the box.
 */
export const SLOT_ASPECT = 3 / 2;
/**
 * The shape, width over height, of the crop shown in a player panel: Melee's square window. In
 * Ultimate the panels narrow as players join, so they show the crop's centre, scaled to cover.
 */
export const PANEL_ASPECT = 1;

/** How small a crop may get, as a share of the largest it could be. */
const SMALLEST = 0.1;

const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(value, high));

/** The widest a crop of this shape can be inside the image. */
const widest = (image: ImageSize, aspect: number) => Math.min(image.width, image.height * aspect);

/** The narrowest and widest a crop can be zoomed to, keeping its shape, inside the image. */
export function zoomRange(crop: Crop, image: ImageSize): { min: number; max: number } {
  const max = widest(image, crop.width / crop.height);
  return { min: max * SMALLEST, max };
}

/** The largest region of a shape, width over height, centred in the image. */
export function centreCrop(image: ImageSize, aspect: number): Crop {
  // The side the image bounds is taken exactly, so the crop fits it without rounding error.
  const wide = image.width / image.height > aspect;
  const width = wide ? image.height * aspect : image.width;
  const height = wide ? image.height : image.width / aspect;
  return { x: (image.width - width) / 2, y: (image.height - height) / 2, width, height };
}

/** Places a crop of a size at a position, pushed back inside the image if it pokes out. */
const placed = (x: number, y: number, width: number, height: number, image: ImageSize): Crop => ({
  x: clamp(x, 0, image.width - width),
  y: clamp(y, 0, image.height - height),
  width,
  height,
});

/** Moves a crop by a distance, stopping at the image's edges. */
export const moveCrop = (crop: Crop, by: { x: number; y: number }, image: ImageSize): Crop =>
  placed(crop.x + by.x, crop.y + by.y, crop.width, crop.height, image);

/**
 * Resizes a crop to a width about its centre, keeping its shape. It grows no larger than the
 * image allows and shrinks no smaller than a tenth of that.
 */
export function zoomCrop(crop: Crop, width: number, image: ImageSize): Crop {
  const aspect = crop.width / crop.height;
  const { min, max } = zoomRange(crop, image);
  const newWidth = clamp(width, min, max);
  const newHeight = newWidth / aspect;
  const centre = { x: crop.x + crop.width / 2, y: crop.y + crop.height / 2 };
  return placed(centre.x - newWidth / 2, centre.y - newHeight / 2, newWidth, newHeight, image);
}

/** Whether a crop lies inside an image and has some size. */
export const cropFits = (crop: Crop, image: ImageSize): boolean =>
  [crop.x, crop.y, crop.width, crop.height].every(Number.isFinite) &&
  crop.width > 0 &&
  crop.height > 0 &&
  crop.x >= 0 &&
  crop.y >= 0 &&
  crop.x + crop.width <= image.width &&
  crop.y + crop.height <= image.height;
