/**
 * Unitinder — 20-question student questionnaire (ported from student-quiz/questions.js).
 * Each option maps to 1–3 dimensions (0.0–1.0). Final persona = average per dimension.
 */

export const DIMENSION_KEYS = [
  "pace",
  "structure",
  "abstraction",
  "interactivity",
  "visual_dependency",
  "verbal_density",
  "repetition_need",
  "formality",
  "humor_receptivity",
  "feedback_style",
  "autonomy",
  "cognitive_load_tolerance",
  "attention_span",
  "motivation_type",
  "error_tolerance",
  "social_preference",
  "real_world_need",
  "emotional_sensitivity",
  "question_comfort",
  "note_taking_style",
  "challenge_preference",
  "context_need",
  "storytelling_affinity",
  "revision_style",
] as const;

export type DimensionKey = (typeof DIMENSION_KEYS)[number];

export interface QuestionOption {
  label: string;
  text: string;
  dimensions: Record<string, number>;
}

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

/**
 * Full 20-question set (kept for reference)
 */
export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "You're learning something brand new. What's your ideal first 5 minutes?",
    options: [
      { label: "A", text: '"Give me the big picture — why does this matter and where does it fit?"', dimensions: { context_need: 0.9, abstraction: 0.6 } },
      { label: "B", text: '"Jump straight into an example I can follow along with"', dimensions: { context_need: 0.2, abstraction: 0.2, real_world_need: 0.8 } },
      { label: "C", text: '"Walk me through the key terms and definitions first"', dimensions: { context_need: 0.5, structure: 0.2, verbal_density: 0.6 } },
      { label: "D", text: '"Let me try something hands-on and explain as I go"', dimensions: { context_need: 0.1, autonomy: 0.8, interactivity: 0.7 } },
    ],
  },
  {
    id: 2,
    text: "A teacher is explaining a complex concept. You're starting to lose the thread. What helps most?",
    options: [
      { label: "A", text: '"Slow down and repeat it with different words"', dimensions: { pace: 0.2, repetition_need: 0.9 } },
      { label: "B", text: '"Draw a diagram or show me a visual"', dimensions: { visual_dependency: 0.9, abstraction: 0.2 } },
      { label: "C", text: '"Give me a real-world analogy"', dimensions: { real_world_need: 0.8, storytelling_affinity: 0.7 } },
      { label: "D", text: '"Let me sit with it — I\'ll figure it out if you give me a minute"', dimensions: { autonomy: 0.9, cognitive_load_tolerance: 0.6 } },
    ],
  },
  {
    id: 3,
    text: "How do you feel about being wrong in front of others?",
    options: [
      { label: "A", text: '"I hate it — I\'d rather not answer than risk being wrong"', dimensions: { error_tolerance: 0.1, question_comfort: 0.2, social_preference: 0.2 } },
      { label: "B", text: '"It\'s uncomfortable but I get over it quickly"', dimensions: { error_tolerance: 0.4, question_comfort: 0.5 } },
      { label: "C", text: '"I don\'t mind — mistakes are how I learn"', dimensions: { error_tolerance: 0.7, question_comfort: 0.7 } },
      { label: "D", text: '"I almost prefer it — being corrected makes the lesson stick"', dimensions: { error_tolerance: 0.9, feedback_style: 0.8, challenge_preference: 0.8 } },
    ],
  },
  {
    id: 4,
    text: "It's a 90-minute class. What's your energy like?",
    options: [
      { label: "A", text: '"I\'m checked out after 15 minutes unless there\'s a break or shift"', dimensions: { attention_span: 0.1, interactivity: 0.7 } },
      { label: "B", text: '"I can do 30 minutes focused, then I need a change of pace"', dimensions: { attention_span: 0.4, pace: 0.4 } },
      { label: "C", text: '"I\'m good for about an hour if the content is engaging"', dimensions: { attention_span: 0.7, motivation_type: 0.6 } },
      { label: "D", text: '"I can lock in for the whole thing if it\'s interesting"', dimensions: { attention_span: 0.9, cognitive_load_tolerance: 0.7 } },
    ],
  },
  {
    id: 5,
    text: "Your teacher cracks a joke mid-lecture. How do you feel?",
    options: [
      { label: "A", text: '"Annoyed — we\'re here to learn, not laugh"', dimensions: { humor_receptivity: 0.1, formality: 0.8 } },
      { label: "B", text: '"Neutral — I don\'t mind but it doesn\'t help me"', dimensions: { humor_receptivity: 0.3 } },
      { label: "C", text: '"Nice break — helps me reset my focus"', dimensions: { humor_receptivity: 0.7, attention_span: 0.4 } },
      { label: "D", text: '"Love it — I remember lessons better when they\'re funny"', dimensions: { humor_receptivity: 0.9, emotional_sensitivity: 0.6 } },
    ],
  },
  {
    id: 6,
    text: "You got a bad grade. What kind of feedback do you want?",
    options: [
      { label: "A", text: '"Be gentle — tell me what I did right first, then what to improve"', dimensions: { feedback_style: 0.1, emotional_sensitivity: 0.7 } },
      { label: "B", text: '"Be clear — just tell me exactly what went wrong so I can fix it"', dimensions: { feedback_style: 0.6, emotional_sensitivity: 0.3 } },
      { label: "C", text: '"Be blunt — don\'t sugarcoat it, I can take it"', dimensions: { feedback_style: 0.9, emotional_sensitivity: 0.1 } },
      { label: "D", text: '"Ask me what I think went wrong before telling me"', dimensions: { feedback_style: 0.5, autonomy: 0.7, interactivity: 0.6 } },
    ],
  },
  {
    id: 7,
    text: "When studying for an exam, what's your go-to method?",
    options: [
      { label: "A", text: '"Reread my notes and highlight key points"', dimensions: { revision_style: 0.3, note_taking_style: 0.7, visual_dependency: 0.3 } },
      { label: "B", text: '"Make flashcards or diagrams and test myself"', dimensions: { revision_style: 0.7, visual_dependency: 0.7, autonomy: 0.6 } },
      { label: "C", text: '"Teach the material to someone else or explain it out loud"', dimensions: { social_preference: 0.8, interactivity: 0.7, verbal_density: 0.5 } },
      { label: "D", text: '"Do practice problems until I can solve them without thinking"', dimensions: { real_world_need: 0.8, repetition_need: 0.7, autonomy: 0.7 } },
    ],
  },
  {
    id: 8,
    text: "A teacher assigns a project with no instructions — just a topic. How do you feel?",
    options: [
      { label: "A", text: '"Panicked — I need structure and clear expectations"', dimensions: { structure: 0.1, autonomy: 0.1 } },
      { label: "B", text: '"Nervous but I\'d manage with some guidelines"', dimensions: { structure: 0.3, autonomy: 0.4 } },
      { label: "C", text: '"Excited — I like the creative freedom"', dimensions: { structure: 0.7, autonomy: 0.8 } },
      { label: "D", text: '"This is my ideal assignment"', dimensions: { structure: 0.9, autonomy: 0.9, challenge_preference: 0.7 } },
    ],
  },
  {
    id: 9,
    text: "How much technical jargon can you handle?",
    options: [
      { label: "A", text: '"Keep it simple — explain like I\'m 12"', dimensions: { verbal_density: 0.1, cognitive_load_tolerance: 0.2 } },
      { label: "B", text: '"Some technical terms are fine if you define them first"', dimensions: { verbal_density: 0.4, context_need: 0.6 } },
      { label: "C", text: '"I like precise language — use the proper terms"', dimensions: { verbal_density: 0.7, formality: 0.6 } },
      { label: "D", text: '"The more technical the better — I\'ll look up what I don\'t know"', dimensions: { verbal_density: 0.9, autonomy: 0.7, cognitive_load_tolerance: 0.8 } },
    ],
  },
  {
    id: 10,
    text: "Pick the sentence that sounds most like your ideal teacher:",
    options: [
      { label: "A", text: '"Let me tell you a story about when this happened in the real world..."', dimensions: { storytelling_affinity: 0.9, real_world_need: 0.7 } },
      { label: "B", text: '"Step one. Then step two. Then step three. Questions?"', dimensions: { structure: 0.1, pace: 0.6, storytelling_affinity: 0.1 } },
      { label: "C", text: '"What do YOU think happens next? Why?"', dimensions: { interactivity: 0.9, autonomy: 0.6, question_comfort: 0.7 } },
      { label: "D", text: '"Here\'s the data — let\'s look at what it tells us"', dimensions: { abstraction: 0.5, visual_dependency: 0.6, storytelling_affinity: 0.2 } },
    ],
  },
  {
    id: 11,
    text: "Group project or solo work?",
    options: [
      { label: "A", text: '"Solo — every time, no exceptions"', dimensions: { social_preference: 0, autonomy: 0.9 } },
      { label: "B", text: '"Solo for the thinking, group for the feedback"', dimensions: { social_preference: 0.3, autonomy: 0.7 } },
      { label: "C", text: '"Groups are fine if everyone pulls their weight"', dimensions: { social_preference: 0.6 } },
      { label: "D", text: '"I learn best bouncing ideas off people"', dimensions: { social_preference: 0.9, interactivity: 0.7 } },
    ],
  },
  {
    id: 12,
    text: "How do you feel about a teacher who pushes you outside your comfort zone?",
    options: [
      { label: "A", text: '"I shut down — I need to feel safe to learn"', dimensions: { challenge_preference: 0.1, emotional_sensitivity: 0.8, error_tolerance: 0.2 } },
      { label: "B", text: '"A little push is fine, but not too much"', dimensions: { challenge_preference: 0.4, emotional_sensitivity: 0.5 } },
      { label: "C", text: '"I need it — comfort zone = stagnation"', dimensions: { challenge_preference: 0.8, motivation_type: 0.7 } },
      { label: "D", text: '"The harder the challenge, the more engaged I am"', dimensions: { challenge_preference: 0.9, cognitive_load_tolerance: 0.8, motivation_type: 0.9 } },
    ],
  },
  {
    id: 13,
    text: "You're reading a textbook chapter. What do you do?",
    options: [
      { label: "A", text: '"Read it once, front to back, done"', dimensions: { revision_style: 0.1, pace: 0.7 } },
      { label: "B", text: '"Read it, then go back and reread the hard parts"', dimensions: { revision_style: 0.5, repetition_need: 0.6 } },
      { label: "C", text: '"Skip around to the parts that seem important, then fill gaps"', dimensions: { structure: 0.7, autonomy: 0.7, revision_style: 0.6 } },
      { label: "D", text: '"Read it, summarize it in my own words, read it again"', dimensions: { revision_style: 0.9, repetition_need: 0.8, note_taking_style: 0.8 } },
    ],
  },
  {
    id: 14,
    text: "A teacher gives you printed slides before the lecture. How do you feel?",
    options: [
      { label: "A", text: '"Essential — I need them to follow along"', dimensions: { note_taking_style: 0.1, structure: 0.2, cognitive_load_tolerance: 0.3 } },
      { label: "B", text: '"Nice to have — I\'ll annotate them with my own notes"', dimensions: { note_taking_style: 0.4 } },
      { label: "C", text: '"I\'d rather take my own notes from scratch"', dimensions: { note_taking_style: 0.7, autonomy: 0.6 } },
      { label: "D", text: '"I don\'t really use them — I learn by listening"', dimensions: { note_taking_style: 0.9, visual_dependency: 0.2 } },
    ],
  },
  {
    id: 15,
    text: "What motivates you to study?",
    options: [
      { label: "A", text: '"Grades and deadlines — I need external pressure"', dimensions: { motivation_type: 0.1, structure: 0.2 } },
      { label: "B", text: '"Not failing — I study to avoid bad outcomes"', dimensions: { motivation_type: 0.3, error_tolerance: 0.3 } },
      { label: "C", text: '"Understanding — I want to actually get it, not just pass"', dimensions: { motivation_type: 0.7, challenge_preference: 0.5 } },
      { label: "D", text: '"Curiosity — I go down rabbit holes for fun"', dimensions: { motivation_type: 0.9, autonomy: 0.8, cognitive_load_tolerance: 0.7 } },
    ],
  },
  {
    id: 16,
    text: "A teacher shows visible enthusiasm about the topic. Effect on you?",
    options: [
      { label: "A", text: '"Doesn\'t matter — either the content clicks or it doesn\'t"', dimensions: { emotional_sensitivity: 0.1, abstraction: 0.6 } },
      { label: "B", text: '"Slightly nice but not a big factor"', dimensions: { emotional_sensitivity: 0.3 } },
      { label: "C", text: '"It helps a lot — energy is contagious"', dimensions: { emotional_sensitivity: 0.7, humor_receptivity: 0.5 } },
      { label: "D", text: '"Game changer — a passionate teacher makes any topic interesting"', dimensions: { emotional_sensitivity: 0.9, motivation_type: 0.6 } },
    ],
  },
  {
    id: 17,
    text: "How do you feel about silence in a classroom — a teacher pauses and waits after asking a question?",
    options: [
      { label: "A", text: '"Extremely uncomfortable — someone please just answer"', dimensions: { question_comfort: 0.2, pace: 0.7, interactivity: 0.3 } },
      { label: "B", text: '"Awkward but I understand why they do it"', dimensions: { question_comfort: 0.4, interactivity: 0.4 } },
      { label: "C", text: '"I appreciate it — it gives me time to think"', dimensions: { question_comfort: 0.6, pace: 0.3, autonomy: 0.6 } },
      { label: "D", text: '"I usually break the silence and answer"', dimensions: { question_comfort: 0.9, interactivity: 0.8, social_preference: 0.7 } },
    ],
  },
  {
    id: 18,
    text: "Your ideal explanation of a math formula:",
    options: [
      { label: "A", text: '"Show me the formula, explain each part, then do an example"', dimensions: { structure: 0.2, abstraction: 0.4, real_world_need: 0.6 } },
      { label: "B", text: '"Start with a real problem, then show me how the formula solves it"', dimensions: { real_world_need: 0.9, context_need: 0.7, abstraction: 0.2 } },
      { label: "C", text: '"Derive it from first principles so I understand where it comes from"', dimensions: { abstraction: 0.9, cognitive_load_tolerance: 0.8, challenge_preference: 0.7 } },
      { label: "D", text: '"Just give me the formula and 10 practice problems"', dimensions: { autonomy: 0.8, structure: 0.3, real_world_need: 0.5 } },
    ],
  },
  {
    id: 19,
    text: "How many times do you need to hear something before it clicks?",
    options: [
      { label: "A", text: '"Once is usually enough if explained well"', dimensions: { repetition_need: 0.1, cognitive_load_tolerance: 0.8 } },
      { label: "B", text: '"Twice — first time to hear it, second time to get it"', dimensions: { repetition_need: 0.4 } },
      { label: "C", text: '"Three or four — I need it from different angles"', dimensions: { repetition_need: 0.7, revision_style: 0.7 } },
      { label: "D", text: '"Many times — and I need to practice it myself too"', dimensions: { repetition_need: 0.9, revision_style: 0.9, autonomy: 0.5 } },
    ],
  },
  {
    id: 20,
    text: "Last one — pick the classroom vibe you'd thrive in:",
    options: [
      { label: "A", text: '"Quiet, focused, everyone taking notes, professor at the front"', dimensions: { formality: 0.8, social_preference: 0.2, structure: 0.1, interactivity: 0.1 } },
      { label: "B", text: '"Relaxed, some discussion, teacher walks around and checks in"', dimensions: { formality: 0.3, interactivity: 0.5, social_preference: 0.5, emotional_sensitivity: 0.5 } },
      { label: "C", text: '"Energetic, lots of debate, students challenge the teacher"', dimensions: { formality: 0.2, interactivity: 0.9, challenge_preference: 0.7, question_comfort: 0.8 } },
      { label: "D", text: '"Workshop-style — everyone\'s building or making something"', dimensions: { real_world_need: 0.9, autonomy: 0.8, social_preference: 0.6, interactivity: 0.6 } },
    ],
  },
];

/**
 * Curated 5-question subset for quiz redesign
 * Selected to maximize dimension coverage (16+ dimensions)
 * 
 * Question IDs: 1, 3, 7, 12, 18
 * 
 * Dimensions covered:
 * - Q1: context_need, abstraction, real_world_need, autonomy, interactivity, structure, verbal_density
 * - Q3: error_tolerance, question_comfort, social_preference, feedback_style, challenge_preference
 * - Q7: revision_style, note_taking_style, visual_dependency, repetition_need
 * - Q12: challenge_preference, emotional_sensitivity, motivation_type, cognitive_load_tolerance
 * - Q18: structure, abstraction, real_world_need, context_need, autonomy
 * 
 * Total unique dimensions: 16
 */
export const QUIZ_QUESTIONS: Question[] = [
  QUESTIONS[0],  // id: 1
  QUESTIONS[2],  // id: 3
  QUESTIONS[6],  // id: 7
  QUESTIONS[11], // id: 12
  QUESTIONS[17], // id: 18
];
