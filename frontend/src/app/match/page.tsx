"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import TinderCard from "react-tinder-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CardSpotlight } from "@/components/ui/aceternity/card-spotlight";
import {
  getStudents,
  matchTeachers,
  SUBJECTS,
  type Student,
  type RankedTeacher,
} from "@/lib/api";

export default function MatchPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState("");
  const [subject, setSubject] = useState("");
  const [ranked, setRanked] = useState<RankedTeacher[] | null>(null);
  const [remainingTeachers, setRemainingTeachers] = useState<RankedTeacher[]>([]);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");
  const [swipeOverlay, setSwipeOverlay] = useState<{
    teacherId: string;
    direction: "left" | "right";
  } | null>(null);

  useEffect(() => {
    getStudents()
      .then((data) => {
        setStudents(data.students);
        if (data.students.length > 0 && !studentId)
          setStudentId(data.students[0].student_id);
        if (!subject) setSubject(SUBJECTS[0]);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load students")
      )
      .finally(() => setLoading(false));
  }, [studentId, subject]);

  const selectedStudent = students.find((s) => s.student_id === studentId);

  const handleMatch = async () => {
    if (!selectedStudent) return;
    setError("");
    setMatching(true);
    setRanked(null);
    setRemainingTeachers([]);
    try {
      const data = await matchTeachers({
        studentPersona: selectedStudent.persona,
        subject: subject || null,
      });
      setRanked(data.ranked);
      setRemainingTeachers(data.ranked);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to match. Is the API running?"
      );
    } finally {
      setMatching(false);
    }
  };

  const handleSwipe = useCallback((teacherId: string, direction: string) => {
    if (direction === "left" || direction === "right") {
      setSwipeOverlay({ teacherId, direction });
    }
  }, []);

  const handleCardLeftScreen = useCallback((teacherId: string) => {
    setRemainingTeachers((prev) => prev.filter((t) => t.teacher_id !== teacherId));
    setSwipeOverlay(null);
  }, []);

  const handleMatchAgain = () => {
    setRanked(null);
    setRemainingTeachers([]);
  };

  const showSwipeStack = ranked && ranked.length > 0;
  const noCardsLeft = showSwipeStack && remainingTeachers.length === 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-semibold">
          Unitinder
        </Link>
        <Badge variant="secondary" className="ml-3 rounded-full">
          Match
        </Badge>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-semibold">Match with teachers</h1>

        {loading && (
          <p className="text-muted-foreground text-sm">Loading students…</p>
        )}
        {error && (
          <p className="text-destructive mb-4 text-sm">{error}</p>
        )}

        {!loading && students.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground">
                No students yet. Take the quiz to add your profile, then come
                back here.
              </p>
              <Button asChild className="mt-4">
                <Link href="/quiz">Take the quiz</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && students.length > 0 && !showSwipeStack && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Choose student and subject
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Student</Label>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="mt-1 flex h-9 w-full max-w-xs items-center justify-between rounded-2xl border border-input bg-transparent px-3 py-2 text-sm"
                  >
                    {students.map((s) => (
                      <option key={s.student_id} value={s.student_id}>
                        {s.name} ({s.student_id})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Subject</Label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1 flex h-9 w-full max-w-xs items-center justify-between rounded-2xl border border-input bg-transparent px-3 py-2 text-sm"
                  >
                    {SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={handleMatch}
                  disabled={matching}
                  className="bg-[var(--gradient-coral)] text-white hover:opacity-90"
                >
                  {matching ? "Matching…" : "Find teachers"}
                </Button>
              </CardContent>
            </Card>

            {ranked !== null && ranked.length === 0 && (
              <p className="text-muted-foreground">
                No teachers found for this subject.
              </p>
            )}
          </div>
        )}

        {showSwipeStack && remainingTeachers.length > 0 && (
          <div className="relative mx-auto h-[520px] w-full max-w-sm">
            {[...remainingTeachers].reverse().map((teacher) => (
              <TinderCard
                key={teacher.teacher_id}
                onSwipe={(dir) => handleSwipe(teacher.teacher_id, dir)}
                onCardLeftScreen={() =>
                  handleCardLeftScreen(teacher.teacher_id)
                }
                preventSwipe={["up", "down"]}
                className="absolute h-full w-full"
              >
                <div className="relative h-full w-full">
                  <CardSpotlight
                    color="var(--gradient-lavender)"
                    radius={280}
                    className="h-full border-0 bg-card shadow-md"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {teacher.name} · {teacher.subject}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm">
                        Score: {teacher.compatibility_score} · {teacher.archetype}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="text-muted-foreground italic">
                        {teacher.tagline}
                      </p>
                      <p>{teacher.summary}</p>
                      <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                        <Link
                          href={
                            studentId
                              ? `/learn/${teacher.teacher_id}?studentId=${studentId}`
                              : `/learn/${teacher.teacher_id}`
                          }
                        >
                          Learn more
                        </Link>
                      </Button>
                    </CardContent>
                  </CardSpotlight>
                  {swipeOverlay?.teacherId === teacher.teacher_id && (
                    <div
                      className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl text-2xl font-bold"
                      style={{
                        backgroundColor:
                          swipeOverlay.direction === "right"
                            ? "rgba(34, 197, 94, 0.85)"
                            : "rgba(239, 68, 68, 0.85)",
                        color: "white",
                      }}
                    >
                      {swipeOverlay.direction === "right" ? "MATCH ✓" : "SKIP ✗"}
                    </div>
                  )}
                </div>
              </TinderCard>
            ))}
          </div>
        )}

        {noCardsLeft && (
          <Card className="mt-8">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                No more teachers. Match again to get a fresh stack.
              </p>
              <Button
                onClick={handleMatchAgain}
                className="bg-[var(--gradient-coral)] text-white hover:opacity-90"
              >
                Match again
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
