"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getTeacher,
  getStudents,
  getModalityPrompts,
  createStudyPlan,
  getPersonalizedSummary,
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
  const [personalizedSummary, setPersonalizedSummary] = useState<string | null>(null);
  const [personalizedSummaryLoading, setPersonalizedSummaryLoading] = useState(false);

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

  useEffect(() => {
    if (!teacherId || !student?.persona) {
      setPersonalizedSummary(null);
      setPersonalizedSummaryLoading(false);
      return;
    }
    setPersonalizedSummary(null);
    setPersonalizedSummaryLoading(true);
    getPersonalizedSummary(teacherId, student.persona)
      .then(({ summary }) => {
        setPersonalizedSummary(summary);
        setPersonalizedSummaryLoading(false);
      })
      .catch(() => {
        setPersonalizedSummary(null);
        setPersonalizedSummaryLoading(false);
      });
  }, [teacherId, student?.student_id]);

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

  /** Use AI-generated Outline block if present (main sections only); else fall back to filtering out subsection noise. */
  const studyPlanTitles = (() => {
    if (!studyPlan?.trim()) return [];
    const lines = studyPlan.split(/\r?\n/);
    const outlineHeader = /^\s*(Outline|Table of Contents)\s*$/i;
    const subsectionLabels = /^(Core Ideas|Emphasis|Proof Component|Problem Set|Reflection|Conceptual Anchor|Theorem Focus|Weekly Structure|Final Integration Exercise)$/i;
    // 1) Look for "Outline" or "Table of Contents" then take following lines until a blank line (main sections only).
    const headerIdx = lines.findIndex((l) => outlineHeader.test(l.trim()));
    if (headerIdx >= 0) {
      const outlineLines: string[] = [];
      for (let i = headerIdx + 1; i < lines.length; i++) {
        const t = lines[i].trim();
        if (!t) break;
        if (subsectionLabels.test(t)) continue;
        outlineLines.push(t.replace(/^#+\s*/, "").trim());
      }
      if (outlineLines.length > 0) return outlineLines;
    }
    // 2) Fallback: only lines that look like main sections (Week N:, Chapter N:, Part N:) and skip subsection labels.
    const mainSection = /^\s*(Week\s+\d+[\s–:-]|Chapter\s+\d+|Part\s+\d+)/i;
    const titles: string[] = [];
    for (const line of lines) {
      const t = line.trim().replace(/^#+\s*/, "");
      if (!t || subsectionLabels.test(t)) continue;
      if (mainSection.test(t)) titles.push(t.trim());
    }
    return titles;
  })();

  /** Strip emoji and other chars that render as junk in default PDF font. */
  const stripForPdf = (text: string) =>
    text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/gu, "").replace(/\s+/g, " ").trim();

  const handleDownloadPdf = () => {
    if (!studyPlan || !teacher || !topic.trim()) return;
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 6;
    let y = margin;

    doc.setFontSize(18);
    doc.text("Study Plan", margin, y);
    y += lineHeight * 2;

    doc.setFontSize(11);
    doc.text(stripForPdf(`${teacher.name} · ${teacher.subject}`), margin, y);
    y += lineHeight;
    doc.text(stripForPdf(`Topic: ${topic.trim()}`), margin, y);
    y += lineHeight * 2;

    doc.setFontSize(10);
    const cleanPlan = studyPlan.split(/\r?\n/).map((line) => stripForPdf(line)).join("\n");
    const lines = doc.splitTextToSize(cleanPlan, maxWidth);
    for (let i = 0; i < lines.length; i++) {
      if (y > pageHeight - margin - lineHeight) {
        doc.addPage();
        y = margin;
      }
      doc.text(lines[i], margin, y);
      y += lineHeight;
    }

    const slug = topic.trim().replace(/[^a-z0-9]+/gi, "-").slice(0, 40) || "study-plan";
    doc.save(`study-plan-${slug}.pdf`);
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
            <p className="text-sm">
              {personalizedSummaryLoading
                ? "Loading personalized summary…"
                : personalizedSummary ?? teacher.summary}
            </p>
            {studentId && !student && (
              <p className="text-muted-foreground text-xs">
                Could not load student profile. Select a student on Match and use Learn more to see a personalized summary.
              </p>
            )}
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
              <div className="space-y-4">
                <Button
                  type="button"
                  onClick={handleDownloadPdf}
                  variant="outline"
                  size="sm"
                >
                  Download PDF
                </Button>
                {studyPlanTitles.length > 0 && (
                  <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Outline
                    </p>
                    <ul className="space-y-2">
                      {studyPlanTitles.map((title, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-foreground"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                            {i + 1}
                          </span>
                          <span className="pt-0.5">{title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
