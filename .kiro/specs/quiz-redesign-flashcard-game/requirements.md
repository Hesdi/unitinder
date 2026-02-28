# Requirements Document

## Introduction

This document specifies requirements for redesigning the student quiz system to include a shortened quiz (5 questions instead of 20) followed by a "Memory Vibe-Check" flashcard game. The flashcard game will assess memory patterns to tag students with additional cognitive dimensions (Visual-Dominant, Sequential-Dominant, or Spatial-Dominant) that complement the existing 24-dimension persona profile.

## Glossary

- **Quiz_System**: The existing student questionnaire that generates a 24-dimension cognitive profile
- **Flashcard_Game**: A memory-based assessment game that displays cards with colored shapes and numbers
- **Memory_Card**: A visual element displaying a colored shape with a number (e.g., red circle with "3")
- **Persona_Profile**: The 24-dimension cognitive profile generated from quiz responses
- **Cognitive_Tag**: A learning style label derived from flashcard game performance (Visual-Dominant, Sequential-Dominant, or Spatial-Dominant)
- **Quiz_Page**: The React component at `frontend/src/app/quiz/page.tsx`
- **Questions_Data**: The question bank stored in `frontend/src/data/questions.ts`
- **Persona_Generator**: The module at `frontend/src/lib/persona.ts` that generates student personas
- **Session_Storage**: Browser storage mechanism for persisting persona data between pages
- **Upload_Material_Page**: The page at `/upload-material` that follows quiz completion

## Requirements

### Requirement 1: Reduce Quiz Length

**User Story:** As a student, I want a shorter quiz, so that I can complete the assessment more quickly without losing engagement.

#### Acceptance Criteria

1. THE Quiz_System SHALL present exactly 5 questions instead of 20 questions
2. THE Questions_Data SHALL contain a curated subset of 5 questions that cover diverse cognitive dimensions
3. THE Quiz_Page SHALL update progress indicators to reflect 5 total questions
4. THE Persona_Generator SHALL generate valid 24-dimension profiles from 5 question responses
5. WHEN a student completes all 5 questions, THE Quiz_System SHALL proceed to the flashcard game

### Requirement 2: Create Flashcard Game Component

**User Story:** As a student, I want to play a memory game after the quiz, so that the system can better understand how I learn and remember information.

#### Acceptance Criteria

1. THE Flashcard_Game SHALL display at least 16 Memory_Cards in a grid layout
2. THE Flashcard_Game SHALL use a blackboard aesthetic with chalk-style visual design
3. WHEN the Flashcard_Game initializes, THE Flashcard_Game SHALL generate at least 16 Memory_Cards with approximately 33% distribution:
   - At least 5 cards testing color memory (displaying colored shapes)
   - At least 5 cards testing number memory (displaying numbers)
   - At least 5 cards testing shape memory (displaying shapes)
4. THE Flashcard_Game SHALL ensure each card tests only ONE attribute type (color OR number OR shape, not combinations)
5. THE Memory_Card SHALL render visual elements using SVG or canvas with chalk-drawn styling

### Requirement 3: Implement Card Flip Mechanics

**User Story:** As a student, I want cards to flip and reveal their contents, so that I can memorize the information before being tested.

#### Acceptance Criteria

1. WHEN the Flashcard_Game starts, THE Memory_Card SHALL display face-up for exactly 3 seconds
2. WHILE Memory_Cards are face-up, THE Flashcard_Game SHALL display all card attributes (color, shape, number) clearly
3. WHEN 3 seconds elapse, THE Memory_Card SHALL flip to face-down state with animation
4. THE Memory_Card SHALL use Framer Motion for flip animations
5. WHILE Memory_Cards are face-down, THE Memory_Card SHALL display a uniform chalk-drawn pattern or texture

### Requirement 4: Implement Memory Challenge

**User Story:** As a student, I want to be asked to recall specific card attributes, so that the system can assess my memory patterns.

#### Acceptance Criteria

1. WHEN all Memory_Cards flip face-down, THE Flashcard_Game SHALL present recall questions based on each card's attribute type:
   - For color cards: "Which card was [color]?" (e.g., "Which card was red?")
   - For number cards: "Which card had the number [number]?" (e.g., "Which card had the number 7?")
   - For shape cards: "Which card had the [shape]?" (e.g., "Which card had the circle?")
2. THE Flashcard_Game SHALL ask one question per card, testing the specific attribute that card represents
3. THE Flashcard_Game SHALL present all face-down cards as clickable answer options
4. WHEN a student clicks a Memory_Card, THE Memory_Card SHALL flip face-up to reveal the answer
5. THE Flashcard_Game SHALL indicate whether the student's answer is correct or incorrect
6. THE Flashcard_Game SHALL record which attribute type (color, number, shape) the student answered correctly

