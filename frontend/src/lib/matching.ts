/**
 * Matching Algorithm for Student-Teacher Compatibility
 * 
 * This module implements the weighted Manhattan distance algorithm to calculate
 * compatibility scores between students and teachers based on their 24-dimension
 * cognitive profiles.
 * 
 * Algorithm:
 * 1. Calculate weighted Manhattan distance for each dimension
 * 2. Convert distance to 0-100 compatibility score
 * 3. Identify best and worst matching dimensions
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 17.4
 */

import { DimensionScores, MatchResult, DIMENSION_KEYS, DIMENSION_WEIGHTS } from '@/types';

/**
 * Calculate compatibility score between student and teacher personas
 * 
 * Uses weighted Manhattan distance to measure compatibility:
 * - Critical dimensions (pace, cognitive_load_tolerance, verbal_density, structure): 3x weight
 * - Important dimensions (interactivity, abstraction, feedback_style, autonomy, real_world_need, attention_span): 2x weight
 * - Other dimensions: 1x weight
 * 
 * @param studentPersona - Student's 24-dimension cognitive profile
 * @param teacherPersona - Teacher's 24-dimension cognitive profile
 * @returns MatchResult with compatibility score (0-100) and dimension explanations
 * 
 * @preconditions
 * - Both studentPersona and teacherPersona contain all 24 dimensions
 * - All dimension values are between 0.0 and 1.0
 * - Dimension keys match between student and teacher personas
 * 
 * @postconditions
 * - compatibility_score is between 0 and 100
 * - why.best contains exactly 3 dimension names
 * - why.worst contains exactly 2 dimension names
 * - Lower distance results in higher score
 */
export function calculateCompatibilityScore(
  studentPersona: DimensionScores,
  teacherPersona: DimensionScores
): MatchResult {
  // Calculate weighted Manhattan distance
  let totalDistance = 0;
  const contributions: Array<[string, number]> = [];

  for (const dimension of DIMENSION_KEYS) {
    const studentValue = studentPersona[dimension];
    const teacherValue = teacherPersona[dimension];
    const weight = DIMENSION_WEIGHTS[dimension] || 1.0;
    
    // Weighted absolute difference
    const contribution = weight * Math.abs(studentValue - teacherValue);
    
    totalDistance += contribution;
    contributions.push([dimension, contribution]);
  }

  // Convert distance to 0-100 score (lower distance = higher score)
  // Formula: score = 100 / (1 + totalDistance)
  const rawScore = 100 / (1 + totalDistance);
  const compatibility_score = Math.round(rawScore * 100) / 100; // Round to 2 decimal places

  // Sort contributions to find best and worst matches
  // Best matches have lowest contribution (smallest weighted distance)
  // Worst matches have highest contribution (largest weighted distance)
  contributions.sort((a, b) => a[1] - b[1]);

  // Extract top 3 best-matching dimensions (lowest contributions)
  const bestDimensions = contributions.slice(0, 3).map(([dim]) => dim);

  // Extract bottom 2 worst-matching dimensions (highest contributions)
  const worstDimensions = contributions.slice(-2).map(([dim]) => dim).reverse();

  return {
    compatibility_score,
    why: {
      best: bestDimensions,
      worst: worstDimensions,
    },
  };
}
