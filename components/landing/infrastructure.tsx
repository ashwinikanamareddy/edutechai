import { Wifi, WifiOff, Smartphone, Server } from "lucide-react"

export function LandingInfrastructure() {
  return (
    <section className="bg-muted py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2
            className="text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Built for Rural Infrastructure
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Designed for real-world constraints with offline-first architecture and SMS-based fallbacks.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <InfraCard
            icon={WifiOff}
            title="Offline-First"
            desc="Content caching, local storage, and auto-sync when connectivity returns."
          />
          <InfraCard
            icon={Smartphone}
            title="SMS Learning"
            desc="Micro-lessons and quizzes via SMS for basic 2G feature phones."
          />
          <InfraCard
            icon={Server}
            title="Edge AI Nodes"
            desc="Local school deployment with Raspberry Pi and offline LLM support."
          />
          <InfraCard
            icon={Wifi}
            title="Low Bandwidth"
            desc="Text-first design with compressed audio and minimal data usage."
          />
        </div>

        {/* Architecture flow */}
        <div className="mt-12 rounded-xl border border-border bg-card p-6">
          <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Deployment Architecture
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["Student Devices", "Local School AI Node", "Local Database", "Periodic Cloud Sync", "District Analytics"].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 px-4 py-2">
                  <p className="text-xs font-medium text-primary">{step}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="text-muted-foreground">&rarr;</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function InfraCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  )
}
