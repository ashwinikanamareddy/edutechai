"use client"

import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  ArrowDown,
  Monitor,
  LayoutDashboard,
  MessageSquare,
  BrainCircuit,
  Activity,
  BarChart3,
  AlertTriangle,
  Target,
  Cloud,
  WifiOff,
  Database,
  Server,
  Lock,
  ShieldCheck,
  Users,
  Building2,
  Globe,
  Eye,
  CheckCircle2,
} from "lucide-react"

const layers = [
  {
    title: "User Interaction Layer",
    color: "bg-primary/5 border-primary/20",
    items: [
      { icon: Monitor, label: "Student Web App" },
      { icon: LayoutDashboard, label: "Teacher Dashboard" },
      { icon: Users, label: "Parent Dashboard" },
      { icon: MessageSquare, label: "SMS Interface" },
    ],
  },
  {
    title: "Intelligence Engine Layer",
    color: "bg-accent/5 border-accent/20",
    items: [
      { icon: BrainCircuit, label: "Adaptive Learning Engine" },
      { icon: AlertTriangle, label: "Confusion Detection Engine" },
      { icon: Activity, label: "Engagement Monitoring Engine" },
      { icon: BarChart3, label: "Mastery Calculation Engine" },
      { icon: Target, label: "Risk Prediction Engine" },
      { icon: CheckCircle2, label: "Confusion Matrix Engine" },
    ],
  },
  {
    title: "AI Processing Layer",
    color: "bg-blue-50 border-blue-200",
    items: [
      { icon: Cloud, label: "Cloud LLM" },
      { icon: WifiOff, label: "Local Offline LLM (Edge)" },
      { icon: Database, label: "Syllabus RAG System" },
      { icon: Globe, label: "Multilingual Processing" },
    ],
  },
  {
    title: "Data Layer",
    color: "bg-green-50 border-green-200",
    items: [
      { icon: Database, label: "Performance Database" },
      { icon: Activity, label: "Behavior Tracking Logs" },
      { icon: BarChart3, label: "Engagement Metrics" },
      { icon: MessageSquare, label: "Notification Logs" },
    ],
  },
  {
    title: "Infrastructure Layer",
    color: "bg-amber-50 border-amber-200",
    items: [
      { icon: WifiOff, label: "Offline Caching System" },
      { icon: MessageSquare, label: "SMS Gateway" },
      { icon: Server, label: "Edge AI School Node" },
      { icon: Cloud, label: "Cloud Sync Module" },
    ],
  },
]

