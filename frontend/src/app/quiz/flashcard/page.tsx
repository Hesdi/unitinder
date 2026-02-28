"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MemoryCard } from '@/components/flashcard/MemoryCard';
import { generateCardSet, cardsMatch } from '@/lib/flashcard/cardGenerator';
import { MemoryCard as MemoryCardType } from '@/lib/flashcard/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type GamePhase = 'ready' | 'memorize' | 'playing' | 'complete' | 'timeout' | 'analyzing';

export default function FlashcardGamePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [cards, setCards] = useState<MemoryCardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [matchedCards, setMatchedCards] = useState<Set<number>>(new Set());
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  
  // Timer
  const [timeRemaining, setTimeRemaining] = useState(15); // 15 seconds
  const [memorizeTimeRemaining, setMemorizeTimeRemaining] = useState(10); // 10 seconds to memorize
  
  // Performance tracking
  const [colorMatches, setColorMatches] = useState(0);
  const [numberMatches, setNumberMatches] = useState(0);
  const [shapeMatches, setShapeMatches] = useState(0);

  // Initialize game
  useEffect(() => {
    try {
      const generatedCards = generateCardSet(); // Generate 16 cards (8 pairs)
      setCards(generatedCards);
    } catch (error) {
      console.error('Failed to generate cards:', error);
    }
  }, []);

  // Memorize phase countdown
  useEffect(() => {
    if (phase === 'memorize') {
      if (memorizeTimeRemaining > 0) {
        const timer = setTimeout(() => {
          setMemorizeTimeRemaining(prev => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // Time's up - flip all cards and start playing
        setFlippedCards(new Set());
        setPhase('playing');
      }
    }
  }, [phase, memorizeTimeRemaining]);

  // Playing phase countdown
  useEffect(() => {
    if (phase === 'playing') {
      if (timeRemaining > 0) {
        const timer = setTimeout(() => {
          setTimeRemaining(prev => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // Time's up!
        handleComplete();
      }
    }
  }, [phase, timeRemaining]);

  const handleStart = () => {
    setPhase('memorize');
    setMemorizeTimeRemaining(10);
    setTimeRemaining(15);
    // Show all cards face-up
    setFlippedCards(new Set(cards.map(c => c.id)));
  };

  const handleCardClick = (cardId: number) => {
    if (phase !== 'playing' || isChecking || matchedCards.has(cardId) || selectedCards.includes(cardId)) {
      return;
    }

    const newSelected = [...selectedCards, cardId];
    setSelectedCards(newSelected);
    setFlippedCards(new Set([...flippedCards, cardId]));

    // Check for match when two cards are selected
    if (newSelected.length === 2) {
      setIsChecking(true);
      const card1 = cards.find(c => c.id === newSelected[0]);
      const card2 = cards.find(c => c.id === newSelected[1]);

      if (card1 && card2 && cardsMatch(card1, card2)) {
        // Match found!
        setTimeout(() => {
          setMatchedCards(new Set([...matchedCards, newSelected[0], newSelected[1]]));
          setSelectedCards([]);
          setIsChecking(false);

          // Track which type was matched
          switch (card1.type) {
            case 'color':
              setColorMatches(prev => prev + 1);
              break;
            case 'number':
              setNumberMatches(prev => prev + 1);
              break;
            case 'shape':
              setShapeMatches(prev => prev + 1);
              break;
          }

          // Check if game is complete
          if (matchedCards.size + 2 === cards.length) {
            handleComplete();
          }
        }, 1000);
      } else {
        // No match - flip back
        setTimeout(() => {
          const newFlipped = new Set(flippedCards);
          newFlipped.delete(newSelected[0]);
          newFlipped.delete(newSelected[1]);
          setFlippedCards(newFlipped);
          setSelectedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const handleComplete = () => {
    try {
      // Calculate cognitive tag based on which type was matched most
      const scores = {
        color: colorMatches,
        number: numberMatches,
        shape: shapeMatches,
      };

      let cognitiveTag: 'Visual-Dominant' | 'Sequential-Dominant' | 'Spatial-Dominant';
      
      if (scores.color >= scores.number && scores.color >= scores.shape) {
        cognitiveTag = 'Visual-Dominant';
      } else if (scores.number >= scores.shape) {
        cognitiveTag = 'Sequential-Dominant';
      } else {
        cognitiveTag = 'Spatial-Dominant';
      }

      // Store cognitive tag in sessionStorage
      const personaStr = sessionStorage.getItem('studentPersona');
      if (personaStr) {
        try {
          const persona = JSON.parse(personaStr);
          persona.cognitiveTag = cognitiveTag;
          persona.flashcardResult = {
            totalQuestions: 8, // 8 pairs
            colorCorrect: colorMatches,
            numberCorrect: numberMatches,
            shapeCorrect: shapeMatches,
            cognitiveTag,
            completedAt: new Date().toISOString(),
            timeSeconds: 15 - timeRemaining,
          };
          sessionStorage.setItem('studentPersona', JSON.stringify(persona));
        } catch (e) {
          console.error('Failed to update persona with cognitive tag:', e);
          // Try localStorage as fallback
          try {
            localStorage.setItem('studentPersona', JSON.stringify({
              cognitiveTag,
              flashcardResult: {
                totalQuestions: 8,
                colorCorrect: colorMatches,
                numberCorrect: numberMatches,
                shapeCorrect: shapeMatches,
                cognitiveTag,
                completedAt: new Date().toISOString(),
                timeSeconds: 15 - timeRemaining,
              },
            }));
          } catch (localError) {
            console.error('Failed to store in localStorage:', localError);
          }
        }
      }

      // Show analyzing phase
      setPhase('analyzing');
      
      // Navigate to match-with-teachers page after 2 seconds
      setTimeout(() => {
        router.push('/match');
      }, 2000);
    } catch (error) {
      console.error('Error completing flashcard game:', error);
      // Navigate anyway
      router.push('/match');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading memory game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-4 py-4 sm:px-6" style={{ background: "var(--tinder-gradient)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-semibold text-white drop-shadow-sm">
              Unitinder
            </Link>
            <Badge variant="secondary" className="ml-3 rounded-full bg-white/20 text-white border-0">
              Memory Game
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            {phase === 'memorize' && (
              <Badge className="text-lg font-mono font-bold bg-yellow-500 text-black border-0">
                Memorize: {memorizeTimeRemaining}s
              </Badge>
            )}
            {phase === 'playing' && (
              <Badge className={`text-lg font-mono font-bold border-0 ${timeRemaining <= 10 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                {formatTime(timeRemaining)}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <AnimatePresence mode="wait">
          {/* Ready Phase */}
          {phase === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Memory Matching Game</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Find all 8 matching pairs in 15 seconds!
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    You'll have 10 seconds to memorize all cards, then they'll flip over.
                    Click two cards to flip them and match pairs of the same color, number, or shape.
                  </p>
                  <Button
                    onClick={handleStart}
                    className="text-white hover:opacity-90"
                    style={{ background: "var(--tinder-gradient)" }}
                  >
                    Start Game
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Memorize Phase */}
          {phase === 'memorize' && (
            <motion.div
              key="memorize"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-yellow-600">Memorize the cards!</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {memorizeTimeRemaining} seconds remaining...
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2">
                    {cards.map((card) => (
                      <div key={card.id} className="w-full">
                        <MemoryCard
                          card={card}
                          isFaceUp={true}
                          isClickable={false}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Playing Phase */}
          {phase === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Match the pairs!</CardTitle>
                    <Badge variant="outline">
                      Pairs: {matchedCards.size / 2} / 8
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2">
                    {cards.map((card) => {
                      const isFlipped = flippedCards.has(card.id) || matchedCards.has(card.id);
                      const isMatched = matchedCards.has(card.id);
                      
                      return (
                        <div key={card.id} className={`w-full ${isMatched ? 'opacity-50' : ''}`}>
                          <MemoryCard
                            card={card}
                            isFaceUp={isFlipped}
                            isClickable={!isMatched && !isChecking}
                            onClick={() => handleCardClick(card.id)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Analyzing Phase */}
          {phase === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Analyzing Your Results...</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-lg text-center">
                      Your student profile is being prepared
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
