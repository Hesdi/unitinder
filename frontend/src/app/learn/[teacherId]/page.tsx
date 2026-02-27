"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getTeacher,
  getStudents,
  getModalityPrompts,
  createStudyPlan,
  type Teacher,
  type Student,
} from "@/lib/api";

export default function LearnPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const teacherId = params?.teacherId as string;
  const studentId = searchParams?.get("studentId") ?? null;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [topic, setTopic] = useState("");
  const [studyPlan, setStudyPlan] = useState("");
  const [studyPlanLoading, setStudyPlanLoading] = useState(false);

  const [prompts, setPrompts] = useState<{
    text_prompt: string;
    audio_prompt: string;
    video_prompt: string;
  } | null>(null);
  const [promptsLoading, setPromptsLoading] = useState(false);

  useEffect(() => {
    if (!teacherId) return;
    getTeacher(teacherId)
      .then(setTeacher)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load teacher"))
      .finally(() => setLoading(false));
  }, [teacherId]);

  useEffect(() => {
    if (!studentId || !teacher) return;
    getStudents()
      .then(({ students }) => students.find((s) => s.student_id === studentId) ?? null)
      .then(setStudent)
      .catch(() => setStudent(null));
  }, [studentId, teacher]);

  const handleGenerateStudyPlan = async () => {
    if (!teacherId || !topic.trim()) return;
    const persona = student?.persona ?? {};
    setStudyPlanLoading(true);
    setStudyPlan("");
    try {
      const { study_plan } = await createStudyPlan(teacherId, persona, topic.trim());
      setStudyPlan(study_plan || "No plan generated. Check that the API key is set.");
    } catch (e) {
      setStudyPlan(
        e instanceof Error ? e.message : "Failed to generate study plan. Is the API running?"
      );
    } finally {
      setStudyPlanLoading(false);
    }
  };

  const handleGetPrompts = async () => {
    if (!teacherId) return;
    setPromptsLoading(true);
    setPrompts(null);
    try {
      const data = await getModalityPrompts(teacherId);
      setPrompts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get prompts");
    } finally {
      setPromptsLoading(false);
    }
  };

  if (loading || !teacher) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border px-4 py-4 sm:px-6">
          <Link href="/match" className="text-xl font-semibold">
            Unitinder
          </Link>
        </header>
        <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          {loading ? (
            <p className="text-muted-foreground">Loading teacher…</p>
          ) : (
            <p className="text-destructive">{error || "Teacher not found"}</p>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 py-4 sm:px-6">
        <Link href="/match" className="text-xl font-semibold">
          Unitinder
        </Link>
        <span className="ml-3 text-muted-foreground">Learn more</span>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-8">
        {error && (
          <p className="text-destructive text-sm">{error}</p>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {teacher.name} · {teacher.subject}
            </CardTitle>
            <p className="text-muted-foreground text-sm">{teacher.archetype}</p>
            <p className="text-sm italic">{teacher.tagline}</p>
            <p className="text-sm">{teacher.summary}</p>
            {student && (
              <p className="text-muted-foreground text-xs">
                Personalized for: {student.name}
              </p>
            )}
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Study plan</CardTitle>
            <p className="text-muted-foreground text-sm">
              Get a study plan in this teacher&apos;s style. Optionally select a student on the Match page and use &quot;Learn more&quot; to personalize.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g. Cellular Respiration"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleGenerateStudyPlan}
              disabled={studyPlanLoading || !topic.trim()}
              className="bg-[var(--gradient-coral)] text-white hover:opacity-90"
            >
              {studyPlanLoading ? "Generating…" : "Generate study plan"}
            </Button>
            {studyPlan && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                {studyPlan}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Audio &amp; video prompts</CardTitle>
            <p className="text-muted-foreground text-sm">
              Generate system prompts for text, audio, and video content in this teacher&apos;s style. Use these with TTS or video models.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleGetPrompts}
              disabled={promptsLoading}
              variant="outline"
            >
              {promptsLoading ? "Generating…" : "Get text / audio / video prompts"}
            </Button>
            {prompts && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Text (study plan) prompt</Label>
                  <pre className="mt-1 max-h-40 overflow-auto rounded border border-border bg-muted/30 p-3 text-xs whitespace-pre-wrap">
                    {prompts.text_prompt || "—"}
                  </pre>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Audio prompt</Label>
                  <pre className="mt-1 max-h-40 overflow-auto rounded border border-border bg-muted/30 p-3 text-xs whitespace-pre-wrap">
                    {prompts.audio_prompt || "—"}
                  </pre>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Video prompt</Label>
                  <pre className="mt-1 max-h-40 overflow-auto rounded border border-border bg-muted/30 p-3 text-xs whitespace-pre-wrap">
                    {prompts.video_prompt || "—"}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button asChild variant="outline">
          <Link href="/match">Back to matching</Link>
        </Button>
      </main>
    </div>
  );
}
