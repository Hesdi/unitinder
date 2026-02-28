# Implementation Plan: Quiz Redesign & Flashcard Game

## Overview

This implementation plan converts the quiz system from 20 questions to 5 questions and adds a memory-based flashcard game that assesses cognitive patterns. The implementation follows a phased approach: first modify the quiz, then build the flashcard game components, and finally integrate the flow with persona generation.

## Tasks

- [ ] 1. Reduce quiz to 5 questions and update navigation
  - [ ] 1.1 Update questions data to export 5-question subset
    - Modify `frontend/src/data/questions.ts` to export `QUIZ_QUESTIONS` with 5 strategically selected questions (IDs: 1, 3, 7, 12, 18)
    - Keep original `QUESTIONS` array for reference
    - Ensure selected questions cover maximum dimension diversity (16+ dimensions)
    - _Requirements: 1.1, 1.2, 8.3_
  
  - [ ]* 1.2 Write property test for quiz length
    - **Property 1: Quiz Length Reduction**
    - **Validates: Requirements 1.1, 1.2**
  
  - [ ] 1.3 Update QuizPage to use 5-question subset
    - Modify `frontend/src/app/quiz/page.tsx` to import `QUIZ_QUESTIONS` instead of `QUESTIONS`
    - Update completion handler to navigate to `/quiz/flashcard` instead of `/upload-material`
    - Verify progress bar automatically reflects 5 questions
    - _Requirements: 1.1, 1.3, 1.5, 6.1_
  
  - [ ]* 1.4 Write property test for progress indicator accuracy
    - **Property 7: Progress Indicator Accuracy**
    - **Validates: Requirements 1.3, 9.2**
  
  - [ ]* 1.5 Write unit tests for quiz navigation
    - Test Previous/Next button state management
    - Test auto-advance behavior after answer selection
    - Test validation error display for incomplete responses
    - _Requirements: 9.1, 9.3, 9.4_

- [ ] 2. Implement card generation utilities
  - [ ] 2.1 Create MemoryCard and related interfaces
    - Create `frontend/src/lib/flashcard/types.ts` with MemoryCard, MemoryQuestion, FlashcardGameResult interfaces
    - Define type unions for card types, shapes, and cognitive tags
    - _Requirements: 2.1, 2.3_
  
  - [ ] 2.2 Implement card generator utility
    - Create `frontend/src/lib/flashcard/cardGenerator.ts`
    - Implement `generateCardSet()` function that creates 16+ cards with 33% distribution (5 color, 5 number, 6 shape cards minimum)
    - Ensure each card tests only ONE attribute type
    - Randomize card positions to prevent pattern memorization
    - _Requirements: 2.3, 2.4, 10.3_
  
  - [ ]* 2.3 Write property test for card distribution balance
    - **Property 2: Card Distribution Balance**
    - **Validates: Requirements 2.1, 2.3, 10.3**
  
  - [ ]* 2.4 Write property test for single attribute testing
    - **Property 3: Single Attribute Testing**
    - **Validates: Requirements 2.4**
  
  - [ ]* 2.5 Write unit tests for card generator
    - Test exact 16-card generation
    - Test minimum distribution requirements (5-5-6)
    - Test position randomization
    - _Requirements: 2.3, 2.4_

- [ ] 3. Implement question generation utilities
  - [ ] 3.1 Create question generator utility
    - Create `frontend/src/lib/flashcard/questionGenerator.ts`
    - Implement `generateQuestions()` function that creates one question per card
    - Use templates: "Which card was [color]?", "Which card had the number [N]?", "Which card had the [shape]?"
    - _Requirements: 4.1, 4.2, 10.2_
  
  - [ ]* 3.2 Write property test for question generation completeness
    - **Property 5: Question Generation Completeness**
    - **Validates: Requirements 4.1, 4.2**
  
  - [ ]* 3.3 Write unit tests for question generator
    - Test question text formatting for each card type
    - Test correct answer mapping
    - Test question count matches card count
    - _Requirements: 4.1, 4.2_

- [ ] 4. Create MemoryCard component with flip animation
  - [ ] 4.1 Implement MemoryCard component
    - Create `frontend/src/components/flashcard/MemoryCard.tsx`
    - Implement face-up rendering with SVG shape, color fill, and centered number
    - Implement face-down rendering with chalk texture pattern
    - Add Framer Motion 3D flip animation
    - Apply blackboard aesthetic with chalk-style fonts and textures
    - _Requirements: 2.2, 2.5, 3.2, 3.4, 7.2, 7.3_
  
  - [ ]* 4.2 Write unit tests for MemoryCard component
    - Test face-up rendering shows correct shape, color, and number
    - Test face-down rendering shows uniform texture
    - Test click handler invocation
    - Test feedback display (correct/incorrect)
    - _Requirements: 2.2, 3.2, 3.5_

