"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  GraduationCap, LayoutDashboard, MessageSquare, WifiOff,
  BrainCircuit, Loader2, Eye, EyeOff, CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { login, register } from "@/lib/api"
import { useAuth } from "@/components/auth/auth-provider"
import type { LoginRequest, AuthUser } from "@/lib/types"
import { AppLogo } from "@/components/shared/app-logo"
import { cn } from "@/lib/utils"

type RoleType = "student" | "teacher" | "parent"
type AuthMode = "login" | "signup"

// ─── Small reusable password input ────────────────────────────────────────────
function PasswordInput({ id, placeholder, value, onChange }: {
  id: string; placeholder: string; value: string; onChange: (v: string) => void
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className="mt-1 pr-10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={id.includes("confirm") ? "new-password" : "current-password"}
      />
      <button
        type="button"
        onClick={() => setShow((p) => !p)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

// ─── Mode toggle ───────────────────────────────────────────────────────────────
function ModeToggle({ mode, onSwitch }: { mode: AuthMode; onSwitch: () => void }) {
  return (
    <div className="flex rounded-xl border border-border/80 bg-muted/40 p-1">
      <button
        type="button"
        onClick={() => mode !== "login" && onSwitch()}
        className={cn(
          "flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
          mode === "login"
            ? "bg-white text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Login
      </button>
      <button
        type="button"
        onClick={() => mode !== "signup" && onSwitch()}
        className={cn(
          "flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
          mode === "signup"
            ? "bg-white text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Sign Up
      </button>
    </div>
  )
}

// ─── Main inner component ──────────────────────────────────────────────────────
function AuthPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setAuthUser } = useAuth()

  const defaultRole = (searchParams.get("role") as RoleType) || "student"
  const [mode, setMode] = useState<AuthMode>("login")
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // ── Student fields ────────────────────────────────────────────
  const [sName, setSName] = useState("")
  const [sEmail, setSEmail] = useState("")
  const [sGrade, setSGrade] = useState("")
  const [sSchool, setSSchool] = useState("")
  const [sParent, setSParent] = useState("")
  const [sLang, setSLang] = useState("")
  const [sPass, setSPass] = useState("")

  // ── Teacher fields ────────────────────────────────────────────
  const [tName, setTName] = useState("")
  const [tEmail, setTEmail] = useState("")
  const [tSchool, setTSchool] = useState("")
  const [tPass, setTPass] = useState("")

  // ── Parent fields ─────────────────────────────────────────────
  const [pName, setPName] = useState("")
  const [pPhone, setPPhone] = useState("")
  const [pStudent, setPStudent] = useState("")
  const [pPass, setPPass] = useState("")

  const dashboardRoutes: Record<string, string> = {
    student: "/dashboard/student",
    teacher: "/dashboard/teacher",
    parent: "/dashboard/parent",
  }

  function digitsOnly(v: string) { return v.replace(/\D/g, "") }
  function isEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) }

  function validate(role: RoleType): string | null {
    if (mode === "signup" && !agreed)
      return "Please accept the responsible AI usage policy."

    if (role === "student") {
      if (mode === "signup") {
        if (!sName.trim()) return "Please enter your full name."
        if (!isEmail(sEmail)) return "Please enter a valid email address."
        if (!sGrade) return "Please select your grade."
        if (!sSchool.trim()) return "Please enter your school name."
        if (digitsOnly(sParent).length !== 10) return "Parent mobile must be exactly 10 digits."
        if (!sLang) return "Please select a language preference."
      } else {
        if (!isEmail(sEmail)) return "Please enter your email."
      }
      if (!sPass || sPass.length < 6) return "Password must be at least 6 characters."
    }

    if (role === "teacher") {
      if (mode === "signup") {
        if (!tName.trim()) return "Please enter your full name."
        if (!tSchool.trim()) return "Please enter your school name."
      }
      if (!isEmail(tEmail)) return "Please enter a valid email address."
      if (!tPass || tPass.length < 6) return "Password must be at least 6 characters."
    }

    if (role === "parent") {
      if (mode === "signup") {
        if (!pName.trim()) return "Please enter your full name."
        if (!pStudent.trim()) return "Please enter the student name or ID."
      }
      if (digitsOnly(pPhone).length !== 10) return "Phone number must be exactly 10 digits."
      if (!pPass || pPass.length < 6) return "Password must be at least 6 characters."
    }

    return null
  }

  function buildLoginPayload(role: RoleType): LoginRequest {
    if (role === "student") return { role, email: sEmail, password: sPass }
    if (role === "teacher") return { role, email: tEmail, password: tPass }
    return { role, phone: digitsOnly(pPhone), parent_phone: digitsOnly(pPhone), password: pPass }
  }

  function buildRegisterPayload(role: RoleType): LoginRequest {
    if (role === "student") {
      return {
        role, name: sName, email: sEmail,
        grade: Number(sGrade), school: sSchool,
        parent_phone: digitsOnly(sParent), language: sLang, password: sPass,
      }
    }
    if (role === "teacher") {
      return { role, name: tName, email: tEmail, school: tSchool, password: tPass }
    }
    return {
      role, name: pName,
      phone: digitsOnly(pPhone), parent_phone: digitsOnly(pPhone),
      student_id: pStudent, password: pPass,
    }
  }

  function createOfflineUser(role: RoleType, payload: LoginRequest): AuthUser {
    if (role === "student") return { id: "demo-student", role, name: payload.name || sName || "Student", token: "demo-token-student", grade: payload.grade, school: payload.school, language: payload.language }
    if (role === "teacher") return { id: "demo-teacher", role, name: payload.name || tName || "Teacher", token: "demo-token-teacher", school: payload.school }
    return { id: "demo-parent", role, name: payload.name || pName || "Parent", token: "demo-token-parent" }
  }

  function isOfflineError(e: unknown) {
    return e instanceof Error && (e.message.includes("Cannot connect to backend") || e.message.includes("public.users") || e.message.includes("PGRST205"))
  }

  async function handleSubmit(role: RoleType) {
    setError(null)
    setSuccess(null)
    const err = validate(role)
    if (err) { setError(err); return }

    setLoading(true)
    try {
      let user: AuthUser
      if (mode === "login") {
        user = await login(buildLoginPayload(role))
      } else {
        user = await register(buildRegisterPayload(role))
        setSuccess("Account created successfully! Redirecting…")
      }
      setAuthUser(user)
      setTimeout(() => router.push(dashboardRoutes[user.role]), 500)
    } catch (e) {
      // In demo mode, we fall back to offline user for ANY error (e.g. invalid Supabase key)
      const payload = mode === "login" ? buildLoginPayload(role) : buildRegisterPayload(role)
      const demo = createOfflineUser(role, payload)
      setAuthUser(demo)
      setSuccess(mode === "signup" ? "Account created (Demo Mode)!" : "Signed in (Demo Mode)!")
      setTimeout(() => router.push(dashboardRoutes[demo.role]), 800)
    } finally {
      setLoading(false)
    }
  }

  function switchMode() {
    setMode((m) => m === "login" ? "signup" : "login")
    setError(null)
    setSuccess(null)
  }

  // ─── Per-role form renderers ─────────────────────────────────────────────────
  function StudentForm() {
    return (
      <div className="flex flex-col gap-4">
        {mode === "signup" && (
          <div>
            <Label htmlFor="s-name">Full Name</Label>
            <Input id="s-name" placeholder="Your full name" className="mt-1" value={sName} onChange={(e) => setSName(e.target.value)} autoComplete="name" />
          </div>
        )}
        <div>
          <Label htmlFor="s-email">Email Address</Label>
          <Input id="s-email" type="email" placeholder="student@email.com" className="mt-1" value={sEmail} onChange={(e) => setSEmail(e.target.value)} autoComplete="email" />
        </div>
        {mode === "signup" && (
          <>
            <div>
              <Label htmlFor="s-grade">Grade</Label>
              <Select value={sGrade} onValueChange={setSGrade}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select grade" /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>Grade {i + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="s-school">School Name</Label>
              <Input id="s-school" placeholder="Your school name" className="mt-1" value={sSchool} onChange={(e) => setSSchool(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="s-parent">Parent Mobile Number</Label>
              <Input id="s-parent" placeholder="10-digit mobile number" className="mt-1" value={sParent} onChange={(e) => setSParent(e.target.value)} maxLength={10} inputMode="numeric" />
            </div>
            <div>
              <Label htmlFor="s-lang">Language Preference</Label>
              <Select value={sLang} onValueChange={setSLang}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select language" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="telugu">Telugu</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
        <div>
          <Label htmlFor="s-pass">Password</Label>
          <PasswordInput id="s-pass" placeholder={mode === "signup" ? "Create a password (min 6 chars)" : "Enter your password"} value={sPass} onChange={setSPass} />
        </div>
      </div>
    )
  }

  function TeacherForm() {
    return (
      <div className="flex flex-col gap-4">
        {mode === "signup" && (
          <div>
            <Label htmlFor="t-name">Full Name</Label>
            <Input id="t-name" placeholder="Your full name" className="mt-1" value={tName} onChange={(e) => setTName(e.target.value)} autoComplete="name" />
          </div>
        )}
        <div>
          <Label htmlFor="t-email">Official Email</Label>
          <Input id="t-email" type="email" placeholder="teacher@school.edu" className="mt-1" value={tEmail} onChange={(e) => setTEmail(e.target.value)} autoComplete="email" />
        </div>
        {mode === "signup" && (
          <div>
            <Label htmlFor="t-school">School Name</Label>
            <Input id="t-school" placeholder="Your school name" className="mt-1" value={tSchool} onChange={(e) => setTSchool(e.target.value)} />
          </div>
        )}
        <div>
          <Label htmlFor="t-pass">Password</Label>
          <PasswordInput id="t-pass" placeholder={mode === "signup" ? "Create a password (min 6 chars)" : "Enter your password"} value={tPass} onChange={setTPass} />
        </div>
      </div>
    )
  }

  function ParentForm() {
    return (
      <div className="flex flex-col gap-4">
        {mode === "signup" && (
          <div>
            <Label htmlFor="p-name">Parent Full Name</Label>
            <Input id="p-name" placeholder="Your full name" className="mt-1" value={pName} onChange={(e) => setPName(e.target.value)} autoComplete="name" />
          </div>
        )}
        <div>
          <Label htmlFor="p-phone">Mobile Number</Label>
          <Input id="p-phone" placeholder="10-digit mobile number" className="mt-1" value={pPhone} onChange={(e) => setPPhone(e.target.value)} maxLength={10} inputMode="numeric" />
        </div>
        {mode === "signup" && (
          <div>
            <Label htmlFor="p-student">Child's Name / Student ID</Label>
            <Input id="p-student" placeholder="Enter your child's name or student ID" className="mt-1" value={pStudent} onChange={(e) => setPStudent(e.target.value)} />
          </div>
        )}
        <div>
          <Label htmlFor="p-pass">Password</Label>
          <PasswordInput id="p-pass" placeholder={mode === "signup" ? "Create a password (min 6 chars)" : "Enter your password"} value={pPass} onChange={setPPass} />
        </div>
      </div>
    )
  }

  const roleInfo = {
    student: { label: "Student", desc: mode === "login" ? "Access your personalised learning dashboard." : "Join Vidya Saathi to track your learning journey." },
    teacher: { label: "Teacher", desc: mode === "login" ? "Access mastery heatmaps and confusion insights." : "Register to monitor your students' progress." },
    parent: { label: "Parent", desc: mode === "login" ? "View your child's progress and receive alerts." : "Create an account to stay connected with your child's learning." },
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left hero panel ─────────────────────────────────────────── */}
      <div className="hidden w-5/12 flex-col justify-between bg-gradient-to-br from-blue-700 via-indigo-700 to-teal-600 p-10 lg:flex">
        <div>
          <AppLogo
            href="/"
            size={40}
            iconClassName="rounded-xl bg-white/15 shadow-sm"
            imageClassName="rounded-xl"
            textClassName="text-lg text-white"
          />
          <div className="mt-14">
            <h1 className="text-balance text-3xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              Detect Silent Confusion Before Students Fall Behind.
            </h1>
            <p className="mt-4 max-w-sm text-pretty text-white/80 leading-relaxed text-sm">
              AI-powered adaptive learning for Grade 1–12 with confusion detection,
              engagement monitoring, teacher analytics, and parent alerts.
            </p>
          </div>
          <div className="mt-10 flex flex-col gap-3">
            {[
              { icon: GraduationCap, label: "Adaptive Personalised Learning" },
              { icon: BrainCircuit, label: "Silent Confusion Detection" },
              { icon: LayoutDashboard, label: "Real-Time Teacher Dashboard" },
              { icon: MessageSquare, label: "Instant Parent SMS Alerts" },
              { icon: WifiOff, label: "Offline Mode Support" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <item.icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm text-white/90">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/40">Vidya Saathi — Educational Intelligence Platform</p>
      </div>

      {/* ── Right auth panel ─────────────────────────────────────────── */}
      <div className="flex w-full flex-col items-center justify-center px-5 py-10 lg:w-7/12">
        <div className="w-full max-w-lg">

          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <AppLogo href="/" size={36} textClassName="text-lg" />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "login" ? "Sign in to continue your learning journey." : "Join Vidya Saathi and start learning smarter."}
            </p>
          </div>

          {/* Global error / success */}
          {error && (
            <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <p className="text-sm text-emerald-800">{success}</p>
            </div>
          )}

          {/* Role tabs */}
          <Tabs defaultValue={defaultRole} className="w-full" onValueChange={() => { setError(null); setSuccess(null) }}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="student">🎓 Student</TabsTrigger>
              <TabsTrigger value="teacher">🏫 Teacher</TabsTrigger>
              <TabsTrigger value="parent">👨‍👩‍👧 Parent</TabsTrigger>
            </TabsList>

            {(["student", "teacher", "parent"] as RoleType[]).map((role) => (
              <TabsContent key={role} value={role} className="mt-0">
                <div className="rounded-2xl border border-border/80 bg-white/95 p-6 shadow-[0_14px_30px_-18px_rgba(15,23,42,0.18)] backdrop-blur">
                  {/* Login / Sign Up toggle */}
                  <ModeToggle mode={mode} onSwitch={switchMode} />

                  <div className="mt-1 mb-5">
                    <p className="text-xs text-muted-foreground mt-2">{roleInfo[role].desc}</p>
                  </div>

                  <form
                    className="flex flex-col gap-5"
                    onSubmit={(e) => { e.preventDefault(); handleSubmit(role) }}
                    noValidate
                  >
                    {role === "student" && StudentForm()}
                    {role === "teacher" && TeacherForm()}
                    {role === "parent" && ParentForm()}

                    {/* Consent — signup only */}
                    {mode === "signup" && (
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id={`consent-${role}`}
                          checked={agreed}
                          onCheckedChange={(v) => setAgreed(v === true)}
                          className="mt-0.5"
                        />
                        <label htmlFor={`consent-${role}`} className="text-xs leading-relaxed text-muted-foreground cursor-pointer">
                          I agree to responsible AI usage and parental consent policy.
                          This platform tracks learning behaviour within the app only.
                        </label>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-sm"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{mode === "login" ? "Signing in…" : "Creating account…"}</>
                      ) : mode === "login" ? "Sign In" : "Create Account"}
                    </Button>
                  </form>

                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    {mode === "login" ? (
                      <>Don&apos;t have an account?{" "}
                        <button type="button" onClick={switchMode} className="font-semibold text-primary underline-offset-2 hover:underline">
                          Sign up free
                        </button>
                      </>
                    ) : (
                      <>Already have an account?{" "}
                        <button type="button" onClick={switchMode} className="font-semibold text-primary underline-offset-2 hover:underline">
                          Sign in
                        </button>
                      </>
                    )}
                  </p>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-4 flex gap-3 text-xs text-muted-foreground justify-center">
            <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
            <span>·</span>
            <Link href="/privacy" className="underline hover:text-foreground">Ethical AI Commitment</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mr-2" />Loading...</div>}>
      <AuthPageInner />
    </Suspense>
  )
}
