/**
 * Color Utilities for Canvas-Based Eyedropper
 * Production-ready, device-agnostic color extraction
 */

export interface CanvasPoint {
  x: number;
  y: number;
}

export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Extract pixel color from canvas at specific coordinates
 * Handles retina displays and coordinate scaling
 */
export function getPixelColorFromCanvas(
  canvas: HTMLCanvasElement,
  x: number,
  y: number
): RGBAColor | null {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  // Clamp coordinates to canvas bounds
  const clampedX = Math.max(0, Math.min(x, canvas.width - 1));
  const clampedY = Math.max(0, Math.min(y, canvas.height - 1));

  try {
    // Extract 1x1 pixel data
    const imageData = ctx.getImageData(clampedX, clampedY, 1, 1);
    const data = imageData.data;

    return {
      r: data[0],
      g: data[1],
      b: data[2],
      a: data[3] / 255, // Normalize alpha to 0-1
    };
  } catch (error) {
    console.error('Failed to extract pixel data:', error);
    return null;
  }
}

/**
 * Convert RGBA to HEX color string
 */
export function rgbaToHex(r: number, g: number, b: number, a: number = 1): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16).padStart(2, '0');
    return hex.toUpperCase();
  };

  // For fully opaque colors, return standard 6-digit hex
  if (a >= 0.99) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // For semi-transparent, return 8-digit hex (RGBA)
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a * 255)}`;
}

/**
 * Convert client coordinates (mouse/touch) to canvas coordinates
 * Accounts for:
 * - Canvas display size vs actual resolution
 * - Zoom/scale factor
 * - Canvas position on screen
 */
export function clientToCanvasCoordinates(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
  displayScale: number = 1
): CanvasPoint {
  const rect = canvas.getBoundingClientRect();

  // Get position relative to canvas element
  const relativeX = clientX - rect.left;
  const relativeY = clientY - rect.top;

  // Convert from display coordinates to actual canvas coordinates
  const canvasX = (relativeX / rect.width) * canvas.width;
  const canvasY = (relativeY / rect.height) * canvas.height;

  return {
    x: Math.floor(canvasX),
    y: Math.floor(canvasY),
  };
}

/**
 * Check if coordinates are within canvas bounds
 */
export function isPointInCanvas(
  x: number,
  y: number,
  canvas: HTMLCanvasElement
): boolean {
  return x >= 0 && x < canvas.width && y >= 0 && y < canvas.height;
}

/**
 * Sample color from canvas with visual preview data
 * Returns color and surrounding pixel info for preview/magnifier
 */
export function sampleColorWithContext(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  sampleSize: number = 1
): {
  color: RGBAColor;
  hex: string;
  preview?: ImageData;
} | null {
  const color = getPixelColorFromCanvas(canvas, x, y);
  if (!color) return null;

  const hex = rgbaToHex(color.r, color.g, color.b, color.a);

  // Optional: get surrounding pixels for magnifier preview
  const ctx = canvas.getContext('2d');
  let preview: ImageData | undefined;

  if (ctx && sampleSize > 1) {
    try {
      const halfSize = Math.floor(sampleSize / 2);
      preview = ctx.getImageData(
        x - halfSize,
        y - halfSize,
        sampleSize,
        sampleSize
      );
    } catch (error) {
      // Preview optional, continue without it
    }
  }

  return { color, hex, preview };
}

/**
 * Validate HEX color string
 */
export function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(hex);
}