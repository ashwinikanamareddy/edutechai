import { Clock, RotateCcw, Lightbulb, Languages, BarChart, ArrowDown } from "lucide-react"

const signals = [
  { icon: Clock, label: "Time Hesitation", desc: "How long a student pauses before answering" },
  { icon: RotateCcw, label: "Retry Frequency", desc: "Number of times a question is re-attempted" },
  { icon: Lightbulb, label: "Hint Usage", desc: "How often hints are requested" },
  { icon: Languages, label: "Language Switching", desc: "Spike in switching between languages" },
  { icon: BarChart, label: "Quiz Instability", desc: "Inconsistent performance across attempts" },
]

const outcomes = [
  "Simplifies content automatically",
  "Adjusts difficulty level",
  "Notifies teacher",
  "Suggests remediation",
  "Alerts parents if persistent",
]

export function LandingConfusionEngine() {
  return (
    <section className="bg-muted py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <BarChart className="h-6 w-6 text-primary" />
          </div>
          <h2
            className="text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Core Innovation: Silent Confusion Engine
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground leading-relaxed">
            Instead of waiting for exam failure, the system detects behavioral signals in real-time
            and intervenes immediately.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Signals tracked */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Behavioral Signals Tracked
            </h3>
            <div className="flex flex-col gap-3">
              {signals.map((s) => (
                <div key={s.label} className="flex items-start gap-3 rounded-lg bg-muted p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confusion Score */}
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-primary/20 bg-card p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Combined into
            </p>
            <div className="relative mb-4 flex h-32 w-32 items-center justify-center rounded-full border-4 border-primary/20">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>45</p>
                <p className="text-xs text-muted-foreground">/100</p>
              </div>
            </div>
            <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              Confusion Score
            </h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Real-time metric combining all behavioral signals into a single actionable score.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                Low: 0-30
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                Mid: 31-60
              </span>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
                High: 61-100
              </span>
            </div>
          </div>

          {/* Outcomes */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              If Confusion Score Is High
            </h3>
            <div className="flex flex-col gap-3">
              {outcomes.map((outcome, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-accent/5 p-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                    {i + 1}
                  </div>
                  <p className="text-sm font-medium text-foreground">{outcome}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-4 py-3">
              <ArrowDown className="h-4 w-4 text-accent" />
              <p className="text-xs font-medium text-accent">Early intervention, not exam failure</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
