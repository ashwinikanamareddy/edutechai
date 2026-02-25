"use client"

import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Lock,
  UserCheck,
  Database,
  BrainCircuit,
  Activity,
  Bell,
  WifiOff,
  Server,
  FileText,
  Heart,
  CheckCircle2,
} from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12 lg:px-8 lg:py-16">
        {/* Header */}
        <div className="text-center">
          <Badge variant="secondary" className="mb-4">Privacy & Ethics</Badge>
          <h1 className="text-balance text-3xl font-bold text-foreground lg:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
            Our Commitment to Responsible Educational Intelligence
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground leading-relaxed">
            We protect student privacy while supporting early learning intervention.
          </p>
        </div>

        {/* What We Track */}
        <section className="mt-14">
          <SectionHeader icon={Eye} title="What We Track" />
          <Card className="mt-4">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-foreground mb-3">We monitor only:</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  "Learning session duration",
                  "Question response time",
                  "Retry attempts",
                  "Hint usage",
                  "Topic mastery patterns",
                  "In-platform engagement behavior",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-red-800">
                  <EyeOff className="h-4 w-4" />
                  We do NOT access other apps, personal messages, photos, or device data.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Why We Track */}
        <section className="mt-10">
          <SectionHeader icon={BrainCircuit} title="Why We Track It" />
          <Card className="mt-4">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-3">To detect:</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  "Silent confusion",
                  "Learning hesitation",
                  "Inconsistent engagement",
                  "Early academic risk",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-accent/20 bg-accent/5 p-3">
                <p className="text-sm font-medium text-foreground">
                  Tracking is used to support students, not monitor them.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Parental Consent */}
        <section className="mt-10">
          <SectionHeader icon={UserCheck} title="Parental Consent" />
          <Card className="mt-4">
            <CardContent className="p-5">
              <div className="flex flex-col gap-3">
                {[
                  "Parental phone number required for minors",
                  "Parent notifications triggered only after consistent patterns",
                  "Parents can opt-out of alerts at any time",
                  "Full transparency in parent dashboard",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-border bg-muted p-3">
                <div className="flex items-start gap-2">
                  <Checkbox id="consent-preview" disabled />
                  <label htmlFor="consent-preview" className="text-sm text-muted-foreground">
                    I provide consent for responsible learning behavior tracking.
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Data Security */}
        <section className="mt-10">
          <SectionHeader icon={Lock} title="Data Security" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              { icon: Database, title: "Encrypted Storage", desc: "All student data encrypted at rest using industry standards." },
              { icon: ShieldCheck, title: "Secure Auth", desc: "Role-based authentication for students, teachers, and parents." },
              { icon: Server, title: "School Isolation", desc: "Each school's data is logically isolated and access-controlled." },
              { icon: EyeOff, title: "No Data Selling", desc: "Student data is never sold or shared with third parties." },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="flex gap-3 p-4">
                  <item.icon className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* AI Transparency */}
        <section className="mt-10">
          <SectionHeader icon={BrainCircuit} title="AI Transparency" />
          <Card className="mt-4">
            <CardContent className="p-5">
              <div className="flex flex-col gap-2">
                {[
                  "AI generates adaptive lessons based on student mastery level",
                  "AI calculates mastery trends from quiz and learning data",
                  "AI estimates confusion patterns from behavioral signals",
                  "AI predictions continuously evaluated via Confusion Matrix Engine",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Our system evaluates its own prediction accuracy to avoid bias and improve recommendations.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Engagement Monitoring Policy */}
        <section className="mt-10">
          <SectionHeader icon={Activity} title="Engagement Monitoring Policy" />
          <Card className="mt-4">
            <CardContent className="p-5">
              <p className="text-sm text-foreground mb-3">We detect:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {["Idle time", "Tab switching inside platform", "Incomplete sessions"].map((item) => (
                  <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                ))}
              </div>
              <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                <p className="text-sm text-foreground">
                  We do not track device-level activity or external app usage.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Ethical Alert System */}
        <section className="mt-10">
          <SectionHeader icon={Bell} title="Ethical Alert System" />
          <Card className="mt-4">
            <CardContent className="p-5">
              <div className="flex flex-col gap-2">
                {[
                  "Parent alerts are supportive and encouraging",
                  "No real-time punishment notifications",
                  "Alerts triggered only after repeated patterns",
                  "Tone of communication remains positive and constructive",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Heart className="h-3.5 w-3.5 shrink-0 text-accent" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Rural Deployment Ethics */}
        <section className="mt-10">
          <SectionHeader icon={WifiOff} title="Rural Deployment Ethics" />
          <Card className="mt-4">
            <CardContent className="p-5">
              <div className="flex flex-col gap-2">
                {[
                  "Offline mode respects data privacy",
                  "Edge AI node stores only school-level learning data",
                  "Sync operations are encrypted end-to-end",
                  "Schools retain full ownership of their data",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Final Statement */}
        <section className="mt-14 text-center">
          <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            &ldquo;Education intelligence should empower, not surveil.&rdquo;
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Download Privacy Policy
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-primary" />
      <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{title}</h2>
    </div>
  )
}
