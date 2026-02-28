/**
 * Card Generation Utility
 * 
 * Generates balanced sets of memory cards for matching game.
 * Each card shows only ONE attribute (color OR number OR shape).
 */

import { MemoryCard, CardType, ShapeType } from './types';

const COLORS = [
  '#FF0000', // red
  '#0000FF', // blue
  '#00FF00', // green
  '#FFFF00', // yellow
  '#FFA500', // orange
  '#800080', // purple
];

const COLOR_NAMES: Record<string, string> = {
  '#FF0000': 'red',
  '#0000FF': 'blue',
  '#00FF00': 'green',
  '#FFFF00': 'yellow',
  '#FFA500': 'orange',
  '#800080': 'purple',
};

const SHAPES: ShapeType[] = ['circle', 'square', 'triangle', 'star', 'hexagon', 'diamond'];

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate a balanced set of memory cards for matching game
 * Creates 8 pairs (16 cards total) with 33% distribution across types
 * 
 * @returns Array of 16 MemoryCard objects (8 pairs)
 */
export function generateCardSet(): MemoryCard[] {
  const cards: MemoryCard[] = [];
  let cardId = 0;

  // Generate 3 color pairs (6 cards)
  const selectedColors = shuffle(COLORS).slice(0, 3);
  for (const color of selectedColors) {
    // Create pair
    for (let i = 0; i < 2; i++) {
      cards.push({
        id: cardId++,
        type: 'color',
        color: color,
        shape: 'circle', // Not displayed
        number: 0, // Not displayed
        position: 0,
      });
    }
  }

  // Generate 3 number pairs (6 cards)
  const selectedNumbers = shuffle(NUMBERS).slice(0, 3);
  for (const number of selectedNumbers) {
    // Create pair
    for (let i = 0; i < 2; i++) {
      cards.push({
        id: cardId++,
        type: 'number',
        color: '#808080', // Not displayed
        shape: 'square', // Not displayed
        number: number,
        position: 0,
      });
    }
  }

  // Generate 2 shape pairs (4 cards)
  const selectedShapes = shuffle(SHAPES).slice(0, 2);
  for (const shape of selectedShapes) {
    // Create pair
    for (let i = 0; i < 2; i++) {
      cards.push({
        id: cardId++,
        type: 'shape',
        color: '#FFFFFF', // Not displayed
        shape: shape,
        number: 0, // Not displayed
        position: 0,
      });
    }
  }

  // Randomize positions
  const shuffledCards = shuffle(cards);
  shuffledCards.forEach((card, index) => {
    card.position = index;
  });

  return shuffledCards;
}

/**
 * Get the human-readable color name from hex code
 */
export function getColorName(hexColor: string): string {
  return COLOR_NAMES[hexColor] || 'unknown';
}

/**
 * Check if two cards match (same type and same value)
 */
export function cardsMatch(card1: MemoryCard, card2: MemoryCard): boolean {
  if (card1.type !== card2.type) return false;
  
  switch (card1.type) {
    case 'color':
      return card1.color === card2.color;
    case 'number':
      return card1.number === card2.number;
    case 'shape':
      return card1.shape === card2.shape;
    default:
      return false;
  }
}
