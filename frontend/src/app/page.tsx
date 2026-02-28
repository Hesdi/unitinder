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
          Take a short quiz to build your learning profile, then see your
          best-matched teachers by subject.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          <Button
            asChild
            size="lg"
            className="text-white hover:opacity-90"
            style={{ background: "var(--tinder-gradient)" }}
          >
            <Link href="/quiz">Take the quiz</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-[var(--tinder-pink)] text-[var(--tinder-pink)] hover:bg-[var(--tinder-pink)]/10">
            <Link href="/match">Match with teachers</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-[var(--tinder-pink)] text-[var(--tinder-pink)] hover:bg-[var(--tinder-pink)]/10">
            <Link href="/saved">My teachers</Link>
          </Button>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          But I&apos;m a teacher —{" "}
          <Link href="/teachers" className="font-medium text-[var(--tinder-pink)] underline underline-offset-2 hover:opacity-90">
            view my dashboard
          </Link>
        </p>
        </main>
      </div>
    </AuroraBackground>
  );
}
