import {
  GraduationCap,
  BrainCircuit,
  Activity,
  BarChart3,
  LayoutDashboard,
  AlertTriangle,
  MessageSquare,
  WifiOff,
  Smartphone,
  ShieldCheck,
} from "lucide-react"

const features = [
  { icon: GraduationCap, title: "Grade-Aware Adaptive Learning", desc: "Content dynamically adjusts for Grade 1-12 with multilingual support." },
  { icon: BrainCircuit, title: "Silent Confusion Detection", desc: "Detects hesitation, retries, hint usage to compute real-time Confusion Score." },
  { icon: Activity, title: "Engagement Detection Engine", desc: "Monitors focus, idle time, tab switching, and session consistency." },
  { icon: BarChart3, title: "Mastery Tracking", desc: "LeetCode-style topic mastery with strength/weakness visualization." },
  { icon: LayoutDashboard, title: "Teacher Heatmap Dashboard", desc: "Real-time class analytics with confusion and mastery heatmaps." },
  { icon: AlertTriangle, title: "Risk Prediction System", desc: "Predicts dropout probability and declining performance trends." },
  { icon: MessageSquare, title: "Parent SMS Alerts", desc: "Supportive notifications when consistent low engagement detected." },
  { icon: WifiOff, title: "Offline-First Mode", desc: "Content caching and sync for low-bandwidth rural environments." },
  { icon: Smartphone, title: "SMS Learning Mode", desc: "Micro-lessons and quizzes via SMS for basic feature phones." },
  { icon: ShieldCheck, title: "Ethical & Privacy-First", desc: "Parental consent, no surveillance, transparent AI scoring." },
]

export function LandingSolution() {
  return (
    <section id="solution" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2
            className="text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Educational Intelligence, Not Just AI Tutoring
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground leading-relaxed">
            This platform integrates adaptive learning, behavioral detection, predictive analytics,
            and rural-ready infrastructure into a single intelligent system.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col items-center rounded-xl border border-border bg-card p-5 text-center transition-shadow hover:shadow-md">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10">
                <f.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
