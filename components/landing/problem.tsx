import {
  Users,
  VolumeX,
  Languages,
  Copy,
  EyeOff,
  ClipboardX,
  BellOff,
  WifiOff,
} from "lucide-react"

const problems = [
  { icon: Users, title: "Large Classrooms", desc: "50-70 students per teacher make individual attention impossible." },
  { icon: VolumeX, title: "Afraid to Ask Doubts", desc: "Students hesitate, struggle silently, and avoid questions." },
  { icon: Languages, title: "Language Barriers", desc: "Content often English-heavy, not localized to student needs." },
  { icon: Copy, title: "One-Size-Fits-All", desc: "Teaching ignores individual weaknesses and learning pace." },
  { icon: EyeOff, title: "Silent Confusion", desc: "Students nod, copy notes, attempt quizzes — but internally struggle." },
  { icon: ClipboardX, title: "Gaps Found Too Late", desc: "Teachers discover problems only after exams." },
  { icon: BellOff, title: "Parents Unaware", desc: "No visibility into when engagement drops or confusion builds." },
  { icon: WifiOff, title: "Poor Infrastructure", desc: "Low bandwidth, unstable internet in rural areas." },
]

export function LandingProblem() {
  return (
    <section id="problem" className="bg-muted py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2
            className="text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            The Hidden Crisis in Rural Education
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground leading-relaxed">
            Students don&apos;t fail suddenly. They nod in class, copy notes, attempt quizzes — but internally struggle.
            This &quot;Silent Confusion&quot; builds slowly until it&apos;s too late.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((item) => (
            <div
              key={item.title}
              className="group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-4 text-center">
          <p className="text-sm font-medium text-foreground">
            &quot;Failure is not sudden. It builds silently. Traditional systems detect failure — they do NOT detect silent struggle.&quot;
          </p>
        </div>
      </div>
    </section>
  )
}
