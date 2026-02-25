import { ShieldCheck, Eye, Lock, Bell, UserCheck } from "lucide-react"

const commitments = [
  { icon: UserCheck, title: "Parental Consent", desc: "Required before any monitoring begins" },
  { icon: Eye, title: "No Device Spying", desc: "Only in-platform learning behavior tracked" },
  { icon: Lock, title: "Transparent Scoring", desc: "Students and parents see how scores work" },
  { icon: Bell, title: "Responsible Alerts", desc: "Supportive tone, never punitive notifications" },
  { icon: ShieldCheck, title: "Privacy-First", desc: "Encrypted storage, no third-party data sales" },
]

export function LandingEthics() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2
            className="text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Ethical AI Commitment
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Education intelligence should empower, not surveil. Every design decision
            prioritizes student safety and parental trust.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {commitments.map((c) => (
            <div key={c.title} className="flex flex-col items-center rounded-xl border border-border bg-card p-5 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <c.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
