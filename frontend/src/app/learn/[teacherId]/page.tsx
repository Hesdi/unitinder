"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { jsPDF } from "jspdf";
import { marked } from "marked";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getTeacher,
  getModalityPrompts,
  createStudyPlan,
  getPersonalizedSummary,
  type Teacher,
  type Student,
} from "@/lib/api";
import { getCurrentStudent } from "@/lib/current-student";

export default function LearnPage() {
  const params = useParams();
  const teacherId = params?.teacherId as string;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [topic, setTopic] = useState("");
  const [studyPlan, setStudyPlan] = useState("");
  const [studyPlanError, setStudyPlanError] = useState("");
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
    setStudent(getCurrentStudent());
  }, []);

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
    setStudyPlanError("");
    try {
      const { study_plan } = await createStudyPlan(teacherId, persona, topic.trim());
      if (study_plan?.trim()) {
        setStudyPlan(study_plan);
      } else {
        setStudyPlanError("No plan generated. Check that the API key is set.");
      }
    } catch (e) {
      setStudyPlanError(
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

  /** Convert markdown to plain text (strip #, **, *, [](), `, list markers). */
  const markdownToPlainText = (md: string): string =>
    md
      .split(/\r?\n/)
      .map((line) => {
        let s = line.replace(/^#+\s*/, "").trim();
        s = s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/__(.+?)__/g, "$1").replace(/_(.+?)_/g, "$1");
        s = s.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
        s = s.replace(/`([^`]*)`/g, "$1");
        s = s.replace(/^\s*[-*]\s+/, "").replace(/^\s*\d+\.\s+/, "");
        return stripForPdf(s);
      })
      .join("\n");

  /** Strip inline markdown for one line (links, backticks); keep ** for formatted PDF. */
  const stripInlineForFormattedPdf = (line: string): string => {
    let s = stripForPdf(line);
    s = s.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
    return s.replace(/`([^`]*)`/g, "$1");
  };

  /** Formatted study plan HTML for UI preview (matches PDF rendering). */
  const studyPlanHtml = useMemo(() => {
    if (!studyPlan?.trim()) return "";
    try {
      const clean = studyPlan.split(/\r?\n/).map((line) => stripForPdf(line)).join("\n");
      return marked.parse(clean, { async: false }) as string;
    } catch {
      return "";
    }
  }, [studyPlan]);

  const slug = topic.trim().replace(/[^a-z0-9]+/gi, "-").slice(0, 40) || "study-plan";

  /** Write a line that may contain **bold** to the PDF with wrapping and page breaks. Returns new y. */
  const writeFormattedLine = (
    doc: jsPDF,
    line: string,
    opts: { margin: number; maxWidth: number; lineHeight: number; pageHeight: number; baseFontSize: number },
    startY: number
  ): number => {
    const { margin, maxWidth, lineHeight, pageHeight, baseFontSize } = opts;
    let y = startY;
    const ensureSpace = () => {
      if (y > pageHeight - margin - lineHeight) {
        doc.addPage();
        y = margin;
      }
    };
    const segments: { text: string; bold: boolean }[] = [];
    const parts = line.split(/\*\*(.+?)\*\*/g);
    for (let i = 0; i < parts.length; i++) segments.push({ text: parts[i], bold: i % 2 === 1 });
    let x = margin;
    doc.setFontSize(baseFontSize);
    for (const seg of segments) {
      doc.setFont("helvetica", seg.bold ? "bold" : "normal");
      const availableWidth = maxWidth - (x - margin);
      const sublines = doc.splitTextToSize(seg.text, availableWidth);
      for (let i = 0; i < sublines.length; i++) {
        ensureSpace();
        if (i > 0) {
          y += lineHeight;
          x = margin;
        }
        doc.text(sublines[i], x, y);
        x += doc.getTextWidth(sublines[i]);
      }
    }
    return y + lineHeight;
  };

  /** Formatted PDF with headers, list indent, and bold (avoids html2canvas lab() issue). */
  const fallbackPlainTextPdf = (doc: jsPDF, teacherData: Teacher, topicText: string) => {
    const margin = 20;
    const listIndent = 8;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 6;
    let y = margin;

    const ensureSpace = () => {
      if (y > pageHeight - margin - lineHeight) {
        doc.addPage();
        y = margin;
      }
    };

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Study Plan", margin, y);
    y += lineHeight * 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(stripForPdf(`${teacherData.name} · ${teacherData.subject}`), margin, y);
    y += lineHeight;
    doc.text(stripForPdf(`Topic: ${topicText.trim()}`), margin, y);
    y += lineHeight * 2;

    doc.setFontSize(10);
    const lines = studyPlan.split(/\r?\n/);

    for (const raw of lines) {
      const line = stripInlineForFormattedPdf(raw);
      const trimmed = line.trim();
      if (!trimmed) {
        y += lineHeight;
        continue;
      }
      ensureSpace();

      const headerMatch = trimmed.match(/^(#+)\s+(.*)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const title = headerMatch[2].replace(/\*\*(.+?)\*\*/g, "$1").trim();
        const size = level === 1 ? 14 : level === 2 ? 12 : 10;
        doc.setFontSize(size);
        doc.setFont("helvetica", "bold");
        const titleLines = doc.splitTextToSize(title, maxWidth);
        for (const ln of titleLines) {
          ensureSpace();
          doc.text(ln, margin, y);
          y += lineHeight;
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        y += lineHeight * 0.5;
        continue;
      }

      const listMatch = trimmed.match(/^\s*([-*]|\d+\.)\s+(.*)$/);
      if (listMatch) {
        const bullet = "• ";
        const content = listMatch[2];
        doc.setFont("helvetica", "normal");
        const contentLines = doc.splitTextToSize(content.replace(/\*\*(.+?)\*\*/g, "$1"), maxWidth - listIndent - doc.getTextWidth(bullet));
        for (let i = 0; i < contentLines.length; i++) {
          ensureSpace();
          doc.text(i === 0 ? bullet + contentLines[i] : contentLines[i], margin + (i === 0 ? 0 : listIndent), y);
          y += lineHeight;
        }
        continue;
      }

      y = writeFormattedLine(
        doc,
        line,
        { margin, maxWidth, lineHeight, pageHeight, baseFontSize: 10 },
        y
      );
    }

    doc.save(`study-plan-${slug}.pdf`);
  };

  const handleDownloadPdf = () => {
    if (!studyPlan || !teacher || !topic.trim()) return;
    const doc = new jsPDF();
    // Use plain-text PDF only: html2canvas (used by doc.html()) does not support modern CSS
    // color functions like lab(), so rendering HTML causes "Attempting to parse an unsupported
    // color function 'lab'" when the page uses Tailwind v4 or similar.
    fallbackPlainTextPdf(doc, teacher, topic.trim());
  };

  if (loading || !teacher) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border px-4 py-4 sm:px-6" style={{ background: "var(--tinder-gradient)" }}>
          <Link href="/match" className="text-xl font-semibold text-white drop-shadow-sm">
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
      <header className="border-b border-border px-4 py-4 sm:px-6" style={{ background: "var(--tinder-gradient)" }}>
        <Link href="/match" className="text-xl font-semibold text-white drop-shadow-sm">
          Unitinder
        </Link>
        <span className="ml-3 text-white/80">Learn more</span>
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
            {!student && (
              <p className="text-muted-foreground text-sm">
                Take the quiz first to see a personalized summary for your learning profile.
              </p>
            )}
            {student && (
              <p className="text-muted-foreground text-xs">
                Personalized for: {student.name}
              </p>
            )}
          </CardHeader>
        </Card>

        {!student && (
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground">
                Take the quiz first to get your learning profile and see personalized summaries and study plans.
              </p>
              <Button asChild className="mt-4 bg-[var(--tinder-pink)] text-white hover:opacity-90">
                <Link href="/quiz">Take the quiz</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Study plan</CardTitle>
            <p className="text-muted-foreground text-sm">
              Get a study plan in this teacher&apos;s style. This teachers profile from the quiz is used to personalize the plan.
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
              disabled={studyPlanLoading || !topic.trim() || !student}
              className="text-white hover:opacity-90"
              style={{ background: "var(--tinder-gradient)" }}
            >
              {studyPlanLoading ? "Generating…" : "Generate study plan"}
            </Button>
            {studyPlanError && (
              <p className="text-destructive text-sm">
                {studyPlanError}
              </p>
            )}
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
                {studyPlanHtml && (
                  <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Full guide
                    </p>
                    <div
                      className="study-plan-preview max-h-[480px] overflow-y-auto text-sm text-foreground [&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mb-1.5 [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5 [&_strong]:font-bold"
                      dangerouslySetInnerHTML={{ __html: studyPlanHtml }}
                    />
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

        <Button asChild variant="outline" className="border-[var(--tinder-pink)] text-[var(--tinder-pink)] hover:bg-[var(--tinder-pink)]/10">
          <Link href="/match">Back to matching</Link>
        </Button>
      </main>
    </div>
  );
}
