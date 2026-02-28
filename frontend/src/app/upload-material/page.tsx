"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuroraBackground } from "@/components/ui/aceternity/aurora-background";
import { StudentPersona, SaveMaterialResponse, MatchResponse } from "@/types";
import { validateMaterialContent, validateMaterialTopic, sanitizeInput } from "@/lib/validation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8765";

export default function MaterialUploadPage() {
  const router = useRouter();
  const [studentPersona, setStudentPersona] = useState<StudentPersona | null>(null);
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    content?: string;
    topic?: string;
  }>({});

  useEffect(() => {
    // Retrieve student persona from sessionStorage
    const storedPersona = sessionStorage.getItem("studentPersona");
    
    if (!storedPersona) {
      // Redirect to quiz if no persona found
      router.push("/quiz");
      return;
    }

    try {
      const persona = JSON.parse(storedPersona);
      setStudentPersona(persona);
    } catch (err) {
      console.error("Failed to parse student persona:", err);
      router.push("/quiz");
    }
  }, [router]);

  const validateForm = (): boolean => {
    const errors: { content?: string; topic?: string } = {};

    if (!validateMaterialContent(content)) {
      errors.content = "Content is required";
    }

    if (!validateMaterialTopic(topic)) {
      errors.topic = "Topic is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!studentPersona) {
      setError("Student persona not found. Please complete the quiz first.");
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);

    try {
      // Sanitize inputs
      const sanitizedContent = sanitizeInput(content);
      const sanitizedTopic = sanitizeInput(topic);

      // Upload learning material
      const materialResponse = await fetch(
        `${API_URL}/api/students/${studentPersona.student_id}/material`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: sanitizedContent,
            topic: sanitizedTopic,
          }),
        }
      );

      if (!materialResponse.ok) {
        throw new Error("Failed to upload learning material");
      }

      const materialData: SaveMaterialResponse = await materialResponse.json();
      const materialId = materialData.material_id;

      // Store material_id in sessionStorage
      sessionStorage.setItem("materialId", materialId);

      // Request teacher matching
      const matchResponse = await fetch(`${API_URL}/api/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentPersona: studentPersona.persona,
          subject: null, // No subject filter
        }),
      });

      if (!matchResponse.ok) {
        throw new Error("Failed to match teachers");
      }

      const matchData: MatchResponse = await matchResponse.json();

      // Store ranked teachers in sessionStorage
      sessionStorage.setItem("rankedTeachers", JSON.stringify(matchData.ranked));

      // Navigate to matching carousel page
      router.push("/match");
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while uploading your material. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setValidationErrors({});
  };

  if (!studentPersona) {
    return (
      <AuroraBackground className="min-h-screen">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground className="min-h-screen !justify-start">
      <div className="relative z-10 flex w-full max-w-4xl flex-1 flex-col">
        <header className="w-full border-b border-border px-4 py-4 sm:px-6">
          <Link href="/" className="text-xl font-semibold">
            Unitinder
          </Link>
        </header>

        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:px-6">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Upload Learning Material</h1>
            <p className="text-muted-foreground">
              Tell us what you want to learn, and we'll match you with the perfect teacher.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
            {/* Topic Input */}
            <div className="space-y-2">
              <Label htmlFor="topic">
                Topic <span className="text-destructive">*</span>
              </Label>
              <Input
                id="topic"
                type="text"
                placeholder="e.g., Quantum Mechanics, React Hooks, World War II"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (validationErrors.topic) {
                    setValidationErrors({ ...validationErrors, topic: undefined });
                  }
                }}
                aria-invalid={!!validationErrors.topic}
                disabled={isUploading}
              />
              {validationErrors.topic && (
                <p className="text-sm text-destructive">{validationErrors.topic}</p>
              )}
            </div>

            {/* Content Input */}
            <div className="flex-1 space-y-2">
              <Label htmlFor="content">
                Learning Material <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="content"
                placeholder="Describe what you want to learn or paste your study material here..."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (validationErrors.content) {
                    setValidationErrors({ ...validationErrors, content: undefined });
                  }
                }}
                aria-invalid={!!validationErrors.content}
                disabled={isUploading}
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input min-h-[200px] w-full resize-y rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
              />
              {validationErrors.content && (
                <p className="text-sm text-destructive">{validationErrors.content}</p>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                <p className="mb-2 text-sm font-medium text-destructive">Upload Failed</p>
                <p className="mb-3 text-sm text-destructive/90">{error}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/quiz")}
                disabled={isUploading}
                className="flex-1"
              >
                Back to Quiz
              </Button>

              <Button
                type="submit"
                disabled={isUploading}
                className="flex-1 bg-[var(--gradient-coral)] text-white hover:opacity-90"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Find My Teachers"
                )}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </AuroraBackground>
  );
}