const confusionFlowSteps = [
  { step: 1, title: "Student Interacts", desc: "Engages with lesson content" },
  { step: 2, title: "Behavior Tracked", desc: "Time hesitation, retries, hints monitored" },
  { step: 3, title: "Confusion Scored", desc: "Score calculated from behavioral signals" },
  { step: 4, title: "Mastery Updated", desc: "Topic mastery recalculated in real-time" },
  { step: 5, title: "Risk Recalculated", desc: "Dropout and failure probability updated" },
  { step: 6, title: "Intervention Triggered", desc: "Simplified content or remedial plan" },
  { step: 7, title: "Teacher Notified", desc: "Dashboard updated with insights" },
  { step: 8, title: "Parent Alerted", desc: "SMS sent if pattern persists" },
]

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 lg:px-8 lg:py-16">
        {/* Header */}
        <div className="text-center">
          <Badge variant="secondary" className="mb-4">System Architecture</Badge>
          <h1 className="text-balance text-3xl font-bold text-foreground lg:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
            Complete Educational Intelligence Architecture
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
            A layered, modular architecture designed for scalability, privacy, and rural deployment.
          </p>
        </div>

        {/* System Overview - Layers */}
        <section className="mt-14">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            High-Level System Overview
          </h2>
          <div className="mt-6 flex flex-col gap-4">
            {layers.map((layer, li) => (
              <div key={layer.title}>
                <Card className={`border ${layer.color}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                      Layer {li + 1}: {layer.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {layer.items.map((item) => (
                        <div key={item.label} className="flex items-center gap-2 rounded-md bg-card px-3 py-2 border border-border">
                          <item.icon className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium text-foreground">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                {li < layers.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowDown className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Confusion Detection Flow */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            How Silent Confusion Is Detected
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Step-by-step intelligence flow from student interaction to intervention.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {confusionFlowSteps.map((s) => (
              <Card key={s.step} className={s.step === 6 ? "border-primary bg-primary/5" : ""}>
                <CardContent className="p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {s.step}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">{s.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Engagement Flow */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Engagement Detection Flow
          </h2>
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center gap-3 p-6 sm:flex-row sm:justify-center sm:gap-2">
              {["Tab Switch", "Idle Time", "Early Exit", "Session Pattern"].map((item, i) => (
                <div key={item} className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{item}</Badge>
                  {i < 3 && <ArrowDown className="h-4 w-4 rotate-0 text-muted-foreground sm:-rotate-90" />}
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="flex justify-center py-2"><ArrowDown className="h-5 w-5 text-muted-foreground" /></div>
          <div className="flex justify-center">
            <Badge className="text-sm">Engagement Score</Badge>
          </div>
          <div className="flex justify-center py-2"><ArrowDown className="h-5 w-5 text-muted-foreground" /></div>
          <div className="flex justify-center">
            <Badge variant="outline" className="text-sm">Trend Analysis</Badge>
          </div>
          <div className="flex justify-center py-2"><ArrowDown className="h-5 w-5 text-muted-foreground" /></div>
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-sm">Parent Alert (if persistent)</Badge>
          </div>
        </section>

        {/* Quiz & Confusion Matrix Flow */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Adaptive Quiz & Confusion Matrix Flow
          </h2>
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center gap-4 p-6">
              {[
                { label: "Predicted Mastery", badge: "primary" },
                { label: "Quiz Performance", badge: "outline" },
                { label: "Actual Result", badge: "outline" },
                { label: "Confusion Matrix Update", badge: "secondary" },
                { label: "Adaptive Engine Accuracy %", badge: "primary" },
              ].map((item, i, arr) => (
                <div key={item.label} className="flex flex-col items-center gap-3">
                  <Badge variant={item.badge as "default" | "outline" | "secondary"} className="text-sm px-4 py-1.5">
                    {item.label}
                  </Badge>
                  {i < arr.length - 1 && <ArrowDown className="h-5 w-5 text-muted-foreground" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Offline & Edge Deployment */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Offline & Edge Deployment Flow
          </h2>
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center gap-4 p-6">
              {[
                { icon: Monitor, label: "Student Devices" },
                { icon: Server, label: "Local School AI Node" },
                { icon: Database, label: "Local Database" },
                { icon: Cloud, label: "Periodic Cloud Sync" },
                { icon: Building2, label: "District Analytics Dashboard" },
              ].map((item, i, arr) => (
                <div key={item.label} className="flex flex-col items-center gap-3">
                  <div className="flex w-full max-w-xs items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <item.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </div>
                  {i < arr.length - 1 && <ArrowDown className="h-5 w-5 text-muted-foreground" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Security & Ethics */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Security & Ethics Architecture
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Lock, title: "Role-Based Access", desc: "Separate permissions for students, teachers, and parents." },
              { icon: ShieldCheck, title: "Parental Consent", desc: "Verified consent before tracking learning behavior." },
              { icon: Database, title: "Data Encryption", desc: "All data encrypted at rest and in transit." },
              { icon: Eye, title: "In-App Only", desc: "Behavior tracking limited to platform activity only." },
              { icon: AlertTriangle, title: "No Surveillance", desc: "No device-level monitoring or external app tracking." },
              { icon: Users, title: "School Isolation", desc: "Each school's data is logically separated." },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="flex gap-3 p-4">
                  <item.icon className="h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Scalability */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Scalability Model
          </h2>
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center gap-4 p-6">
              {[
                "Multiple Schools",
                "Cluster Aggregation",
                "District Analytics",
                "Policy Insights",
              ].map((label, i, arr) => (
                <div key={label} className="flex flex-col items-center gap-3">
                  <Badge variant={i === arr.length - 1 ? "default" : "outline"} className="px-4 py-1.5 text-sm">
                    {label}
                  </Badge>
                  {i < arr.length - 1 && <ArrowDown className="h-5 w-5 text-muted-foreground" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Final Statement */}
        <section className="mt-16 text-center">
          <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            &ldquo;Designed not just as an application, but as an educational intelligence infrastructure.&rdquo;
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/auth">Explore Demo</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/infrastructure">Infrastructure Details</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
