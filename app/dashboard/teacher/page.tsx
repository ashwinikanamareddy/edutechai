"use client"

import { useEffect, useState } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardSkeleton, ErrorState } from "@/components/ui/api-states"
import {
  BarChart3, BrainCircuit, Activity, AlertTriangle, Bell, Target,
  TrendingUp, TrendingDown, FileText, MessageSquare, Calendar, Users,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { fetchTeacherDashboard, exportClassReport, fetchTeacherRiskStudents, simulateRiskStudent } from "@/lib/api"
import { useAuth } from "@/components/auth/auth-provider"
import { useApiQuery } from "@/hooks/use-api"
import type { TeacherDashboardData, TeacherRiskStudentAnalytics } from "@/lib/types"

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

type TeacherTrendPoint = { attempt: number; mastery: number; confusion: number }

export default function TeacherDashboard() {
  const { user } = useAuth()
  const { data, loading, error, refetch } = useApiQuery<TeacherDashboardData>(fetchTeacherDashboard)
  const [flaggedStudents, setFlaggedStudents] = useState<TeacherRiskStudentAnalytics[]>([])
  const [selectedTrend, setSelectedTrend] = useState<TeacherTrendPoint[]>([])
  const [selectedFlagged, setSelectedFlagged] = useState<TeacherRiskStudentAnalytics | null>(null)
  const [simulating, setSimulating] = useState(false)
  const [simulateMessage, setSimulateMessage] = useState<string | null>(null)

  const displayName = user?.name ?? "Teacher"

  async function fetchRiskStudentsList() {
    try {
      const res = await fetchTeacherRiskStudents()
      setFlaggedStudents(res.students)
      const first = res.students[0] ?? null
      setSelectedFlagged(first)
      if (first) {
        setSelectedTrend(
          first.mastery_trend.map((m, i) => ({
            attempt: i + 1,
            mastery: m,
            confusion: first.confusion_trend[i] ?? 0,
          }))
        )
      } else {
        setSelectedTrend([])
      }
    } catch {
      setFlaggedStudents([])
      setSelectedFlagged(null)
      setSelectedTrend([])
    }
  }

  useEffect(() => {
    let active = true
    fetchTeacherRiskStudents()
      .then((res) => {
        if (!active) return
        setFlaggedStudents(res.students)
        const first = res.students[0] ?? null
        setSelectedFlagged(first)
        if (first) {
          setSelectedTrend(
            first.mastery_trend.map((m, i) => ({
              attempt: i + 1,
              mastery: m,
              confusion: first.confusion_trend[i] ?? 0,
            }))
          )
        } else {
          setSelectedTrend([])
        }
      })
      .catch(() => {
        if (!active) return
        setFlaggedStudents([])
        setSelectedFlagged(null)
        setSelectedTrend([])
      })
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <DashboardShell role="teacher" userName={displayName} meta="">
        <DashboardSkeleton />
      </DashboardShell>
    )
  }

  if (error || !data) {
    return (
      <DashboardShell role="teacher" userName={displayName} meta="">
        <ErrorState message={error ?? "Failed to load dashboard data"} onRetry={refetch} />
      </DashboardShell>
    )
  }

  async function handleExport() {
    try {
      const blob = await exportClassReport()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url; a.download = "class-report.pdf"; a.click()
      URL.revokeObjectURL(url)
    } catch { /* handled by global interceptor */ }
  }

  async function handleSimulateRisk() {
    try {
      setSimulating(true)
      setSimulateMessage(null)
      await simulateRiskStudent({
        student_id: "demo-student",
        language: "English",
      })
      await Promise.allSettled([refetch(), fetchRiskStudentsList()])
      setSimulateMessage("At-risk student simulation completed. Analytics refreshed.")
    } catch (e) {
      setSimulateMessage(e instanceof Error ? e.message : "Simulation failed")
    } finally {
      setSimulating(false)
    }
  }

  return (
    <DashboardShell role="teacher" userName={displayName} meta="">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard icon={BarChart3} label="Avg Mastery" value={data.avg_mastery} trend="+2%" up />
        <KPICard icon={BrainCircuit} label="Avg Confusion" value={data.avg_confusion} trend="-3" up />
        <KPICard icon={Activity} label="Avg Engagement" value={data.avg_engagement} trend="+4%" up />
        <KPICard icon={AlertTriangle} label="At Risk" value={String(data.at_risk_count)} />
        <KPICard icon={Bell} label="Alerts Sent" value={String(data.alerts_sent)} />
        <KPICard icon={Target} label="Engine Accuracy" value={data.engine_accuracy} />
      </div>

      {/* Heatmaps */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>Class Mastery Heatmap</CardTitle>
            <p className="text-xs text-muted-foreground">Students vs Topics</p>
          </CardHeader>
          <CardContent>
            <HeatmapGrid students={data.heatmap_students} topics={data.heatmap_topics} data={data.mastery_heatmap} />
          </CardContent>
        </Card>
        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>Silent Confusion Detection</CardTitle>
            <p className="text-xs text-muted-foreground">Confusion detected through hesitation, retry behavior, hint usage, and instability.</p>
          </CardHeader>
          <CardContent>
            <HeatmapGrid students={data.heatmap_students} topics={data.heatmap_topics} data={data.confusion_heatmap} />
          </CardContent>
        </Card>
      </div>

      {/* Engagement Chart + Risk Table */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>Engagement Monitoring</CardTitle>
            <p className="text-xs text-muted-foreground">Class engagement trend by week</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.engagement_data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke={chartAxis} />
                <YAxis tick={{ fontSize: 11 }} stroke={chartAxis} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "hsl(var(--border))" }} />
                <Line type="monotone" dataKey="score" stroke="oklch(0.57 0.11 195)" strokeWidth={2} dot={{ fill: "oklch(0.57 0.11 195)" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>Early Risk Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <Table containerClassName="max-h-[320px] overflow-auto">
              <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Cause</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr:last-child]:border-b-0">
                {(data.students ?? []).map((s) => (
                  <TableRow key={s.name} className="group">
                    <TableCell className="text-sm font-semibold">{s.name}</TableCell>
                    <TableCell>
                      <RiskPill risk={s.risk} />
                    </TableCell>
                    <TableCell className="max-w-[180px] whitespace-normal text-xs leading-relaxed text-muted-foreground">{s.cause}</TableCell>
                    <TableCell className="max-w-[180px] whitespace-normal text-xs leading-relaxed text-muted-foreground">{s.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Parent Notifications + Engine Metrics */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>Parent Support Alerts</CardTitle>
            <p className="text-xs text-muted-foreground">Alerts triggered only after consistent patterns.</p>
          </CardHeader>
          <CardContent>
            <Table containerClassName="max-h-[320px] overflow-auto">
              <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr:last-child]:border-b-0">
                {(data.notification_log ?? []).map((n, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm font-semibold">{n.student}</TableCell>
                    <TableCell className="text-xs">{n.type}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{n.date}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-full text-[10px]">{n.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>System Intelligence Evaluation</CardTitle>
            <p className="text-xs text-muted-foreground">Confusion Matrix Engine metrics</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <MetricBlock label="Prediction Accuracy" value={data.prediction_accuracy} />
              <MetricBlock label="False Risk Alerts" value={data.false_risk_alerts} />
              <MetricBlock label="Missed Weak Topics" value={data.missed_weak_topics} />
              <MetricBlock label="F1 Score" value={data.f1_score} />
            </div>
            <p className="mt-4 text-[10px] text-muted-foreground">
              The system continuously evaluates its adaptive logic to improve recommendation accuracy.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Intervention Intelligence */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>
              Live Risk & Intervention Trends
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Visualizing mastery decline and confusion spikes for the highest-priority student.
            </p>
          </CardHeader>
          <CardContent>
            {selectedFlagged && selectedTrend.length > 0 ? (
              <>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-full text-xs">{selectedFlagged.student_id}</Badge>
                  <PriorityPill priority={selectedFlagged.teacher_priority} />
                  <RiskPill risk={selectedFlagged.latest_risk} />
                  {selectedFlagged.intervention_required && (
                    <span className="risk-pill state-info-soft">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> AI Intervention
                    </span>
                  )}
                  {selectedFlagged.parent_notification_required && (
                    <span className="risk-pill state-warning-soft">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Parent Alert
                    </span>
                  )}
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={selectedTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                    <XAxis dataKey="attempt" tick={{ fontSize: 11 }} stroke={chartAxis} />
                    <YAxis tick={{ fontSize: 11 }} stroke={chartAxis} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="mastery" stroke="oklch(0.46 0.10 232)" strokeWidth={3} name="Mastery" dot={{ fill: "oklch(0.46 0.10 232)" }} />
                    <Line type="monotone" dataKey="confusion" stroke="oklch(0.61 0.13 24)" strokeWidth={3} name="Confusion" dot={{ fill: "oklch(0.61 0.13 24)" }} />
                  </LineChart>
                </ResponsiveContainer>
                {selectedFlagged.recommended_action && (
                  <div className="mt-4 rounded-xl border border-blue-200/70 bg-blue-50/70 p-3">
                    <p className="text-xs font-semibold text-blue-800">Recommended Action</p>
                    <p className="mt-1 text-sm text-blue-900">{selectedFlagged.recommended_action}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-border/80 bg-muted/50 p-4 text-sm text-muted-foreground">
                No flagged students available yet. Trend analytics appear after quiz attempts are recorded.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>
              Intervention Queue
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Highest-priority students requiring teacher review.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {flaggedStudents.length > 0 ? flaggedStudents.slice(0, 5).map((s) => (
              <button
                key={s.student_id}
                type="button"
                onClick={() => {
                  setSelectedFlagged(s)
                  setSelectedTrend(
                    s.mastery_trend.map((m, i) => ({
                      attempt: i + 1,
                      mastery: m,
                      confusion: s.confusion_trend[i] ?? 0,
                    }))
                  )
                }}
                className={`w-full rounded-xl border p-3 text-left transition-all duration-200 hover:shadow-sm ${selectedFlagged?.student_id === s.student_id ? "border-primary bg-primary/5" : "border-border/80 bg-muted/40"
                  }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{s.student_id}</p>
                  <PriorityPill priority={s.teacher_priority} />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <RiskPill risk={s.latest_risk} />
                  {s.intervention_required && <Badge variant="secondary" className="rounded-full text-[10px]">Intervention</Badge>}
                  {s.parent_notification_required && <Badge variant="secondary" className="rounded-full text-[10px]">Parent Alert</Badge>}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {s.recommended_action ?? "Monitor closely and review trend data."}
                </p>
              </button>
            )) : (
              <div className="rounded-xl border border-border/80 bg-muted/50 p-4 text-sm text-muted-foreground">
                No flagged students.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Center */}
      <div className="mt-6">
        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>Action Center</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button className="gap-2"><Users className="h-4 w-4" /> Assign Remedial Topic</Button>
            <Button variant="outline" className="gap-2"><MessageSquare className="h-4 w-4" /> Send Custom Parent Message</Button>
            <Button variant="outline" className="gap-2" onClick={handleExport}><FileText className="h-4 w-4" /> Export Class Report</Button>
            <Button variant="outline" className="gap-2"><Calendar className="h-4 w-4" /> Schedule Intervention</Button>
            <Button
              type="button"
              onClick={handleSimulateRisk}
              disabled={simulating}
              className="gap-2 bg-violet-600 text-white hover:bg-violet-700"
            >
              <BrainCircuit className="h-4 w-4" />
              {simulating ? "Simulating..." : "Simulate At-Risk Student"}
            </Button>
          </CardContent>
          {simulateMessage && (
            <div className="px-6 pb-4">
              <div className="rounded-xl border border-border/70 bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                {simulateMessage}
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  )
}

function KPICard({ icon: Icon, label, value, trend, up }: { icon: React.ElementType; label: string; value: string; trend?: string; up?: boolean }) {
  const gradientClass =
    label.includes("Mastery") || label.includes("Engagement")
      ? "kpi-gradient-card kpi-green"
      : label.includes("Confusion")
        ? "kpi-gradient-card kpi-purple"
        : label.includes("Risk") || label.includes("Alerts")
          ? "kpi-gradient-card kpi-red"
          : label.includes("Accuracy")
            ? "kpi-gradient-card kpi-teal"
            : "kpi-gradient-card kpi-blue"
  return (
    <Card className={gradientClass}>
      <CardContent className="relative z-10 flex flex-col gap-1.5 p-5">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-white" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/85">{label}</span>
        </div>
        <p className="text-2xl font-bold leading-none text-white" style={{ fontFamily: "var(--font-heading)" }}>{value}</p>
        {trend && (
          <span className="flex items-center gap-1 text-[10px] text-white/85">
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend}
          </span>
        )}
      </CardContent>
    </Card>
  )
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/70 p-3 text-center transition-colors duration-200 hover:bg-muted">
      <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{value}</p>
    </div>
  )
}

function HeatmapGrid({ students, topics, data }: { students: string[]; topics: string[]; data: string[][] }) {
  return (
    <div>
      <div className="mb-2 grid gap-1" style={{ gridTemplateColumns: `80px repeat(${(topics ?? []).length}, 1fr)` }}>
        <div />
        {(topics ?? []).map((t) => (
          <p key={t} className="text-center text-[9px] font-medium text-muted-foreground">{t}</p>
        ))}
      </div>
      {(data ?? []).map((row, ri) => (
        <div key={ri} className="mb-1 grid gap-1" style={{ gridTemplateColumns: `80px repeat(${(topics ?? []).length}, 1fr)` }}>
          <p className="text-xs font-medium text-foreground truncate">{students[ri]}</p>
          {(row ?? []).map((cell, ci) => (
            <div key={ci} className={`h-6 rounded-sm transition-colors duration-200 ${heatCellClass(cell, ri, ci)}`} />
          ))}
        </div>
      ))}
      <div className="mt-3 flex gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><div className="heat-strong h-2.5 w-2.5 rounded-sm" /> Strong</span>
        <span className="flex items-center gap-1"><div className="heat-moderate h-2.5 w-2.5 rounded-sm" /> Moderate</span>
        <span className="flex items-center gap-1"><div className="heat-weak h-2.5 w-2.5 rounded-sm" /> Weak</span>
      </div>
    </div>
  )
}

function heatCellClass(cell: string, rowIndex: number, colIndex: number) {
  const variants = heatScale[cell]
  if (!variants) return "bg-muted"
  return variants[(rowIndex + colIndex) % variants.length]
}

function RiskPill({ risk }: { risk: string }) {
  const styles =
    risk === "High"
      ? "risk-pill risk-pill-high"
      : risk === "Medium"
        ? "risk-pill risk-pill-medium"
        : "risk-pill risk-pill-low"
  const dot =
    risk === "High" ? "bg-rose-500" : risk === "Medium" ? "bg-amber-500" : "bg-emerald-500"
  return (
    <span className={styles}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {risk}
    </span>
  )
}

function PriorityPill({ priority }: { priority: string }) {
  const normalized = priority.toLowerCase()
  const cls =
    normalized === "critical"
      ? "risk-pill risk-pill-high"
      : normalized === "high"
        ? "risk-pill risk-pill-medium"
        : "risk-pill risk-pill-low"
  const dot =
    normalized === "critical"
      ? "bg-rose-500"
      : normalized === "high"
        ? "bg-amber-500"
        : "bg-emerald-500"
  return (
    <span className={cls}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {priority} Priority
    </span>
  )
}