### Requirement 5: Generate Cognitive Tags from Performance

**User Story:** As a student, I want my memory game performance to influence my learning profile, so that teachers can understand my dominant memory patterns.

#### Acceptance Criteria

1. WHEN the Flashcard_Game completes, THE Flashcard_Game SHALL analyze which attribute types the student recalled correctly
2. IF the student correctly recalled color-based questions most frequently, THEN THE Flashcard_Game SHALL assign the Cognitive_Tag "Visual-Dominant"
3. IF the student correctly recalled number-based questions most frequently, THEN THE Flashcard_Game SHALL assign the Cognitive_Tag "Sequential-Dominant"
4. IF the student correctly recalled shape-based questions most frequently, THEN THE Flashcard_Game SHALL assign the Cognitive_Tag "Spatial-Dominant"
5. THE Flashcard_Game SHALL store the Cognitive_Tag in Session_Storage alongside the Persona_Profile
6. THE Persona_Generator SHALL include the Cognitive_Tag in the StudentPersona object structure

### Requirement 6: Integrate Flashcard Game into Quiz Flow

**User Story:** As a student, I want a seamless transition from quiz to flashcard game to material upload, so that the assessment feels like a cohesive experience.

#### Acceptance Criteria

1. WHEN a student completes the 5-question quiz, THE Quiz_System SHALL navigate to the Flashcard_Game instead of Upload_Material_Page
2. THE Flashcard_Game SHALL display on the same route as the quiz or a new route `/quiz/flashcard`
3. WHEN the Flashcard_Game completes, THE Flashcard_Game SHALL navigate to Upload_Material_Page at `/upload-material`
4. THE Quiz_System SHALL preserve the Persona_Profile in Session_Storage throughout the entire flow
5. THE Upload_Material_Page SHALL have access to both the Persona_Profile and Cognitive_Tag from Session_Storage

### Requirement 7: Implement Blackboard Aesthetic

**User Story:** As a student, I want the flashcard game to have a visually engaging blackboard theme, so that the experience feels playful and educational.

#### Acceptance Criteria

1. THE Flashcard_Game SHALL use a dark background color resembling a blackboard (dark green or black)
2. THE Memory_Card SHALL render shapes and numbers with chalk-style textures or stroke effects
3. THE Flashcard_Game SHALL use chalk-style fonts for text elements
4. WHEN Memory_Cards flip, THE Flashcard_Game SHALL use animation effects that resemble chalk being drawn or erased
5. THE Flashcard_Game SHALL maintain visual consistency with the existing AuroraBackground component used in Quiz_Page

### Requirement 8: Maintain Persona Generation Integrity

**User Story:** As a developer, I want the 24-dimension persona generation to remain accurate with fewer questions, so that student profiles are still meaningful for teacher matching.

#### Acceptance Criteria

1. THE Persona_Generator SHALL calculate dimension averages from the 5 selected questions
2. THE Persona_Generator SHALL assign default value 0.5 to dimensions with no contributions from the 5 questions
3. THE Questions_Data SHALL select 5 questions that collectively contribute to at least 15 of the 24 dimensions
4. THE Persona_Generator SHALL continue to generate archetype labels and summaries using the existing deriveArchetype function
5. THE Persona_Generator SHALL include both the 24-dimension scores and the Cognitive_Tag in the final StudentPersona object

### Requirement 9: Preserve Existing Quiz Features

**User Story:** As a student, I want the quiz navigation and validation features to work the same way, so that the user experience remains familiar.

#### Acceptance Criteria

1. THE Quiz_Page SHALL maintain Previous and Next button functionality
2. THE Quiz_Page SHALL maintain progress bar display showing current question out of 5
3. THE Quiz_Page SHALL maintain answer validation requiring all questions to be answered
4. THE Quiz_Page SHALL maintain auto-advance behavior after selecting an answer
5. THE Quiz_Page SHALL maintain the existing AuroraBackground visual styling

### Requirement 10: Handle Multiple Flashcard Rounds

**User Story:** As a student, I want to answer multiple memory questions, so that the system has enough data to accurately assess my memory patterns.

#### Acceptance Criteria

1. THE Flashcard_Game SHALL present all memory cards in a single round
2. THE Flashcard_Game SHALL ask at least 16 questions (one per card) to test all three memory patterns
3. THE Flashcard_Game SHALL maintain the 33% distribution across all cards (approximately equal numbers of color, number, and shape cards)
4. THE Flashcard_Game SHALL track correct answers for each attribute type (color, number, shape)
5. WHEN all questions are answered, THE Flashcard_Game SHALL calculate the final Cognitive_Tag based on which attribute type had the highest correct answer rate
