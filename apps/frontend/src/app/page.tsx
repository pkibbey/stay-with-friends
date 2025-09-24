import * as React from "react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { HeroSection } from "@/components/HeroSection"
import { HowItWorksSection } from "@/components/HowItWorksSection"
import { FeaturedHostsSection } from "@/components/FeaturedHostsSection"
import { CommunityStatsSection } from "@/components/CommunityStatsSection"
import { MapPreviewSection } from "@/components/MapPreviewSection"
import { MarketingHero } from "@/components/landing/MarketingHero"
import { ExperienceHighlights } from "@/components/landing/ExperienceHighlights"
import { SocialProofSection } from "@/components/landing/SocialProofSection"
import { DualPersonaSection } from "@/components/landing/DualPersonaSection"
import { FinalCTA } from "@/components/landing/FinalCTA"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    // Logged-out marketing landing
    return (
      <div className="min-h-screen">
        <MarketingHero />
        <ExperienceHighlights />
        <DualPersonaSection />
        <SocialProofSection />
        <FinalCTA />
      </div>
    )
  }

  // Logged-in users keep the functional homepage
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      <FeaturedHostsSection />
      <CommunityStatsSection />
      <MapPreviewSection />
    </div>
  )
}
