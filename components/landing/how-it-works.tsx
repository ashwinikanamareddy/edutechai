import { GraduationCap, BookOpen, Activity, BrainCircuit, Zap, LayoutDashboard, MessageSquare, WifiOff } from "lucide-react"

const steps = [
  { icon: GraduationCap, title: "Select Grade", desc: "Student selects Grade 1-12 to begin" },
  { icon: BookOpen, title: "Adaptive AI Tutor", desc: "Learns via AI-powered adaptive content" },
  { icon: Activity, title: "Behavior Tracking", desc: "System monitors learning patterns" },
  { icon: BrainCircuit, title: "Scores Computed", desc: "Confusion & Engagement scores calculated" },
  { icon: Zap, title: "Early Intervention", desc: "Automatic content adjustment triggered" },
  { icon: LayoutDashboard, title: "Teacher Updated", desc: "Real-time dashboard with class analytics" },
  { icon: MessageSquare, title: "Parent Notified", desc: "SMS alert sent if patterns persist" },
  { icon: WifiOff, title: "Offline Access", desc: "Full support in low-bandwidth areas" },
]

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2
            className="text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            How It Works
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            A seamless flow from student interaction to intelligent intervention.
          </p>
        </div>

        <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              {/* Step number */}
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                {i + 1}
              </div>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-6 hidden h-0.5 w-6 -translate-x-1/2 translate-x-full bg-border lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
