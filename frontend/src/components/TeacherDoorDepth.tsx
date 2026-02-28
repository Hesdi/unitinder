/**
 * TeacherDoor Component with Dynamic Depth
 * 
 * Renders a door with continuous interpolation of scale, blur, and opacity
 * based on its position in the depth-swap carousel.
 */

'use client';

import { motion } from 'framer-motion';
import type { RankedTeacher } from '@/types';
import type { DoorDepthState } from '@/lib/carousel-depth';
import { doorSwingVariants } from '@/lib/animations';

interface TeacherDoorDepthProps {
  teacher: RankedTeacher;
  depthState: DoorDepthState;
  isCenter: boolean;
  isSwinging: boolean;
  onClick?: () => void;
  isDragging?: boolean;
}

export function TeacherDoorDepth({
  teacher,
  depthState,
  isCenter,
  isSwinging,
  onClick,
  isDragging = false,
}: TeacherDoorDepthProps) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        width: '300px',
        height: '480px',
        marginLeft: '-150px',
        marginTop: '-240px',
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        cursor: isCenter ? 'pointer' : 'default',
        pointerEvents: isCenter ? 'auto' : 'none',
      }}
      animate={{
        scale: depthState.scale,
        x: depthState.x,
        z: depthState.z,
        filter: `blur(${depthState.blur}px)`,
        opacity: depthState.opacity,
      }}
      transition={
        isDragging
          ? { type: 'tween', duration: 0, ease: 'linear' }
          : { type: 'spring', stiffness: 300, damping: 30 }
      }
      onClick={isCenter ? onClick : undefined}
    >
      <motion.div
        className="relative h-full w-full"
        style={{
          transformStyle: 'preserve-3d',
        }}
        variants={doorSwingVariants}
        animate={isSwinging && isCenter ? 'open' : 'closed'}
      >
        {/* Wooden door background */}
        <div
          className="absolute inset-0 rounded-lg shadow-2xl"
          style={{
            background: 'linear-gradient(180deg, #8B4513 0%, #654321 100%)',
            border: '8px solid #5C3317',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          {/* Wood grain texture */}
          <div
            className="absolute inset-0 rounded-lg opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 2px,
                rgba(0,0,0,0.1) 2px,
                rgba(0,0,0,0.1) 4px
              )`,
            }}
          />

          {/* Door panels */}
          <div className="absolute inset-4 flex flex-col gap-4">
            <div
              className="flex-1 rounded border-4 border-[#5C3317]"
              style={{
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
              }}
            />
            <div
              className="flex-1 rounded border-4 border-[#5C3317]"
              style={{
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
              }}
            />
          </div>

          {/* Door handle */}
          <div
            className="absolute right-6 top-1/2 h-3 w-8 -translate-y-1/2 rounded-full"
            style={{
              background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
            }}
          />

          {/* Room number with match score - top of door */}
          <div className="absolute left-1/2 top-8 -translate-x-1/2">
            <div
              className="rounded-md bg-gradient-to-b from-amber-100 to-amber-200 px-5 py-2 text-center shadow-lg"
              style={{
                border: '2px solid #92400e',
                filter: isCenter ? 'none' : `blur(${Math.min(depthState.blur * 0.5, 4)}px)`,
              }}
            >
              <div className="text-3xl font-bold text-amber-900">
                #{(teacher as any).rank || '1'}
              </div>
              <div className="text-xs font-semibold text-green-700 mt-1">
                {teacher.compatibility_score}% Match
              </div>
            </div>
          </div>

          {/* Nameplate - lower on door, smaller size */}
          <div className="absolute left-1/2 top-[60%] w-[75%] -translate-x-1/2 -translate-y-1/2">
            <div
              className="rounded-lg bg-gradient-to-b from-amber-50 to-amber-100 p-3 shadow-2xl"
              style={{
                border: '2px solid #78350f',
                boxShadow: '0 4px 12px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.5)',
                filter: isCenter ? 'none' : `blur(${Math.min(depthState.blur * 0.5, 4)}px)`,
              }}
            >
              {/* Nameplate header */}
              <div className="mb-2 border-b border-amber-800 pb-1.5">
                <h3 className="text-base font-bold text-amber-900">
                  {teacher.name}
                </h3>
                <p className="text-xs font-semibold text-amber-700">
                  {teacher.subject}
                </p>
              </div>

              {/* Description */}
              <div className="text-[10px] leading-relaxed text-amber-900">
                <p className="italic mb-1">"{teacher.tagline}"</p>
                <p className="text-[9px] leading-tight">{teacher.summary}</p>
              </div>

              {/* Archetype badge */}
              <div className="mt-1.5 flex justify-center">
                <span className="rounded-full bg-amber-800 px-2.5 py-0.5 text-[9px] font-semibold text-amber-50">
                  {teacher.archetype}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
