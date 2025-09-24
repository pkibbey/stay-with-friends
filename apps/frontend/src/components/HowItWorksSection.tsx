import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Home, Search, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const steps = [
  {
    icon: Users,
    title: 'Connect with Friends',
    description: 'Invite your trusted friends to join the platform and build your network of connections.',
    link: '/invite',
    linkText: 'Send Invites'
  },
  {
    icon: Home,
    title: 'List Your Space',
    description: 'Share your home, apartment, or vacation property with friends who need a place to stay.',
    link: '/hosting',
    linkText: 'Start Hosting'
  },
  {
    icon: Search,
    title: 'Find Perfect Stays',
    description: 'Search through available listings from your network and find the ideal place for your trip.',
    link: '/search',
    linkText: 'Browse Hosts'
  },
  {
    icon: Calendar,
    title: 'Book & Enjoy',
    description: 'Request to stay, coordinate with your host, and enjoy a memorable experience with friends.',
    link: '/stays',
    linkText: 'View Bookings'
  }
]

export function HowItWorksSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay with friends has never been easier. Follow these simple steps to get started.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl mb-2">
                    <span className="inline-block w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold mr-2 align-middle">
                      {index + 1}
                    </span>
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">
                    {step.description}
                  </p>
                  <Link href={step.link}>
                    <Button variant="outline" size="sm">
                      {step.linkText}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            Ready to get started? Join thousands of friends who are already sharing homes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/invite">
              <Button size="lg">
                <Users className="w-5 h-5 mr-2" />
                Invite Friends
              </Button>
            </Link>
            <Link href="/search">
              <Button size="lg" variant="outline">
                <Search className="w-5 h-5 mr-2" />
                Find a Stay
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}