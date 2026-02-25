import { Heart, MessageSquare, Shield } from "lucide-react"

export function LandingForParents() {
  return (
    <section id="parents" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <div>
            <h2
              className="text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Supportive System, Not Surveillance
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Parents receive supportive SMS alerts when consistent patterns of low engagement
              or high confusion are detected. The tone is always encouraging, never punitive.
            </p>

            <div className="mt-8 flex flex-col gap-5">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <MessageSquare className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">SMS Alerts</h3>
                  <p className="text-sm text-muted-foreground">Receive supportive notifications about your child&apos;s learning journey.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <Heart className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Early Encouragement</h3>
                  <p className="text-sm text-muted-foreground">Track child engagement and encourage study improvement early.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Privacy Protected</h3>
                  <p className="text-sm text-muted-foreground">No device spying. Only in-platform learning behavior is monitored.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SMS Preview */}
          <div className="mx-auto w-full max-w-xs">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-4 text-center">
                <p className="text-xs font-medium text-muted-foreground">Vidya Saathi SMS Alert</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="self-start rounded-xl rounded-tl-sm bg-muted px-4 py-2.5">
                  <p className="text-sm text-foreground">
                    Your child may need support in Algebra. Please encourage 15 minutes of revision today.
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">10:30 AM</p>
                </div>
                <div className="self-start rounded-xl rounded-tl-sm bg-muted px-4 py-2.5">
                  <p className="text-sm text-foreground">
                    Great news! Your child completed the Science recovery plan with 85% mastery.
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">2:15 PM</p>
                </div>
                <div className="self-start rounded-xl rounded-tl-sm bg-accent/10 px-4 py-2.5">
                  <p className="text-sm text-foreground">
                    Weekly summary: 5 sessions completed. Engagement improved this week.
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">6:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
