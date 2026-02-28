/**
 * Validation utilities for the Student-Teacher Matching Platform
 * Validates data formats, ranges, and sanitizes user inputs
 */

// 24 cognitive dimensions from the design document
const VALID_DIMENSIONS = new Set([
  'pace',
  'structure',
  'abstraction',
  'interactivity',
  'visual_dependency',
  'verbal_density',
  'repetition_need',
  'formality',
  'humor_receptivity',
  'feedback_style',
  'autonomy',
  'cognitive_load_tolerance',
  'attention_span',
  'motivation_type',
  'error_tolerance',
  'social_preference',
  'real_world_need',
  'emotional_sensitivity',
  'question_comfort',
  'note_taking_style',
  'challenge_preference',
  'context_need',
  'storytelling_affinity',
  'revision_style',
]);

/**
 * Validates student ID format: "stu_[8 hex chars]"
 * @param studentId - The student ID to validate
 * @returns true if valid, false otherwise
 */
export function validateStudentId(studentId: string): boolean {
  const pattern = /^stu_[0-9a-f]{8}$/;
  return pattern.test(studentId);
}

/**
 * Validates teacher ID format: "tch_[subject]_[3 digits]"
 * @param teacherId - The teacher ID to validate
 * @returns true if valid, false otherwise
 */
export function validateTeacherId(teacherId: string): boolean {
  const pattern = /^tch_[a-z]+_\d{3}$/;
  return pattern.test(teacherId);
}

/**
 * Validates material ID format: "mat_[8 hex chars]"
 * @param materialId - The material ID to validate
 * @returns true if valid, false otherwise
 */
export function validateMaterialId(materialId: string): boolean {
  const pattern = /^mat_[0-9a-f]{8}$/;
  return pattern.test(materialId);
}

/**
 * Validates dimension score is between 0.0 and 1.0 inclusive
 * @param score - The dimension score to validate
 * @returns true if valid, false otherwise
 */
export function validateDimensionScore(score: number): boolean {
  return typeof score === 'number' && score >= 0.0 && score <= 1.0;
}

/**
 * Validates compatibility score is between 0 and 100
 * @param score - The compatibility score to validate
 * @returns true if valid, false otherwise
 */
export function validateCompatibilityScore(score: number): boolean {
  return typeof score === 'number' && score >= 0 && score <= 100;
}

/**
 * Validates ISO 8601 timestamp format
 * @param timestamp - The timestamp string to validate
 * @returns true if valid, false otherwise
 */
export function validateTimestamp(timestamp: string): boolean {
  try {
    const date = new Date(timestamp);
    // Check if date is valid and the string is in ISO format
    return !isNaN(date.getTime()) && timestamp === date.toISOString();
  } catch {
    return false;
  }
}

/**
 * Validates that dimension names are valid keys from the 24-dimension model
 * @param dimensionNames - Array of dimension names to validate
 * @returns true if all dimension names are valid, false otherwise
 */
export function validateDimensionNames(dimensionNames: string[]): boolean {
  if (!Array.isArray(dimensionNames)) {
    return false;
  }
  return dimensionNames.every((name) => VALID_DIMENSIONS.has(name));
}

/**
 * Validates match explanation "best" array contains exactly 3 dimension names
 * @param bestDimensions - Array of best-matching dimension names
 * @returns true if valid, false otherwise
 */
export function validateBestDimensions(bestDimensions: string[]): boolean {
  return (
    Array.isArray(bestDimensions) &&
    bestDimensions.length === 3 &&
    validateDimensionNames(bestDimensions)
  );
}

/**
 * Validates match explanation "worst" array contains exactly 2 dimension names
 * @param worstDimensions - Array of worst-matching dimension names
 * @returns true if valid, false otherwise
 */
export function validateWorstDimensions(worstDimensions: string[]): boolean {
  return (
    Array.isArray(worstDimensions) &&
    worstDimensions.length === 2 &&
    validateDimensionNames(worstDimensions)
  );
}

