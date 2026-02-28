"use client";

import { Question } from "@/types";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuizQuestionProps {
  question: Question;
  selectedOption?: number;
  onSelectOption: (optionIndex: number) => void;
}

export function QuizQuestion({
  question,
  selectedOption,
  onSelectOption,
}: QuizQuestionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Question Text */}
        <div className="rounded-lg bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold leading-relaxed">
            {question.text}
          </h2>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedOption === index;

            return (
              <motion.div
                key={option.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    "cursor-pointer p-4 transition-all hover:shadow-md",
                    isSelected
                      ? "border-[var(--gradient-coral)] bg-[var(--gradient-coral)]/5 ring-2 ring-[var(--gradient-coral)]"
                      : "border-border hover:border-[var(--gradient-coral)]/50"
                  )}
                  onClick={() => onSelectOption(index)}
                >
                  <div className="flex items-start gap-3">
                    {/* Option Label */}
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold transition-colors",
                        isSelected
                          ? "bg-[var(--gradient-coral)] text-white"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {option.label}
                    </div>

                    {/* Option Text */}
                    <p
                      className={cn(
                        "flex-1 pt-1 leading-relaxed",
                        isSelected ? "font-medium" : "text-muted-foreground"
                      )}
                    >
                      {option.text}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
