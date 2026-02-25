import { Badge } from "@/components/ui/badge"

const heatmapData = [
  { student: "Student A", topics: ["green", "green", "yellow", "green", "red"] },
  { student: "Student B", topics: ["yellow", "red", "red", "yellow", "green"] },
  { student: "Student C", topics: ["green", "green", "green", "yellow", "green"] },
  { student: "Student D", topics: ["red", "yellow", "red", "red", "yellow"] },
  { student: "Student E", topics: ["green", "yellow", "green", "green", "green"] },
]

const topicLabels = ["Algebra", "Fractions", "Geometry", "Decimals", "Statistics"]

const colorMap: Record<string, string> = {
  green: "heat-strong",
  yellow: "heat-moderate",
  red: "heat-weak",
}

export function LandingForTeachers() {
  return (
    <section id="teachers" className="bg-muted py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Dashboard Preview */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Class Mastery Heatmap</h3>
              <Badge variant="secondary" className="text-xs">Grade 7 - Math</Badge>
            </div>

            {/* Topic headers */}
            <div className="mb-2 grid grid-cols-[100px_1fr] gap-2">
              <div />
              <div className="grid grid-cols-5 gap-1">
                {topicLabels.map((t) => (
                  <p key={t} className="text-center text-[10px] font-medium text-muted-foreground">{t}</p>
                ))}
              </div>
            </div>

            {/* Heatmap rows */}
            {heatmapData.map((row) => (
              <div key={row.student} className="mb-1 grid grid-cols-[100px_1fr] gap-2">
                <p className="text-xs font-medium text-foreground">{row.student}</p>
                <div className="grid grid-cols-5 gap-1">
                  {row.topics.map((color, i) => (
                    <div key={i} className={`h-6 rounded-sm ${colorMap[color]}`} />
                  ))}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="mt-4 flex gap-4 border-t border-border pt-3">
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <div className="heat-strong h-2.5 w-2.5 rounded-sm" /> Strong
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <div className="heat-moderate h-2.5 w-2.5 rounded-sm" /> Moderate
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <div className="heat-weak h-2.5 w-2.5 rounded-sm" /> Weak
              </span>
            </div>

            {/* Risk alerts */}
            <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-xs font-medium text-foreground">Risk Alert: Student D - High confusion in Fractions & Geometry</p>
              <p className="text-[10px] text-muted-foreground">Recommended: Assign remedial session</p>
            </div>
          </div>

          {/* Text content */}
          <div>
            <h2
              className="text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              See What Exams Cannot Reveal.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              The Teacher Dashboard provides deep class analytics including mastery heatmaps,
              silent confusion detection, engagement tracking, risk prediction, and parent alert monitoring.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {[
                "Class mastery & confusion heatmaps",
                "Engagement distribution & trends",
                "Risk prediction with suggested actions",
                "Parent notification logs",
                "Adaptive engine accuracy metrics",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