/**
 * Sanitizes user input by removing potentially harmful characters
 * Prevents XSS and injection attacks
 * @param input - The user input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>'"]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Validates that learning material content is a non-empty string
 * @param content - The learning material content to validate
 * @returns true if valid, false otherwise
 */
export function validateMaterialContent(content: string): boolean {
  return typeof content === 'string' && content.trim().length > 0;
}

/**
 * Validates that learning material topic is a non-empty string
 * @param topic - The learning material topic to validate
 * @returns true if valid, false otherwise
 */
export function validateMaterialTopic(topic: string): boolean {
  return typeof topic === 'string' && topic.trim().length > 0;
}

/**
 * Validates a complete student persona object
 * @param persona - The student persona to validate
 * @returns Object with isValid boolean and errors array
 */
export function validateStudentPersona(persona: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate student_id
  if (!persona.student_id || !validateStudentId(persona.student_id)) {
    errors.push('Invalid student_id format');
  }

  // Validate generated_at timestamp
  if (!persona.generated_at || !validateTimestamp(persona.generated_at)) {
    errors.push('Invalid generated_at timestamp');
  }

  // Validate persona dimensions
  if (!persona.persona || typeof persona.persona !== 'object') {
    errors.push('Missing persona object');
  } else {
    // Check all 24 dimensions are present
    for (const dimension of VALID_DIMENSIONS) {
      if (!(dimension in persona.persona)) {
        errors.push(`Missing dimension: ${dimension}`);
      } else if (!validateDimensionScore(persona.persona[dimension])) {
        errors.push(`Invalid score for dimension: ${dimension}`);
      }
    }
  }

  // Validate archetype
  if (!persona.archetype || typeof persona.archetype !== 'string' || persona.archetype.trim().length === 0) {
    errors.push('Invalid or missing archetype');
  }

  // Validate summary
  if (!persona.summary || typeof persona.summary !== 'string' || persona.summary.trim().length === 0) {
    errors.push('Invalid or missing summary');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a ranked teacher object
 * @param teacher - The ranked teacher to validate
 * @returns Object with isValid boolean and errors array
 */
export function validateRankedTeacher(teacher: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate teacher_id
  if (!teacher.teacher_id || !validateTeacherId(teacher.teacher_id)) {
    errors.push('Invalid teacher_id format');
  }

  // Validate compatibility_score
  if (
    teacher.compatibility_score === undefined ||
    !validateCompatibilityScore(teacher.compatibility_score)
  ) {
    errors.push('Invalid compatibility_score');
  }

  // Validate match explanation
  if (!teacher.why || typeof teacher.why !== 'object') {
    errors.push('Missing match explanation');
  } else {
    if (!validateBestDimensions(teacher.why.best)) {
      errors.push('Invalid "best" dimensions array (must contain exactly 3 valid dimension names)');
    }
    if (!validateWorstDimensions(teacher.why.worst)) {
      errors.push('Invalid "worst" dimensions array (must contain exactly 2 valid dimension names)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates learning material object
 * @param material - The learning material to validate
 * @returns Object with isValid boolean and errors array
 */
export function validateLearningMaterial(material: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate material_id
  if (!material.material_id || !validateMaterialId(material.material_id)) {
    errors.push('Invalid material_id format');
  }

  // Validate student_id
  if (!material.student_id || !validateStudentId(material.student_id)) {
    errors.push('Invalid student_id format');
  }

  // Validate content
  if (!validateMaterialContent(material.content)) {
    errors.push('Content must be a non-empty string');
  }

  // Validate topic
  if (!validateMaterialTopic(material.topic)) {
    errors.push('Topic must be a non-empty string');
  }

  // Validate uploaded_at timestamp
  if (!material.uploaded_at || !validateTimestamp(material.uploaded_at)) {
    errors.push('Invalid uploaded_at timestamp');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
