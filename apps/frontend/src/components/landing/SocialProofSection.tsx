import { Card, CardContent } from "@/components/ui/card"

const quotes = [
  {
    quote: "We planned to see the city, but spent most of the time catching up in the kitchen. Best trip in years.",
    author: "Amara & Jess",
  },
  {
    quote: "The kids made new friends, we grilled in the garden, and it felt like family from day one.",
    author: "Diego & Lina",
  },
  {
    quote: "It’s not about finding a place—it’s about who’s there when you arrive.",
    author: "Sam",
  },
]

export function SocialProofSection() {
  return (
    <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Real stays with real friends
          </h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            Stories from people who chose connection over convenience.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quotes.map((q) => (
            <Card key={q.quote} className="h-full">
              <CardContent className="p-6">
                <p className="text-gray-800 dark:text-gray-100">“{q.quote}”</p>
                <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-300">— {q.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
