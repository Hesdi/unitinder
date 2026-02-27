"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QUESTIONS } from "@/data/questions";
import { DIMENSION_KEYS } from "@/data/questions";
import { aggregatePersona, deriveArchetypeAndSummary } from "@/lib/quiz";
import { createStudent } from "@/lib/api";

export default function QuizPage() {
  const [step, setStep] = useState<"name" | "questions" | "saving" | "done" | "error">("name");
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState("");

  const handleStart = () => {
    setStep("questions");
  };

  const handleAnswer = (questionId: number, label: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: label }));
  };

  const handleSubmit = async () => {
    const answered = Object.keys(answers).length;
    if (answered !== QUESTIONS.length) {
      setError(`Please answer all ${QUESTIONS.length} questions. You have ${answered}.`);
      return;
    }
    setError("");
    setStep("saving");

    const accumulator: Record<string, number[]> = {};
    DIMENSION_KEYS.forEach((k) => (accumulator[k] = []));

    for (const q of QUESTIONS) {
      const choice = answers[q.id];
      const opt = q.options.find((o) => o.label === choice);
      if (opt?.dimensions) {
        for (const [dim, value] of Object.entries(opt.dimensions)) {
          if (accumulator[dim]) accumulator[dim].push(value);
        }
      }
    }

    const persona = aggregatePersona(accumulator);
    const { archetype, summary } = deriveArchetypeAndSummary(persona);

    try {
      await createStudent({
        name: (name || "Student").trim() || "Student",
        persona,
        archetype,
        summary,
      });
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save. Is the API running?");
      setStep("error");
    }
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === QUESTIONS.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <Link href="/" className="text-xl font-semibold">
          Unitinder
        </Link>
        <span className="ml-4 text-muted-foreground">Quiz</span>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        {step === "name" && (
          <Card>
            <CardHeader>
              <CardTitle>Student learning profile</CardTitle>
              <p className="text-muted-foreground text-sm">
                ~20 questions, 3–4 minutes. We’ll use your answers to match you with teachers.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Your name (optional)</Label>
                <Input
                  id="name"
                  placeholder="Student"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 max-w-xs"
                />
              </div>
              <Button onClick={handleStart}>Start quiz</Button>
            </CardContent>
          </Card>
        )}

        {step === "questions" && (
          <div className="space-y-8">
            <p className="text-muted-foreground text-sm">
              Question {answeredCount} of {QUESTIONS.length}
            </p>
            {QUESTIONS.map((q) => (
              <Card key={q.id}>
                <CardHeader>
                  <CardTitle className="text-base font-medium">
                    {q.id}. {q.text}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {q.options.map((opt) => (
                    <Button
                      key={opt.label}
                      type="button"
                      variant={answers[q.id] === opt.label ? "default" : "outline"}
                      className="justify-start text-left"
                      onClick={() => handleAnswer(q.id, opt.label)}
                    >
                      {opt.label}) {opt.text}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            ))}
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex gap-4">
              <Button onClick={handleSubmit} disabled={!allAnswered}>
                Submit and save to students
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Cancel</Link>
              </Button>
            </div>
          </div>
        )}

        {step === "saving" && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Saving your profile…
            </CardContent>
          </Card>
        )}

        {step === "done" && (
          <Card>
            <CardHeader>
              <CardTitle>Profile saved</CardTitle>
              <p className="text-muted-foreground text-sm">
                Your learning profile has been added to the students list. You can now match with teachers by subject.
              </p>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/match">Match with teachers</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "error" && (
          <Card>
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
              <p className="text-destructive text-sm">{error}</p>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => setStep("questions")}>
                Try again
              </Button>
              <Button asChild className="ml-2">
                <Link href="/">Home</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
