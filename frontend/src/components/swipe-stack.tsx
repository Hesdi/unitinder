"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  PanInfo,
} from "framer-motion";
import { TeacherCard } from "@/components/teacher-card";
import type { RankedTeacher } from "@/lib/api";

const SWIPE_THRESHOLD = 0.6; // 60% of card width to commit
const ROTATION_STRENGTH = 0.15;

interface SwipeStackProps {
  teachers: RankedTeacher[];
  studentId?: string | null;
  onSwipe: (teacherId: string, direction: "left" | "right") => void;
  onStackEmpty?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function SwipeStack({
  teachers,
  studentId,
  onSwipe,
  onStackEmpty,
  onSwipeLeft,
  onSwipeRight,
}: SwipeStackProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, (v) => v * ROTATION_STRENGTH);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentTeacher = teachers[0];
  const hasCards = teachers.length > 0;

  // Reset x when top card changes (after parent removes swiped card)
  useEffect(() => {
    x.set(0);
  }, [currentTeacher?.teacher_id, x]);

  // Overlay opacities: NOPE (left) when x < 0, LIKE (right) when x > 0
  const nopeOpacity = useTransform(x, (v) =>
    v < 0 ? Math.min(1, Math.abs(v) / 80) : 0
  );
  const likeOpacity = useTransform(x, (v) =>
    v > 0 ? Math.min(1, v / 80) : 0
  );

  const commitSwipe = useCallback(
    (direction: "left" | "right") => {
      if (!currentTeacher) return;
      const teacherId = currentTeacher.teacher_id;
      const exitX = direction === "left" ? -400 : 400;
      animate(x, exitX, {
        type: "spring",
        stiffness: 300,
        damping: 30,
        onComplete: () => {
          onSwipe(teacherId, direction);
          if (teachers.length <= 1) {
            onStackEmpty?.();
          }
        },
      });
    },
    [currentTeacher, teachers.length, x, onSwipe, onStackEmpty]
  );

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!currentTeacher) return;
      const offset = info.offset.x;
      const velocity = info.velocity.x;
      const width = containerRef.current?.offsetWidth ?? 300;
      const threshold = width * SWIPE_THRESHOLD;
      const shouldSwipeLeft = offset < -threshold || velocity < -500;
      const shouldSwipeRight = offset > threshold || velocity > 500;

      if (shouldSwipeLeft) {
        commitSwipe("left");
      } else if (shouldSwipeRight) {
        commitSwipe("right");
      } else {
        animate(x, 0, {
          type: "spring",
          stiffness: 300,
          damping: 25,
        });
      }
    },
    [currentTeacher, x, commitSwipe]
  );

  const handleNope = useCallback(() => {
    if (!currentTeacher) return;
    onSwipeLeft?.();
    commitSwipe("left");
  }, [currentTeacher, commitSwipe, onSwipeLeft]);

  const handleLike = useCallback(() => {
    if (!currentTeacher) return;
    onSwipeRight?.();
    commitSwipe("right");
  }, [currentTeacher, commitSwipe, onSwipeRight]);

  if (!hasCards || !currentTeacher) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-center gap-6" ref={containerRef}>
      <div className="relative mx-auto h-[520px] w-full max-w-lg flex-shrink-0">
        {/* Back cards (subtle scale) */}
        {teachers.slice(1, 3).map((teacher, i) => (
          <div
            key={teacher.teacher_id}
            className="absolute inset-0"
            style={{
              transform: `scale(${1 - (i + 1) * 0.04}) translateY(${(i + 1) * 8}px)`,
              zIndex: 1 + i,
            }}
          >
            <TeacherCard teacher={teacher} studentId={studentId} />
          </div>
        ))}

        {/* Top card (draggable) — key so new card gets fresh motion values */}
        <motion.div
          key={currentTeacher.teacher_id}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.5}
          style={{ x, rotate }}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
        >
          <div className="relative h-full w-full touch-none">
            <TeacherCard teacher={currentTeacher} studentId={studentId}>
              {/* NOPE overlay (left) */}
              <motion.div
                className="pointer-events-none absolute inset-0 flex items-center justify-start pl-6"
                style={{ opacity: nopeOpacity }}
              >
                <span
                  className="rounded-lg border-4 px-4 py-2 text-4xl font-black uppercase tracking-wider"
                  style={{
                    color: "var(--tinder-nope)",
                    borderColor: "var(--tinder-nope)",
                    transform: "rotate(-20deg)",
                  }}
                >
                  NOPE
                </span>
              </motion.div>
              {/* LIKE overlay (right) */}
              <motion.div
                className="pointer-events-none absolute inset-0 flex items-center justify-end pr-6"
                style={{ opacity: likeOpacity }}
              >
                <span
                  className="rounded-lg border-4 px-4 py-2 text-4xl font-black uppercase tracking-wider"
                  style={{
                    color: "var(--tinder-like)",
                    borderColor: "var(--tinder-like)",
                    transform: "rotate(12deg)",
                  }}
                >
                  LIKE
                </span>
              </motion.div>
            </TeacherCard>
          </div>
        </motion.div>
      </div>

      {/* Action bar: Nope (X) and Like (heart) */}
      <div className="flex items-center justify-center gap-8">
        <button
          type="button"
          onClick={handleNope}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-md transition hover:scale-105 active:scale-95"
          style={{
            borderColor: "var(--tinder-nope)",
            color: "var(--tinder-nope)",
            background: "white",
          }}
          aria-label="Nope"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleLike}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-md transition hover:scale-105 active:scale-95"
          style={{
            borderColor: "var(--tinder-like)",
            color: "var(--tinder-like)",
            background: "white",
          }}
          aria-label="Like"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
