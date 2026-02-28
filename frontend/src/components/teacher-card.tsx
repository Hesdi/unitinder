"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { RankedTeacher } from "@/lib/api";

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
      {/* Hero section — ~35–40% of card height */}
      <div
        className="flex-shrink-0"
        style={{ height: "38%" }}
      >
        <div
          className="h-full w-full"
          style={{
            background: "var(--tinder-gradient)",
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
            Score: {teacher.compatibility_score} · {teacher.archetype}
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

        {/* Learn more link */}
        <Link
          href={learnHref}
          className="mt-3 inline-block text-sm font-medium text-[var(--tinder-pink)] hover:underline"
        >
          Learn more
        </Link>
      </div>

      {children}
    </div>
  );
}
