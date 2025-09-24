import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TextLogo } from "@/components/TextLogo"
import { Coffee, Gamepad2, Sun, Users } from "lucide-react"

export function MarketingHero() {
  return (
    <section className="relative isolate">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-blue-50/60 to-blue-100 dark:from-transparent dark:via-gray-900/50 dark:to-gray-900" />

      {/* Subtle animated accents (lightweight) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[8%] top-10 h-40 w-40 rounded-full bg-gradient-to-tr from-blue-400/25 to-indigo-400/25 blur-3xl animate-pulse" />
        <div className="absolute right-[12%] top-24 h-24 w-24 rounded-full bg-gradient-to-tr from-amber-300/25 to-pink-300/25 blur-2xl animate-pulse" />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-28 text-center">
        <div className="mx-auto grid max-w-3xl gap-6">
          <TextLogo className="text-5xl md:text-6xl" />
          <p className="text-balance text-xl md:text-2xl text-gray-700 dark:text-gray-200">
            Stay with friends. Not just a room—shared mornings, garden chats, board games and late coffee.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-4 text-gray-700 dark:text-gray-200">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm shadow-sm backdrop-blur dark:bg-white/10">
              <Coffee className="h-4 w-4" /> Croissants for breakfast
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm shadow-sm backdrop-blur dark:bg-white/10">
              <Sun className="h-4 w-4" /> Time in the garden
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm shadow-sm backdrop-blur dark:bg-white/10">
              <Gamepad2 className="h-4 w-4" /> Games after dinner
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm shadow-sm backdrop-blur dark:bg-white/10">
              <Users className="h-4 w-4" /> Trusted connections
            </span>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/auth/signin">
              <Button size="lg" className="px-8">Sign in to get started</Button>
            </Link>
            <a href="#how-it-works" className="text-base font-medium text-blue-700 underline decoration-blue-300 underline-offset-4 hover:decoration-blue-500 dark:text-blue-300">
              How it works
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
