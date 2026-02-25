"use client"

import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  TrendingDown,
  TrendingUp,
  BarChart3,
  Activity,
  AlertTriangle,
  Target,
  Building2,
  Users,
  ArrowDown,
  WifiOff,
  MessageSquare,
  Server,
  CheckCircle2,
  BrainCircuit,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts"

const riskSimulation = [
  { month: "M1", noDetection: 25, withDetection: 25 },
  { month: "M2", noDetection: 32, withDetection: 22 },
  { month: "M3", noDetection: 40, withDetection: 20 },
  { month: "M4", noDetection: 52, withDetection: 18 },
  { month: "M5", noDetection: 58, withDetection: 15 },
  { month: "M6", noDetection: 65, withDetection: 12 },
]

const recoveryData = [
  { metric: "Mastery Improvement", value: 70 },
  { metric: "Confusion Reduction", value: 60 },
  { metric: "Engagement Stability", value: 55 },
]

const accuracyTrend = [
  { week: "W1", accuracy: 72 },
  { week: "W2", accuracy: 75 },
  { week: "W3", accuracy: 78 },
  { week: "W4", accuracy: 80 },
  { week: "W5", accuracy: 82 },
  { week: "W6", accuracy: 84 },
  { week: "W7", accuracy: 85 },
  { week: "W8", accuracy: 87 },
]

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 lg:px-8 lg:py-16">
        {/* Header */}
        <div className="text-center">
          <Badge variant="secondary" className="mb-4">Impact & Outcomes</Badge>
          <h1 className="text-balance text-3xl font-bold text-foreground lg:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
            Measuring Educational Impact Before It&apos;s Too Late
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
            Our system doesn&apos;t just track performance &mdash; it prevents academic decline.
          </p>
        </div>

        {/* Projected Impact Metrics */}
        <section className="mt-14">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Projected Impact Metrics
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Impact based on adaptive intervention modeling.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ImpactCard icon={BrainCircuit} label="Silent Confusion Reduction" value="30%" color="text-primary" />
            <ImpactCard icon={BarChart3} label="Mastery Stability Improvement" value="25%" color="text-accent" />
            <ImpactCard icon={Activity} label="Engagement Consistency" value="20%" color="metric-positive" />
            <ImpactCard icon={AlertTriangle} label="Risk Indicator Reduction" value="15%" color="metric-caution" />
          </div>
        </section>

        {/* Before vs After */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Before vs. After Comparison
          </h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="border-rose-200/70 bg-rose-50/40">
              <CardHeader>
                <CardTitle className="text-sm text-rose-800" style={{ fontFamily: "var(--font-heading)" }}>
                  Traditional Classroom Model
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {[
                  "Confusion detected only during exams",
                  "No engagement tracking system",
                  "No predictive risk indicators",
                  "No real-time parent awareness",
                  "Intervention happens after failure",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                    <span className="text-xs text-rose-800">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-emerald-200/70 bg-emerald-50/35">
              <CardHeader>
                <CardTitle className="text-sm text-emerald-800" style={{ fontFamily: "var(--font-heading)" }}>
                  With Educational Intelligence Platform
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {[
                  "Real-time confusion detection via behavior analysis",
                  "Early intervention before concepts are lost",
                  "Continuous engagement monitoring",
                  "Parent support system with SMS alerts",
                  "Predictive analytics for proactive action",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                    <span className="text-xs text-emerald-800">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Risk Prevention Simulation */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Dropout & Failure Risk Simulation
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">Failure probability comparison over 6 months.</p>
          <Card className="mt-6">
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={riskSimulation}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: "Risk %", angle: -90, position: "insideLeft", style: { fontSize: 10 } }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="noDetection" fill="rgba(225, 93, 93, 0.18)" stroke="oklch(0.61 0.13 24)" strokeWidth={2} name="No Detection" />
                  <Area type="monotone" dataKey="withDetection" fill="rgba(61, 154, 106, 0.16)" stroke="oklch(0.64 0.11 150)" strokeWidth={2} name="With Detection" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><div className="heat-weak h-2.5 w-2.5 rounded-sm" /> No early detection</span>
                <span className="flex items-center gap-1"><div className="heat-strong h-2.5 w-2.5 rounded-sm" /> With detection + intervention</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Recovery Success */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Recovery Success Rate
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">Students enrolled in remedial plans show significant improvement.</p>
          <Card className="mt-6">
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={recoveryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="metric" type="category" width={150} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="value" fill="oklch(0.57 0.11 195)" radius={[0, 6, 6, 0]} name="Improvement %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* Classroom Transformation */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Classroom Transformation Model
          </h2>
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center gap-4 p-6">
              {[
                "Large Classroom (50-70 students)",
                "Silent confusion clusters detected",
                "Targeted micro-interventions assigned",
                "Performance stabilized",
                "Confidence improved",
              ].map((label, i, arr) => (
                <div key={label} className="flex flex-col items-center gap-3">
                  <Badge
                    variant={i === arr.length - 1 ? "default" : "outline"}
                    className="px-4 py-1.5 text-sm"
                  >
                    {label}
                  </Badge>
                  {i < arr.length - 1 && <ArrowDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Rural Deployment Scalability */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Rural Deployment Scalability
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <ScaleCard count="1 School" students="500 Students" icon={Building2} />
            <ScaleCard count="10 Schools" students="5,000 Students" icon={Users} />
            <ScaleCard count="100 Schools" students="50,000 Students" icon={Building2} highlight />
          </div>
        </section>

        {/* Cost Efficiency */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Cost-Efficiency Estimation
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Server, text: "Minimal infrastructure requirement" },
              { icon: MessageSquare, text: "SMS-based fallback for zero-internet areas" },
              { icon: WifiOff, text: "Offline-first support reduces data costs" },
              { icon: Target, text: "Edge AI deployment ready" },
              { icon: Users, text: "Teacher-driven distribution model" },
            ].map((item) => (
              <Card key={item.text}>
                <CardContent className="flex items-center gap-3 p-4">
                  <item.icon className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm text-foreground">{item.text}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Confusion Matrix Evaluation Impact */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Confusion Matrix Evaluation Impact
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">The adaptive engine continuously self-evaluates prediction accuracy.</p>
          <Card className="mt-6">
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={accuracyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[65, 90]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Line type="monotone" dataKey="accuracy" stroke="oklch(0.46 0.10 232)" strokeWidth={2} dot={{ fill: "oklch(0.46 0.10 232)" }} name="Accuracy %" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-muted p-2">
                  <p className="text-[10px] text-muted-foreground">False Risk Alerts</p>
                  <p className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                    <TrendingDown className="inline h-3 w-3 text-emerald-700" /> Declining
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <p className="text-[10px] text-muted-foreground">Recommendation Precision</p>
                  <p className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                    <TrendingUp className="inline h-3 w-3 text-emerald-700" /> Improving
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <p className="text-[10px] text-muted-foreground">Prediction Accuracy</p>
                  <p className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>87%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Final Vision */}
        <section className="mt-16 text-center">
          <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            &ldquo;This platform transforms reactive education into proactive intelligence.&rdquo;
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/architecture">View Architecture</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth">Explore Demo</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function ImpactCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-5 text-center">
        <Icon className={`mx-auto h-6 w-6 ${color}`} />
        <p className={`mt-3 text-3xl font-bold ${color}`} style={{ fontFamily: "var(--font-heading)" }}>{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}

function ScaleCard({ count, students, icon: Icon, highlight }: { count: string; students: string; icon: React.ElementType; highlight?: boolean }) {
  return (
    <Card className={highlight ? "border-primary bg-primary/5" : ""}>
      <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
        <Icon className={`h-6 w-6 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
        <p className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{count}</p>
        <p className="text-sm text-muted-foreground">{students}</p>
      </CardContent>
    </Card>
  )
}
