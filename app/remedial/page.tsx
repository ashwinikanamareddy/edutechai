"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DashboardSkeleton, ErrorState } from "@/components/ui/api-states"
import Link from "next/link"
import {
  BarChart3, BrainCircuit, Activity, AlertTriangle, BookOpen, Eye,
  CheckCircle2, ArrowRight, Clock, TrendingUp, TrendingDown, MessageSquare, Star,
} from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { fetchRemedialData, continueRecoveryStep, generateRemedialContent, getStoredUser } from "@/lib/api"
import { useApiQuery, useApiMutation } from "@/hooks/use-api"
import type { RemedialData } from "@/lib/types"

const iconMap: Record<string, React.ElementType> = {
  BookOpen, Eye, Star, CheckCircle2,
  default: BookOpen,
}

const interventionIconMap: Record<string, React.ElementType> = {
  TrendingDown, TrendingUp, Activity, AlertTriangle,
  default: BarChart3,
}

export default function RemedialPage() {
  const { data, loading, error, refetch } = useApiQuery<RemedialData>(fetchRemedialData)
  const continueMutation = useApiMutation<number, void>(continueRecoveryStep)
  const [language, setLanguage] = useState<string>(getStoredUser()?.language || "English")
  const [generatedContent, setGeneratedContent] = useState<string>("")
  const [generatedSource, setGeneratedSource] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string>("")

  if (loading) {
    return (
      <DashboardShell role="student" userName="Loading..." meta="">
        <DashboardSkeleton />
      </DashboardShell>
    )
  }

  if (error || !data) {
    return (
      <DashboardShell role="student" userName="Student" meta="">
        <ErrorState message={error ?? "Failed to load recovery plan"} onRetry={refetch} />
      </DashboardShell>
    )
  }

  async function handleGenerateLocalizedRemedial() {
    if (!data) return
    try {
      setIsGenerating(true)
      setGenerateError("")
      const primaryTopic = data.weak_subtopics[0]?.name ?? "Mathematics"
      const masteryValue = Number.parseFloat(data.current_mastery.replace(/[^\d.]/g, "")) || 50
      const confusionValue = Number.parseFloat(data.confusion_score.replace(/[^\d.]/g, "")) || 50
      const res = await generateRemedialContent({
        student_id: getStoredUser()?.id ?? null,
        topic: primaryTopic,
        mastery: masteryValue,
        confusion: confusionValue,
        language,
      })
      setGeneratedContent(res.remedial_content)
      setGeneratedSource(res.source)
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : "Failed to generate remedial content")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <DashboardShell role="student" userName="Student" meta="Recovery Plan Active">
      {/* Header Alert */}
      <div className="state-warning-soft mb-6 rounded-lg p-4">
        <p className="text-sm font-medium">{data.trigger_reason}</p>
        <p className="mt-1 text-xs">{data.trigger_detail}</p>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard icon={BarChart3} label="Current Mastery" value={data.current_mastery} color="metric-caution" />
        <StatusCard icon={BrainCircuit} label="Confusion Score" value={data.confusion_score} color="metric-negative" />
        <StatusCard icon={Activity} label="Engagement" value={data.engagement} color="metric-caution" />
        <StatusCard icon={AlertTriangle} label="Risk Level" value={data.risk_level} color="metric-negative" />
      </div>

      {/* Recovery Plan */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>AI-Generated Recovery Plan</CardTitle>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Est. {data.estimated_time}</span>
              </div>
            </div>
            <Progress value={data.recovery_completion} className="mt-2 h-2" />
            <p className="mt-1 text-xs text-muted-foreground">Recovery Completion: {data.recovery_completion}%</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(data.recovery_steps ?? []).map((s) => {
              const StepIcon = iconMap[s.icon_name] ?? iconMap.default
              return (
                <div
                  key={s.step}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${s.status === "done" ? "border-emerald-200/70 bg-emerald-50/80" :
                      s.status === "current" ? "border-primary bg-primary/5" :
                        "border-border bg-card"
                    }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${s.status === "done" ? "bg-emerald-600 text-white" :
                      s.status === "current" ? "bg-primary text-primary-foreground" :
                        "bg-muted text-muted-foreground"
                    }`}>
                    {s.status === "done" ? <CheckCircle2 className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Step {s.step}: {s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                  {s.status === "current" && (
                    <Button
                      size="sm"
                      className="gap-1"
                      disabled={continueMutation.loading}
                      onClick={() => continueMutation.mutate(s.step).then(() => refetch()).catch(() => { })}
                    >
                      Continue <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                  {s.status === "done" && (
                    <Badge variant="secondary" className="text-[10px] text-emerald-700">Complete</Badge>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Multilingual AI Support */}
      <div className="mt-6">
        <Card className="dashboard-panel">
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>
              Multilingual AI Remedial Support
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Generate remedial content in the student&apos;s preferred language to reduce language barriers.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="w-full sm:max-w-[220px]">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none ring-0 transition-colors focus:border-primary"
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Telugu</option>
                  <option>Tamil</option>
                </select>
              </div>
              <Button
                type="button"
                onClick={handleGenerateLocalizedRemedial}
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? "Generating..." : "Generate AI Remedial"}
              </Button>
              {generatedSource && (
                <Badge variant="secondary" className="rounded-full text-[10px]">
                  Source: {generatedSource}
                </Badge>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              This platform tracks learning behavior within the app only (not device spying).
            </p>

            {generateError && (
              <div className="state-danger-soft mt-4 rounded-xl p-3 text-sm">{generateError}</div>
            )}

            {generatedContent && (
              <div className="mt-4 rounded-xl border border-border/70 bg-muted/40 p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  AI Remedial Content ({language})
                </p>
                <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                  {generatedContent}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Topic Breakdown + Confidence */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>Topic Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {(data.weak_subtopics ?? []).map((t) => (
              <div key={t.name}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{t.name}</span>
                  <span className="text-sm font-bold text-foreground">{t.mastery}%</span>
                </div>
                <Progress value={t.mastery} className="mt-1 h-2" />
                {t.practice && (
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs gap-1" asChild>
                      <Link href="/learning"><BookOpen className="h-3 w-3" /> Practice</Link>
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs gap-1" asChild>
                      <Link href="/learning"><Eye className="h-3 w-3" /> Watch Explanation</Link>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>Confidence Index</CardTitle>
            <p className="text-xs text-muted-foreground">Reflects stability and consistency of correct responses.</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-rose-200/70 bg-rose-50/80 p-3 text-center">
                <p className="text-[10px] text-rose-700">Before Intervention</p>
                <p className="mt-1 text-xl font-bold text-rose-700" style={{ fontFamily: "var(--font-heading)" }}>{data.confidence_before}</p>
              </div>
              <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/80 p-3 text-center">
                <p className="text-[10px] text-emerald-700">Current</p>
                <p className="mt-1 text-xl font-bold text-emerald-700" style={{ fontFamily: "var(--font-heading)" }}>{data.confidence_current}</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">
                Confidence is increasing. Continue the recovery plan to strengthen understanding further.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Tracker Chart */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>
              Improvement Tracker: Before vs. After Intervention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.improvement_data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Line type="monotone" dataKey="confusion" stroke="oklch(0.61 0.13 24)" strokeWidth={2} name="Confusion" dot={{ fill: "oklch(0.61 0.13 24)" }} />
                <Line type="monotone" dataKey="mastery" stroke="oklch(0.46 0.10 232)" strokeWidth={2} name="Mastery" dot={{ fill: "oklch(0.46 0.10 232)" }} />
                <Line type="monotone" dataKey="engagement" stroke="oklch(0.57 0.11 195)" strokeWidth={2} name="Engagement" dot={{ fill: "oklch(0.57 0.11 195)" }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><div className="heat-weak h-2.5 w-2.5 rounded-sm" /> Confusion</span>
              <span className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-sm bg-indigo-500/85" /> Mastery</span>
              <span className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-sm bg-teal-500/85" /> Engagement</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Intervention Effectiveness + Panels */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>Intervention Effectiveness</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {(data.intervention_metrics ?? []).map((m) => {
              const MIcon = interventionIconMap[m.icon_name] ?? interventionIconMap.default
              return (
                <div key={m.label} className="rounded-lg bg-muted p-3 text-center">
                  <MIcon className={`mx-auto h-4 w-4 ${m.color}`} />
                  <p className={`mt-1 text-lg font-bold ${m.color}`} style={{ fontFamily: "var(--font-heading)" }}>{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm" style={{ fontFamily: "var(--font-heading)" }}>Teacher Intervention Panel</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button size="sm" variant="outline" className="w-full justify-start gap-2 text-xs"><BookOpen className="h-3.5 w-3.5" /> Assign Custom Practice</Button>
              <Button size="sm" variant="outline" className="w-full justify-start gap-2 text-xs"><Clock className="h-3.5 w-3.5" /> Schedule Guided Session</Button>
              <Button size="sm" variant="outline" className="w-full justify-start gap-2 text-xs"><MessageSquare className="h-3.5 w-3.5" /> Send Encouragement</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm" style={{ fontFamily: "var(--font-heading)" }}>Parent Support Message</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                <p className="text-xs text-foreground">
                  &ldquo;Your child has started a recovery plan. Encourage 15 minutes of practice daily.&rdquo;
                </p>
              </div>
              <Button size="sm" variant="outline" className="mt-3 w-full gap-2 text-xs"><MessageSquare className="h-3.5 w-3.5" /> Send Update to Parent</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button className="gap-2"><ArrowRight className="h-4 w-4" /> Continue Recovery Plan</Button>
            <Button variant="outline" className="gap-2" asChild><Link href="/quiz">Attempt Full Adaptive Quiz</Link></Button>
            <Button variant="outline" asChild><Link href="/dashboard/student">Return to Dashboard</Link></Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

function StatusCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        </div>
        <p className={`mt-1 text-2xl font-bold ${color}`} style={{ fontFamily: "var(--font-heading)" }}>{value}</p>
      </CardContent>
    </Card>
  )
}
