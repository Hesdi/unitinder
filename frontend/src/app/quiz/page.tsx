"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/data/questions";
import { generatePersonaFromQuiz, QuestionResponse } from "@/lib/persona";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuizQuestion } from "@/components/QuizQuestion";
import { AuroraBackground } from "@/components/ui/aceternity/aurora-background";
import Link from "next/link";

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<number, number>>(new Map());
  const [validationError, setValidationError] = useState<string | null>(null);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;

  const handleAnswerSelect = (optionIndex: number) => {
    // Record the response
    const newResponses = new Map(responses);
    newResponses.set(currentQuestion.id, optionIndex);
    setResponses(newResponses);
    setValidationError(null);

    // Auto-advance to next question after a brief delay
    setTimeout(() => {
      if (!isLastQuestion) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setValidationError(null);
    }
  };

  const handleSubmit = () => {
    // Validate all questions are answered
    const unansweredQuestions: number[] = [];
    
    for (const question of QUESTIONS) {
      if (!responses.has(question.id)) {
        unansweredQuestions.push(question.id);
      }
    }

    if (unansweredQuestions.length > 0) {
      setValidationError(
        `Please answer all questions. Unanswered: ${unansweredQuestions.join(", ")}`
      );
      return;
    }

    // Generate persona from quiz responses
    const questionResponses: QuestionResponse[] = QUESTIONS.map((question) => ({
      question,
      selectedIndex: responses.get(question.id)!,
    }));

    const persona = generatePersonaFromQuiz(questionResponses);

    // Store persona in sessionStorage for next page
    sessionStorage.setItem("studentPersona", JSON.stringify(persona));

    // Navigate to material upload page
    router.push("/upload-material");
  };

  return (
    <AuroraBackground className="min-h-screen !justify-start">
      <div className="relative z-10 flex w-full max-w-4xl flex-1 flex-col">
        <header className="w-full border-b border-border px-4 py-4 sm:px-6">
          <Link href="/" className="text-xl font-semibold">
            Unitinder
          </Link>
        </header>

        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:px-6">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {QUESTIONS.length}
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Display */}
          <div className="flex-1">
            <QuizQuestion
              question={currentQuestion}
              selectedOption={responses.get(currentQuestion.id)}
              onSelectOption={handleAnswerSelect}
            />
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
              {validationError}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex-1"
            >
              Previous
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={!responses.has(currentQuestion.id)}
                className="flex-1 bg-[var(--gradient-coral)] text-white hover:opacity-90"
              >
                Complete Quiz
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                disabled={!responses.has(currentQuestion.id)}
                className="flex-1 bg-[var(--gradient-coral)] text-white hover:opacity-90"
              >
                Next
              </Button>
            )}
          </div>
        </main>
      </div>
    </AuroraBackground>
  );
}
