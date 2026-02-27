import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <Link href="/" className="text-xl font-semibold">
          Unitinder
        </Link>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight">
          Find teachers that match how you learn
        </h1>
        <p className="mb-12 text-muted-foreground">
          Take a short quiz to build your learning profile, then see your best-matched teachers by subject.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90">
            <Link href="/quiz">Take the quiz</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/match">Match with teachers</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
