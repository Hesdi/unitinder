/**
 * Demo Match Page with Hardcoded Data
 * 
 * This page uses hardcoded student (stu_001) and teachers from JSON files
 * to demonstrate the carousel and door swing animation.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TeacherDoorDepth } from '@/components/TeacherDoorDepth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { calculateCompatibilityScore } from '@/lib/matching';
import { calculateCarouselDepthState } from '@/lib/carousel-depth';
import type { RankedTeacher, StudentPersona, TeacherProfile } from '@/types';

// Hardcoded student data (first student from students.json)
const HARDCODED_STUDENT: StudentPersona = {
  student_id: "stu_001",
  name: "Alex Chen",
  generated_at: "2026-02-27T12:00:00.000Z",
  persona: {
    pace: 0.75,
    structure: 0.80,
    abstraction: 0.70,
    interactivity: 0.40,
    visual_dependency: 0.35,
    verbal_density: 0.85,
    repetition_need: 0.25,
    formality: 0.70,
    humor_receptivity: 0.30,
    feedback_style: 0.50,
    autonomy: 0.75,
    cognitive_load_tolerance: 0.80,
    attention_span: 0.85,
    motivation_type: 0.80,
    error_tolerance: 0.50,
    social_preference: 0.25,
    real_world_need: 0.40,
    emotional_sensitivity: 0.40,
    question_comfort: 0.55,
    note_taking_style: 0.75,
    challenge_preference: 0.70,
    context_need: 0.60,
    storytelling_affinity: 0.35,
    revision_style: 0.40
  },
  archetype: "Fast theoretical learner",
  summary: "Prefers fast, structured, verbal instruction. High cognitive load and attention span. Good for rigorous, theory-heavy teachers."
};

const HARDCODED_MATERIAL_ID = "mat_demo001";

export default function MatchDemoPage() {
  const router = useRouter();

  const [teachers, setTeachers] = useState<RankedTeacher[]>([]);
  const [centerIndex, setCenterIndex] = useState(0);
  const [isSwinging, setIsSwinging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const animationStateRef = useRef({
    centerIndex: 0,
    isAnimating: false,
  });

  const teachersRef = useRef<RankedTeacher[]>([]);

  // Load and match teachers on mount
  useEffect(() => {
    async function loadAndMatchTeachers() {
      try {
        // Fetch teachers.json from public directory
        const response = await fetch('/teachers.json');
        const data = await response.json();

        // Calculate compatibility scores for each teacher
        const rankedTeachers: RankedTeacher[] = data.teachers.map((teacher: TeacherProfile) => {
          const matchResult = calculateCompatibilityScore(
            HARDCODED_STUDENT.persona,
            teacher.persona
          );

          return {
            ...teacher,
            compatibility_score: matchResult.compatibility_score,
            why: matchResult.why
          };
        });

        // Sort by compatibility score descending
        rankedTeachers.sort((a, b) => b.compatibility_score - a.compatibility_score);

        // Add rank to each teacher
        rankedTeachers.forEach((teacher, index) => {
          (teacher as any).rank = index + 1;
        });

        setTeachers(rankedTeachers);
        teachersRef.current = rankedTeachers;
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load teachers:', error);
        setIsLoading(false);
      }
    }

    loadAndMatchTeachers();
  }, []);


  const handleDoorClick = useCallback(() => {
    if (animationStateRef.current.isAnimating) return;

    const selectedTeacher = teachers[centerIndex];
    if (!selectedTeacher) return;

    // Trigger door swing animation
    setIsSwinging(true);

    // Navigate to demo page after animation completes (800ms)
    setTimeout(() => {
      router.push(
        `/demo?teacherId=${selectedTeacher.teacher_id}&studentId=${HARDCODED_STUDENT.student_id}&materialId=${HARDCODED_MATERIAL_ID}`
      );
    }, 800);
  }, [centerIndex, teachers, router]);

  const handleRotateLeft = useCallback(() => {
    if (teachersRef.current.length === 0 || animationStateRef.current.isAnimating) return;

    const newIndex = (animationStateRef.current.centerIndex - 1 + teachersRef.current.length) % teachersRef.current.length;

    animationStateRef.current.centerIndex = newIndex;
    setCenterIndex(newIndex);
  }, []);

  const handleRotateRight = useCallback(() => {
    if (teachersRef.current.length === 0 || animationStateRef.current.isAnimating) return;

    const newIndex = (animationStateRef.current.centerIndex + 1) % teachersRef.current.length;

    animationStateRef.current.centerIndex = newIndex;
    setCenterIndex(newIndex);
  }, []);

  // Sync ref with state
  useEffect(() => {
    animationStateRef.current.centerIndex = centerIndex;
  }, [centerIndex]);

  const carouselState = calculateCarouselDepthState(
    centerIndex,
    0, // Drag progress is now fixed to 0
    teachers.length
  );

  const centerTeacher = teachers[centerIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading teachers and calculating matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <header className="border-b border-slate-700 px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-semibold">
          Student-Teacher Matching
        </Link>
        <Badge variant="secondary" className="ml-3 rounded-full">
          Demo Match
        </Badge>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold">
            Find Your Perfect Teacher
          </h1>
          <p className="text-gray-400">
            Student: {HARDCODED_STUDENT.name} ({HARDCODED_STUDENT.archetype})
          </p>
        </div>

        {teachers.length === 0 ? (
          <div className="text-center">
            <p className="mb-4 text-gray-400">
              No teachers available.
            </p>
          </div>
        ) : (
          <>
            {/* 3D Carousel Container */}
            <div
              className="relative mx-auto"
              style={{
                width: '100%',
                height: '700px',
                perspective: '1200px',
                perspectiveOrigin: '50% 50%',
              }}
            >
              {/* Carousel stage */}
              <div
                className="relative h-full w-full"
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Render visible doors with depth states */}
                {carouselState.doors.map((doorState) => {
                  const teacher = teachers[doorState.index];
                  if (!teacher) return null;

                  const isCenter = doorState.index === centerIndex;

                  return (
                    <TeacherDoorDepth
                      key={teacher.teacher_id}
                      teacher={teacher}
                      depthState={doorState}
                      isCenter={isCenter}
                      isSwinging={isSwinging && isCenter}
                      isDragging={animationStateRef.current.isAnimating}
                      onClick={isCenter ? handleDoorClick : undefined}
                    />
                  );
                })}
              </div>

              {/* Click hint */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
                <p className="text-sm text-gray-400">
                  Click center door to select
                </p>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="mt-8 flex items-center justify-center gap-8">
              <Button
                onClick={handleRotateLeft}
                disabled={teachers.length === 0}
                variant="outline"
                size="lg"
              >
                ← Previous
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-400">
                  {centerIndex + 1} of {teachers.length}
                </p>
              </div>

              <Button
                onClick={handleRotateRight}
                disabled={teachers.length === 0}
                variant="outline"
                size="lg"
              >
                Next →
              </Button>
            </div>

            {/* Teacher details */}
            {centerTeacher && (
              <div className="mx-auto mt-12 max-w-2xl rounded-lg bg-slate-800/50 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{centerTeacher.name}</h2>
                  <Badge variant="default" className="text-lg">
                    {centerTeacher.compatibility_score}% Match
                  </Badge>
                </div>
                <p className="mb-4 text-gray-400">
                  {centerTeacher.subject} • {centerTeacher.archetype}
                </p>
                <p className="mb-4 italic text-gray-300">{centerTeacher.tagline}</p>
                <p className="mb-6 text-gray-200">{centerTeacher.summary}</p>

                <div className="flex flex-wrap gap-3">
                  <Badge variant="default" className="rounded-full">
                    Best Match: {centerTeacher.why.best.join(', ')}
                  </Badge>
                  <Badge variant="outline" className="rounded-full">
                    Areas to Improve: {centerTeacher.why.worst.join(', ')}
                  </Badge>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
