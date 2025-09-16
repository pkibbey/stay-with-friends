import { Badge } from "@/components/ui/badge"
import { Users, MapPin } from "lucide-react"

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter">
          <span className="text-gray-900 dark:text-white">Stay</span>
          <span className="text-blue-500 dark:text-blue-300">With</span>
          <span className="text-blue-600 dark:text-blue-400">Friends</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Find the perfect place to stay with people you know. Like Airbnb, but only for your trusted network.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Badge variant="secondary" className="px-4 py-2">
            <Users className="w-4 h-4 mr-2" />
            Trusted Network Only
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <MapPin className="w-4 h-4 mr-2" />
            Unique Locations
          </Badge>
        </div>
      </div>
    </section>
  )
}