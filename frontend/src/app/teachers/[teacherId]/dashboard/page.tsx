"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Heart, BarChart3, ThumbsUp, Users, Sparkles, ArrowLeft, Mic } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTeacher, getTeacherInsights, cloneTeacherVoice, type Teacher, type TeacherInsights } from "@/lib/api";

function formatDimension(key: string): string {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function TeacherDashboardPage({
  params,
}: {
  params: Promise<{ teacherId: string }>;
}) {
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [insights, setInsights] = useState<TeacherInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [voiceCloneLoading, setVoiceCloneLoading] = useState(false);
  const [voiceCloneError, setVoiceCloneError] = useState("");
  const [voiceCloneSuccess, setVoiceCloneSuccess] = useState(false);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const [t, i] = await Promise.all([getTeacher(id), getTeacherInsights(id)]);
      setTeacher(t);
      setInsights(i);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
      setTeacher(null);
      setInsights(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCloneVoice = useCallback(async () => {
    if (!teacherId || !teacher || !voiceFile) return;
    setVoiceCloneLoading(true);
    setVoiceCloneError("");
    setVoiceCloneSuccess(false);
    try {
      await cloneTeacherVoice(teacherId, teacher.name, voiceFile);
      const updated = await getTeacher(teacherId);
      setTeacher(updated);
      setVoiceCloneSuccess(true);
      setVoiceFile(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Voice clone failed";
      const friendly =
        msg === "Failed to fetch" || msg.includes("NetworkError")
          ? "Could not reach the API. Make sure the backend is running (e.g. uvicorn on port 8765) and CORS allows this origin."
          : msg;
      setVoiceCloneError(friendly);
      console.error("Voice clone failed:", e);
    } finally {
      setVoiceCloneLoading(false);
    }
  }, [teacherId, teacher, voiceFile]);

  useEffect(() => {
    let cancelled = false;
    params.then((p) => {
      if (!cancelled) {
        setTeacherId(p.teacherId);
        load(p.teacherId);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [params, load]);

  if (loading && !teacher) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header
          className="border-b border-border px-4 py-4 sm:px-6"
          style={{ background: "var(--tinder-gradient)" }}
        >
          <div className="flex items-center gap-3 text-white">
            <Link href="/teachers" className="rounded p-1 hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="font-semibold">Loading…</span>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-muted-foreground">Loading dashboard…</p>
        </main>
      </div>
    );
  }

  if (error && !teacher) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header
          className="border-b border-border px-4 py-4 sm:px-6"
          style={{ background: "var(--tinder-gradient)" }}
        >
          <Link href="/teachers" className="flex items-center gap-2 text-white">
            <ArrowLeft className="h-5 w-5" />
            Back to teachers
          </Link>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-destructive">{error}</p>
          <Link href="/teachers" className="mt-4 inline-block text-[var(--tinder-pink)] underline">
            Back to teachers
          </Link>
        </main>
      </div>
    );
  }

  const hasInsights = insights && insights.total_likes > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className="border-b border-border px-4 py-4 sm:px-6"
        style={{ background: "var(--tinder-gradient)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <Link
              href="/teachers"
              className="rounded p-1 hover:bg-white/10 transition-colors"
              aria-label="Back to teachers"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold drop-shadow-sm">
                {teacher?.name ?? "Teacher"}
              </h1>
              <p className="text-sm text-white/85">
                {teacher?.subject} · Insights dashboard
              </p>
            </div>
          </div>
          <Badge className="rounded-full bg-white/20 text-white border-0">
            <BarChart3 className="mr-1 h-3.5 w-3.5" />
            Dashboard
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-8">
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Hero stat: total likes */}
        <Card className="overflow-hidden border-2 border-[var(--tinder-pink)]/20">
          <div
            className="h-2 w-full"
            style={{ background: "var(--tinder-gradient)" }}
          />
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white"
                style={{ background: "var(--tinder-gradient)" }}
              >
                <ThumbsUp className="h-7 w-7" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {insights?.total_likes ?? 0}
                </p>
                <p className="text-muted-foreground">
                  students swiped right on you (no names stored)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teacher voice: upload video/audio to clone voice for TTS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mic className="h-4 w-4 text-[var(--tinder-pink)]" />
              Your voice
            </CardTitle>
            {teacher?.voice_id ? (
              <p className="text-sm text-muted-foreground">
                Your voice is set. Students can generate study-plan audio in your voice on your learn page.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Upload a video or audio file to extract and clone your voice. It will be used for text-to-speech when students generate audio from study plans.
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {!teacher?.voice_id && (
              <>
                <div>
                  <Label htmlFor="dashboard-voice-file">Video or audio file</Label>
                  <Input
                    id="dashboard-voice-file"
                    type="file"
                    accept=".mp4,.mov,.webm,.mp3,.wav,.m4a"
                    className="mt-1"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setVoiceFile(f ?? null);
                      setVoiceCloneError("");
                      setVoiceCloneSuccess(false);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCloneVoice();
                  }}
                  disabled={voiceCloneLoading || !voiceFile}
                  variant="outline"
                  className="border-[var(--tinder-pink)] text-[var(--tinder-pink)] hover:bg-[var(--tinder-pink)]/10"
                >
                  {voiceCloneLoading ? "Cloning…" : "Clone voice from video/audio"}
                </Button>
                {voiceCloneSuccess && (
                  <p className="text-sm text-green-600 dark:text-green-400">Voice cloned successfully.</p>
                )}
                {voiceCloneError && (
                  <p className="text-sm text-destructive font-medium" role="alert">
                    {voiceCloneError}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {!hasInsights && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h2 className="mt-4 text-lg font-semibold">No swipe data yet</h2>
              <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
                When students like you on the Match page, anonymized insights will appear here: archetypes, traits, and how your likers align with your teaching style.
              </p>
              <Link
                href="/teachers"
                className="mt-6 inline-flex items-center gap-2 text-[var(--tinder-pink)] font-medium hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to teachers
              </Link>
            </CardContent>
          </Card>
        )}

        {hasInsights && insights && (
          <>
            {/* Who likes you: archetypes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-[var(--tinder-pink)]" />
                  Who tends to swipe right on you
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Distribution of learning archetypes (anonymous; no student names).
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.archetype_distribution.map(({ archetype, count }) => {
                    const pct = insights.total_likes > 0
                      ? Math.round((count / insights.total_likes) * 100)
                      : 0;
                    return (
                      <div key={archetype} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-foreground">{archetype}</span>
                          <span className="text-muted-foreground">
                            {count} {count === 1 ? "student" : "students"} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: "var(--tinder-gradient)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Traits: where you align vs differ */}
            <Tabs defaultValue="align" className="w-full">
              <TabsList className="w-full grid grid-cols-2 bg-muted p-1">
                <TabsTrigger value="align" className="data-[state=active]:bg-[var(--tinder-pink)] data-[state=active]:text-white data-[state=active]:shadow-sm">
                  Best alignment
                </TabsTrigger>
                <TabsTrigger value="differ" className="data-[state=active]:bg-[var(--tinder-pink)] data-[state=active]:text-white data-[state=active]:shadow-sm">
                  Where you differ
                </TabsTrigger>
              </TabsList>
              <TabsContent value="align" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Traits that match</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Students who like you tend to align with you on these dimensions (same style).
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {insights.top_aligning_traits.map((dim) => (
                        <Badge
                          key={dim}
                          className="bg-[var(--tinder-pink)]/15 text-[var(--tinder-pink)] border border-[var(--tinder-pink)]/30"
                        >
                          {formatDimension(dim)}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="differ" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Where likers differ most</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      These dimensions show the biggest gap between your style and the average student who liked you — they still chose you, so it can show appeal across styles.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {insights.least_aligning_traits.map((dim) => (
                        <Badge
                          key={dim}
                          variant="secondary"
                          className="border border-border"
                        >
                          {formatDimension(dim)}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Alignment detail: you vs likers (first 8 dimensions) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">You vs. average liker</CardTitle>
                <p className="text-sm text-muted-foreground">
                  How your teaching style compares to the average persona of students who swiped right (0 = one end, 1 = other end of each dimension).
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.alignment_detail.slice(0, 8).map(({ dimension, teacher_value, avg_student_value, distance }) => (
                    <div key={dimension} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">
                          {formatDimension(dimension)}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          gap: {(distance * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[var(--tinder-coral)] opacity-80"
                            style={{ width: `${teacher_value * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">
                          you
                        </span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[var(--tinder-pink)] opacity-80"
                            style={{ width: `${avg_student_value * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">
                          likers
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <div className="flex justify-center pt-4">
          <Link
            href="/teachers"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--tinder-pink)] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            All teachers
          </Link>
        </div>
      </main>
    </div>
  );
}
