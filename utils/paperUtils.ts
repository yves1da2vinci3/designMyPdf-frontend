import { FormatType } from './types';

/**
 * Paper dimensions in millimeters for standard paper sizes
 */
export const PAPER_DIMENSIONS = {
  a1: { width: 841, height: 1189 },
  a2: { width: 594, height: 841 },
  a3: { width: 420, height: 594 },
  a4: { width: 210, height: 297 },
  a5: { width: 148, height: 210 },
  a6: { width: 105, height: 148 },
};

/**
 * Default paper format
 */
export const DEFAULT_FORMAT: FormatType = 'a4';

/**
 * Calculate page dimensions based on format and orientation
 * @param format The paper format (a1-a6)
 * @param isLandscape Whether the orientation is landscape
 * @returns The width and height in millimeters
 */
export function getPageDimensions(format: FormatType, isLandscape: boolean) {
  const dimensions = PAPER_DIMENSIONS[format];
  
  return {
    width: isLandscape ? dimensions.height : dimensions.width,
    height: isLandscape ? dimensions.width : dimensions.height,
  };
} 