- [ ] 5. Checkpoint - Verify card and question utilities
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement FlashcardGame main component
  - [ ] 6.1 Create FlashcardGame page component
    - Create `frontend/src/app/quiz/flashcard/page.tsx`
    - Implement state management for game phases (reveal, question, complete)
    - Implement card grid layout (4x4 or responsive grid for 16+ cards)
    - Apply blackboard aesthetic with dark background and chalk styling
    - _Requirements: 2.1, 6.2, 7.1, 7.4_
  
  - [ ] 6.2 Implement reveal phase logic
    - Initialize game with `generateCardSet()` and `generateQuestions()`
    - Display all cards face-up for exactly 3 seconds
    - Use setTimeout to trigger flip after 3 seconds
    - _Requirements: 3.1, 3.3, 10.1_
  
  - [ ]* 6.3 Write property test for card reveal timing
    - **Property 4: Card Reveal Timing**
    - **Validates: Requirements 3.1, 3.3**
  
  - [ ] 6.3 Implement question phase logic
    - Flip all cards to face-down state with animation
    - Display current question text above the grid
    - Make all cards clickable as answer options
    - Track which cards have been flipped during answers
    - _Requirements: 3.3, 4.3, 10.1_
  
  - [ ] 6.4 Implement answer handling logic
    - Handle card click during question phase
    - Flip clicked card face-up to reveal answer
    - Display correct/incorrect feedback
    - Record answer correctness by attribute type (color, number, shape)
    - Advance to next question after feedback delay
    - _Requirements: 4.4, 4.5, 4.6, 10.4_
  
  - [ ]* 6.5 Write property test for answer interaction
    - **Property 6: Answer Interaction**
    - **Validates: Requirements 4.3, 4.4, 4.5**
  
  - [ ]* 6.6 Write property test for performance tracking
    - **Property 8: Performance Tracking**
    - **Validates: Requirements 4.6, 10.4**
  
  - [ ]* 6.7 Write unit tests for FlashcardGame component
    - Test phase transitions (reveal → question → complete)
    - Test question progression through all cards
    - Test answer tracking by attribute type
    - Test grid layout rendering
    - _Requirements: 3.1, 3.3, 4.3, 4.4, 4.5, 4.6_

- [ ] 7. Implement cognitive tag calculation and persona integration
  - [ ] 7.1 Update StudentPersona interface
    - Modify `frontend/src/lib/persona.ts` to add `cognitiveTag` and `flashcardResult` fields to StudentPersona interface
    - _Requirements: 5.6, 8.5_
  
  - [ ] 7.2 Implement cognitive tag calculation
    - Add `calculateCognitiveTag()` function in `frontend/src/lib/flashcard/resultCalculator.ts`
    - Determine tag based on highest correct count: Visual-Dominant (color), Sequential-Dominant (number), Spatial-Dominant (shape)
    - Handle ties by defaulting to first alphabetically (Sequential > Spatial > Visual)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 10.5_
  
  - [ ]* 7.3 Write property test for cognitive tag assignment
    - **Property 10: Cognitive Tag Assignment**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 10.5**
  
  - [ ] 7.4 Implement persona update function
    - Add `updatePersonaWithCognitiveTag()` function in `frontend/src/lib/persona.ts`
    - Update existing persona object with cognitive tag and flashcard results
    - Store updated persona in sessionStorage
    - _Requirements: 5.5, 5.6_
  
  - [ ]* 7.5 Write property test for persona object structure
    - **Property 13: Persona Object Structure**
    - **Validates: Requirements 5.6, 8.5**
  
  - [ ]* 7.6 Write unit tests for cognitive tag calculation
    - Test tag assignment for each dominant type
    - Test tie-breaking logic
    - Test persona update with cognitive tag
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 8. Implement persona generation with 5 questions
  - [ ] 8.1 Update persona generator for 5-question input
    - Modify `generatePersona()` function in `frontend/src/lib/persona.ts` to handle 5 responses
    - Calculate dimension averages from available questions
    - Assign default value 0.5 to dimensions not covered by the 5 questions
    - Maintain existing archetype derivation logic
    - _Requirements: 1.4, 8.1, 8.2, 8.4_
  
  - [ ]* 8.2 Write property test for persona generation integrity
    - **Property 9: Persona Generation Integrity**
    - **Validates: Requirements 1.4, 8.1, 8.2, 8.4**
  
  - [ ]* 8.3 Write unit tests for persona generation
    - Test dimension calculation with 5 responses
    - Test default value assignment for uncovered dimensions
    - Test archetype derivation still works
    - Test all 24 dimensions present in output
    - _Requirements: 1.4, 8.1, 8.2, 8.4_

