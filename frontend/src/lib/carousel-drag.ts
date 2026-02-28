/**
 * Carousel Drag Handling
 * 
 * Handles drag gestures for the 3D carousel interface.
 * Tracks drag position, calculates offset, and determines rotation triggers.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

export interface DragResult {
  offset: number;
  shouldRotate: boolean;
  direction: 'left' | 'right' | null;
}

/**
 * Handle carousel drag gesture
 * 
 * @param startX - Initial X coordinate when drag started
 * @param currentX - Current X coordinate during drag
 * @param threshold - Pixel threshold to trigger rotation (default: 150px)
 * @returns DragResult with offset, rotation trigger, and direction
 * 
 * Preconditions:
 * - startX and currentX are valid screen coordinates
 * - threshold is positive number (typically 100-150 pixels)
 * - Drag gesture has been initiated
 * 
 * Postconditions:
 * - Returns drag offset for visual feedback
 * - If |currentX - startX| > threshold, triggers rotation
 * - Rotation direction matches drag direction
 * - No state mutation until drag completes
 */
export function handleCarouselDrag(
  startX: number,
  currentX: number,
  threshold: number = 150
): DragResult {
  // Calculate drag offset
  const offset = currentX - startX;
  
  // Check if offset exceeds threshold
  const shouldRotate = Math.abs(offset) > threshold;
  
  // Determine rotation direction based on drag direction
  let direction: 'left' | 'right' | null = null;
  
  if (shouldRotate) {
    // Positive offset = drag right = rotate left (show previous teacher)
    // Negative offset = drag left = rotate right (show next teacher)
    direction = offset > 0 ? 'left' : 'right';
  }
  
  return {
    offset,
    shouldRotate,
    direction
  };
}
