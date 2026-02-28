# Implementation Plan: Student-Teacher Matching Platform

## Overview

This implementation plan breaks down the Student-Teacher Matching Platform into discrete coding tasks. The platform consists of a Next.js frontend with TypeScript, a FastAPI backend, and AI services for demo generation and video analysis. The implementation follows a layered approach: core data models and utilities first, then individual page components, followed by API integration, and finally the 3D carousel with animations.

## Tasks

- [x] 1. Set up project structure and core types
  - Initialize Next.js 14+ project with TypeScript, Tailwind CSS, and shadcn/ui
  - Create directory structure: `/app`, `/components`, `/lib`, `/types`, `/api`
  - Define TypeScript interfaces for all data models in `/types/index.ts`: StudentPersona, DimensionScores, RankedTeacher, LearningMaterial, TeacherProfile, GeneratedDemoContent, Question, QuestionOption
  - Set up Framer Motion and configure animation settings
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.12_

- [ ]* 1.1 Write property test for data model validation
  - **Property 1: Persona Completeness and Validity**
  - **Property 24: ID Format Validation**
  - **Property 25: Score Range Validation**
  - **Property 26: Timestamp Format Validation**
  - **Validates: Requirements 3.1, 3.4, 3.5, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 18.1, 18.2**

- [x] 2. Implement validation utilities
  - Create `/lib/validation.ts` with functions: validateStudentId, validateTeacherId, validateMaterialId, validateDimensionScore, validateCompatibilityScore, validateTimestamp, validateDimensionNames
  - Implement input sanitization function for user inputs
  - Add validation for learning material content and topic (non-empty strings)
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9, 15.10, 15.12_

- [ ]* 2.1 Write unit tests for validation utilities
  - Test each validation function with valid and invalid inputs
  - Test edge cases (empty strings, boundary values, malformed IDs)
  - _Requirements: 15.1-15.12_

- [x] 3. Implement persona generation logic
  - Create `/lib/persona.ts` with generatePersonaFromQuiz function
  - Implement dimension accumulation and averaging logic
  - Implement deriveArchetype function to generate archetype label and summary
  - Implement generateStudentId function (format: "stu_[8 hex chars]")
  - Add ISO 8601 timestamp generation
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 17.1, 17.2_

- [ ]* 3.1 Write property test for persona generation
  - **Property 1: Persona Completeness and Validity**
  - **Property 2: Dimension Averaging Correctness**
  - **Property 3: Persona Metadata Validity**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 17.1, 17.2, 18.1, 18.2**

- [x] 4. Implement matching algorithm
  - Create `/lib/matching.ts` with calculateCompatibilityScore function
  - Implement weighted Manhattan distance calculation with dimension weights (3x for critical, 2x for important, 1x for others)
  - Implement distance-to-score conversion: score = 100 / (1 + totalDistance)
  - Implement best/worst dimension identification (3 best, 2 worst)
  - Add score rounding to 2 decimal places
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 17.4_

- [ ]* 4.1 Write property test for matching algorithm
  - **Property 8: Compatibility Score Calculation**
  - **Property 10: Match Explanation Completeness**
  - **Property 27: Match Explanation Validation**
  - **Property 28: Dimension Completeness in Matching**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 17.4, 18.3, 18.4**

- [x] 5. Implement Landing Page component
  - Create `/app/page.tsx` with role selection UI
  - Add two role buttons: "Student" and "Teacher" with visual distinction
  - Add brief descriptions for each role's journey
  - Implement navigation: student → /quiz, teacher → /teacher/dashboard
  - Style with Tailwind CSS and shadcn/ui components
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Quiz Page component
  - Create `/app/quiz/page.tsx` with quiz interface
  - Create `/components/QuizQuestion.tsx` for individual question display
  - Load 20 questions with 4 options each (A, B, C, D)
  - Implement single question display with smooth transitions
  - Track user responses in component state
  - Implement validation: prevent submission with unanswered questions
  - Display validation errors highlighting unanswered questions
  - On completion, call generatePersonaFromQuiz and navigate to material upload
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ]* 7.1 Write property test for quiz validation
  - **Property 4: Question Format Consistency**
  - **Property 5: Quiz Response Recording**
  - **Property 6: Quiz Validation**
  - **Property 7: Single Question Display**
  - **Validates: Requirements 2.2, 2.3, 2.4, 2.6_

- [x] 8. Implement Material Upload Page component
  - Create `/app/upload-material/page.tsx` with material upload interface
  - Add text input for learning material content
  - Add text input for topic
  - Implement validation: content and topic must be non-empty
  - Display validation errors for empty fields
  - On submit, POST to /api/students/{id}/material with content and topic
  - Store returned material_id in state
  - After successful upload, POST to /api/match to get ranked teachers
  - Navigate to /match with studentId, materialId, and ranked teachers
  - Display error message and retry option on failure
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 15.12_

