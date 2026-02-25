"use client"

import { useState } from "react"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
  MessageSquare, Send, Smartphone, Radio, WifiOff,
  CheckCircle2, Bell, Heart, Globe, BookOpen, Zap, Loader2,
} from "lucide-react"
import { sendSMS } from "@/lib/api"
import type { SMSMessage } from "@/lib/types"

const initialConversation: SMSMessage[] = [
  { sender: "student", text: "MATH ALGEBRA" },
  { sender: "system", text: "Algebra basics:\nSolve 2x + 3 = 7\n\nStep 1: Subtract 3 from both sides.\n2x = 4\nStep 2: Divide by 2.\nx = 2\n\nQ1: What is x if 3x = 9?\nReply A)2 B)3 C)4" },
  { sender: "student", text: "B" },
  { sender: "system", text: "Correct! Great work.\n\nNext question:\nSolve 5x = 20.\nReply with your answer.", correct: true },
]

export default function SMSPage() {
  const [messages, setMessages] = useState<SMSMessage[]>(initialConversation)
  const [input, setInput] = useState("")
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [sending, setSending] = useState(false)

  async function handleSend() {
    if (!input.trim()) return
    const userMsg: SMSMessage = { sender: "student", text: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    const text = input.trim()
    setInput("")
    setSending(true)

    try {
      const result = await sendSMS({ message: text, session_id: sessionId })
      setMessages((prev) => [...prev, result.reply])
      setSessionId(result.session_id)
    } catch {
      // Fallback simulation
      const fallback: SMSMessage = text === "4"
        ? { sender: "system", text: "Correct! x = 4.\n\nYou've completed this micro-lesson.\nKeep it up!", correct: true }
        : { sender: "system", text: "Not quite. Let's try again.\n5x = 20\nDivide both sides by 5.\nx = ?\n\nReply with the correct answer." }
      setMessages((prev) => [...prev, fallback])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12 lg:px-8 lg:py-16">
        {/* Header */}
        <div className="text-center">
          <Badge variant="secondary" className="mb-4">SMS Learning Mode</Badge>
          <h1 className="text-balance text-3xl font-bold text-foreground lg:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
            Learning Beyond Internet: SMS Mode
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
            Our platform enables micro-learning and quiz interaction through SMS for low-device rural environments.
          </p>
        </div>

        {/* How SMS Mode Works */}
        <section className="mt-14">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            How SMS Mode Works
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: 1, title: "Send Topic", desc: "Student sends SMS with topic keyword", example: "MATH FRACTIONS", icon: Send },
              { step: 2, title: "Receive Lesson", desc: "System replies with micro-lesson summary", example: "Concept + explanation", icon: BookOpen },
              { step: 3, title: "Get Quiz", desc: "System sends quiz question to practice", example: "Multiple choice Q", icon: Zap },
              { step: 4, title: "Reply Answer", desc: "Student replies, system evaluates", example: "Instant feedback", icon: CheckCircle2 },
            ].map((s) => (
              <Card key={s.step}>
                <CardContent className="p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {s.step}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">{s.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
                  <Badge variant="outline" className="mt-2 text-[10px]">{s.example}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Live SMS Simulation */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Live SMS Simulation
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Try typing a message below to interact with the simulation.</p>

          <Card className="mt-6">
            <CardHeader className="border-b border-border bg-muted px-4 py-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">SMS Learning - Math</span>
                {sending && <Loader2 className="ml-auto h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 p-4" style={{ maxHeight: 400, overflowY: "auto" }}>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === "student" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
                    m.sender === "student"
                      ? "bg-primary text-primary-foreground"
                      : m.correct
                        ? "border border-green-200 bg-green-50 text-green-800"
                        : "border border-border bg-muted text-foreground"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="flex gap-2 border-t border-border p-3">
              <Input
                placeholder="Type your SMS reply..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="text-sm"
                disabled={sending}
              />
              <Button size="sm" onClick={handleSend} className="gap-1" disabled={sending}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
              </Button>
            </div>
          </Card>
        </section>

        {/* Micro-Lesson Format */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Micro-Lesson Format
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "1 key concept per lesson",
              "Short, clear explanation",
              "1-2 practice questions",
              "Immediate feedback on answers",
              "Encouragement message included",
            ].map((item) => (
              <Card key={item}>
                <CardContent className="flex items-center gap-2 p-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                  <span className="text-sm text-foreground">{item}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Designed for low bandwidth and basic keypad phones.
          </p>
        </section>

        {/* Parent Alerts via SMS */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Parent Alerts via SMS
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Parents receive supportive alerts when patterns are detected.</p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm font-medium text-foreground mb-3">Alerts triggered when:</p>
                <div className="flex flex-col gap-2">
                  {[
                    "High confusion trend over multiple sessions",
                    "Low engagement over multiple sessions",
                    "Risk indicator increases significantly",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Bell className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm" style={{ fontFamily: "var(--font-heading)" }}>Example Parent SMS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    &ldquo;Your child may need support in Algebra. Encourage 15 minutes of revision today.&rdquo;
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-accent" />
                  <p className="text-xs text-muted-foreground">Supportive tone, not punishment.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SMS + Offline Integration */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            SMS + Offline Integration
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { icon: MessageSquare, text: "SMS works independently of app login" },
              { icon: WifiOff, text: "Offline learning packs can sync results" },
              { icon: Radio, text: "Weekly progress summary delivered via SMS" },
              { icon: Globe, text: "Students without smartphones can still participate" },
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

        {/* Rural Impact */}
        <section className="mt-16 text-center">
          <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            &ldquo;Education should not depend on device type or internet speed.&rdquo;
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3 mx-auto max-w-xl">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>2G</p>
                <p className="text-xs text-muted-foreground">Works on basic phones</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>0</p>
                <p className="text-xs text-muted-foreground">No app installation</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>Low</p>
                <p className="text-xs text-muted-foreground">Cost per student</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12 flex flex-wrap justify-center gap-3">
          <Button className="gap-2"><MessageSquare className="h-4 w-4" /> Try SMS Simulation</Button>
          <Button variant="outline" className="gap-2"><Radio className="h-4 w-4" /> Connect School SMS Gateway</Button>
          <Button variant="outline" asChild><Link href="/dashboard/student">Return to Dashboard</Link></Button>
        </section>
      </main>
      <Footer />
    </div>
  )
}
