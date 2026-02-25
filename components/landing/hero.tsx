import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BarChart3, BrainCircuit, Eye, ShieldCheck } from "lucide-react"

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-16 lg:pb-28 lg:pt-24">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <div className="flex flex-col gap-6">
            <Badge variant="secondary" className="w-fit gap-1.5 px-3 py-1 text-xs font-medium">
              <BrainCircuit className="h-3.5 w-3.5" />
              AI-Powered Educational Intelligence
            </Badge>

            <h1
              className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-5xl xl:text-6xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Detect Silent Confusion{" "}
              <span className="text-primary">Before Students Fail.</span>
            </h1>

            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
              An AI-powered educational intelligence platform designed for rural
              school students (Grade 1-12), combining adaptive learning, confusion
              detection, engagement monitoring, teacher analytics, and parent alerts.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/auth">
                  Start Learning
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/auth?role=teacher">For Schools & Teachers</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-accent" />
                Privacy-first
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-accent" />
                No device spying
              </span>
              <span className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-accent" />
                Offline-ready
              </span>
            </div>
          </div>

          {/* Right: Dashboard preview */}
          <div className="relative">
            <div className="rounded-xl border border-border bg-card p-4 shadow-lg">
              {/* Mock dashboard header */}
              <div className="mb-4 flex items-center justify-between rounded-lg bg-muted px-4 py-2">
                <span className="text-xs font-medium text-muted-foreground">Student Dashboard</span>
                <Badge variant="outline" className="text-xs">Grade 7</Badge>
              </div>

              {/* Metric cards */}
              <div className="grid grid-cols-2 gap-3">
                <DashboardCard label="Mastery Score" value="68%" color="text-primary" />
                <DashboardCard label="Confusion Score" value="45" color="metric-caution" />
                <DashboardCard label="Engagement" value="72%" color="text-accent" />
                <DashboardCard label="Risk Level" value="Low" color="text-foreground" />
              </div>

              {/* Heatmap preview */}
              <div className="mt-4 rounded-lg border border-border p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Topic Mastery Heatmap</p>
                <div className="grid grid-cols-8 gap-1">
                  {Array.from({ length: 32 }).map((_, i) => {
                    const colors = [
                      "heat-strong", "bg-emerald-500/85", "heat-moderate",
                      "bg-emerald-300/85", "heat-weak", "bg-amber-300/85",
                      "heat-strong", "bg-emerald-500/85"
                    ]
                    return (
                      <div
                        key={i}
                        className={`h-4 w-full rounded-sm ${colors[i % colors.length]}`}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Confusion indicator */}
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200/70 bg-amber-50/80 px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-xs text-amber-800">Confusion detected in Algebra - Switching to simplified mode</span>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -right-2 -top-2 rounded-lg border border-border bg-card px-3 py-2 shadow-md">
              <p className="text-xs font-medium text-foreground">Live Tracking</p>
              <p className="text-[10px] text-muted-foreground">Behavioral signals active</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DashboardCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
