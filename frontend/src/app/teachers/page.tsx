"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, BarChart3, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTeachers, type Teacher } from "@/lib/api";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTeachers()
      .then((data) => setTeachers(data.teachers))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load teachers"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className="border-b border-border px-4 py-4 sm:px-6"
        style={{ background: "var(--tinder-gradient)" }}
      >
        <div className="flex items-center justify-between w-full">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xl font-semibold text-white drop-shadow-sm"
          >
            <Heart className="h-6 w-6 fill-white" />
            Unitinder
          </Link>
          <Badge
            variant="secondary"
            className="rounded-full bg-white/20 text-white border-0"
          >
            <GraduationCap className="mr-1 h-3.5 w-3.5" />
            Teachers
          </Badge>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-2xl font-semibold">Teacher dashboard</h1>
        <p className="mb-8 text-muted-foreground">
          Pick a teacher to see anonymized insights: which kinds of students tend to swipe right on you (no names, only traits and archetypes).
        </p>

        {error && (
          <p className="mb-4 text-sm text-destructive">{error}</p>
        )}

        {loading && (
          <p className="text-muted-foreground">Loading teachers…</p>
        )}

        {!loading && teachers.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No teachers in the system yet.
            </CardContent>
          </Card>
        )}

        {!loading && teachers.length > 0 && (
          <ul className="space-y-4">
            {teachers.map((teacher) => (
              <li key={teacher.teacher_id}>
                <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                  <div
                    className="h-2 w-full flex-shrink-0"
                    style={{ background: "var(--tinder-gradient)" }}
                  />
                  <CardContent className="px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">
                          {teacher.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {teacher.subject} · {teacher.archetype}
                        </p>
                        {teacher.tagline && (
                          <p className="mt-1 text-sm italic text-muted-foreground line-clamp-1">
                            {teacher.tagline}
                          </p>
                        )}
                      </div>
                      <Button
                        asChild
                        size="sm"
                        className="text-white hover:opacity-90 shrink-0"
                        style={{ background: "var(--tinder-gradient)" }}
                      >
                        <Link
                          href={`/teachers/${teacher.teacher_id}/dashboard`}
                          className="inline-flex items-center gap-1.5"
                        >
                          <BarChart3 className="h-4 w-4" />
                          View insights
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
