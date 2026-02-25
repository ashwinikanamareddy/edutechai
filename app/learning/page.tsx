"use client"

import { useState, useCallback } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DashboardSkeleton, ErrorState } from "@/components/ui/api-states"
import Link from "next/link"
import {
  BookOpen, ChevronDown, Globe, Volume2, Lightbulb, Layers, Clock,
  RotateCcw, Languages, Activity, ArrowRight, Bookmark, CheckCircle, Loader2,
} from "lucide-react"
import { fetchLesson, trackBehavior, requestSimplified, submitLessonAnswer } from "@/lib/api"
import { useApiQuery, useApiMutation } from "@/hooks/use-api"
import type { LearningPageData, BehaviorEvent } from "@/lib/types"

export default function LearningPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("English")
  const [confusionScore, setConfusionScore] = useState<number | null>(null)
  const [showIntervention, setShowIntervention] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackCorrect, setFeedbackCorrect] = useState(false)
  const [feedbackExplanation, setFeedbackExplanation] = useState("")
  const [simplifiedHtml, setSimplifiedHtml] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const { data, loading, error, refetch } = useApiQuery<LearningPageData>(
    useCallback(() => fetchLesson("Mathematics", "Linear Equations", selectedLanguage), [selectedLanguage]),
    [selectedLanguage]
  )

  const behaviorMutation = useApiMutation<BehaviorEvent, { confusion_score: number }>(trackBehavior)
  const simplifyMutation = useApiMutation<{ topic: string; language: string }, { explanation_html: string }>(
    (payload) => requestSimplified(payload.topic, payload.language)
  )
  const answerMutation = useApiMutation<{ question_id?: string; selected: number }, { correct: boolean; explanation: string; new_confusion_score: number }>(submitLessonAnswer)

  // Use API confusion score once loaded, otherwise local
  const currentConfusion = confusionScore ?? data?.confusion_score ?? 0

  async function handleAnswerSelect(idx: number) {
    setSelectedAnswer(idx)
    try {
      const result = await answerMutation.mutate({ selected: idx })
      setShowFeedback(true)
      setFeedbackCorrect(result.correct)
      setFeedbackExplanation(result.explanation)
      setConfusionScore(result.new_confusion_score)
      if (result.new_confusion_score > 50) setShowIntervention(true)
    } catch {
      // Fallback: check locally against data
      if (data?.quick_check) {
        setShowFeedback(true)
        setFeedbackCorrect(idx === data.quick_check.correct_index)
        setFeedbackExplanation(data.quick_check.explanation)
      }
    }
    // Track behavior
    behaviorMutation.mutate({ event_type: "answer", value: idx }).catch(() => { })
  }

  async function handleSimplify(mode: "simple" | "example" = "simple") {
    try {
      const topic = data?.lesson?.topic ?? "this topic"
      const promptText = mode === "example" ? `${topic} with a real-life example` : topic
      const result = await simplifyMutation.mutate({ topic: promptText, language: selectedLanguage })
      setSimplifiedHtml(result.explanation_html)
    } catch { /* error shown via mutation state */ }
    behaviorMutation.mutate({ event_type: "simplify" }).catch(() => { })
  }

  function handleAudio() {
    if (typeof window === "undefined") return
    const synth = window.speechSynthesis
    if (isPlaying) {
      synth.cancel()
      setIsPlaying(false)
      return
    }

    const textToRead = (simplifiedHtml ?? data?.lesson.explanation_html ?? "").replace(/<[^>]*>/g, "")
    const utter = new SpeechSynthesisUtterance(textToRead)

    // Attempt to match voice to language
    const langMap: Record<string, string> = { "English": "en-IN", "Hindi": "hi-IN", "Telugu": "te-IN" }
    utter.lang = langMap[selectedLanguage] ?? "en-IN"

    utter.onend = () => setIsPlaying(false)
    setIsPlaying(true)
    synth.speak(utter)
  }

  function handleLanguageSwitch() {
    const langs = ["English", "Hindi", "Telugu"]
    const nextIdx = (langs.indexOf(selectedLanguage) + 1) % langs.length
    const nextLang = langs[nextIdx]
    setSelectedLanguage(nextLang)
    behaviorMutation.mutate({ event_type: "language_switch" }).catch(() => { })

    // In a real app we'd fetch the translated lesson here. 
    // For demo we'll just show an info message in the UI.
  }

  async function handleHint() {
    behaviorMutation.mutate({ event_type: "hint" }).catch(() => { })
  }

  if (loading) {
    return (
      <DashboardShell role="student" userName="Loading..." meta="">
        <DashboardSkeleton />
      </DashboardShell>
    )
  }

  if (error || !data || !data.lesson) {
    return (
      <DashboardShell role="student" userName="Student" meta="">
        <ErrorState message={error ?? "Failed to load lesson"} onRetry={refetch} />
      </DashboardShell>
    )
  }

  const { lesson, behavior, quick_check } = data

  return (
    <DashboardShell role="student" userName="Student" meta={`Grade ${lesson.grade} - ${lesson.subject}`}>
      {/* Top progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Topic Progress</span>
          <span className="text-muted-foreground">{lesson.progress_percent}% Complete</span>
        </div>
        <Progress value={lesson.progress_percent} className="mt-2 h-2" />
      </div>

      {/* Header bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge variant="secondary">{lesson.subject}</Badge>
        <Badge variant="outline">{lesson.topic}</Badge>
        <Badge variant="outline">Grade {lesson.grade}</Badge>
        <div className="ml-auto flex items-center gap-3">
          <Badge variant="secondary" className="gap-1"><Globe className="h-3 w-3" /> {selectedLanguage}</Badge>
          <Badge variant={currentConfusion > 50 ? "destructive" : "secondary"} className="gap-1">
            Confusion: {currentConfusion}
          </Badge>
          <Badge variant="secondary" className="gap-1"><Activity className="h-3 w-3" /> Focus: {behavior.focus}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main content */}
        <div className="flex flex-col gap-6">
          {/* AI Explanation Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base" style={{ fontFamily: "var(--font-heading)" }}>
                <BookOpen className="h-5 w-5 text-primary" />
                AI Explanation: {lesson.topic}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: simplifiedHtml ?? lesson.explanation_html }}
              />

              {/* Collapsible step-by-step */}
              <Collapsible className="mt-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 text-primary">
                    <Layers className="h-4 w-4" /> Step-by-step breakdown <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 rounded-lg border border-border bg-muted p-4">
                  <div className="flex flex-col gap-3 text-sm">
                    {(lesson.steps ?? []).map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                        <p className="text-foreground">{step}</p>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Action buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => handleSimplify("simple")} disabled={simplifyMutation.loading}>
                  {simplifyMutation.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />} Simplify Explanation
                </Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => handleSimplify("example")} disabled={simplifyMutation.loading}>
                  <BookOpen className="h-4 w-4" /> Explain with Example
                </Button>
                <Button variant="outline" size="sm" className="gap-1" onClick={handleLanguageSwitch}>
                  <Globe className="h-4 w-4" /> Switch Language
                </Button>
                <Button variant={isPlaying ? "default" : "outline"} size="sm" className="gap-1" onClick={handleAudio}>
                  {isPlaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />} {isPlaying ? "Stop Audio" : "Audio Explanation"}
                </Button>
              </div>

              {currentConfusion > 50 && (
                <div className="state-warning-soft mt-4 rounded-lg p-3">
                  <p className="text-sm font-medium">
                    Switching to simplified explanation mode.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Check Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base" style={{ fontFamily: "var(--font-heading)" }}>Quick Check</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 font-medium text-foreground">{quick_check.question}</p>
              <div className="flex flex-col gap-2">
                {(quick_check.options ?? []).map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswerSelect(i)}
                    disabled={showFeedback || answerMutation.loading}
                    className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${showFeedback && feedbackCorrect && selectedAnswer === i ? "state-success-soft" :
                      showFeedback && !feedbackCorrect && selectedAnswer === i ? "state-danger-soft" :
                        showFeedback && i === quick_check.correct_index ? "state-success-soft" :
                          "border-border bg-card text-foreground hover:bg-muted"
                      }`}
                  >
                    {String.fromCharCode(65 + i)}) {opt}
                  </button>
                ))}
              </div>
              {showFeedback && (
                <div className={`mt-4 rounded-lg p-3 ${feedbackCorrect ? "state-success-soft" : "state-danger-soft"}`}>
                  <p className="text-sm font-medium">
                    {feedbackExplanation}
                  </p>
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={handleHint}>
                  <Lightbulb className="h-3 w-3" /> Hint
                </Button>
                <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => { setSelectedAnswer(null); setShowFeedback(false); behaviorMutation.mutate({ event_type: "retry" }).catch(() => { }) }}>
                  <RotateCcw className="h-3 w-3" /> Retry
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Intervention panel */}
          {showIntervention && (
            <Card className="border-amber-200/70 bg-amber-50/60">
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                  We noticed this topic may be challenging.
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">Would you like:</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleSimplify("simple")}>Simplified explanation</Button>
                  <Button variant="outline" size="sm">Visual breakdown</Button>
                  <Button variant="outline" size="sm">Extra practice questions</Button>
                  <Button variant="outline" size="sm">Switch to preferred language</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex flex-wrap gap-3">
            <Button className="gap-1" asChild>
              <Link href="/quiz">Proceed to Adaptive Quiz <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button variant="outline" className="gap-1"><CheckCircle className="h-4 w-4" /> Mark Topic Complete</Button>
            <Button variant="outline" className="gap-1"><Bookmark className="h-4 w-4" /> Save for Later</Button>
            <Button variant="ghost" asChild><Link href="/dashboard/student">Return to Dashboard</Link></Button>
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm" style={{ fontFamily: "var(--font-heading)" }}>Behavior Tracking</CardTitle>
              <p className="text-[10px] text-muted-foreground">These signals help detect silent confusion early.</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Indicator icon={Clock} label="Time Hesitation" value={behavior.hesitation} color="metric-positive" />
              <Indicator icon={RotateCcw} label="Retry Counter" value={String(behavior.retry_count)} color={behavior.retry_count > 2 ? "metric-caution" : "metric-positive"} />
              <Indicator icon={Lightbulb} label="Hint Usage" value={String(behavior.hint_usage)} color="metric-positive" />
              <Indicator icon={Languages} label="Language Switches" value={String(behavior.language_switches)} color="metric-positive" />
              <Indicator icon={Activity} label="Focus Activity" value={behavior.focus} color="metric-positive" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm" style={{ fontFamily: "var(--font-heading)" }}>Confusion Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className={`flex h-24 w-24 items-center justify-center rounded-full border-4 ${currentConfusion > 60 ? "border-rose-300" : currentConfusion > 30 ? "border-amber-300" : "border-emerald-300"
                  }`}>
                  <span className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                    {currentConfusion}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex justify-center gap-2 text-[10px]">
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">Low</span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">Moderate</span>
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-700">High</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}

function Indicator({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-foreground">{label}</span>
      </div>
      <span className={`text-xs font-semibold ${color}`}>{value}</span>
    </div>
  )
}
