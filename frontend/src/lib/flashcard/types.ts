/**
 * Flashcard Game Type Definitions
 */

export type CardType = 'color' | 'number' | 'shape';

export type ShapeType = 'circle' | 'square' | 'triangle' | 'star' | 'hexagon' | 'diamond';

export type CognitiveTag = 'Visual-Dominant' | 'Sequential-Dominant' | 'Spatial-Dominant';

export interface MemoryCard {
  id: number;
  type: CardType;
  color: string; // hex color
  shape: ShapeType;
  number: number; // 1-9
  position: number; // grid position 0-15+
}

export interface MemoryQuestion {
  cardId: number;
  type: CardType;
  questionText: string;
  correctAnswer: number; // cardId of correct card
}

export interface FlashcardGameResult {
  totalQuestions: number;
  colorCorrect: number;
  numberCorrect: number;
  shapeCorrect: number;
  cognitiveTag: CognitiveTag;
  completedAt: string; // ISO timestamp
}