- [ ]* 8.1 Write property test for material upload validation
  - **Property 30: Material Upload Validation**
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 15.12**

- [x] 9. Implement persona persistence API integration
  - Create `/lib/api.ts` with API client functions
  - Implement saveStudentPersona function: POST /api/students
  - Implement saveLearningMaterial function: POST /api/students/{id}/material
  - Implement getMatchedTeachers function: POST /api/match
  - Add error handling with user-friendly messages
  - Implement local caching for failed saves
  - Add retry logic for failed requests
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 10. Implement carousel rotation logic
  - Create `/lib/carousel.ts` with rotateCarousel function
  - Implement index calculation with wraparound: (index ± 1 + N) % N
  - Calculate positions for 3 visible doors (left, center, right)
  - Define transforms for each position: scale, translateX, translateZ, blur, opacity
  - Return transition state with new index, positions, and duration (600ms)
  - _Requirements: 7.7, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3, 9.4_

- [ ]* 10.1 Write property test for carousel rotation
  - **Property 12: Carousel Wraparound Navigation**
  - **Property 16: Carousel Rotation Consistency**
  - **Property 17: Carousel Index Validity**
  - **Validates: Requirements 7.7, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3, 9.4**

- [x] 11. Implement carousel drag handling
  - Create `/lib/carousel-drag.ts` with handleCarouselDrag function
  - Track drag start position and current position
  - Calculate drag offset: currentX - startX
  - Return drag result with offset and rotation trigger (threshold: 150px)
  - Determine rotation direction based on drag direction
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]* 11.1 Write property test for drag handling
  - **Property 13: Drag Offset Tracking**
  - **Property 14: Drag Visual Feedback**
  - **Property 15: Drag Threshold Rotation**
  - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4**

- [x] 12. Implement Matching Carousel component
  - Create `/app/match/page.tsx` with 3D carousel interface
  - Create `/components/TeacherDoor.tsx` for individual door rendering
  - Render 3 doors at a time (center + 2 sides) with wooden university door design
  - Apply transforms: center scale(1.1), sides scale(0.85) + translateZ(-200px)
  - Apply blur(4px) to side doors, opacity 0.7
  - Display teacher name and compatibility percentage on center door
  - Implement drag gesture handlers: onDragStart, onDragMove, onDragEnd
  - Provide visual feedback during drag (translate carousel)
  - Trigger rotation on drag release > 150px threshold
  - Animate transitions with Framer Motion (600ms duration)
  - Ignore drag gestures while animating
  - On center door click, trigger door swing animation
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 9.6_

- [ ]* 12.1 Write unit tests for carousel component
  - Test door rendering with different teacher counts
  - Test drag gesture handling and threshold logic
  - Test animation state management
  - _Requirements: 7.1-7.7, 8.1-8.7_

- [x] 13. Implement door swing animation
  - Create `/lib/animations.ts` with animateDoorSwing function
  - Use Framer Motion to rotate door 90deg on Y-axis
  - Set animation duration to 800ms with ease-out timing
  - Fire onComplete callback after animation finishes
  - Navigate to /demo with teacherId, studentId, and materialId
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 14. Checkpoint - Ensure carousel works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Implement Teacher Demo Page component
  - Create `/app/demo/page.tsx` with demo content display
  - Display 3 modality option cards: Study Plan, Teaching Audio, Teaching Video
  - On page load, trigger demo generation: POST /api/generate-demos with studentId, teacherId, materialId
  - Display loading indicator while generating demos
  - Fetch generated demo content from API response
  - Implement modality selection: update state on card click
  - Render study plan in formatted text view (markdown)
  - Embed audio player with controls for teaching audio
  - Embed video player with controls for teaching video
  - Add navigation button to return to carousel
  - Display error message and retry option on generation failure
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 18.6_

- [ ]* 15.1 Write property test for demo generation
  - **Property 31: Demo Generation Completeness**
  - **Property 33: Demo Content Association**
  - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8**

- [ ] 16. Implement Teacher Dashboard component
  - Create `/app/teacher/dashboard/page.tsx` with dashboard interface
  - On load, fetch teacher stats: GET /api/teachers/{id}/stats
  - Display total match count in progress bar
  - List matched students with names and compatibility scores
  - Sort student list by compatibility score descending
  - Display profile generation status (generated or not)
  - Display error message and retry option on API failure
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

- [ ]* 16.1 Write property test for dashboard display
  - **Property 18: Student List Display Completeness**
  - **Property 19: Student List Sorting**
  - **Validates: Requirements 11.4, 11.5, 13.4, 13.5**

- [ ] 17. Implement video upload interface
  - Create `/components/VideoUpload.tsx` component
  - Add file input accepting mp4, webm, mov formats
  - Implement client-side validation: file type and size < 500MB
  - Display specific validation error messages
  - On upload, POST to /api/teachers/{id}/video with file
  - Display upload progress indicator (update at least once per second)
  - After upload, trigger video analysis
  - Display analysis status indicator while analyzing
  - On completion, display success message and refresh dashboard stats
  - Display error message and retry option on failure
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 14.10, 14.11, 14.12, 16.7, 18.3, 18.4_

