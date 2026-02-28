"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/ui/aceternity/aurora-background";
import { Spotlight } from "@/components/ui/aceternity/spotlight";

export default function Home() {
  return (
    <AuroraBackground className="min-h-screen !justify-start">
      <div className="relative z-10 flex w-full max-w-4xl flex-1 flex-col">
        <header className="w-full border-b border-border px-4 py-4 sm:px-6">
          <Link href="/" className="text-xl font-semibold">
            Unitinder
          </Link>
        </header>
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
          <div className="relative overflow-hidden rounded-2xl py-4">
            <Spotlight
              className="-top-40 left-0 md:-top-20 md:left-60"
              fill="var(--gradient-lavender)"
            />
            <h1 className="relative mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Find teachers that match how you learn
            </h1>
          </div>
          <p className="mb-10 text-muted-foreground sm:mb-12">
            Choose your role to get started with personalized teacher-student matching.
          </p>
          
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Student Role */}
            <div className="flex flex-col rounded-lg border border-border bg-card p-6 transition-all hover:border-[var(--gradient-coral)] hover:shadow-lg">
              <h2 className="mb-2 text-xl font-semibold">Student</h2>
              <p className="mb-4 flex-1 text-sm text-muted-foreground">
                Take a cognitive assessment quiz, upload learning material, and discover teachers perfectly matched to your learning style.
              </p>
              <Button
                asChild
                size="lg"
                className="w-full bg-[var(--gradient-coral)] text-white hover:opacity-90"
              >
                <Link href="/quiz">Start as Student</Link>
              </Button>
            </div>

            {/* Teacher Role */}
            <div className="flex flex-col rounded-lg border border-border bg-card p-6 transition-all hover:border-[var(--gradient-lavender)] hover:shadow-lg">
              <h2 className="mb-2 text-xl font-semibold">Teacher</h2>
              <p className="mb-4 flex-1 text-sm text-muted-foreground">
                Upload your teaching video to generate your profile, view match analytics, and connect with compatible students.
              </p>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full hover:bg-[var(--gradient-lavender)] hover:text-white"
              >
                <Link href="/teacher/dashboard">Start as Teacher</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </AuroraBackground>
  );
}
