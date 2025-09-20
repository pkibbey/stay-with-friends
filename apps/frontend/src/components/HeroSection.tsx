import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, MapPin, Search } from "lucide-react"
import { TextLogo } from "./TextLogo"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-4xl mx-auto">
        <TextLogo className="text-4xl md:text-6xl mb-6" />
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Find the perfect place to stay with people you know. Like AirBNB, but only for your trusted network.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Badge variant="secondary" className="px-4 py-2">
            <Users className="w-4 h-4 mr-2" />
            Trusted Network Only
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <MapPin className="w-4 h-4 mr-2" />
            Unique Locations
          </Badge>
        </div>
        <div className="flex justify-center">
          <Link href="/search">
            <Button size="lg" className="px-8">
              <Search className="w-5 h-5 mr-2" />
              Search All Hosts
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}