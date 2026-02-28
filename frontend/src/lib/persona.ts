/**
 * Persona Generation Logic
 * 
 * This module handles the generation of student personas from quiz responses.
 * It calculates 24-dimension cognitive profiles by averaging dimension values
 * from selected answer options.
 */

import { StudentPersona, DimensionScores, Question, DIMENSION_KEYS } from '@/types';

/**
 * Interface for quiz responses
 */
export interface QuestionResponse {
  question: Question;
  selectedIndex: number; // Index of selected option (0-3)
}

/**
 * Generate a unique student ID in the format "stu_[8 hex chars]"
 * 
 * @returns A unique student ID string
 */
export function generateStudentId(): string {
  const hexChars = '0123456789abcdef';
  let id = 'stu_';
  
  for (let i = 0; i < 8; i++) {
    id += hexChars[Math.floor(Math.random() * 16)];
  }
  
  return id;
}

/**
 * Derive archetype label and summary from dimension scores
 * 
 * @param persona - The 24-dimension scores
 * @returns Object with archetype label and summary text
 */
export function deriveArchetype(persona: DimensionScores): { archetype: string; summary: string } {
  // Analyze key dimensions to determine archetype
  const pace = persona.pace;
  const structure = persona.structure;
  const autonomy = persona.autonomy;
  const interactivity = persona.interactivity;
  const abstraction = persona.abstraction;
  const real_world_need = persona.real_world_need;
  
  let archetype = '';
  let summary = '';
  
  // Determine archetype based on dominant characteristics
  if (autonomy > 0.7 && structure > 0.6) {
    archetype = 'Independent Explorer';
    summary = 'You thrive with creative freedom and self-directed learning, preferring to chart your own path through material.';
  } else if (interactivity > 0.7 && social_preference > 0.6) {
    archetype = 'Collaborative Learner';
    summary = 'You learn best through discussion and group work, drawing energy from bouncing ideas off others.';
  } else if (abstraction > 0.7 && cognitive_load_tolerance > 0.6) {
    archetype = 'Analytical Thinker';
    summary = 'You prefer deep theoretical understanding and can handle complex, abstract concepts with ease.';
  } else if (real_world_need > 0.7 && visual_dependency > 0.6) {
    archetype = 'Practical Visualizer';
    summary = 'You learn best through concrete examples and visual demonstrations that connect to real-world applications.';
  } else if (structure < 0.4 && pace > 0.6) {
    archetype = 'Fast-Paced Adapter';
    summary = 'You prefer quick-moving lessons with flexibility, adapting easily to changes in direction.';
  } else if (structure < 0.4 && repetition_need > 0.6) {
    archetype = 'Methodical Processor';
    summary = 'You benefit from clear structure and repeated exposure to material, building understanding step by step.';
  } else {
    archetype = 'Balanced Learner';
    summary = 'You have a well-rounded learning style that adapts to different teaching approaches.';
  }
  
  return { archetype, summary };
}

/**
 * Generate a complete student persona from quiz responses
 * 
 * This function:
 * 1. Accumulates dimension values from all selected answer options
 * 2. Calculates the average for each dimension
 * 3. Assigns default value of 0.5 for dimensions with no contributions
 * 4. Rounds all scores to 2 decimal places
 * 5. Generates archetype label and summary
 * 6. Creates unique student ID and timestamp
 * 
 * @param responses - Array of question responses with selected options
 * @returns Complete StudentPersona object
 */
export function generatePersonaFromQuiz(responses: QuestionResponse[]): StudentPersona {
  // Initialize accumulator for all dimensions
  const dimensionAccumulator: Record<string, number[]> = {};
  
  for (const key of DIMENSION_KEYS) {
    dimensionAccumulator[key] = [];
  }
  
  // Accumulate dimension values from each response
  for (const response of responses) {
    const selectedOption = response.question.options[response.selectedIndex];
    
    // Add dimension contributions from the selected option
    for (const [dimension, value] of Object.entries(selectedOption.dimensions)) {
      if (dimensionAccumulator[dimension]) {
        dimensionAccumulator[dimension].push(value);
      }
    }
  }
  
  // Calculate average for each dimension
  const persona: DimensionScores = {} as DimensionScores;
  
  for (const key of DIMENSION_KEYS) {
    const values = dimensionAccumulator[key];
    
    if (values.length === 0) {
      // Default neutral value for dimensions with no contributions
      persona[key] = 0.5;
    } else {
      // Calculate average and round to 2 decimal places
      const sum = values.reduce((acc, val) => acc + val, 0);
      persona[key] = Math.round((sum / values.length) * 100) / 100;
    }
  }
  
  // Generate archetype and summary
  const { archetype, summary } = deriveArchetype(persona);
  
  // Create complete persona object
  return {
    student_id: generateStudentId(),
    name: 'Student', // Will be replaced with actual name in the UI
    generated_at: new Date().toISOString(),
    persona,
    archetype,
    summary
  };
}
