import Link from "next/link"
import { AppLogo } from "@/components/shared/app-logo"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <AppLogo href="/" size={32} textClassName="text-base" />
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              AI-powered educational intelligence for rural school students.
            </p>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">Platform</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/dashboard/student" className="hover:text-foreground">Student Dashboard</Link>
              <Link href="/dashboard/teacher" className="hover:text-foreground">Teacher Dashboard</Link>
              <Link href="/dashboard/parent" className="hover:text-foreground">Parent Dashboard</Link>
              <Link href="/learning" className="hover:text-foreground">Learning</Link>
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">Resources</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/architecture" className="hover:text-foreground">Architecture</Link>
              <Link href="/infrastructure" className="hover:text-foreground">Infrastructure</Link>
              <Link href="/impact" className="hover:text-foreground">Impact</Link>
              <Link href="/sms-learning" className="hover:text-foreground">SMS Learning</Link>
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">Trust</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
              <Link href="/privacy" className="hover:text-foreground">Ethical AI</Link>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          Vidya Saathi. Detect Silent Confusion Before Students Fail.
        </div>
      </div>
    </footer>
  )
}
