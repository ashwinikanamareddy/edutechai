import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LandingCTA() {
  return (
    <section className="bg-primary py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
        <h2
          className="text-balance text-3xl font-bold tracking-tight text-primary-foreground lg:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Build Strong Foundations Before It&apos;s Too Late.
        </h2>
        <p className="mt-4 text-primary-foreground/80 leading-relaxed">
          Our platform detects silent confusion before students fail, adapts learning dynamically,
          monitors engagement ethically, and supports rural infrastructure limitations.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth">Student Login</Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth?role=teacher">Teacher Dashboard</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <Link href="/dashboard/student">Explore Demo</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
