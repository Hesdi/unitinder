/**
 * Framer Motion animation configurations for the Student-Teacher Matching Platform
 * 
 * This file centralizes all animation settings used throughout the application:
 * - Carousel transitions
 * - Door swing animations
 * - Page transitions
 * - Loading states
 */

import { Transition, Variants } from 'framer-motion';

// ============================================================================
// Carousel Animations
// ============================================================================

/**
 * Carousel rotation transition settings
 * Duration: 600ms as specified in requirements
 */
export const carouselRotationTransition: Transition = {
  duration: 0.6,
  ease: 'easeInOut',
};

/**
 * Door position variants for carousel
 * - Center: scale(1.1), no blur, full opacity
 * - Side: scale(0.85), translateZ(-200px), blur(4px), opacity 0.7
 */
export const doorPositionVariants: Variants = {
  center: {
    scale: 1.1,
    x: 0,
    z: 0,
    filter: 'blur(0px)',
    opacity: 1.0,
    transition: carouselRotationTransition,
  },
  left: {
    scale: 0.85,
    x: -400,
    z: -200,
    filter: 'blur(4px)',
    opacity: 0.7,
    transition: carouselRotationTransition,
  },
  right: {
    scale: 0.85,
    x: 400,
    z: -200,
    filter: 'blur(4px)',
    opacity: 0.7,
    transition: carouselRotationTransition,
  },
  hidden: {
    scale: 0.5,
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

// ============================================================================
// Door Swing Animation
// ============================================================================

/**
 * Door swing animation settings
 * Duration: 800ms with ease-out timing as specified in requirements
 * Rotates door 90 degrees on Y-axis
 */
export const doorSwingTransition: Transition = {
  duration: 0.8,
  ease: 'easeOut',
};

export const doorSwingVariants: Variants = {
  closed: {
    rotateY: 0,
    transition: doorSwingTransition,
  },
  open: {
    rotateY: 90,
    transition: doorSwingTransition,
  },
};

// ============================================================================
// Page Transitions
// ============================================================================

/**
 * Page transition settings for smooth navigation
 */
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

// ============================================================================
// Quiz Transitions
// ============================================================================

/**
 * Question transition settings for quiz page
 * Smooth transitions between questions
 */
export const questionTransitionVariants: Variants = {
  enter: {
    x: 100,
    opacity: 0,
  },
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    x: -100,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

// ============================================================================
// Loading Animations
// ============================================================================

/**
 * Loading spinner animation
 */
export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Pulse animation for loading states
 */
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ============================================================================
// Card Animations
// ============================================================================

/**
 * Card hover and tap animations
 */
export const cardVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: 'easeIn',
    },
  },
};

// ============================================================================
// Stagger Animations
// ============================================================================

/**
 * Stagger container for animating lists
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * Stagger item animation
 */
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// ============================================================================
// Demo Content Animations
// ============================================================================

/**
 * Demo modality card animations
 */
export const demoCardVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: 'easeIn',
    },
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a spring animation configuration
 */
export const createSpringTransition = (
  stiffness: number = 300,
  damping: number = 30
): Transition => ({
  type: 'spring',
  stiffness,
  damping,
});

/**
 * Create a tween animation configuration
 */
export const createTweenTransition = (
  duration: number = 0.3,
  ease: any = 'easeOut'
): Transition => ({
  type: 'tween',
  duration,
  ease,
});

/**
 * Performance optimization: Use transform and opacity for animations
 * These properties are GPU-accelerated and provide 60fps animations
 */
export const PERFORMANCE_OPTIMIZED_PROPERTIES = [
  'transform',
  'opacity',
  'scale',
  'rotate',
  'translateX',
  'translateY',
  'translateZ',
];

// ============================================================================
// Door Swing Animation Function
// ============================================================================

/**
 * Animates a door swing animation and navigates to the demo page
 * 
 * This function is called when a student clicks the center door in the carousel.
 * It triggers a 90-degree rotation on the Y-axis over 800ms with ease-out timing,
 * then fires the onComplete callback for navigation.
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 * 
 * @param onComplete - Callback function to execute after animation completes
 * @returns Animation configuration object for Framer Motion
 * 
 * @example
 * ```tsx
 * const handleDoorClick = () => {
 *   const animation = animateDoorSwing(() => {
 *     router.push({
 *       pathname: '/demo',
 *       query: { teacherId, studentId, materialId }
 *     });
 *   });
 *   // Use with Framer Motion's animate prop or controls
 * };
 * ```
 */
export function animateDoorSwing(onComplete: () => void) {
  return {
    rotateY: 90,
    transition: doorSwingTransition,
    onAnimationComplete: onComplete,
  };
}

/**
 * Type definition for door swing animation result
 */
export interface DoorSwingAnimation {
  rotateY: number;
  transition: Transition;
  onAnimationComplete: () => void;
}
