/**
 * Carousel Rotation Logic
 * 
 * Implements 3D carousel rotation with wraparound navigation.
 * Calculates positions and transforms for visible doors (left, center, right).
 * 
 * Requirements: 7.7, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3, 9.4
 */

import type { RankedTeacher, CarouselTransition, DoorTransform } from '@/types';

/**
 * Rotates the carousel in the specified direction
 * 
 * @param currentIndex - Current center door index
 * @param direction - Rotation direction ('left' or 'right')
 * @param teachers - Array of ranked teachers
 * @returns Transition state with new index, positions, and transforms
 * 
 * Preconditions:
 * - currentIndex is valid (0 <= currentIndex < teachers.length)
 * - teachers array is non-empty
 * - direction is either 'left' or 'right'
 * 
 * Postconditions:
 * - newIndex is valid and different from currentIndex
 * - All position indices are within valid range
 * - Transform values are properly defined for all visible doors
 * - Transition duration is positive
 */
export function rotateCarousel(
  currentIndex: number,
  direction: 'left' | 'right',
  teachers: RankedTeacher[]
): CarouselTransition {
  const totalTeachers = teachers.length;
  
  // Calculate new center index with wraparound
  // Right: (index + 1) % N
  // Left: (index - 1 + N) % N
  const newIndex = direction === 'right' 
    ? (currentIndex + 1) % totalTeachers
    : (currentIndex - 1 + totalTeachers) % totalTeachers;
  
  // Calculate positions for 3 visible doors
  const leftIndex = (newIndex - 1 + totalTeachers) % totalTeachers;
  const centerIndex = newIndex;
  const rightIndex = (newIndex + 1) % totalTeachers;
  
  // Define transforms for each position
  const transforms: Record<'left' | 'center' | 'right', DoorTransform> = {
    left: {
      scale: 0.85,
      translateX: -400,
      translateZ: -200,
      blur: 4,
      opacity: 0.7
    },
    center: {
      scale: 1.1,
      translateX: 0,
      translateZ: 0,
      blur: 0,
      opacity: 1.0
    },
    right: {
      scale: 0.85,
      translateX: 400,
      translateZ: -200,
      blur: 4,
      opacity: 0.7
    }
  };
  
  // Return transition state
  return {
    newIndex: centerIndex,
    positions: {
      [leftIndex]: transforms.left,
      [centerIndex]: transforms.center,
      [rightIndex]: transforms.right
    },
    duration: 600 // milliseconds
  };
}
