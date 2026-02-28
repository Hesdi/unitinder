"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SwipeStack } from "@/components/swipe-stack";
import {
  matchTeachers,
  addLikedTeacher,
  SUBJECTS,
  type RankedTeacher,
} from "@/lib/api";
import { getCurrentStudent } from "@/lib/current-student";
import type { Student } from "@/lib/api";

export default function MatchPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [subject, setSubject] = useState("");
  const [ranked, setRanked] = useState<RankedTeacher[] | null>(null);
  const [remainingTeachers, setRemainingTeachers] = useState<RankedTeacher[]>([]);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setStudent(getCurrentStudent());
    setSubject(SUBJECTS[0]);
  }, []);

  const handleMatch = async () => {
    if (!student) return;
    setError("");
    setMatching(true);
    setRanked(null);
    setRemainingTeachers([]);
    try {
      const data = await matchTeachers({
        studentPersona: student.persona,
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

  const handleSwipe = useCallback((teacherId: string, direction: "left" | "right") => {
    if (direction === "right" && student) {
      addLikedTeacher(student.student_id, teacherId).catch(() => {});
    }
    setRemainingTeachers((prev) => prev.filter((t) => t.teacher_id !== teacherId));
  }, [student]);

  const handleMatchAgain = () => {
    setRanked(null);
    setRemainingTeachers([]);
  };

  const showSwipeStack = ranked && ranked.length > 0;
  const noCardsLeft = showSwipeStack && remainingTeachers.length === 0;
  const noStudent = student === null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className="border-b border-border px-4 py-4 sm:px-6"
        style={{ background: "var(--tinder-gradient)" }}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xl font-semibold text-white drop-shadow-sm"
            >
              <Heart className="h-6 w-6 fill-white" />
              Unitinder
            </Link>
            <Badge
              variant="secondary"
              className="ml-3 rounded-full bg-white/20 text-white border-0"
            >
              Match
            </Badge>
          </div>
          <Link
            href="/saved"
            className="text-sm font-medium text-white/90 hover:text-white"
          >
            My teachers
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-semibold">Match with teachers</h1>

        {error && (
          <p className="text-destructive mb-4 text-sm">{error}</p>
        )}

        {noStudent && (
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground">
                Take the quiz first to get your learning profile, then come back here.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button asChild className="bg-[var(--tinder-pink)] text-white hover:opacity-90" style={{ background: "var(--tinder-gradient)" }}>
                  <Link href="/quiz">Take the quiz</Link>
                </Button>
                <span className="text-muted-foreground text-sm">or</span>
                <Link
                  href="/teachers"
                  className="text-sm font-medium text-[var(--tinder-pink)] underline underline-offset-2 hover:opacity-90"
                >
                  I&apos;m a teacher — view my dashboard
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {student && !showSwipeStack && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Choose subject
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  className="bg-[var(--tinder-pink)] text-white hover:opacity-90"
                  style={{ background: "var(--tinder-gradient)" }}
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
          <div className="flex flex-col items-center justify-center">
            <SwipeStack
              teachers={remainingTeachers}
              studentId={student?.student_id ?? null}
              onSwipe={handleSwipe}
            />
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
                className="text-white hover:opacity-90"
                style={{ background: "var(--tinder-gradient)" }}
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
