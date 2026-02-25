"use client"

import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Wifi,
  WifiOff,
  MessageSquare,
  Server,
  Cloud,
  Smartphone,
  Radio,
  HardDrive,
  ArrowDown,
  Shield,
  RefreshCw,
  Building2,
  Globe,
  Layers,
  Database,
} from "lucide-react"

export default function InfrastructurePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 lg:px-8 lg:py-16">
        {/* Header */}
        <div className="text-center">
          <Badge variant="secondary" className="mb-4">Infrastructure</Badge>
          <h1 className="text-balance text-3xl font-bold text-foreground lg:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
            Built for Rural Infrastructure. Designed for Real-World Constraints.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
            Our platform works in low-bandwidth environments, supports SMS-based learning, and can
            be deployed through local school AI nodes.
          </p>
        </div>

        {/* Low Bandwidth Optimization */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Low Bandwidth Optimization
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Engineered for connectivity-constrained environments.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Layers, title: "Text-First Design", desc: "Lightweight text-based lessons minimize data usage to under 50KB per session." },
              { icon: HardDrive, title: "Local Caching", desc: "Lessons cached locally for uninterrupted offline access." },
              { icon: WifiOff, title: "Offline Session Support", desc: "Full learning sessions supported without internet connection." },
              { icon: RefreshCw, title: "Smart Sync", desc: "Progress automatically syncs when internet reconnects." },
              { icon: Radio, title: "Compressed Audio", desc: "Audio explanations compressed to minimal data formats." },
              { icon: Wifi, title: "Bandwidth Detection", desc: "Auto-adjusts content quality based on connection speed." },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="flex gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Online/Offline toggle demo */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <Card className="w-fit">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex items-center gap-2 rounded-lg bg-green-100 px-3 py-2">
                  <Wifi className="h-4 w-4 text-green-700" />
                  <span className="text-xs font-medium text-green-700">Online Mode</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2">
                  <WifiOff className="h-4 w-4 text-amber-700" />
                  <span className="text-xs font-medium text-amber-700">Offline Mode</span>
                </div>
                <Badge variant="secondary" className="text-[10px]">Auto-switch</Badge>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SMS Learning Mode */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Learning Beyond Smartphones
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Micro-lessons and quizzes delivered via SMS for basic feature phones.</p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Features */}
            <div className="flex flex-col gap-3">
              {[
                "Micro lessons delivered via SMS",
                "Quiz interaction through SMS replies",
                "Parent alerts via SMS",
                "Works on basic feature phones",
                "No internet required",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
                  <MessageSquare className="h-4 w-4 text-accent" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>

            {/* SMS Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm" style={{ fontFamily: "var(--font-heading)" }}>SMS Conversation Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <SMSBubble sender="student" text="MATH FRACTIONS" />
                <SMSBubble sender="system" text={"Fraction basics: 1/2 means one part of two equal parts.\n\nQ: What is 1/2 + 1/2?\nReply with your answer."} />
                <SMSBubble sender="student" text="1" />
                <SMSBubble sender="system" text="Correct! Well done. Next: What is 3/4 - 1/4?" correct />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Edge AI Deployment */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Micro AI School Node Deployment
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Local AI infrastructure for schools without reliable internet.</p>

          <div className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-4">
                  <FlowBlock icon={Smartphone} label="Student Devices" desc="Tablets, phones, or shared devices" />
                  <ArrowDown className="h-5 w-5 text-muted-foreground" />
                  <FlowBlock icon={Server} label="Local School AI Node" desc="Mini PC / Raspberry Pi with Offline LLM" highlight />
                  <ArrowDown className="h-5 w-5 text-muted-foreground" />
                  <FlowBlock icon={Database} label="Local Database" desc="Syllabus RAG + Student progress" />
                  <ArrowDown className="h-5 w-5 text-muted-foreground" />
                  <FlowBlock icon={Cloud} label="Periodic Cloud Sync" desc="Weekly sync by teacher when connected" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Hybrid AI Architecture */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Hybrid AI Architecture
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Seamless switch between cloud and local AI processing.</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Cloud className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Online Mode</h3>
                </div>
                <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" />Cloud LLM for advanced generation</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" />Real-time adaptive content</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" />Full analytics dashboard</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <WifiOff className="h-5 w-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-foreground">Offline Mode</h3>
                </div>
                <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-amber-500" />Local AI engine (Ollama)</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-amber-500" />Preloaded syllabus packs</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-amber-500" />Cached progress + sync later</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4 text-center">
            <Badge variant="outline" className="text-xs">
              Auto-switch: If internet available, use cloud. Else fallback to local AI.
            </Badge>
          </div>
        </section>

        {/* Data Sync */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>Data Sync & Consistency</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { icon: HardDrive, text: "Student progress stored locally on device" },
              { icon: Cloud, text: "Sync to cloud when network becomes available" },
              { icon: RefreshCw, text: "Conflict resolution handling for data integrity" },
              { icon: Shield, text: "Secure encrypted data transfer protocols" },
            ].map((item) => (
              <Card key={item.text}>
                <CardContent className="flex items-center gap-3 p-4">
                  <item.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">{item.text}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Scalability */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>Scalable Across Rural Districts</h2>
          <div className="mt-6">
            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-6">
                <FlowBlock icon={Building2} label="Multi-School Deployment" desc="Individual school nodes" />
                <ArrowDown className="h-5 w-5 text-muted-foreground" />
                <FlowBlock icon={Layers} label="Cluster Aggregation" desc="Group schools by region" />
                <ArrowDown className="h-5 w-5 text-muted-foreground" />
                <FlowBlock icon={Globe} label="District-Level Reporting" desc="Comprehensive analytics for policy makers" />
                <ArrowDown className="h-5 w-5 text-muted-foreground" />
                <FlowBlock icon={Server} label="Government Integration" desc="Ready for institutional adoption" highlight />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Final Message */}
        <section className="mt-16 text-center">
          <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            &ldquo;Education intelligence should not depend on internet speed.&rdquo;
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/architecture">View System Architecture</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/sms">Try SMS Mode</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function SMSBubble({ sender, text, correct }: { sender: "student" | "system"; text: string; correct?: boolean }) {
  return (
    <div className={`flex ${sender === "student" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${
        sender === "student"
          ? "bg-primary text-primary-foreground"
          : correct
            ? "border border-green-200 bg-green-50 text-green-800"
            : "border border-border bg-muted text-foreground"
      }`}>
        {text}
      </div>
    </div>
  )
}

function FlowBlock({ icon: Icon, label, desc, highlight }: { icon: React.ElementType; label: string; desc: string; highlight?: boolean }) {
  return (
    <div className={`flex w-full max-w-sm items-center gap-3 rounded-lg border p-4 ${
      highlight ? "border-primary bg-primary/5" : "border-border bg-card"
    }`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
        highlight ? "bg-primary/10" : "bg-muted"
      }`}>
        <Icon className={`h-5 w-5 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}
