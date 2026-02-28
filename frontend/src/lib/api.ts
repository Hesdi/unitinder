/**
 * API Client for Student-Teacher Matching Platform
 * 
 * Provides functions for:
 * - Saving student personas
 * - Uploading learning materials
 * - Fetching matched teachers
 * 
 * Features:
 * - Error handling with user-friendly messages
 * - Local caching for failed saves
 * - Retry logic for failed requests
 */

import type {
  StudentPersona,
  LearningMaterial,
  RankedTeacher,
  SavePersonaResponse,
  SaveMaterialResponse,
  MatchResponse,
} from '@/types';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const CACHE_KEY_PREFIX = 'stmp_cache_';

// ============================================================================
// Error Types
// ============================================================================

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// ============================================================================
// Local Storage Cache Utilities
// ============================================================================

function getCacheKey(type: string, id?: string): string {
  return `${CACHE_KEY_PREFIX}${type}${id ? `_${id}` : ''}`;
}

function saveToCache<T>(key: string, data: T): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (error) {
    console.error('Failed to save to cache:', error);
  }
}

function getFromCache<T>(key: string): T | null {
  try {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    }
  } catch (error) {
    console.error('Failed to read from cache:', error);
  }
  return null;
}

function removeFromCache(key: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Failed to remove from cache:', error);
  }
}

// ============================================================================
// HTTP Utilities
// ============================================================================

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If successful or client error (4xx), return immediately
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      // Server error (5xx) - retry
      lastError = new Error(`Server error: ${response.status}`);
      
      if (attempt < retries) {
        await delay(RETRY_DELAY_MS * (attempt + 1)); // Exponential backoff
      }
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < retries) {
        await delay(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  throw new APIError(
    'Request failed after multiple retries',
    undefined,
    lastError
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    if (error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Save student persona to backend
 * 
 * POST /api/students
 * 
 * Features:
 * - Caches persona locally if save fails
 * - Retries failed requests automatically
 * - Returns student_id on success
 * 
 * @param persona - Complete student persona with 24-dimension scores
 * @returns Promise resolving to student_id
 * @throws APIError with user-friendly message
 */
export async function saveStudentPersona(
  persona: StudentPersona
): Promise<string> {
  const cacheKey = getCacheKey('persona', persona.student_id);

  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/students`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(persona),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || 'Failed to save student persona',
        response.status
      );
    }

    const data: SavePersonaResponse = await response.json();
    
    // Clear cache on successful save
    removeFromCache(cacheKey);
    
    return data.student_id;
  } catch (error) {
    // Cache persona locally for recovery
    saveToCache(cacheKey, persona);
    
    throw new APIError(
      getErrorMessage(error) + ' Your profile has been saved locally.',
      undefined,
      error
    );
  }
}

/**
 * Save learning material for a student
 * 
 * POST /api/students/{id}/material
 * 
 * Features:
 * - Validates student_id format
 * - Caches material locally if save fails
 * - Retries failed requests automatically
 * - Returns material_id on success
 * 
 * @param studentId - Student ID (format: "stu_[8 hex chars]")
 * @param content - Learning material content (non-empty)
 * @param topic - Learning material topic (non-empty)
 * @returns Promise resolving to material_id
 * @throws APIError with user-friendly message
 */
export async function saveLearningMaterial(
  studentId: string,
  content: string,
  topic: string
): Promise<string> {
  // Validate inputs
  if (!content.trim()) {
    throw new APIError('Learning material content cannot be empty');
  }
  
  if (!topic.trim()) {
    throw new APIError('Learning material topic cannot be empty');
  }

  const materialData = {
    student_id: studentId,
    content: content.trim(),
    topic: topic.trim(),
    uploaded_at: new Date().toISOString(),
  };

  const cacheKey = getCacheKey('material', studentId);

  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/students/${studentId}/material`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || 'Failed to upload learning material',
        response.status
      );
    }

    const data: SaveMaterialResponse = await response.json();
    
    // Clear cache on successful save
    removeFromCache(cacheKey);
    
    return data.material_id;
  } catch (error) {
    // Cache material locally for recovery
    saveToCache(cacheKey, materialData);
    
    throw new APIError(
      getErrorMessage(error) + ' Your material has been saved locally.',
      undefined,
      error
    );
  }
}

/**
 * Get matched teachers ranked by compatibility
 * 
 * POST /api/match
 * 
 * Features:
 * - Calculates compatibility scores for all teachers
 * - Returns teachers sorted by compatibility (descending)
 * - Includes match explanations (best/worst dimensions)
 * - Retries failed requests automatically
 * 
 * @param studentPersona - Student's 24-dimension persona
 * @param subject - Optional subject filter (e.g., "biology", "math")
 * @returns Promise resolving to array of ranked teachers
 * @throws APIError with user-friendly message
 */
export async function getMatchedTeachers(
  studentPersona: StudentPersona,
  subject?: string
): Promise<RankedTeacher[]> {
  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/match`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentPersona: studentPersona.persona,
          subject: subject || null,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || 'Failed to fetch matched teachers',
        response.status
      );
    }

    const data: MatchResponse = await response.json();
    
    return data.ranked;
  } catch (error) {
    throw new APIError(
      getErrorMessage(error),
      undefined,
      error
    );
  }
}

// ============================================================================
// Cache Recovery Functions
// ============================================================================

/**
 * Retrieve cached student persona
 * 
 * Useful for recovering from failed saves
 * 
 * @param studentId - Student ID to retrieve
 * @returns Cached persona or null if not found
 */
export function getCachedPersona(studentId: string): StudentPersona | null {
  const cacheKey = getCacheKey('persona', studentId);
  return getFromCache<StudentPersona>(cacheKey);
}

/**
 * Retrieve cached learning material
 * 
 * Useful for recovering from failed uploads
 * 
 * @param studentId - Student ID to retrieve material for
 * @returns Cached material or null if not found
 */
export function getCachedMaterial(studentId: string): Partial<LearningMaterial> | null {
  const cacheKey = getCacheKey('material', studentId);
  return getFromCache<Partial<LearningMaterial>>(cacheKey);
}

/**
 * Clear all cached data for a student
 * 
 * @param studentId - Student ID to clear cache for
 */
export function clearStudentCache(studentId: string): void {
  removeFromCache(getCacheKey('persona', studentId));
  removeFromCache(getCacheKey('material', studentId));
}
