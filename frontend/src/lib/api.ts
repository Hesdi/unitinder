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

export async function getTeacher(teacherId: string): Promise<Teacher> {
  const res = await fetch(`${API_URL}/api/teachers/${encodeURIComponent(teacherId)}`);
  if (!res.ok) throw new Error("Failed to fetch teacher");
  return res.json();
}

export async function getLikedTeachers(studentId: string): Promise<{ teachers: Teacher[] }> {
  const res = await fetch(`${API_URL}/api/students/${encodeURIComponent(studentId)}/likes`);
  if (!res.ok) throw new Error("Failed to fetch liked teachers");
  return res.json();
}

export async function addLikedTeacher(studentId: string, teacherId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/students/${encodeURIComponent(studentId)}/likes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teacher_id: teacherId }),
  });
  if (!res.ok) throw new Error("Failed to add liked teacher");
}

export async function removeLikedTeacher(studentId: string, teacherId: string): Promise<void> {
  const res = await fetch(
    `${API_URL}/api/students/${encodeURIComponent(studentId)}/likes/${encodeURIComponent(teacherId)}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Failed to remove liked teacher");
}

export async function getPersonalizedSummary(
  teacherId: string,
  studentPersona: Record<string, number>
): Promise<{ summary: string }> {
  const res = await fetch(`${API_URL}/api/learn/personalized-summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teacherId, studentPersona }),
  });
  if (!res.ok) throw new Error("Failed to get personalized summary");
  return res.json();
}

export async function getModalityPrompts(teacherId: string): Promise<{
  text_prompt: string;
  audio_prompt: string;
  video_prompt: string;
}> {
  const res = await fetch(`${API_URL}/api/learn/prompts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teacherId }),
  });
  if (!res.ok) throw new Error("Failed to get prompts");
  return res.json();
}

export async function createStudyPlan(
  teacherId: string,
  studentPersona: Record<string, number>,
  topic: string
): Promise<{ study_plan: string; text_prompt: string }> {
  const res = await fetch(`${API_URL}/api/learn/study-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teacherId, studentPersona, topic }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { detail?: string }).detail ?? "Failed to create study plan";
    throw new Error(typeof message === "string" ? message : "Failed to create study plan");
  }
  return res.json();
}

export interface Teacher {
  teacher_id: string;
  name: string;
  subject: string;
  archetype: string;
  tagline: string;
  summary: string;
  persona: Record<string, number>;
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
  "Analysis",
  "Algorithms and Data Structures",
  "Cryptography",
  "Statistics",
  "Databases",
] as const;
