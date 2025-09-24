import { Card, CardContent } from "@/components/ui/card"
import { Coffee, Users, Sun, Gamepad2, Music, HeartHandshake } from "lucide-react"

const features = [
  { icon: Users, title: "Stay with your people", desc: "It’s not a marketplace. It’s your circle—friends and friends-of-friends." },
  { icon: Coffee, title: "Slow mornings", desc: "Coffee, croissants, and a real catch‑up around a familiar table." },
  { icon: Sun, title: "Garden time", desc: "Kids playing, BBQ sizzling, or just a quiet read in the sun." },
  { icon: Gamepad2, title: "Games at night", desc: "Cards, co‑op, or a movie—memories you can’t book on a listing." },
  { icon: Music, title: "Local vibes", desc: "Skip the tourist traps—get tips from someone who knows you." },
  { icon: HeartHandshake, title: "Shared stories", desc: "Leave with more inside jokes than photos." },
]

export function ExperienceHighlights() {
  return (
    <section id="how-it-works" className="py-16 md:py-20 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            The best part isn’t the room
          </h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            It’s who you’re with—and the time you share.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-gray-600 dark:text-gray-300">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
