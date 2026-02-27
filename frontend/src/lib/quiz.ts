import { DIMENSION_KEYS } from "@/data/questions";

export type Persona = Record<string, number>;

/**
 * Accumulate dimension values from selected options; for each dimension, average (default 0.5 if none).
 * Same logic as student-quiz/run-quiz.js aggregatePersona.
 */
export function aggregatePersona(accumulator: Record<string, number[]>): Persona {
  const persona: Persona = {};
  for (const key of DIMENSION_KEYS) {
    const values = accumulator[key];
    if (!values || values.length === 0) {
      persona[key] = 0.5;
    } else {
      const sum = values.reduce((a, b) => a + b, 0);
      persona[key] = Math.round((sum / values.length) * 100) / 100;
    }
  }
  return persona;
}

/**
 * Top 3 and bottom 2 dimensions for archetype/summary. Same as run-quiz.js deriveArchetypeAndSummary.
 */
export function deriveArchetypeAndSummary(persona: Persona): { archetype: string; summary: string } {
  const entries = Object.entries(persona).sort((a, b) => b[1] - a[1]);
  const top = entries.slice(0, 3).map(([k]) => k);
  const low = entries.slice(-2).map(([k]) => k);
  const archetype = "Learner profile";
  const summary = `Strong on: ${top.join(", ")}. Lower on: ${low.join(", ")}. Profile generated from 20-question quiz — use for teacher matching.`;
  return { archetype, summary };
}
