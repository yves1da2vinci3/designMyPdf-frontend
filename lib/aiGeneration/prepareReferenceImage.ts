import sharp from 'sharp';
import { readImageDimensions } from '@/utils/imageDimensions';

const TARGET_LONG_MIN = 1280;
const TARGET_LONG_MAX = 1600;

/**
 * Resize reference image for vision API: long edge in [1280, 1600] when possible.
 */
export async function prepareReferenceImageBuffer(input: Buffer): Promise<{
  buffer: Buffer;
  mimeType: 'image/png';
  width: number;
  height: number;
}> {
  const meta = await sharp(input).metadata();
  let width = meta.width ?? 0;
  let height = meta.height ?? 0;
  if (width <= 0 || height <= 0) {
    const fromHeader = readImageDimensions(input);
    width = fromHeader?.width ?? 800;
    height = fromHeader?.height ?? 600;
  }

  const longEdge = Math.max(width, height);
  let targetLong = longEdge;

  if (longEdge > TARGET_LONG_MAX) {
    targetLong = TARGET_LONG_MAX;
  } else if (longEdge < TARGET_LONG_MIN) {
    targetLong = TARGET_LONG_MIN;
  }

  let pipeline = sharp(input);
  if (targetLong !== longEdge) {
    if (width >= height) {
      pipeline = pipeline.resize({
        width: Math.round((width * targetLong) / longEdge),
        withoutEnlargement: longEdge >= TARGET_LONG_MIN,
      });
    } else {
      pipeline = pipeline.resize({
        height: Math.round((height * targetLong) / longEdge),
        withoutEnlargement: longEdge >= TARGET_LONG_MIN,
      });
    }
  }

  const buffer = await pipeline.png().toBuffer();
  const outMeta = await sharp(buffer).metadata();

  return {
    buffer,
    mimeType: 'image/png',
    width: outMeta.width ?? width,
    height: outMeta.height ?? height,
  };
}
