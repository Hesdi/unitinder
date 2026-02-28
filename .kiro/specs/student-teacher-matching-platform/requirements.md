# Requirements Document

## Introduction

The Student-Teacher Matching Platform is a web application that connects students with compatible teachers based on cognitive learning preferences. The system administers a 24-dimension cognitive load assessment quiz to students, generates student personas, allows students to upload learning material they want to learn, then uses weighted compatibility scoring to match them with teachers. Teachers upload teaching videos which are analyzed to generate their 24-dimension teaching profiles. When students select a teacher, the system generates personalized AI demo content (study plan, audio, video) showing how that specific teacher would teach the student's uploaded material. Students explore matches through an immersive 3D carousel interface featuring wooden university doors. This is a presentation MVP focused on core functionality.

## Glossary

- **System**: The Student-Teacher Matching Platform web application
- **Quiz_Engine**: Component that administers cognitive assessment questions
- **Persona_Generator**: Component that calculates 24-dimension student profiles from quiz responses
- **Matching_Service**: Backend service that ranks teachers by compatibility with student personas
- **Carousel_Interface**: 3D interactive component displaying teacher matches as wooden doors
- **Teacher_Dashboard**: Interface for teachers to upload videos and view match analytics
- **Demo_Page**: Page displaying AI-generated demo content in three modalities (study plan, audio, video)
- **Material_Upload**: Component for students to upload learning material (topic/content they want to learn)
- **Video_Analysis_Service**: Backend service that analyzes teaching videos to generate teacher profiles
- **Demo_Generation_Service**: Backend service that generates personalized demo content based on student persona, teacher profile, and learning material
- **Student_Persona**: 24-dimension profile representing student learning preferences (0-1 scale per dimension)
- **Teacher_Profile**: 24-dimension profile representing teacher's teaching style, generated from video analysis
- **Learning_Material**: Topic or content uploaded by student that they want to learn
- **Ranked_Teacher**: Teacher profile with compatibility score and match explanation
- **Dimension_Score**: Numerical value between 0.0 and 1.0 representing a cognitive preference
- **Compatibility_Score**: Percentage (0-100) indicating student-teacher match quality
- **Content_Modality**: Format of teaching content (study-plan, audio, or video)

## Requirements

### Requirement 1: Role Selection

**User Story:** As a user, I want to select my role (student or teacher), so that I can access the appropriate features for my needs.

#### Acceptance Criteria

1. WHEN a user accesses the landing page, THE System SHALL display two distinct role options: student and teacher
2. WHEN a user selects the student role, THE System SHALL navigate to the quiz page
3. WHEN a user selects the teacher role, THE System SHALL navigate to the teacher dashboard
4. THE Landing_Page SHALL provide a brief description of each role's journey

### Requirement 2: Cognitive Assessment Quiz

**User Story:** As a student, I want to complete a cognitive load assessment quiz, so that the system can understand my learning preferences.

#### Acceptance Criteria

1. THE Quiz_Engine SHALL administer exactly 20 questions to the student
2. WHEN displaying a question, THE Quiz_Engine SHALL present exactly 4 answer options labeled A, B, C, and D
3. WHEN a student selects an answer, THE Quiz_Engine SHALL record the response and advance to the next question
4. WHEN a student attempts to submit the quiz with unanswered questions, THE System SHALL display a validation error highlighting the unanswered questions
5. WHEN all 20 questions are answered, THE Quiz_Engine SHALL enable quiz submission
6. THE Quiz_Engine SHALL display questions one at a time with smooth transitions between questions

### Requirement 3: Student Persona Generation

**User Story:** As a student, I want my quiz responses to generate a detailed learning profile, so that I can be matched with compatible teachers.

#### Acceptance Criteria

1. WHEN a student completes the quiz, THE Persona_Generator SHALL calculate scores for all 24 cognitive dimensions
2. FOR each dimension, THE Persona_Generator SHALL compute the average of all contributing values from selected answer options
3. IF a dimension has no contributing values, THE Persona_Generator SHALL assign a default value of 0.5
4. THE Persona_Generator SHALL ensure all dimension scores are between 0.0 and 1.0 inclusive
5. THE Persona_Generator SHALL round each dimension score to 2 decimal places
6. THE Persona_Generator SHALL generate a unique student_id in the format "stu_[8 hex chars]"
7. THE Persona_Generator SHALL assign an archetype label based on the dimension scores
8. THE Persona_Generator SHALL generate a text summary describing the student's learning preferences
9. THE Persona_Generator SHALL include an ISO 8601 timestamp in the generated_at field

### Requirement 4: Persona Persistence

**User Story:** As a student, I want my learning profile saved, so that I don't need to retake the quiz if I return later.

#### Acceptance Criteria

