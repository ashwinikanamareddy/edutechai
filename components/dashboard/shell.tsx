"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, BookOpen, ClipboardCheck, BarChart3, Users, MessageSquare, Settings, Menu, X, Flame, LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { AppLogo } from "@/components/shared/app-logo"

const studentLinks = [
  { href: "/dashboard/student", icon: Home, label: "Dashboard" },
  { href: "/learning", icon: BookOpen, label: "Learning" },
  { href: "/quiz", icon: ClipboardCheck, label: "Adaptive Quiz" },
  { href: "/remedial", icon: BarChart3, label: "Recovery Plan" },
]

const teacherLinks = [
  { href: "/dashboard/teacher", icon: Home, label: "Dashboard" },
  { href: "/dashboard/teacher", icon: Users, label: "Class Analytics" },
]

const parentLinks = [
  { href: "/dashboard/parent", icon: Home, label: "Dashboard" },
  { href: "/dashboard/parent", icon: MessageSquare, label: "Alerts" },
]

interface DashboardShellProps {
  children: React.ReactNode
  role: "student" | "teacher" | "parent"
  userName?: string
  meta?: string
}

export function DashboardShell({ children, role, userName = "Demo User", meta }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const links = role === "student" ? studentLinks : role === "teacher" ? teacherLinks : parentLinks
  const displayName = user?.name || userName

  function handleLogout() {
    logout()
    router.push("/auth")
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 border-r border-border/80 bg-white/95 backdrop-blur transition-transform lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border/80 px-4 py-4">
            <AppLogo
              href="/"
              size={32}
              textClassName="text-sm"
              iconClassName="rounded-xl"
              imageClassName="rounded-xl"
            />
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 p-3">
            {links.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}

            <div className="mt-auto">
              <Link
                href="/"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </nav>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-border/80 bg-white/85 px-4 py-3 backdrop-blur lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="h-5 w-5 text-foreground" />
            </button>
            <div>
              <p className="text-sm font-semibold text-foreground">{displayName}</p>
              {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {role === "student" && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Flame className="h-3 w-3 text-amber-500" />
                7-Day Streak
              </Badge>
            )}
            <Badge variant="outline" className="text-xs capitalize">{role}</Badge>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
