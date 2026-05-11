/**
 * Traitement des images pour l'analyse visuelle avec Claude Vision
 */
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';
import type { ProcessedImage } from './types';

/**
 * Récupère une image depuis une URL et la convertit en base64
 */
async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
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

    const base64Data = Buffer.from(response.data).toString('base64');
    return { data: base64Data, mimeType: contentType };
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

  for (const url of imageUrls) {
    try {
      let base64Data: string;
      let mimeType: string;

      if (url.startsWith('/uploads/')) {
        // Fichier local (ex: depuis le dossier public dans Next.js)
        const filePath = path.join(process.cwd(), 'public', url);
        if (!fs.existsSync(filePath)) {
          throw new Error(`Local file not found: ${url}`);
        }
        const fileData = fs.readFileSync(filePath);
        base64Data = Buffer.from(fileData).toString('base64');
        const ext = path.extname(url).substring(1).toLowerCase();
        mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      } else {
        // URL distante
        const fetchedImage = await fetchImageAsBase64(url);
        base64Data = fetchedImage.data;
        mimeType = fetchedImage.mimeType;
      }

      processedImages.push({
        url,
        base64: base64Data,
        mimeType,
      });
    } catch (error: any) {
      console.error(`Error processing image ${url}:`, error.message);
      // Continue avec les autres images même si une échoue
    }
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