1. WHEN a student persona is generated, THE System SHALL send a POST request to /api/students with the complete persona
2. WHEN the API save succeeds, THE System SHALL store the returned student_id for subsequent operations
3. WHEN the API save succeeds, THE System SHALL navigate to the material upload page
4. IF the API save fails, THE System SHALL cache the persona locally and display a retry option
5. THE System SHALL allow the student to proceed to material upload without re-taking the quiz after a failed save

### Requirement 5: Learning Material Upload

**User Story:** As a student, I want to upload learning material (topic/content I want to learn), so that the system can generate personalized demo content showing how each teacher would teach my specific material.

#### Acceptance Criteria

1. THE Material_Upload SHALL provide a text input interface for students to enter learning material content
2. THE Material_Upload SHALL provide a text input field for students to enter the topic of their learning material
3. WHEN a student attempts to submit with empty content, THE System SHALL display a validation error indicating content is required
4. WHEN a student attempts to submit with empty topic, THE System SHALL display a validation error indicating topic is required
5. WHEN a student submits valid material, THE System SHALL send a POST request to /api/students/{id}/material with the content and topic
6. WHEN the material upload succeeds, THE System SHALL store the returned material_id for subsequent operations
7. WHEN the material upload succeeds, THE System SHALL proceed to request teacher matching
8. WHEN the material upload succeeds, THE System SHALL navigate to the matching carousel page with the student persona, material_id, and ranked teachers
9. IF the material upload fails, THE System SHALL display an error message and allow the student to retry

### Requirement 6: Teacher Matching

**User Story:** As a student, I want to see teachers ranked by compatibility with my learning style, so that I can find the best-fit instructor.

#### Acceptance Criteria

1. WHEN a student uploads learning material, THE Matching_Service SHALL calculate compatibility scores for all available teachers
2. THE Matching_Service SHALL use weighted Manhattan distance to calculate compatibility, with dimension weights of 3x for critical dimensions (pace, cognitive_load_tolerance, verbal_density, structure), 2x for important dimensions (interactivity, abstraction, feedback_style, autonomy, real_world_need, attention_span), and 1x for all other dimensions
3. THE Matching_Service SHALL convert distance to a 0-100 compatibility score using the formula: score = 100 / (1 + totalDistance)
4. THE Matching_Service SHALL round compatibility scores to 2 decimal places
5. THE Matching_Service SHALL sort teachers by compatibility score in descending order
6. THE Matching_Service SHALL identify the 3 best-matching dimensions (lowest weighted distance) for each teacher
7. THE Matching_Service SHALL identify the 2 worst-matching dimensions (highest weighted distance) for each teacher
8. THE Matching_Service SHALL return a ranked list of teachers with compatibility scores and match explanations

### Requirement 7: 3D Carousel Display

**User Story:** As a student, I want to explore teacher matches through an immersive 3D carousel, so that I can visually browse my options.

#### Acceptance Criteria

1. THE Carousel_Interface SHALL display exactly 3 doors at any time: one center door and two side doors
2. THE Carousel_Interface SHALL apply scale(1.1) transform to the center door
3. THE Carousel_Interface SHALL apply scale(0.85) and translateZ(-200px) transforms to side doors
4. THE Carousel_Interface SHALL apply a 4-pixel Gaussian blur filter to side doors
5. THE Carousel_Interface SHALL set opacity to 1.0 for the center door and 0.7 for side doors
6. THE Carousel_Interface SHALL display the teacher name and compatibility percentage on the center door
7. WHEN the carousel contains N teachers, THE Carousel_Interface SHALL support wraparound navigation (index N-1 wraps to 0, index 0 wraps to N-1)

### Requirement 8: Carousel Navigation

**User Story:** As a student, I want to swipe or drag through teacher matches, so that I can easily browse all options.

#### Acceptance Criteria

1. WHEN a student initiates a drag gesture, THE Carousel_Interface SHALL track the horizontal drag offset
2. WHEN a student drags horizontally, THE Carousel_Interface SHALL provide visual feedback by translating the carousel
3. WHEN a student releases a drag with offset greater than 150 pixels, THE Carousel_Interface SHALL rotate the carousel in the drag direction
4. WHEN a student releases a drag with offset less than or equal to 150 pixels, THE Carousel_Interface SHALL snap the carousel back to center position
5. WHEN the carousel is animating, THE Carousel_Interface SHALL ignore new drag gestures until the animation completes
6. THE Carousel_Interface SHALL complete rotation animations in 600 milliseconds
7. THE Carousel_Interface SHALL smoothly animate scale, position, blur, and opacity changes during rotation

### Requirement 9: Carousel Rotation Consistency

**User Story:** As a student, I want carousel navigation to be predictable, so that I can reliably browse teachers.

#### Acceptance Criteria

