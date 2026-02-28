/**
 * Result Calculator Utility
 * 
 * Calculates cognitive tags based on flashcard game performance.
 */

import { CognitiveTag } from './types';

/**
 * Calculate cognitive tag based on correct answer counts
 * 
 * Determines the dominant memory pattern:
 * - Visual-Dominant: Best at remembering colors
 * - Sequential-Dominant: Best at remembering numbers
 * - Spatial-Dominant: Best at remembering shapes
 * 
 * Tie-breaking: Sequential > Spatial > Visual (alphabetical)
 * 
 * @param colorCorrect - Number of correct color questions
 * @param numberCorrect - Number of correct number questions
 * @param shapeCorrect - Number of correct shape questions
 * @returns Cognitive tag indicating dominant memory pattern
 */
export function calculateCognitiveTag(
  colorCorrect: number,
  numberCorrect: number,
  shapeCorrect: number
): CognitiveTag {
  // Determine highest score
  const maxScore = Math.max(colorCorrect, numberCorrect, shapeCorrect);

  // Check for ties and apply tie-breaking rules
  if (numberCorrect === maxScore) {
    return 'Sequential-Dominant';
  } else if (shapeCorrect === maxScore) {
    return 'Spatial-Dominant';
  } else {
    return 'Visual-Dominant';
  }
}
