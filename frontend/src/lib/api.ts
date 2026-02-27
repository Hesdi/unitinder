const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8765";

export async function getStudents(): Promise<{ students: Student[] }> {
  const res = await fetch(`${API_URL}/api/students`);
  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json();
}

export async function createStudent(body: {
  name: string;
  persona: Record<string, number>;
  archetype?: string;
  summary?: string;
}): Promise<Student> {
  const res = await fetch(`${API_URL}/api/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to save student");
  return res.json();
}

export async function matchTeachers(body: {
  studentPersona: Record<string, number>;
  subject?: string | null;
}): Promise<{ ranked: RankedTeacher[] }> {
  const res = await fetch(`${API_URL}/api/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to match teachers");
  return res.json();
}

export interface Student {
  student_id: string;
  name: string;
  generated_at: string;
  persona: Record<string, number>;
  archetype: string;
  summary: string;
}

export interface RankedTeacher {
  teacher_id: string;
  name: string;
  subject: string;
  archetype: string;
  tagline: string;
  summary: string;
  compatibility_score: number;
  why: { best: string[]; worst: string[] };
}

export const SUBJECTS = [
  "Computer Science",
  "Biology",
  "Physics",
  "Chemistry",
  "History",
] as const;
