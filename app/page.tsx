import { LandingHero } from "@/components/landing/hero"
import { LandingProblem } from "@/components/landing/problem"
import { LandingSolution } from "@/components/landing/solution"
import { LandingConfusionEngine } from "@/components/landing/confusion-engine"
import { LandingHowItWorks } from "@/components/landing/how-it-works"
import { LandingForTeachers } from "@/components/landing/for-teachers"
import { LandingForParents } from "@/components/landing/for-parents"
import { LandingInfrastructure } from "@/components/landing/infrastructure"
import { LandingEthics } from "@/components/landing/ethics"
import { LandingCTA } from "@/components/landing/cta"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <LandingHero />
        <LandingProblem />
        <LandingSolution />
        <LandingConfusionEngine />
        <LandingHowItWorks />
        <LandingForTeachers />
        <LandingForParents />
        <LandingInfrastructure />
        <LandingEthics />
        <LandingCTA />
      </main>
      <Footer />
    </div>
  )
}
