"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getStudents, matchTeachers, SUBJECTS, type Student, type RankedTeacher } from "@/lib/api";

export default function MatchPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState("");
  const [subject, setSubject] = useState("");
  const [ranked, setRanked] = useState<RankedTeacher[] | null>(null);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudents()
      .then((data) => {
        setStudents(data.students);
        if (data.students.length > 0 && !studentId) setStudentId(data.students[0].student_id);
        if (!subject) setSubject(SUBJECTS[0]);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load students"))
      .finally(() => setLoading(false));
  }, [studentId, subject]);

  const selectedStudent = students.find((s) => s.student_id === studentId);

  const handleMatch = async () => {
    if (!selectedStudent) return;
    setError("");
    setMatching(true);
    setRanked(null);
    try {
      const data = await matchTeachers({
        studentPersona: selectedStudent.persona,
        subject: subject || null,
      });
      setRanked(data.ranked);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to match. Is the API running?");
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <Link href="/" className="text-xl font-semibold">
          Unitinder
        </Link>
        <span className="ml-4 text-muted-foreground">Match</span>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-semibold">Match with teachers</h1>

        {loading && <p className="text-muted-foreground text-sm">Loading students…</p>}
        {error && <p className="mb-4 text-destructive text-sm">{error}</p>}

        {!loading && students.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground">
                No students yet. Take the quiz to add your profile, then come back here.
              </p>
              <Button asChild className="mt-4">
                <Link href="/quiz">Take the quiz</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && students.length > 0 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Choose student and subject</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Student</Label>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="mt-1 flex h-9 w-full max-w-xs items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm"
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
                    className="mt-1 flex h-9 w-full max-w-xs items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  >
                    {SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleMatch} disabled={matching}>
                  {matching ? "Matching…" : "Find teachers"}
                </Button>
              </CardContent>
            </Card>

            {ranked && ranked.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium">Ranked teachers</h2>
                {ranked.map((t) => (
                  <Card key={t.teacher_id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {t.name} · {t.subject}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm">
                        Score: {t.compatibility_score} · {t.archetype}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="italic text-muted-foreground">{t.tagline}</p>
                      <p>{t.summary}</p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <span className="rounded border border-border px-2 py-0.5 text-xs">
                          Best: {t.why.best.join(", ")}
                        </span>
                        <span className="rounded border border-border px-2 py-0.5 text-xs">
                          Worst: {t.why.worst.join(", ")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {ranked && ranked.length === 0 && (
              <p className="text-muted-foreground">No teachers found for this subject.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