- [ ] 9. Checkpoint - Verify persona and cognitive tag logic
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Integrate navigation flow and session storage
  - [ ] 10.1 Implement FlashcardGame completion handler
    - Calculate cognitive tag from answer tracking
    - Retrieve persona from sessionStorage
    - Update persona with cognitive tag
    - Store updated persona back to sessionStorage
    - Navigate to `/upload-material`
    - _Requirements: 5.5, 6.3, 6.4_
  
  - [ ]* 10.2 Write property test for navigation flow
    - **Property 11: Navigation Flow**
    - **Validates: Requirements 1.5, 6.1, 6.3**
  
  - [ ]* 10.3 Write property test for session storage persistence
    - **Property 12: Session Storage Persistence**
    - **Validates: Requirements 5.5, 6.4, 6.5**
  
  - [ ] 10.4 Verify upload material page can access persona
    - Check that `frontend/src/app/upload-material/page.tsx` retrieves persona from sessionStorage
    - Verify both 24-dimension scores and cognitive tag are accessible
    - _Requirements: 6.5_
  
  - [ ]* 10.5 Write integration tests for complete flow
    - Test quiz → flashcard → upload navigation
    - Test persona persistence across all pages
    - Test cognitive tag appears in final persona
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 11. Implement error handling
  - [ ] 11.1 Add error handling for card generation
    - Wrap `generateCardSet()` in try-catch with retry logic (up to 3 attempts)
    - Display error message and retry button if all attempts fail
    - Log errors for debugging
  
  - [ ] 11.2 Add error handling for session storage
    - Wrap sessionStorage operations in try-catch
    - Implement localStorage fallback if sessionStorage fails
    - Display warning if both storage mechanisms fail
  
  - [ ] 11.3 Add error handling for navigation
    - Catch router.push() failures
    - Display user-friendly error message with manual navigation link
    - Log navigation errors
  
  - [ ] 11.4 Add error handling for persona generation
    - Validate dimension values are in [0, 1] range, clamp if needed
    - Assign default cognitive tag if calculation fails
    - Log warnings for invalid data
  
  - [ ]* 11.5 Write unit tests for error handling
    - Test card generation retry logic
    - Test storage fallback mechanisms
    - Test navigation error recovery
    - Test persona validation and clamping

- [ ] 12. Implement visual styling and animations
  - [ ] 12.1 Apply blackboard aesthetic to FlashcardGame
    - Use dark green or black background color
    - Apply chalk-style fonts (e.g., "Chalkboard SE", "Comic Sans MS" fallback)
    - Add chalk texture to card backs
    - Ensure visual consistency with existing AuroraBackground component
    - _Requirements: 7.1, 7.2, 7.3, 7.5_
  
  - [ ] 12.2 Implement Framer Motion animations
    - Add 3D flip animation for card transitions
    - Add chalk-drawing effect for card reveals (optional enhancement)
    - Add smooth transitions between game phases
    - _Requirements: 3.4, 7.4_
  
  - [ ]* 12.3 Write visual regression tests
    - Test blackboard styling renders correctly
    - Test animations complete without errors
    - Test responsive grid layout on different screen sizes

- [ ] 13. Final checkpoint - End-to-end testing
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Verify all requirements and properties
  - [ ] 14.1 Manual verification of quiz flow
    - Complete 5-question quiz and verify navigation to flashcard game
    - Verify progress bar shows "Question X of 5"
    - Verify Previous/Next buttons work correctly
    - _Requirements: 1.1, 1.3, 1.5, 9.1, 9.2_
  
  - [ ] 14.2 Manual verification of flashcard game
    - Verify 16+ cards display in grid
    - Verify cards show face-up for 3 seconds then flip
    - Verify questions appear for each card
    - Verify clicking cards reveals answers with feedback
    - Verify cognitive tag is calculated correctly
    - _Requirements: 2.1, 3.1, 3.3, 4.3, 4.4, 4.5, 5.1_
  
  - [ ] 14.3 Manual verification of persona integration
    - Verify persona contains all 24 dimensions
    - Verify cognitive tag is added to persona
    - Verify persona persists to upload material page
    - _Requirements: 5.5, 5.6, 6.4, 6.5, 8.1, 8.5_
  
  - [ ] 14.4 Manual verification of visual styling
    - Verify blackboard aesthetic throughout flashcard game
    - Verify chalk-style fonts and textures
    - Verify animations are smooth and complete
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests should use `fast-check` library with minimum 100 iterations
- Unit tests should use Jest and React Testing Library
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- The implementation uses TypeScript/React/Next.js as specified in the design document
- All property tests should be tagged with format: `Feature: quiz-redesign-flashcard-game, Property {N}: {property text}`