- [ ]* 17.1 Write property test for video upload validation
  - **Property 20: File Type Validation**
  - **Property 21: File Size Validation**
  - **Property 22: Validation Error Specificity**
  - **Property 23: Upload Progress Range and Monotonicity**
  - **Validates: Requirements 12.2, 12.3, 12.4, 13.1, 13.2, 14.2, 14.3, 14.4**

- [ ] 18. Implement backend API routes (Next.js API routes)
  - Create `/app/api/students/route.ts`: POST handler to save student persona
  - Create `/app/api/students/[id]/material/route.ts`: POST handler to save learning material
  - Create `/app/api/match/route.ts`: POST handler to calculate and return ranked teachers
  - Create `/app/api/generate-demos/route.ts`: POST handler to generate demo content (study plan, audio, video)
  - Create `/app/api/teachers/[id]/stats/route.ts`: GET handler to fetch teacher statistics
  - Create `/app/api/teachers/[id]/video/route.ts`: POST handler to upload teacher video
  - Create `/app/api/teachers/[id]/analyze/route.ts`: POST handler to trigger video analysis
  - Implement error handling with appropriate HTTP status codes
  - Add input validation using validation utilities
  - _Requirements: 4.1, 5.5, 5.6, 6.1, 11.1, 13.1, 14.5, 14.8_

- [ ]* 18.1 Write integration tests for API routes
  - Test each endpoint with valid and invalid inputs
  - Test error handling and status codes
  - Test data persistence and retrieval
  - _Requirements: 4.1, 5.5, 5.6, 6.1, 11.1, 13.1, 14.5, 14.8_

- [ ] 19. Implement demo generation service integration
  - Create `/lib/demo-generation.ts` with generateDemoContent function
  - Integrate with OpenAI API for study plan generation
  - Integrate with TTS service (Azure Cognitive Services or similar) for audio generation
  - Integrate with video generation service for teaching video
  - Combine student persona + teacher profile + learning material in prompts
  - Store generated content in cloud storage (Azure Blob or AWS S3)
  - Return DemoContent with URLs to generated files
  - Add metadata: duration, file size, format, generation time
  - Implement error handling and retry logic
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_

- [ ]* 19.1 Write property test for demo content metadata
  - **Property 29: Content Metadata Completeness**
  - **Validates: Requirements 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7**

- [ ] 20. Implement video analysis service integration
  - Create `/lib/video-analysis.ts` with analyzeTeachingVideo function
  - Upload video to cloud storage
  - Integrate with video analysis service (Azure Video Indexer or custom ML model)
  - Extract teaching characteristics: style, pace, tone, formality, interactivity, etc.
  - Map extracted features to 24-dimension teacher profile
  - Ensure all dimension scores are between 0.0 and 1.0
  - Generate archetype label and summary
  - Save teacher profile to database
  - Return TeacherProfile with generated persona
  - Implement error handling for analysis failures
  - _Requirements: 14.8, 14.9, 14.10, 14.11, 14.12, 17.3, 18.7_

- [ ]* 20.1 Write property test for teacher profile generation
  - **Property 32: Teacher Profile Generation**
  - **Validates: Requirements 14.10, 17.3**

- [ ] 21. Implement performance optimizations
  - Use CSS transforms (translateZ, scale) for all carousel animations
  - Implement virtual scrolling for carousel if teacher list > 50 items
  - Convert door textures to WebP format with PNG fallback
  - Implement lazy loading for teacher profile images
  - Optimize asset sizes: target < 2MB for carousel page
  - Throttle upload progress updates to max once per second
  - Add memoization to expensive calculations (matching scores)
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

- [ ] 22. Implement error handling and recovery
  - Add error boundaries to all page components
  - Implement retry logic for all API calls
  - Add local caching for failed persona saves
  - Display user-friendly error messages for all error scenarios
  - Add specific error messages for network, validation, and timeout errors
  - Implement recovery flows: allow retry without re-taking quiz or re-uploading material
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_

- [ ] 23. Final integration and wiring
  - Connect all components with proper routing
  - Implement state management for cross-page data flow (student persona, material_id, teacher selection)
  - Add loading states to all async operations
  - Test complete student flow: landing → quiz → material upload → carousel → demo
  - Test complete teacher flow: landing → dashboard → video upload → analysis → stats
  - Verify all API integrations work end-to-end
  - Ensure all animations are smooth (60fps)
  - _Requirements: All requirements_

- [ ] 24. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript throughout for type safety
- Focus is on presentation MVP: no authentication, simplified error handling
- Demo generation and video analysis may take significant time (10-30 seconds for demos, 1-2 minutes for video analysis)
