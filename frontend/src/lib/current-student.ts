import type { Student } from "@/lib/api";

const STORAGE_KEY = "unitinder_current_student";

export function getCurrentStudent(): Student | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Student;
  } catch {
    return null;
  }
}

export function setCurrentStudent(student: Student): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(student));
  } catch {
    // ignore
  }
}

export function clearCurrentStudent(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
