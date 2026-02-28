/**
 * Question Generation Utility
 * 
 * Generates memory recall questions based on card attributes.
 * Each question tests the specific attribute type that the card represents.
 */

import { MemoryCard, MemoryQuestion } from './types';
import { getColorName } from './cardGenerator';

/**
 * Generate questions for a set of memory cards
 * 
 * Creates one question per card, testing the specific attribute that card represents:
 * - Color cards: "Which card was [color]?"
 * - Number cards: "Which card had the number [N]?"
 * - Shape cards: "Which card had the [shape]?"
 * 
 * @param cards - Array of MemoryCard objects
 * @returns Array of MemoryQuestion objects
 */
export function generateQuestions(cards: MemoryCard[]): MemoryQuestion[] {
  return cards.map((card) => {
    let questionText: string;

    switch (card.type) {
      case 'color':
        const colorName = getColorName(card.color);
        questionText = `Which card was ${colorName}?`;
        break;
      
      case 'number':
        questionText = `Which card had the number ${card.number}?`;
        break;
      
      case 'shape':
        questionText = `Which card had the ${card.shape}?`;
        break;
      
      default:
        questionText = 'Which card?';
    }

    return {
      cardId: card.id,
      type: card.type,
      questionText,
      correctAnswer: card.id,
    };
  });
}
