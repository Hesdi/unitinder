/**
 * MemoryCard Component
 * 
 * Individual flashcard with flip animation and chalk-style blackboard aesthetic.
 */

import { motion } from 'framer-motion';
import { MemoryCard as MemoryCardType, ShapeType } from '@/lib/flashcard/types';

interface MemoryCardProps {
  card: MemoryCardType;
  isFaceUp: boolean;
  isClickable: boolean;
  onClick?: () => void;
  showFeedback?: 'correct' | 'incorrect' | null;
}

/**
 * Render SVG shape based on shape type
 */
function renderShape(shape: ShapeType, color: string, size: number = 60) {
  const center = size / 2;
  
  switch (shape) {
    case 'circle':
      return (
        <circle
          cx={center}
          cy={center}
          r={center * 0.8}
          fill={color}
          stroke="#FFFFFF"
          strokeWidth="2"
        />
      );
    
    case 'square':
      return (
        <rect
          x={center * 0.2}
          y={center * 0.2}
          width={center * 1.6}
          height={center * 1.6}
          fill={color}
          stroke="#FFFFFF"
          strokeWidth="2"
        />
      );
    
    case 'triangle':
      const points = `${center},${center * 0.2} ${center * 1.8},${center * 1.8} ${center * 0.2},${center * 1.8}`;
      return (
        <polygon
          points={points}
          fill={color}
          stroke="#FFFFFF"
          strokeWidth="2"
        />
      );
    
    case 'star':
      // 5-pointed star
      const starPoints = [];
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const radius = i % 2 === 0 ? center * 0.8 : center * 0.4;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        starPoints.push(`${x},${y}`);
      }
      return (
        <polygon
          points={starPoints.join(' ')}
          fill={color}
          stroke="#FFFFFF"
          strokeWidth="2"
        />
      );
    
    case 'hexagon':
      const hexPoints = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = center + center * 0.8 * Math.cos(angle);
        const y = center + center * 0.8 * Math.sin(angle);
        hexPoints.push(`${x},${y}`);
      }
      return (
        <polygon
          points={hexPoints.join(' ')}
          fill={color}
          stroke="#FFFFFF"
          strokeWidth="2"
        />
      );
    
    case 'diamond':
      const diamondPoints = `${center},${center * 0.2} ${center * 1.8},${center} ${center},${center * 1.8} ${center * 0.2},${center}`;
      return (
        <polygon
          points={diamondPoints}
          fill={color}
          stroke="#FFFFFF"
          strokeWidth="2"
        />
      );
    
    default:
      return null;
  }
}

export function MemoryCard({
  card,
  isFaceUp,
  isClickable,
  onClick,
  showFeedback,
}: MemoryCardProps) {
  return (
    <motion.div
      className={`relative w-full aspect-square cursor-pointer ${
        isClickable ? 'hover:scale-105' : ''
      }`}
      onClick={isClickable ? onClick : undefined}
      initial={false}
      animate={{
        rotateY: isFaceUp ? 0 : 180,
      }}
      transition={{
        duration: 0.6,
        ease: 'easeInOut',
      }}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Card Face Up */}
      <div
        className="absolute inset-0 rounded-lg border-4 border-white/30 bg-slate-800 flex items-center justify-center p-4"
        style={{
          backfaceVisibility: 'hidden',
          transform: 'rotateY(0deg)',
        }}
      >
        {/* Display only the relevant attribute based on card type */}
        {card.type === 'color' && (
          <div
            className="w-20 h-20 rounded-full border-4 border-white"
            style={{ backgroundColor: card.color }}
          />
        )}
        
        {card.type === 'number' && (
          <div
            className="text-6xl font-bold text-white"
            style={{
              fontFamily: '"Chalkboard SE", "Comic Sans MS", cursive',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {card.number}
          </div>
        )}
        
        {card.type === 'shape' && (
          <svg width="80" height="80" viewBox="0 0 60 60">
            {renderShape(card.shape, '#FFFFFF')}
          </svg>
        )}

        {/* Feedback indicator */}
        {showFeedback && (
          <div
            className={`absolute top-2 right-2 w-6 h-6 rounded-full ${
              showFeedback === 'correct' ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
        )}
      </div>

      {/* Card Face Down */}
      <div
        className="absolute inset-0 rounded-lg border-4 border-white/30 bg-slate-700 flex items-center justify-center"
        style={{
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
        }}
      >
        {/* Chalk texture pattern */}
        <div className="w-full h-full opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]" />
        
        {/* Question mark */}
        <div
          className="absolute text-6xl font-bold text-white/40"
          style={{
            fontFamily: '"Chalkboard SE", "Comic Sans MS", cursive',
          }}
        >
          ?
        </div>
      </div>
    </motion.div>
  );
}
