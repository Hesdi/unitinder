"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { RankedTeacher } from "@/lib/api";

/** Blend two hex colors; t in [0,1] (0 = a, 1 = b). */
function blendHex(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const n = hex.replace("#", "");
    return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
  };
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}

/** Gradient for card hero: high score = more pink, low = more red (0–100). */
function getMatchGradient(score: number): string {
  const p = Math.max(0, Math.min(100, score)) / 100;
  const highHex = "#FE3C72";
  const lowHex = "#E63946";
  const left = blendHex(lowHex, highHex, p);
  const right = blendHex(lowHex, highHex, Math.max(0, p - 0.15));
  return `linear-gradient(135deg, ${left} 0%, ${right} 100%)`;
}

interface TeacherCardProps {
  teacher: RankedTeacher;
  studentId?: string | null;
  className?: string;
  children?: React.ReactNode;
}

export function TeacherCard({
  teacher,
  studentId,
  className,
  children,
}: TeacherCardProps) {
  const learnHref = studentId
    ? `/learn/${teacher.teacher_id}?studentId=${studentId}`
    : `/learn/${teacher.teacher_id}`;

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg",
        className
      )}
    >
      {/* Hero section — color by match % (pink = high, red = low) */}
      <div
        className="flex-shrink-0"
        style={{ height: "38%" }}
      >
        <div
          className="h-full w-full"
          style={{
            background: getMatchGradient(teacher.compatibility_score),
          }}
        />
      </div>

      {/* Content: name band + summary, vertically centered in remaining space */}
      <div className="flex min-h-0 flex-1 flex-col justify-center px-4 py-4">
        {/* Name / subject / score band */}
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-foreground">
            {teacher.name} · {teacher.subject}
          </h3>
          <p className="text-sm text-muted-foreground">
            Score: {teacher.compatibility_score}% · {teacher.archetype}
          </p>
        </div>

        {/* Tagline (optional, one line) */}
        {teacher.tagline && (
          <p className="mb-2 text-sm italic text-muted-foreground line-clamp-1">
            {teacher.tagline}
          </p>
        )}

        {/* Summary with line-clamp */}
        <p className="line-clamp-4 overflow-hidden text-sm text-foreground">
          {teacher.summary}
        </p>

        {/* CTA: Learn with [teacher] to see if it's a match */}
        <Link
          href={learnHref}
          className="mt-4 block w-full rounded-xl bg-[var(--tinder-pink)] px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:opacity-90"
        >
          LEARN WITH {teacher.name.toUpperCase()} TO SEE IF IT&apos;S A MATCH
        </Link>
      </div>

      {children}
    </div>
  );
}
