"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DashboardSkeleton, ErrorState } from "@/components/ui/api-states"
import Link from "next/link"
import {
  GraduationCap, Activity, BrainCircuit, AlertTriangle,
  Bell, Phone, FileText, ShieldCheck, Eye, Lock, Heart,
} from "lucide-react"
import { fetchParentDashboard } from "@/lib/api"
import { useAuth } from "@/components/auth/auth-provider"
import { useApiQuery } from "@/hooks/use-api"
import type { ParentDashboardData } from "@/lib/types"

export default function ParentDashboard() {
  const { user } = useAuth()
  const { data, loading, error, refetch } = useApiQuery<ParentDashboardData>(fetchParentDashboard)
  const displayName = user?.name ?? "Parent"

  if (loading) {
    return (
      <DashboardShell role="parent" userName={displayName} meta="">
        <DashboardSkeleton />
      </DashboardShell>
    )
  }

  if (error || !data) {
    return (
      <DashboardShell role="parent" userName={displayName} meta="">
        <ErrorState message={error ?? "Failed to load dashboard data"} onRetry={refetch} />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="parent" userName={displayName} meta={`Parent of ${data.child_name}`}>
      {/* Header message */}
      <div className="mb-6 rounded-xl border border-accent/20 bg-accent/5 p-4 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.18)] transition-all duration-200">
        <p className="text-sm font-semibold text-foreground">Supporting Your Child&apos;s Learning Journey</p>
        <p className="mt-1 text-xs text-muted-foreground">Last updated: {data.last_updated}</p>
      </div>

      {/* Status cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard icon={GraduationCap} label="Overall Mastery" value={data.overall_mastery} explain="How well your child understands topics" color="text-primary" />
        <StatusCard icon={Activity} label="Engagement Level" value={data.engagement_level} explain="How consistently your child focuses during learning" color="text-green-600" />
        <StatusCard icon={BrainCircuit} label="Confusion Level" value={data.confusion_level} explain="Areas where your child may need extra explanation" color="text-amber-600" />
        <StatusCard icon={AlertTriangle} label="Risk Indicator" value={data.risk_indicator} explain="Early warning if learning gaps are increasing" color="text-green-600" />
      </div>

      {/* Subject Progress + Engagement */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>Subject Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {(data.subjects ?? []).map((s) => (
              <SubjectRow key={s.name} name={s.name} value={s.value} advice={s.advice} />
            ))}
          </CardContent>
        </Card>

        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>Engagement Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/70 bg-muted/70 p-3 text-center">
                <p className="text-xs text-muted-foreground">Active Days</p>
                <p className="mt-1 text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{data.active_days}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/70 p-3 text-center">
                <p className="text-xs text-muted-foreground">Avg Session</p>
                <p className="mt-1 text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{data.avg_session}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/70 p-3 text-center">
                <p className="text-xs text-muted-foreground">Incomplete</p>
                <p className="mt-1 text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{data.incomplete}</p>
              </div>
            </div>
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
              <p className="text-sm text-foreground">Small daily study sessions improve confidence.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts + Confusion Insight */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base" style={{ fontFamily: "var(--font-heading)" }}>
              <Bell className="h-4 w-4" /> Support Notifications
            </CardTitle>
            <p className="text-xs text-muted-foreground">Alerts sent only when consistent patterns detected.</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(data.alerts ?? []).map((a, i) => (
              <div key={i} className="rounded-xl border border-border/80 bg-muted/60 p-3 transition-all duration-200 hover:bg-muted/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{a.reason}</span>
                  <span className="text-[10px] text-muted-foreground">{a.date}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{a.action}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>Confusion Insight</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We track signals like hesitation, retries, and difficulty patterns to detect when your
              child may not fully understand a concept.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-3 flex-1 overflow-hidden rounded-full border border-border/60 bg-muted/80">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 transition-all duration-500" style={{ width: `${data.confusion_percentage}%` }} />
              </div>
              <span className="risk-pill risk-pill-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {data.confusion_level}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Your child is working through some challenging topics. Extra encouragement helps.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How You Can Help */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base" style={{ fontFamily: "var(--font-heading)" }}>
              <Heart className="h-4 w-4" /> How You Can Help
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(data.suggestions ?? []).map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <p className="text-sm text-foreground">{s}</p>
              </div>
            ))}
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="gap-1"><FileText className="h-4 w-4" /> Download Report</Button>
              <Button size="sm" variant="outline" className="gap-1"><Phone className="h-4 w-4" /> Contact Teacher</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>Privacy & Ethics</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {[
              { icon: Eye, text: "We do NOT track other apps." },
              { icon: ShieldCheck, text: "We monitor learning behavior within the platform only." },
              { icon: Lock, text: "Data is securely stored and encrypted." },
              { icon: Bell, text: "Alerts are supportive, not punitive." },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-accent" />
                <p className="text-sm text-foreground">{item.text}</p>
              </div>
            ))}
            <Link href="/privacy" className="mt-2 text-xs font-medium text-primary underline">
              View Privacy Policy
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

function StatusCard({ icon: Icon, label, value, explain, color }: { icon: React.ElementType; label: string; value: string; explain: string; color: string }) {
  return (
    <Card className="dashboard-panel">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{label}</span>
        </div>
        <p className={`mt-2 text-2xl font-bold leading-none ${color}`} style={{ fontFamily: "var(--font-heading)" }}>{value}</p>
        <p className="mt-1 text-[10px] text-muted-foreground">{explain}</p>
      </CardContent>
    </Card>
  )
}

function SubjectRow({ name, value, advice }: { name: string; value: number; advice: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{name}</span>
        <span className="text-sm font-bold text-foreground">{value}%</span>
      </div>
      <Progress value={value} className="mt-1 h-2" />
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{advice}</p>
    </div>
  )
}
