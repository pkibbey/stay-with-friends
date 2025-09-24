import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Home, PartyPopper, Coffee } from "lucide-react"

export function DualPersonaSection() {
  return (
    <section className="py-16 md:py-20 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Whether you’re visiting or welcoming
          </h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            Stay with friends—or invite them to stay with you.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Host persona */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                <Home className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Host the people you love</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Let friends know they’re welcome. Share your space for weekends, reunions, and impromptu dinners.
              </p>
              <div className="mt-5">
                <Link href={{ pathname: "/auth/signin", query: { callbackUrl: "/hosting" } }}>
                  <Button size="sm" variant="default" className="px-4">
                    <PartyPopper className="mr-2 h-4 w-4" /> Start hosting
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Guest persona */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Stay with your friends</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Plan a visit that’s more about slow mornings and real catch‑ups than check‑in codes.
              </p>
              <div className="mt-5">
                <Link href={{ pathname: "/auth/signin", query: { callbackUrl: "/invite" } }}>
                  <Button size="sm" variant="outline" className="px-4">
                    <Coffee className="mr-2 h-4 w-4" /> Get started
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
