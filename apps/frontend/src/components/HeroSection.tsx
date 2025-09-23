import { Button } from "@/components/ui/button"
import { Users, Search, Zap, Globe2 } from "lucide-react"
import { TextLogo } from "./TextLogo"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <div className="grid gap-6 max-w-4xl mx-auto">
        <TextLogo className="text-4xl md:text-6xl" />
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Find the perfect place to stay with people you know. Like AirBNB, but only for your trusted network.
        </p>
        <div className="flex justify-center py-16">
          <Link href="/search">
            <Button size="lg" className="px-8" variant="default">
              <Search className="w-7 h-7 mr-1" />
              Search All Hosts
            </Button>
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="text-lg md:text-xl font-light text-gray-700 dark:text-gray-200  flex items-center gap-2 px-4 py-2">
            <Users className="w-7 h-7 text-blue-400 dark:text-blue-600" />
            Trusted Network Only
          </div>
          <div className="text-lg md:text-xl font-light text-gray-700 dark:text-gray-200 flex items-center gap-2 px-4 py-2">
            <Globe2 className="w-7 h-7 text-blue-400 dark:text-blue-600" />
            Unique Locations
          </div>
          <div className="text-lg md:text-xl font-light text-gray-700 dark:text-gray-200 flex items-center gap-2 px-4 py-2">
            <Zap className="w-7 h-7 text-blue-400 dark:text-blue-600" />
            Good times
          </div>
        </div>
      </div>
    </section>
  )
}