"use client"

import { useEffect, useState } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DashboardSkeleton, ErrorState } from "@/components/ui/api-states"
import Link from "next/link"
import {
  BarChart3, BrainCircuit, Activity, AlertTriangle, BookOpen, Play,
  ClipboardCheck, Clock, TrendingDown, TrendingUp, Bell,
} from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts"
import { fetchStudentDashboard, fetchStudentTrend } from "@/lib/api"
import { useAuth } from "@/components/auth/auth-provider"
import { useApiQuery } from "@/hooks/use-api"
import type { StudentDashboardData, StudentTrendResponse } from "@/lib/types"

const heatScale: Record<string, string[]> = {
  green: ["bg-emerald-200", "bg-emerald-300", "bg-emerald-400"],
  yellow: ["bg-amber-200", "bg-amber-300", "bg-amber-400"],
  red: ["bg-rose-200", "bg-rose-300", "bg-rose-400"],
}

const chartGrid = "hsl(var(--border))"
const chartAxis = "hsl(var(--muted-foreground))"
const tooltipStyle = {
  background: "rgba(255,255,255,0.96)",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  boxShadow: "0 10px 28px -16px rgba(15,23,42,.25)",
}

type TrendChartPoint = { attempt: number; mastery: number; confusion: number }

export default function StudentDashboard() {
  const { user } = useAuth()
  const { data, loading, error, refetch } = useApiQuery<StudentDashboardData>(fetchStudentDashboard)
  const [trendData, setTrendData] = useState<TrendChartPoint[]>([])
  const [trendMeta, setTrendMeta] = useState<StudentTrendResponse | null>(null)

  useEffect(() => {
    let active = true
    const studentId = user?.id ?? "demo-student"

    fetchStudentTrend(studentId)
      .then((res) => {
        if (!active) return
        const combined = res.mastery_trend.map((m, i) => ({
          attempt: i + 1,
          mastery: m,
          confusion: res.confusion_trend[i] ?? 0,
        }))
        setTrendData(combined)
        setTrendMeta(res)
      })
      .catch(() => {
        if (!active) return
        setTrendData([])
        setTrendMeta(null)
      })

    return () => {
      active = false
    }
  }, [user?.id])

  const displayName = user?.name ?? "Student"

  if (loading) {
    return (
      <DashboardShell role="student" userName={displayName} meta="">
        <DashboardSkeleton />
      </DashboardShell>
    )
  }

  if (error || !data) {
    return (
      <DashboardShell role="student" userName={displayName} meta="">
        <ErrorState message={error ?? "Failed to load dashboard data"} onRetry={refetch} />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="student" userName={displayName} meta="">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={BarChart3}
          label="Mastery Score"
          value={`${data.mastery_score}%`}
          trend={data.mastery_trend}
          trendUp={data.mastery_trend?.startsWith("+") ?? false}
        />
        <MetricCard
          icon={BrainCircuit}
          label="Confusion Score"
          value={String(data.confusion_score)}
          subLabel={data.confusion_label}
          badgeColor="state-warning-soft"
        />
        <MetricCard
          icon={Activity}
          label="Engagement Score"
          value={`${data.engagement_score}%`}
          trend={data.engagement_trend}
          trendUp={data.engagement_trend?.startsWith("+") ?? false}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Risk Indicator"
          value={data.risk_indicator}
          badgeColor={data.risk_indicator === "Low Risk" ? "state-success-soft" : "state-danger-soft"}
        />
      </div>

      {/* Subject mastery + Heatmap */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>Subject Mastery</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {(data.subjects ?? []).map((s) => (
              <div key={s.name}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{s.name}</span>
                  <span className="text-sm font-bold text-foreground">{s.mastery}%</span>
                </div>
                <Progress value={s.mastery} className="h-2" />
                <div className="mt-1 flex gap-2">
                  <Badge variant="secondary" className="text-[10px]">Strong: {s.strength}</Badge>
                  <Badge variant="outline" className="text-[10px] text-destructive">Weak: {s.weak}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>Topic Mastery Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><div className="heat-strong h-2.5 w-2.5 rounded-sm" /> Strong</span>
              <span className="flex items-center gap-1"><div className="heat-moderate h-2.5 w-2.5 rounded-sm" /> Improving</span>
              <span className="flex items-center gap-1"><div className="heat-weak h-2.5 w-2.5 rounded-sm" /> Weak</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {(data.topic_heatmap ?? []).map((row, ri) => (
                <div key={ri} className="grid grid-cols-8 gap-1.5">
                  {(row ?? []).map((cell, ci) => (
                    <div key={ci} className={`h-8 rounded-md transition-colors duration-200 ${heatCellClass(cell, ri, ci)}`} />
                  ))}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Topics colored based on mastery. Click to open learning page.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>Silent Confusion Monitor</CardTitle>
            <p className="text-xs text-muted-foreground">Score trend over the last 7 days</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.confusion_trend ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke={chartAxis} />
                <YAxis tick={{ fontSize: 11 }} stroke={chartAxis} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "hsl(var(--border))" }} />
                <Line type="monotone" dataKey="score" stroke="oklch(0.77 0.12 82)" strokeWidth={2} dot={{ fill: "oklch(0.77 0.12 82)" }} />
              </LineChart>
            </ResponsiveContainer>
            <p className="mt-2 text-xs text-muted-foreground">
              If confusion score rises, simplified explanations and remedial lessons are automatically triggered.
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>Focus & Engagement Tracking</CardTitle>
            <p className="text-xs text-muted-foreground">Engagement trend over 7 days</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.engagement_trend_data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke={chartAxis} />
                <YAxis tick={{ fontSize: 11 }} stroke={chartAxis} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(15,23,42,0.03)" }} />
                <Bar dataKey="score" fill="oklch(0.57 0.11 195)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-muted p-2">
                <p className="text-muted-foreground">Avg Session</p>
                <p className="font-semibold text-foreground">{data.avg_session_minutes} min</p>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <p className="text-muted-foreground">Sessions/Week</p>
                <p className="font-semibold text-foreground">{data.sessions_per_week}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Analytics Intelligence */}
      <div className="mt-6">
        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>
              Live Intelligence Analytics
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Real attempt-by-attempt mastery and confusion trends from the analytics engine.
            </p>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                    <XAxis dataKey="attempt" tick={{ fontSize: 11 }} stroke={chartAxis} />
                    <YAxis tick={{ fontSize: 11 }} stroke={chartAxis} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="mastery" stroke="oklch(0.46 0.10 232)" strokeWidth={3} name="Mastery" dot={{ fill: "oklch(0.46 0.10 232)" }} />
                    <Line type="monotone" dataKey="confusion" stroke="oklch(0.61 0.13 24)" strokeWidth={3} name="Confusion" dot={{ fill: "oklch(0.61 0.13 24)" }} />
                  </LineChart>
                </ResponsiveContainer>

                <div className="mt-4 flex flex-wrap gap-2">
                  <RiskBadge risk={(trendMeta?.risk_trend.at(-1) as string | undefined) ?? data.risk_indicator.replace(" Risk", "")} />
                  {isInterventionTriggered(trendMeta) && (
                    <span className="risk-pill state-info-soft">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> AI Remedial Support Generated
                    </span>
                  )}
                  {isParentAlertTriggered(trendMeta) && (
                    <span className="risk-pill state-warning-soft">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Parent Notification Sent
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-border/80 bg-muted/50 p-4 text-sm text-muted-foreground">
                Trend analytics will appear after quiz attempts are recorded.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations + Quick Actions */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>AI Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(data.recommendations ?? []).map((r, i) => (
              <div key={i} className={`flex items-center justify-between rounded-xl border p-3 transition-all duration-200 hover:shadow-sm ${r.type === "warning" ? "state-warning-soft" :
                r.type === "success" ? "state-success-soft" :
                  "border-border bg-muted"
                }`}>
                <p className="text-sm text-foreground">{r.text}</p>
                <Button size="sm" variant="outline" className="shrink-0 text-xs" asChild>
                  <Link href="/learning">Start</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="dashboard-panel">
            <CardHeader>
              <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto flex-col gap-1 py-4" asChild>
                <Link href="/learning"><BookOpen className="h-5 w-5 text-primary" /><span className="text-xs">New Lesson</span></Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-1 py-4" asChild>
                <Link href="/learning"><Play className="h-5 w-5 text-primary" /><span className="text-xs">Resume</span></Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-1 py-4" asChild>
                <Link href="/quiz"><ClipboardCheck className="h-5 w-5 text-primary" /><span className="text-xs">Adaptive Quiz</span></Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-1 py-4" asChild>
                <Link href="/remedial"><Clock className="h-5 w-5 text-primary" /><span className="text-xs">Timeline</span></Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="dashboard-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base" style={{ fontFamily: "var(--font-heading)" }}>
                <Bell className="h-4 w-4" /> Parent Notification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-xs">Parent Alerts: {data.parent_alerts_active ? "Active" : "Inactive"}</Badge>
              <p className="mt-2 text-xs text-muted-foreground">
                We notify parents only when consistent low engagement or high confusion is detected.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}

function MetricCard({
  icon: Icon, label, value, subLabel, trend, trendUp, badgeColor,
}: {
  icon: React.ElementType; label: string; value: string; subLabel?: string
  trend?: string; trendUp?: boolean; badgeColor?: string
}) {
  const gradientClass = label.includes("Mastery")
    ? "kpi-gradient-card kpi-teal"
    : label.includes("Confusion")
      ? "kpi-gradient-card kpi-purple"
      : label.includes("Engagement")
        ? "kpi-gradient-card kpi-blue"
        : (value?.toLowerCase() ?? "").includes("low")
          ? "kpi-gradient-card kpi-green"
          : "kpi-gradient-card kpi-red"

  return (
    <Card className={gradientClass}>
      <CardContent className="relative z-10 flex items-start gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/85">{label}</p>
          <p className="mt-1 text-2xl font-bold leading-none text-white" style={{ fontFamily: "var(--font-heading)" }}>{value}</p>
          {subLabel && badgeColor && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/12 px-2.5 py-1 text-[10px] font-semibold text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              {subLabel}
            </span>
          )}
          {trend && (
            <span className="mt-1 flex items-center gap-1 text-[10px] font-medium text-white/85">
              {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend}
            </span>
          )}
          {!subLabel && badgeColor && !trend && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/12 px-2.5 py-1 text-[10px] font-semibold text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              {value}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function heatCellClass(cell: string, rowIndex: number, colIndex: number) {
  const variants = heatScale[cell]
  if (!variants) return "bg-muted"
  return variants[(rowIndex + colIndex) % variants.length]
}

function RiskBadge({ risk }: { risk: string }) {
  const normalized = risk.toLowerCase()
  const cls = normalized.includes("high")
    ? "risk-pill risk-pill-high"
    : normalized.includes("medium")
      ? "risk-pill risk-pill-medium"
      : "risk-pill risk-pill-low"
  const dot = normalized.includes("high")
    ? "bg-rose-500"
    : normalized.includes("medium")
      ? "bg-amber-500"
      : "bg-emerald-500"
  return (
    <span className={cls}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {risk.includes("Risk") ? risk : `${risk} Risk`}
    </span>
  )
}

function isInterventionTriggered(meta: StudentTrendResponse | null) {
  if (!meta || meta.mastery_trend.length === 0) return false
  const latestMastery = meta.mastery_trend.at(-1) ?? 100
  const latestRisk = (meta.risk_trend.at(-1) ?? "Low").toLowerCase()
  return latestMastery < 60 || latestRisk === "high" || meta.risk_alert
}

function isParentAlertTriggered(meta: StudentTrendResponse | null) {
  if (!meta || meta.confusion_trend.length === 0) return false
  const latestConfusion = meta.confusion_trend.at(-1) ?? 0
  const latestRisk = (meta.risk_trend.at(-1) ?? "Low").toLowerCase()
  return latestConfusion > 70 || latestRisk === "high"
}
