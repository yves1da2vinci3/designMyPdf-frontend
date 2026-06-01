/**
 * Lit width/height depuis buffer PNG/JPEG sans dépendance native.
 */
export type ImageOrientation = 'landscape' | 'portrait' | 'square';

export function getOrientationFromDimensions(width: number, height: number): ImageOrientation {
  if (width <= 0 || height <= 0) return 'portrait';
  const ratio = width / height;
  if (ratio > 1.05) return 'landscape';
  if (ratio < 0.95) return 'portrait';
  return 'square';
}

function readJpegDimensions(buffer: Buffer): { width: number; height: number } | null {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      if (offset + 7 > buffer.length) return null;
      const height = buffer.readUInt16BE(offset + 3);
      const width = buffer.readUInt16BE(offset + 5);
      return { width, height };
    }
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (offset + 2 > buffer.length) break;
    const segmentLength = buffer.readUInt16BE(offset);
    offset += segmentLength;
  }
  return null;
}

export function readImageDimensions(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length >= 24 && buffer[0] === 0x89 && buffer[1] === 0x50) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    return readJpegDimensions(buffer);
  }
  return null;
}

export function isLandscapeDimensions(width: number, height: number): boolean {
  const o = getOrientationFromDimensions(width, height);
  return o === 'landscape' || o === 'square';
}