1. WHEN a student rotates right then left, THE Carousel_Interface SHALL return to the original center teacher
2. WHEN rotating right from index i, THE Carousel_Interface SHALL display teacher at index (i + 1) % N in the center
3. WHEN rotating left from index i, THE Carousel_Interface SHALL display teacher at index (i - 1 + N) % N in the center
4. THE Carousel_Interface SHALL maintain the active index within the range [0, N-1] at all times

### Requirement 10: Teacher Selection

**User Story:** As a student, I want to select a teacher from the carousel, so that I can view their demo content.

#### Acceptance Criteria

1. WHEN a student clicks the center door, THE Carousel_Interface SHALL initiate a door swing animation
2. THE Carousel_Interface SHALL rotate the door 90 degrees on the Y-axis over 800 milliseconds with ease-out timing
3. WHEN the door swing animation completes, THE System SHALL navigate to the teacher demo page
4. THE System SHALL pass the selected teacher's ID, the student's ID, and the material_id to the demo page
5. THE System SHALL trigger demo generation for the selected student-teacher-material combination

### Requirement 11: AI Demo Content Generation

**User Story:** As a student, I want the system to generate personalized demo content showing how the selected teacher would teach my uploaded material, so that I can preview the teaching style with my specific learning needs.

#### Acceptance Criteria

1. WHEN a student selects a teacher, THE Demo_Generation_Service SHALL generate demo content based on the student persona, teacher profile, and learning material
2. THE Demo_Generation_Service SHALL generate exactly 3 content modalities: study plan (text), teaching audio, and teaching video
3. THE Demo_Generation_Service SHALL use the student's 24-dimension persona to personalize the teaching approach
4. THE Demo_Generation_Service SHALL use the teacher's 24-dimension profile to match the teacher's teaching style
5. THE Demo_Generation_Service SHALL incorporate the student's uploaded learning material as the subject matter
6. WHILE generating demos, THE Demo_Page SHALL display a loading indicator with generation status
7. WHEN demo generation completes, THE System SHALL store the generated content with references to student_id, teacher_id, and material_id
8. IF demo generation fails, THE System SHALL display an error message and allow the student to retry or return to the carousel

### Requirement 12: Demo Content Display

**User Story:** As a student, I want to view AI-generated demo content in multiple formats, so that I can choose my preferred learning modality.

#### Acceptance Criteria

1. THE Demo_Page SHALL display exactly 3 content modality options: Study Plan, Teaching Audio, and Teaching Video
2. WHEN a student selects a modality option, THE Demo_Page SHALL display the corresponding generated content
3. WHEN displaying a study plan, THE Demo_Page SHALL render the AI-generated content in a formatted text view
4. WHEN displaying teaching audio, THE Demo_Page SHALL embed an audio player with playback controls for the AI-generated audio
5. WHEN displaying teaching video, THE Demo_Page SHALL embed a video player with playback controls for the AI-generated video
6. THE Demo_Page SHALL provide navigation to return to the carousel interface

### Requirement 13: Teacher Dashboard Statistics

**User Story:** As a teacher, I want to view my match statistics, so that I can understand my reach and student compatibility.

#### Acceptance Criteria

1. WHEN a teacher accesses the dashboard, THE Teacher_Dashboard SHALL fetch match statistics via GET /api/teachers/{id}/stats
2. THE Teacher_Dashboard SHALL display the total number of matched students
3. THE Teacher_Dashboard SHALL display a progress bar visualizing the match count
4. THE Teacher_Dashboard SHALL list all matched students with their names and compatibility scores
5. THE Teacher_Dashboard SHALL sort the student list by compatibility score in descending order
6. THE Teacher_Dashboard SHALL display whether the teacher's profile has been generated from video analysis
7. IF the statistics API fails, THE Teacher_Dashboard SHALL display an error message with a retry option

### Requirement 14: Teacher Video Upload for Profile Generation

**User Story:** As a teacher, I want to upload a teaching video so that the system can analyze it and generate my 24-dimension teaching profile for matching with students.

#### Acceptance Criteria

1. THE Teacher_Dashboard SHALL provide a video upload interface accepting mp4, webm, and mov file formats
2. WHEN a teacher selects a video file, THE System SHALL validate the file type on the client side
3. WHEN a teacher selects a video file, THE System SHALL validate the file size is less than 500MB
4. IF file validation fails, THE System SHALL display a specific error message indicating the validation failure reason
5. WHEN a teacher initiates upload, THE System SHALL send the file to POST /api/teachers/{id}/video
6. WHILE uploading, THE System SHALL display a progress indicator showing upload percentage
7. THE System SHALL update the progress indicator at least once per second during upload
8. WHEN upload completes successfully, THE System SHALL trigger video analysis to generate the teacher's profile
9. WHILE analyzing the video, THE System SHALL display an analysis status indicator
10. WHEN video analysis completes, THE Video_Analysis_Service SHALL generate a 24-dimension teacher profile based on teaching style, pace, tone, and other characteristics extracted from the video
11. WHEN profile generation completes, THE System SHALL display a success message and refresh the dashboard statistics
12. IF upload or analysis fails, THE System SHALL display an error message and allow the teacher to retry with the same or different file

