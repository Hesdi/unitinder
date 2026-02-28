/**
 * Matching Carousel Page
 * 
 * 3D carousel interface displaying teacher matches as wooden university doors.
 * Supports drag gestures for navigation and door swing animation on selection.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 9.6
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TeacherDoor } from '@/components/TeacherDoor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { rotateCarousel } from '@/lib/carousel';
import type { RankedTeacher, DoorTransform } from '@/types';

export default function MatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL parameters
  const studentId = searchParams.get('studentId');
  const materialId = searchParams.get('materialId');
  const teachersParam = searchParams.get('teachers');

  const [teachers, setTeachers] = useState<RankedTeacher[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSwinging, setIsSwinging] = useState(false);
  const [doorTransforms, setDoorTransforms] = useState<Record<number, DoorTransform>>({});

  // Load teachers from URL parameter
  useEffect(() => {
    if (teachersParam) {
      try {
        const parsed = JSON.parse(teachersParam);
        // Add rank to each teacher based on their position in the sorted array
        parsed.forEach((teacher: RankedTeacher, index: number) => {
          (teacher as any).rank = index + 1;
        });
        setTeachers(parsed);
        initializeDoorTransforms(parsed.length, 0);
      } catch (e) {
        console.error('Failed to parse teachers:', e);
      }
    }
  }, [teachersParam]);

  // Initialize door transforms for visible doors
  const initializeDoorTransforms = (totalTeachers: number, centerIndex: number) => {
    if (totalTeachers === 0) return;

    const leftIndex = (centerIndex - 1 + totalTeachers) % totalTeachers;
    const rightIndex = (centerIndex + 1) % totalTeachers;

    const transforms: Record<number, DoorTransform> = {
      [leftIndex]: {
        scale: 0.85,
        translateX: -400,
        translateZ: -200,
        blur: 4,
        opacity: 0.7,
      },
      [centerIndex]: {
        scale: 1.1,
        translateX: 0,
        translateZ: 0,
        blur: 0,
        opacity: 1.0,
      },
      [rightIndex]: {
        scale: 0.85,
        translateX: 400,
        translateZ: -200,
        blur: 4,
        opacity: 0.7,
      },
    };

    setDoorTransforms(transforms);
  };



  // Handle center door click
  const handleDoorClick = useCallback(() => {
    if (isAnimating) return;

    const selectedTeacher = teachers[activeIndex];
    if (!selectedTeacher) return;

    // Trigger door swing animation
    setIsSwinging(true);

    // Navigate to demo page after animation completes (800ms)
    setTimeout(() => {
      router.push(
        `/demo?teacherId=${selectedTeacher.teacher_id}&studentId=${studentId}&materialId=${materialId}`
      );
    }, 800);
  }, [isAnimating, activeIndex, teachers, studentId, materialId, router]);

  // Handle rotation buttons
  const handleRotateLeft = useCallback(() => {
    if (isAnimating || teachers.length === 0) return;

    setIsAnimating(true);
    const transition = rotateCarousel(activeIndex, 'left', teachers);

    setActiveIndex(transition.newIndex);
    setDoorTransforms(transition.positions);

    setTimeout(() => {
      setIsAnimating(false);
    }, transition.duration);
  }, [isAnimating, activeIndex, teachers]);

  const handleRotateRight = useCallback(() => {
    if (isAnimating || teachers.length === 0) return;

    setIsAnimating(true);
    const transition = rotateCarousel(activeIndex, 'right', teachers);

    setActiveIndex(transition.newIndex);
    setDoorTransforms(transition.positions);

    setTimeout(() => {
      setIsAnimating(false);
    }, transition.duration);
  }, [isAnimating, activeIndex, teachers]);

  // Get visible door indices
  const getVisibleDoors = () => {
    if (teachers.length === 0) return [];

    const totalTeachers = teachers.length;
    const leftIndex = (activeIndex - 1 + totalTeachers) % totalTeachers;
    const rightIndex = (activeIndex + 1) % totalTeachers;

    return [
      { index: leftIndex, position: 'left' as const },
      { index: activeIndex, position: 'center' as const },
      { index: rightIndex, position: 'right' as const },
    ];
  };

  const visibleDoors = getVisibleDoors();
  const centerTeacher = teachers[activeIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <header className="border-b border-slate-700 px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-semibold">
          Student-Teacher Matching
        </Link>
        <Badge variant="secondary" className="ml-3 rounded-full">
          Match
        </Badge>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="mb-8 text-center text-3xl font-bold">
          Find Your Perfect Teacher
        </h1>

        {teachers.length === 0 ? (
          <div className="text-center">
            <p className="mb-4 text-gray-400">
              No teachers to display. Please complete the quiz and upload learning material first.
            </p>
            <Button asChild>
              <Link href="/quiz">Take Quiz</Link>
            </Button>
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
                  transform: 'none',
                  transition: 'transform 0.3s ease-out',
                }}
              >
                {/* Render visible doors */}
                {visibleDoors.map(({ index, position }) => {
                  const teacher = teachers[index];
                  const transform = doorTransforms[index];

                  if (!teacher || !transform) return null;

                  return (
                    <TeacherDoor
                      key={teacher.teacher_id}
                      teacher={teacher}
                      position={position}
                      transform={transform}
                      isSwinging={isSwinging && position === 'center'}
                      onClick={position === 'center' ? handleDoorClick : undefined}
                    />
                  );
                })}
              </div>

              {/* Click hint */}
              {!isAnimating && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
                  <p className="text-sm text-gray-400">
                    Click center door to select
                  </p>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="mt-8 flex items-center justify-center gap-8">
              <Button
                onClick={handleRotateLeft}
                disabled={isAnimating || teachers.length === 0}
                variant="outline"
                size="lg"
              >
                ← Previous
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-400">
                  {activeIndex + 1} of {teachers.length}
                </p>
              </div>

              <Button
                onClick={handleRotateRight}
                disabled={isAnimating || teachers.length === 0}
                variant="outline"
                size="lg"
              >
                Next →
              </Button>
            </div>

            {/* Teacher details */}
            {centerTeacher && (
              <div className="mx-auto mt-12 max-w-2xl rounded-lg bg-slate-800/50 p-6 backdrop-blur-sm">
                <h2 className="mb-2 text-2xl font-bold">{centerTeacher.name}</h2>
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
