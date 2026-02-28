"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getLikedTeachers,
  removeLikedTeacher,
  type Teacher,
} from "@/lib/api";
import { getCurrentStudent } from "@/lib/current-student";
import type { Student } from "@/lib/api";

export default function SavedPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setStudent(getCurrentStudent());
  }, []);

  useEffect(() => {
    if (!student) {
      setTeachers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getLikedTeachers(student.student_id)
      .then((data) => setTeachers(data.teachers))
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load saved teachers")
      )
      .finally(() => setLoading(false));
  }, [student]);

  const handleRemove = async (teacherId: string) => {
    if (!student) return;
    try {
      await removeLikedTeacher(student.student_id, teacherId);
      setTeachers((prev) => prev.filter((t) => t.teacher_id !== teacherId));
    } catch {
      setError("Failed to remove teacher");
    }
  };

  const noStudent = student === null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className="border-b border-border px-4 py-4 sm:px-6"
        style={{ background: "var(--tinder-gradient)" }}
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xl font-semibold text-white drop-shadow-sm"
          >
            <Heart className="h-6 w-6 fill-white" />
            Unitinder
          </Link>
          <Link
            href="/match"
            className="text-sm font-medium text-white/90 hover:text-white"
          >
            Match
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-semibold">My teachers</h1>

        {error && (
          <p className="mb-4 text-sm text-destructive">{error}</p>
        )}

        {noStudent && (
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground">
                Take the quiz first to get your learning profile, then come back here.
              </p>
              <Button asChild className="mt-4 bg-[var(--tinder-pink)] text-white hover:opacity-90">
                <Link href="/quiz">Take the quiz</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {student && (
          <>
            {loading && (
              <p className="text-muted-foreground text-sm">Loading saved teachers…</p>
            )}

            {!loading && teachers.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    No saved teachers yet. Like teachers on the Match page to see
                    them here.
                  </p>
                  <Button asChild className="text-white hover:opacity-90" style={{ background: "var(--tinder-gradient)" }}>
                    <Link href="/match">Match with teachers</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {!loading && teachers.length > 0 && (
              <ul className="space-y-4">
                {teachers.map((teacher) => (
                  <li key={teacher.teacher_id}>
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                        <div
                          className="h-24 w-full flex-shrink-0"
                          style={{ background: "var(--tinder-gradient)" }}
                        />
                        <div className="px-4 py-3">
                          <h3 className="text-lg font-semibold text-foreground">
                            {teacher.name} · {teacher.subject}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {teacher.archetype}
                          </p>
                          {teacher.tagline && (
                            <p className="mt-1 text-sm italic text-muted-foreground line-clamp-1">
                              {teacher.tagline}
                            </p>
                          )}
                          <p className="mt-2 line-clamp-2 text-sm text-foreground">
                            {teacher.summary}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button asChild size="sm" className="text-white hover:opacity-90" style={{ background: "var(--tinder-gradient)" }}>
                              <Link
                                href={`/learn/${teacher.teacher_id}`}
                                className="inline-flex items-center gap-1.5"
                              >
                                <BookOpen className="h-4 w-4" />
                                Generate study material
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-muted-foreground/30 text-muted-foreground hover:bg-muted"
                              onClick={() => handleRemove(teacher.teacher_id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1.5" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}
