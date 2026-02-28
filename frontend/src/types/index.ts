/**
 * Core TypeScript interfaces for Student-Teacher Matching Platform
 * 
 * This file defines all data models used throughout the application:
 * - Student personas with 24-dimension cognitive profiles
 * - Teacher profiles and rankings
 * - Learning materials and demo content
 * - Quiz questions and responses
 */

// ============================================================================
// Dimension Scores - 24 cognitive dimensions (0-1 scale)
// ============================================================================

export interface DimensionScores {
  pace: number;
  structure: number;
  abstraction: number;
  interactivity: number;
  visual_dependency: number;
  verbal_density: number;
  repetition_need: number;
  formality: number;
  humor_receptivity: number;
  feedback_style: number;
  autonomy: number;
  cognitive_load_tolerance: number;
  attention_span: number;
  motivation_type: number;
  error_tolerance: number;
  social_preference: number;
  real_world_need: number;
  emotional_sensitivity: number;
  question_comfort: number;
  note_taking_style: number;
  challenge_preference: number;
  context_need: number;
  storytelling_affinity: number;
  revision_style: number;
}

// ============================================================================
// Student Persona
// ============================================================================

export interface StudentPersona {
  student_id: string; // Format: "stu_[8 hex chars]"
  name: string;
  generated_at: string; // ISO 8601 timestamp
  persona: DimensionScores;
  archetype: string;
  summary: string;
}

// ============================================================================
// Teacher Profile
// ============================================================================

export interface TeacherProfile {
  teacher_id: string; // Format: "tch_[subject]_[3 digits]"
  name: string;
  subject: string;
  archetype: string;
  tagline: string;
  summary: string;
  persona: DimensionScores;
  video_url: string;
  profile_generated_at: string; // ISO 8601 timestamp
}

// ============================================================================
// Ranked Teacher (with compatibility score)
// ============================================================================

export interface MatchExplanation {
  best: string[]; // Top 3 best-matching dimensions
  worst: string[]; // Bottom 2 worst-matching dimensions
}

export interface RankedTeacher {
  teacher_id: string;
  name: string;
  subject: string;
  archetype: string;
  tagline: string;
  summary: string;
  compatibility_score: number; // 0-100
  why: MatchExplanation;
  persona: DimensionScores;
}

// ============================================================================
// Learning Material
// ============================================================================

export interface LearningMaterial {
  material_id: string; // Format: "mat_[8 hex chars]"
  student_id: string;
  content: string;
  topic: string;
  uploaded_at: string; // ISO 8601 timestamp
}

// ============================================================================
// Generated Demo Content
// ============================================================================

export interface DemoMetadata {
  duration?: number; // for audio/video in seconds
  file_size?: number; // in bytes
  format?: string; // e.g., 'mp4', 'mp3', 'markdown'
  generation_time?: number; // time taken to generate in seconds
}

export interface GeneratedDemoContent {
  demo_id: string; // Format: "demo_[8 hex chars]"
  teacher_id: string;
  student_id: string;
  material_id: string;
  content_type: 'study-plan' | 'audio' | 'video';
  content_url: string;
  generated_at: string; // ISO 8601 timestamp
  metadata: DemoMetadata;
}

// ============================================================================
// Quiz Questions
// ============================================================================

export interface QuestionOption {
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
  dimensions: Record<string, number>; // Dimension contributions (0-1 scale)
}

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

// ============================================================================
// Teacher Dashboard
// ============================================================================

export interface StudentMatch {
  student_id: string;
  student_name: string;
  compatibility_score: number;
  matched_at: string; // ISO 8601 timestamp
}

export interface TeacherStats {
  teacher_id: string;
  name: string;
  total_matches: number;
  matched_students: StudentMatch[];
  profile_generated: boolean;
}

// ============================================================================
// Component State Interfaces
// ============================================================================

export interface CarouselState {
  activeIndex: number;
  isDragging: boolean;
  dragOffset: number;
  isAnimating: boolean;
}

export interface DemoContent {
  studyPlan: string;
  audioUrl: string;
  videoUrl: string;
}

export interface DemoPageState {
  selectedModality: 'study-plan' | 'audio' | 'video' | null;
  content: DemoContent | null;
  isLoading: boolean;
  isGenerating: boolean;
}

export interface UploadState {
  isUploading: boolean;
  isAnalyzing: boolean;
  progress: number;
  error: string | null;
}

export interface MaterialUploadState {
  content: string;
  topic: string;
  isUploading: boolean;
  error: string | null;
}

// ============================================================================
// Carousel Transition Types
// ============================================================================

export interface DoorTransform {
  scale: number;
  translateX: number;
  translateZ: number;
  blur: number;
  opacity: number;
}

export interface CarouselTransition {
  newIndex: number;
  positions: Record<number, DoorTransform>;
  duration: number; // milliseconds
}

export interface DragResult {
  offset: number;
  shouldRotate: boolean;
  direction?: 'left' | 'right';
}

// ============================================================================
// API Response Types
// ============================================================================

export interface MatchResult {
  compatibility_score: number;
  why: MatchExplanation;
}

export interface MatchResponse {
  ranked: RankedTeacher[];
}

export interface SavePersonaResponse {
  student_id: string;
  success: boolean;
}

export interface SaveMaterialResponse {
  material_id: string;
  success: boolean;
}

export interface GenerateDemosResponse {
  studyPlan: string;
  audioUrl: string;
  videoUrl: string;
}

// ============================================================================
// Validation Types
// ============================================================================

export type ValidationResult = {
  valid: boolean;
  error?: string;
};

// ============================================================================
// Constants
// ============================================================================

export const DIMENSION_KEYS: (keyof DimensionScores)[] = [
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
];

// Dimension weights for matching algorithm
export const DIMENSION_WEIGHTS: Record<string, number> = {
  // 3x weight - critical dimensions
  pace: 3.0,
  cognitive_load_tolerance: 3.0,
  verbal_density: 3.0,
  structure: 3.0,
  
  // 2x weight - important dimensions
  interactivity: 2.0,
  abstraction: 2.0,
  feedback_style: 2.0,
  autonomy: 2.0,
  real_world_need: 2.0,
  attention_span: 2.0,
  
  // 1x weight - all other dimensions
  visual_dependency: 1.0,
  repetition_need: 1.0,
  formality: 1.0,
  humor_receptivity: 1.0,
  motivation_type: 1.0,
  error_tolerance: 1.0,
  social_preference: 1.0,
  emotional_sensitivity: 1.0,
  question_comfort: 1.0,
  note_taking_style: 1.0,
  challenge_preference: 1.0,
  context_need: 1.0,
  storytelling_affinity: 1.0,
  revision_style: 1.0,
};
