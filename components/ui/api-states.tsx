"use client"

import { AlertTriangle, RefreshCw, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

/* ---- Skeleton Grid --------------------------------------- */
export function LoadingSkeleton({ rows = 4, columns = 1 }: { rows?: number; columns?: number }) {
  return (
    <div className={`grid gap-4 ${columns > 1 ? `sm:grid-cols-${columns}` : ""}`}>
      {Array.from({ length: rows * columns }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg bg-muted">
          <div className="p-4 flex flex-col gap-3">
            <div className="h-3 w-1/3 rounded bg-muted-foreground/10" />
            <div className="h-6 w-2/3 rounded bg-muted-foreground/10" />
            <div className="h-3 w-1/2 rounded bg-muted-foreground/10" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---- Dashboard Card Skeleton ----------------------------- */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-muted" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-3 w-20 rounded bg-muted" />
                <div className="h-7 w-16 rounded bg-muted" />
                <div className="h-2.5 w-24 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Chart row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-6">
            <div className="h-4 w-32 rounded bg-muted mb-4" />
            <div className="h-48 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- Error State ----------------------------------------- */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-foreground">Something went wrong</p>
        <p className="max-w-md text-xs text-muted-foreground">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-2 gap-1.5" onClick={onRetry}>
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

/* ---- Empty State ----------------------------------------- */
export function EmptyState({ title = "No data yet", description }: { title?: string; description?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="max-w-md text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  )
}
