import * as React from "react"
import { HeroSection } from "@/components/HeroSection"

export default async function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <HeroSection />
    </div>
  )
}
