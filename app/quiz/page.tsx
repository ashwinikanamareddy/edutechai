"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DashboardSkeleton, ErrorState } from "@/components/ui/api-states"
import Link from "next/link"
import {
  Clock, RotateCcw, Lightbulb, Languages, Activity,
  CheckCircle, XCircle, ArrowRight, BarChart3, TrendingUp, TrendingDown,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { startQuiz, submitQuizAnswer, getQuizSummary, submitQuizToEngine, fetchStudentTrend } from "@/lib/api"
import { useAuth } from "@/components/auth/auth-provider"
import { useApiQuery, useApiMutation } from "@/hooks/use-api"
import type { QuizQuestion, QuizSession, QuizSubmission, QuizSubmissionResult, QuizSummary, StudentTrendResponse } from "@/lib/types"

// ─── Difficulty colour helpers ────────────────────────────────────────────────
function difficultyVariant(d?: string): "default" | "secondary" | "destructive" | "outline" {
  if (!d) return "outline"
  const dl = d.toLowerCase()
  if (dl === "hard") return "destructive"
  if (dl === "medium") return "default"
  return "secondary"
}

function difficultyLabel(d?: string) {
  if (!d) return "Easy"
  return d.charAt(0).toUpperCase() + d.slice(1).toLowerCase()
}

export default function QuizPage() {
  const { user } = useAuth()
  const displayName = user?.name ?? "Student"

  // ── Fetch initial quiz session ─────────────────────────────────────────────
  const { data: session, loading, error, refetch } = useApiQuery<QuizSession>(
    useCallback(
      () => startQuiz("Mathematics", "Linear Equations", { grade: user?.grade, student_id: user?.id ?? null }),
      [user?.grade, user?.id]
    ),
    [user?.grade, user?.id]
  )

  // ── One-at-a-time question state ───────────────────────────────────────────
  // currentQ: the question currently being displayed
  // answeredQuestions: history of answered questions (for progress display)
  const [currentQ, setCurrentQ] = useState<QuizQuestion | null>(null)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [maxQuestions, setMaxQuestions] = useState(10)
  const [queuedQuestions, setQueuedQuestions] = useState<QuizQuestion[]>([]) // remaining pre-loaded

  const [selected, setSelected] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackResult, setFeedbackResult] = useState<QuizSubmissionResult | null>(null)
  const [score, setScore] = useState(0)
  const [confusionScore, setConfusionScore] = useState(28)
  const [currentDifficulty, setCurrentDifficulty] = useState("Easy")
  const [completed, setCompleted] = useState(false)
  const [retries, setRetries] = useState(0)
  const [hintUsed, setHintUsed] = useState(0)
  const [showHint, setShowHint] = useState(false)

  // Per-question timer (tracks hesitation_time)
  const questionStartTime = useRef<number>(Date.now())
  const [elapsedSec, setElapsedSec] = useState(0)

  // Summary & Engine state
  const [summary, setSummary] = useState<QuizSummary | null>(null)
  const [engineMastery, setEngineMastery] = useState<number | null>(null)
  const [engineConfusion, setEngineConfusion] = useState<number | null>(null)
  const [engineRisk, setEngineRisk] = useState<string | null>(null)
  const [engineIntervention, setEngineIntervention] = useState(false)
  const [engineParentAlert, setEngineParentAlert] = useState(false)
  const [smsStatus, setSmsStatus] = useState<string | null>(null)
  const [engineError, setEngineError] = useState<string | null>(null)
  const [trendData, setTrendData] = useState<Array<{ attempt: number; mastery: number; confusion: number }>>([])
  const [trendMeta, setTrendMeta] = useState<StudentTrendResponse | null>(null)

  const submitMutation = useApiMutation<QuizSubmission, QuizSubmissionResult>(submitQuizAnswer)
  const summaryMutation = useApiMutation<string, QuizSummary>(getQuizSummary)

  const studentId = user?.id ?? "demo-student"
  const studentLanguage = user?.language ?? "English"

  // ── Initialise questions from session ─────────────────────────────────────
  useEffect(() => {
    if (session?.questions?.length) {
      const [first, ...rest] = session.questions
      setCurrentQ(first)
      setQueuedQuestions(rest)
      setMaxQuestions(session.max_questions ?? 10)
      setCurrentDifficulty(first.difficulty ?? "Easy")
      questionStartTime.current = Date.now()
      setElapsedSec(0)
    }
  }, [session])

  // ── Per-question elapsed timer ─────────────────────────────────────────────
  useEffect(() => {
    if (showFeedback || completed || !currentQ) return
    const id = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - questionStartTime.current) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [showFeedback, completed, currentQ])

  // ── Load trend data ────────────────────────────────────────────────────────
  const fetchTrend = useCallback(async () => {
    try {
      const res = await fetchStudentTrend(studentId)
      setTrendData(res.mastery_trend.map((m, i) => ({ attempt: i + 1, mastery: m, confusion: res.confusion_trend[i] ?? 0 })))
      setTrendMeta(res)
    } catch {
      setTrendData([])
      setTrendMeta(null)
    }
  }, [studentId])

  useEffect(() => {
    fetchTrend()
    // Initial demo data if empty
    setTrendData([
      { attempt: 1, mastery: 45, confusion: 65 },
      { attempt: 2, mastery: 55, confusion: 50 },
      { attempt: 3, mastery: 65, confusion: 40 },
    ])
  }, [fetchTrend])

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardShell role="student" userName={displayName} meta="Adaptive Quiz">
        <DashboardSkeleton />
      </DashboardShell>
    )
  }

  if (error || !session) {
    return (
      <DashboardShell role="student" userName={displayName} meta="Adaptive Quiz">
        <ErrorState message={error ?? "Failed to start quiz"} onRetry={refetch} />
      </DashboardShell>
    )
  }

  if (!completed && !currentQ) {
    return (
      <DashboardShell role="student" userName={displayName} meta="Adaptive Quiz">
        <ErrorState message="Quiz questions are not available. Please restart." onRetry={refetch} />
      </DashboardShell>
    )
  }

  // ── Handle answer selection ────────────────────────────────────────────────
  async function handleSelect(idx: number) {
    if (!currentQ || showFeedback) return
    setSelected(idx)
    const timeSpentMs = Date.now() - questionStartTime.current

    try {
      const result = await submitMutation.mutate({
        session_id: session!.session_id,
        question_id: currentQ.id,
        selected: idx,
        retries,
        hints_used: hintUsed,
        time_spent_ms: timeSpentMs,
      })
      setFeedbackResult(result)
      setShowFeedback(true)
      setConfusionScore(result.new_confusion_score)
      if (result.correct) setScore(s => s + 1)
      if (result.next_difficulty) setCurrentDifficulty(result.next_difficulty)
    } catch {
      // Local fallback
      const isCorrect = idx === currentQ.correct
      setFeedbackResult({
        correct: isCorrect,
        explanation: currentQ.explanation,
        new_confusion_score: confusionScore + (isCorrect ? -5 : 8),
        next_question: null,
      })
      setShowFeedback(true)
      if (isCorrect) setScore(s => s + 1)
      setConfusionScore(s => isCorrect ? Math.max(0, s - 5) : Math.min(100, s + 8))
    }
  }

  // ── Advance to the next question ───────────────────────────────────────────
  async function handleNext() {
    const newAnswered = answeredCount + 1
    setAnsweredCount(newAnswered)

    const isLast = newAnswered >= maxQuestions

    if (isLast) {
      // Quiz complete — go to summary
      setCompleted(true)
      setCurrentQ(null)

      try {
        const s = await summaryMutation.mutate(session!.session_id)
        setSummary(s)
      } catch { /* use local fallback */ }

      try {
        const finalCorrect = score + (feedbackResult?.correct ? 1 : 0)
        const finalMastery = Math.round((finalCorrect / newAnswered) * 100)
        const engagementScore = Math.max(35, 100 - Math.min(55, retries * 5 + hintUsed * 4))

        // Push new attempt to trend data locally for immediate display
        setTrendData(prev => [
          ...prev,
          { attempt: prev.length + 1, mastery: finalMastery, confusion: confusionScore }
        ])

        const res = await submitQuizToEngine({
          session_id: session?.session_id,
          student_id: studentId,
          language: studentLanguage,
          correct_answers: finalCorrect,
          total_questions: newAnswered,
          hesitation_time: Math.max(1, Math.round(confusionScore / 3)),
          retries,
          hints_used: hintUsed,
          instability_score: Math.min(100, confusionScore + retries * 2),
          engagement_score: engagementScore,
        })
        setEngineMastery(res.mastery)
        setEngineConfusion(res.confusion)
        setEngineRisk(res.risk)
        setEngineIntervention(res.intervention_triggered)
        setEngineParentAlert(res.parent_alert_triggered)
        setSmsStatus(res.sms_delivery_status ?? null)
        setEngineError(null)
        await fetchTrend()
      } catch (e) {
        setEngineError(e instanceof Error ? e.message : "Failed to submit to intelligence engine")
      }
      return
    }

    // Move to next question: prefer server-provided next_question, then queue, then error
    const serverNext = feedbackResult?.next_question
    if (serverNext) {
      setCurrentQ(serverNext)
    } else if (queuedQuestions.length > 0) {
      const [next, ...rest] = queuedQuestions
      setCurrentQ(next)
      setQueuedQuestions(rest)
    } else {
      // No more questions available — end quiz
      setCompleted(true)
      return
    }

    // Reset per-question state
    setSelected(null)
    setShowFeedback(false)
    setFeedbackResult(null)
    setShowHint(false)
    setRetries(0)
    setHintUsed(0)
    questionStartTime.current = Date.now()
    setElapsedSec(0)
  }

  function handleRetry() {
    setSelected(null)
    setShowFeedback(false)
    setFeedbackResult(null)
    setRetries(r => r + 1)
    setConfusionScore(s => Math.min(100, s + 3))
  }

  // ── Completed summary ──────────────────────────────────────────────────────
  if (completed) {
    const mastery = summary?.mastery_percent ?? Math.round((score / Math.max(1, answeredCount)) * 100)
    const summaryData = summary ?? {
      score, total: answeredCount, mastery_percent: mastery,
      confusion_change: confusionScore - 28, engagement: "High",
      confidence: mastery > 70 ? "Strong" : "Building",
      risk: mastery < 50 ? "Attention" : "Low",
      strengths: ["Basic Linear Equations"], weaknesses: ["Word Problems with variables"],
      predicted_mastery: "75%", actual_performance: `${mastery}%`,
      prediction_accuracy: "80%", adaptive_status: "Active",
    }
    const displayRisk = engineRisk ?? (summaryData.risk === "Attention" ? "High" : "Low")

    return (
      <DashboardShell role="student" userName={displayName} meta="Adaptive Quiz - Complete">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-xl" style={{ fontFamily: "var(--font-heading)" }}>Quiz Complete</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/30 bg-primary/5">
                <span className="text-3xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>{summaryData.mastery_percent}%</span>
              </div>

              <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
                <SummaryCard label="Final Score" value={`${summaryData.score}/${summaryData.total}`} />
                <SummaryCard label="Mastery" value={`${summaryData.mastery_percent}%`} />
                <SummaryCard label="Confusion Change" value={summaryData.confusion_change > 0 ? `+${summaryData.confusion_change}` : String(summaryData.confusion_change)} />
                <SummaryCard label="Engagement" value={summaryData.engagement} />
                <SummaryCard label="Confidence" value={summaryData.confidence} />
                <SummaryCard label="Risk" value={summaryData.risk} />
              </div>

              <div className="w-full rounded-lg border border-border bg-muted p-4 text-left">
                <p className="text-sm font-medium text-foreground">Based on your performance:</p>
                <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                  {summaryData.strengths.map((s, i) => <p key={i}>✅ Strength: {s}</p>)}
                  {summaryData.weaknesses.map((w, i) => <p key={i}>📖 Needs Practice: {w}</p>)}
                </div>
              </div>

              <div className="w-full rounded-lg border border-border bg-card p-4 text-left">
                <h4 className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>System Intelligence Evaluation</h4>
                <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded bg-muted p-2"><p className="text-muted-foreground">Predicted Mastery</p><p className="font-bold text-foreground">{summaryData.predicted_mastery}</p></div>
                  <div className="rounded bg-muted p-2"><p className="text-muted-foreground">Actual Performance</p><p className="font-bold text-foreground">{summaryData.actual_performance}</p></div>
                  <div className="rounded bg-muted p-2"><p className="text-muted-foreground">Prediction Accuracy</p><p className="font-bold text-foreground">{summaryData.prediction_accuracy}</p></div>
                  <div className="rounded bg-muted p-2"><p className="text-muted-foreground">Adaptive Status</p><p className="font-bold text-foreground">{summaryData.adaptive_status}</p></div>
                </div>
              </div>

              <div className="w-full rounded-lg border border-border bg-card p-4 text-left">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>Live Analytics Update</h4>
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold text-white transition-all duration-500 ${displayRisk === "High" ? "bg-rose-500" : displayRisk === "Medium" ? "bg-amber-500" : "bg-emerald-500"
                    }`}>
                    {displayRisk} Risk
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {engineIntervention && (
                    <span className="risk-pill state-info-soft">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> AI Remedial Support Generated
                    </span>
                  )}
                  {engineParentAlert && (
                    <span className="risk-pill state-warning-soft">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Parent Notification Sent
                    </span>
                  )}
                  {smsStatus === "sent" && (
                    <span className="risk-pill state-success-soft">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> SMS Sent
                    </span>
                  )}
                  {smsStatus === "failed" && (
                    <span className="risk-pill state-danger-soft">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> SMS Failed (Logged)
                    </span>
                  )}
                  {smsStatus === "skipped" && (
                    <span className="risk-pill bg-muted text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70" /> No Alert Needed
                    </span>
                  )}
                  {(engineMastery !== null || engineConfusion !== null) && (
                    <span className="risk-pill state-success-soft">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Engine: {engineMastery ?? summaryData.mastery_percent}% mastery / {Math.round(engineConfusion ?? confusionScore)} confusion
                    </span>
                  )}
                </div>

                {engineError && (
                  <div className="state-danger-soft mt-3 rounded-lg p-2 text-xs">{engineError}</div>
                )}

                <div className="mt-4 h-[240px] w-full">
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="attempt" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip />
                        <Line type="monotone" dataKey="mastery" stroke="oklch(0.46 0.10 232)" strokeWidth={3} name="Mastery" dot={{ fill: "oklch(0.46 0.10 232)" }} />
                        <Line type="monotone" dataKey="confusion" stroke="oklch(0.61 0.13 24)" strokeWidth={3} name="Confusion" dot={{ fill: "oklch(0.61 0.13 24)" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                      Trend graph will appear after attempts are stored.
                    </div>
                  )}
                </div>
                {trendMeta?.risk_alert && (
                  <p className="mt-2 text-xs text-amber-700">
                    Decline alert detected across recent attempts. Early intervention is recommended.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" onClick={refetch}>Retake Quiz</Button>
                <Button variant="outline" asChild><Link href="/remedial">Start Remedial Practice</Link></Button>
                <Button asChild><Link href="/dashboard/student">Return to Dashboard</Link></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    )
  }

  // ── Active quiz ────────────────────────────────────────────────────────────
  const progressPct = Math.round((answeredCount / maxQuestions) * 100)

  return (
    <DashboardShell role="student" userName={displayName} meta="Adaptive Quiz">
      {/* Progress bar */}
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Question {answeredCount + 1} of {maxQuestions}
        </span>
        <div className="flex items-center gap-3">
          <Badge variant={difficultyVariant(currentDifficulty)} className="text-xs gap-1">
            {currentDifficulty === "Hard" && <TrendingUp className="h-3 w-3" />}
            {currentDifficulty === "Easy" && <TrendingDown className="h-3 w-3" />}
            {difficultyLabel(currentDifficulty)}
          </Badge>
          <Badge variant={confusionScore > 50 ? "destructive" : "secondary"} className="text-xs">
            Confusion: {confusionScore}
          </Badge>
        </div>
      </div>
      <Progress value={progressPct} className="mb-6 h-2" />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Question card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: "var(--font-heading)" }}>
              {currentQ?.q}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {currentQ?.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={showFeedback || submitMutation.loading}
                  className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${showFeedback && feedbackResult?.correct && selected === i ? "state-success-soft" :
                    showFeedback && !feedbackResult?.correct && selected === i ? "state-danger-soft" :
                      showFeedback && i === currentQ.correct ? "state-success-soft" :
                        selected === i ? "border-primary bg-primary/5 text-foreground" :
                          "border-border bg-card text-foreground hover:bg-muted"
                    }`}
                >
                  {String.fromCharCode(65 + i)}) {opt}
                </button>
              ))}
            </div>

            {showFeedback && feedbackResult && (
              <div className={`mt-4 flex items-start gap-2 rounded-lg p-3 ${feedbackResult.correct ? "state-success-soft" : "state-danger-soft"}`}>
                {feedbackResult.correct ? (
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" />
                )}
                <p className="text-sm">{feedbackResult.explanation}</p>
              </div>
            )}

            {showFeedback && feedbackResult?.next_difficulty && (
              <div className="state-info-soft mt-3 rounded-lg px-3 py-2">
                <p className="text-xs font-medium">
                  Next difficulty: <span className="font-bold">{feedbackResult.next_difficulty}</span>
                  {feedbackResult.next_difficulty !== currentDifficulty && (
                    feedbackResult.correct ? " ↑ Level up!" : " ↓ Adjusted to help you improve"
                  )}
                </p>
              </div>
            )}

            {showHint && !showFeedback && (
              <div className="state-warning-soft mt-4 rounded-lg p-3">
                <p className="text-sm">Hint: Try isolating the variable step by step.</p>
              </div>
            )}

            {confusionScore > 50 && !showFeedback && (
              <div className="state-warning-soft mt-3 rounded-lg px-3 py-2">
                <p className="text-xs">Difficulty adjusted to match your learning pace.</p>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              {!showFeedback && (
                <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => { setShowHint(true); setHintUsed(h => h + 1) }}>
                  <Lightbulb className="h-3 w-3" /> Hint
                </Button>
              )}
              {showFeedback && feedbackResult && !feedbackResult.correct && (
                <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={handleRetry}>
                  <RotateCcw className="h-3 w-3" /> Retry
                </Button>
              )}
              {showFeedback && (
                <Button size="sm" className="ml-auto gap-1" onClick={handleNext} disabled={submitMutation.loading}>
                  {answeredCount + 1 >= maxQuestions ? "Finish Quiz" : "Next Question"} <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Side panel */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm" style={{ fontFamily: "var(--font-heading)" }}>Confusion Tracker</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <TrackerRow icon={Clock} label="Time on Q" value={`${elapsedSec}s`} color={elapsedSec > 30 ? "metric-caution" : "metric-positive"} />
              <TrackerRow icon={RotateCcw} label="Retries" value={String(retries)} color={retries > 2 ? "metric-negative" : "metric-positive"} />
              <TrackerRow icon={Lightbulb} label="Hints Used" value={String(hintUsed)} color={hintUsed > 2 ? "metric-caution" : "metric-positive"} />
              <TrackerRow icon={Languages} label="Lang Switch" value="0" color="metric-positive" />
              <TrackerRow icon={Activity} label="Consistency" value="Stable" color="metric-positive" />
              <div className="mt-2 flex items-center justify-center">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full border-4 ${confusionScore > 60 ? "border-rose-300" : confusionScore > 30 ? "border-amber-300" : "border-emerald-300"
                  }`}>
                  <span className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{confusionScore}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                <div className="flex items-center gap-1"><BarChart3 className="h-4 w-4" /> Score</div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                {score}/{answeredCount}
              </p>
              <p className="text-xs text-muted-foreground">
                {Math.round((score / Math.max(1, answeredCount)) * 100)}% accuracy so far
              </p>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-1">Current difficulty</p>
                <Badge variant={difficultyVariant(currentDifficulty)} className="text-xs">
                  {difficultyLabel(currentDifficulty)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}

function TrackerRow({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between rounded bg-muted px-3 py-1.5">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-foreground">{label}</span>
      </div>
      <span className={`text-xs font-semibold ${color}`}>{value}</span>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted p-3 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{value}</p>
    </div>
  )
}