### Requirement 15: Data Validation

**User Story:** As a system administrator, I want all data validated, so that the system maintains data integrity.

#### Acceptance Criteria

1. THE System SHALL validate that all student_id values follow the format "stu_[8 hex chars]"
2. THE System SHALL validate that all teacher_id values follow the format "tch_[subject]_[3 digits]"
3. THE System SHALL validate that all material_id values follow the format "mat_[8 hex chars]"
4. THE System SHALL validate that all dimension scores are between 0.0 and 1.0 inclusive
5. THE System SHALL validate that all compatibility scores are between 0 and 100
6. THE System SHALL validate that generated_at and created_at timestamps are valid ISO 8601 format
7. THE System SHALL validate that match explanation "best" arrays contain exactly 3 dimension names
8. THE System SHALL validate that match explanation "worst" arrays contain exactly 2 dimension names
9. THE System SHALL validate that all dimension names in match explanations are valid dimension keys
10. THE System SHALL sanitize all user inputs (student names, quiz responses, learning material content) before saving to the database
11. THE System SHALL validate video file types and sizes on both client and server
12. THE System SHALL validate that learning material content and topic are non-empty strings

### Requirement 16: Performance Optimization

**User Story:** As a student, I want smooth animations and fast loading, so that I have a pleasant user experience.

#### Acceptance Criteria

1. THE Carousel_Interface SHALL use CSS transforms (translateZ, scale) for all position and size changes
2. THE Carousel_Interface SHALL achieve 60 frames per second during animations
3. WHERE the teacher list exceeds 50 items, THE Carousel_Interface SHALL implement virtual scrolling rendering only visible doors plus 2 on each side
4. THE System SHALL use WebP format for door textures with PNG fallback
5. THE System SHALL implement lazy loading for teacher profile images
6. THE System SHALL limit total asset size for the carousel page to less than 2MB
7. THE System SHALL throttle upload progress updates to maximum once per second to avoid excessive re-renders

### Requirement 17: Dimension Completeness

**User Story:** As a system architect, I want all 24 cognitive dimensions captured, so that matching is comprehensive and accurate.

#### Acceptance Criteria

1. THE Persona_Generator SHALL calculate scores for all 24 dimensions: pace, structure, abstraction, interactivity, visual_dependency, verbal_density, repetition_need, formality, humor_receptivity, feedback_style, autonomy, cognitive_load_tolerance, attention_span, motivation_type, error_tolerance, social_preference, real_world_need, emotional_sensitivity, question_comfort, note_taking_style, challenge_preference, context_need, storytelling_affinity, and revision_style
2. THE Persona_Generator SHALL ensure no dimension is undefined in the generated persona
3. THE Video_Analysis_Service SHALL generate scores for all 24 dimensions when creating a teacher profile from video analysis
4. THE Matching_Service SHALL use all 24 dimensions when calculating compatibility scores
5. THE System SHALL validate that both student and teacher personas contain all 24 dimensions before matching

### Requirement 18: Error Recovery

**User Story:** As a user, I want clear error messages and recovery options, so that I can resolve issues and continue using the system.

#### Acceptance Criteria

1. WHEN an API request fails, THE System SHALL display a user-friendly error message describing the issue
2. WHEN an API request fails, THE System SHALL provide a retry option
3. WHEN a network error occurs during video upload, THE System SHALL display a specific network error message
4. WHEN a file validation error occurs during video upload, THE System SHALL display the specific validation failure (file size, format, etc.)
5. WHEN the matching API times out, THE System SHALL allow the student to retry matching without re-taking the quiz or re-uploading material
6. WHEN demo generation fails, THE System SHALL display an error message and allow the student to retry or return to the carousel
7. WHEN video analysis fails, THE System SHALL display an error message and allow the teacher to re-upload a different video

### Requirement 19: Content Metadata

**User Story:** As a system architect, I want content metadata tracked, so that the system can manage and display content appropriately.

#### Acceptance Criteria

1. WHEN storing AI-generated audio or video content, THE System SHALL record the duration in seconds
2. WHEN storing any generated content, THE System SHALL record the file size in bytes
3. WHEN storing any generated content, THE System SHALL record the file format (e.g., mp4, mp3, markdown)
4. WHEN storing any generated content, THE System SHALL record references to student_id, teacher_id, and material_id
5. WHEN storing any generated content, THE System SHALL record an ISO 8601 timestamp in the generated_at field
6. THE System SHALL validate that audio and video content includes duration metadata
7. WHEN storing learning material, THE System SHALL record the content, topic, student_id, and upload timestamp

