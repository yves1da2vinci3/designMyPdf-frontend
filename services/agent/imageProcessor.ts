/**
 * Traitement des images pour l'analyse visuelle avec Claude Vision
 */
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';
import type { ProcessedImage } from './types';
import { prepareReferenceImageBuffer } from '@/lib/aiGeneration/prepareReferenceImage';

export async function loadImageBuffer(url: string): Promise<Buffer> {
  if (url.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), 'public', url);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Local file not found: ${url}`);
    }
    return fs.readFileSync(filePath);
  }
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 10000,
    maxContentLength: 10 * 1024 * 1024,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  });
  if (response.status !== 200) {
    throw new Error(`Failed to fetch image, status code: ${response.status}`);
  }
  return Buffer.from(response.data);
}

/**
 * Récupère une image depuis une URL et la convertit en base64
 */
async function fetchImageAsBase64(
  url: string,
): Promise<{ data: string; mimeType: string; buffer: Buffer }> {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000, // 10 second timeout
      maxContentLength: 10 * 1024 * 1024, // 10MB max size
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch image, status code: ${response.status}`);
    }

    const rawContentType = response.headers['content-type'];
    const contentType = typeof rawContentType === 'string' ? rawContentType : 'image/jpeg';

    if (!contentType.startsWith('image/')) {
      throw new Error(`Invalid content type: ${contentType}. Expected an image.`);
    }

    const buffer = Buffer.from(response.data);
    const base64Data = buffer.toString('base64');
    return { data: base64Data, mimeType: contentType, buffer };
  } catch (error: any) {
    throw new Error(`Failed to fetch image from ${url}: ${error.message}`);
  }
}

/**
 * Traite une liste d'URLs d'images et les convertit en format ProcessedImage
 * pour l'analyse visuelle avec Claude Vision
 */
export async function processImagesForAnalysis(imageUrls: string[]): Promise<ProcessedImage[]> {
  const processedImages: ProcessedImage[] = [];
  const failures: string[] = [];

  for (const url of imageUrls) {
    try {
      let base64Data: string;
      let mimeType: string;

      let fileBuffer: Buffer;
      if (url.startsWith('/uploads/')) {
        fileBuffer = await loadImageBuffer(url);
        base64Data = fileBuffer.toString('base64');
        const ext = path.extname(url).substring(1).toLowerCase();
        mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      } else {
        const fetchedImage = await fetchImageAsBase64(url);
        base64Data = fetchedImage.data;
        mimeType = fetchedImage.mimeType;
        fileBuffer = fetchedImage.buffer;
      }

      const prepared = await prepareReferenceImageBuffer(fileBuffer);
      fileBuffer = prepared.buffer;
      base64Data = prepared.buffer.toString('base64');
      mimeType = prepared.mimeType;
      const w = prepared.width;
      const h = prepared.height;
      processedImages.push({
        url,
        base64: base64Data,
        mimeType,
        width: w,
        height: h,
        orientation: w > h ? 'landscape' : w < h ? 'portrait' : 'square',
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`Error processing image ${url}:`, msg);
      failures.push(`${url}: ${msg}`);
    }
  }

  if (imageUrls.length > 0 && processedImages.length === 0) {
    const detail = failures.length > 0 ? failures.join(' | ') : 'aucune URL valide';
    throw new Error(`Impossible de charger les images de référence (${detail})`);
  }

  return processedImages;
}

/**
 * Formate une image traitée pour l'API Claude Vision
 * Retourne le format attendu par HumanMessage de LangChain
 */
export function formatImageForClaude(image: ProcessedImage): {
  type: 'image_url';
  image_url: string;
} {
  return {
    type: 'image_url',
    image_url: `data:${image.mimeType};base64,${image.base64}`,
  };
}

/**
 * Formate plusieurs images pour l'API Claude Vision
 */
export function formatImagesForClaude(images: ProcessedImage[]): Array<{
  type: 'image_url';
  image_url: string;
}> {
  return images.map(formatImageForClaude);
}
