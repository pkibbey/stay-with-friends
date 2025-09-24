'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Home, Users, Calendar, TrendingUp } from 'lucide-react'
import { graphqlRequest } from '@/lib/graphql'

interface CommunityStats {
  totalHostsCount: number
  totalConnectionsCount: number
  totalBookingsCount: number
}

export function CommunityStatsSection() {
  const [stats, setStats] = useState<CommunityStats>({
    totalHostsCount: 0,
    totalConnectionsCount: 0,
    totalBookingsCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const query = `
          query GetCommunityStats {
            totalHostsCount
            totalConnectionsCount
            totalBookingsCount
          }
        `

        const result = await graphqlRequest(query)
        const fetchedStats = result.data as unknown as CommunityStats
        setStats(fetchedStats)
      } catch (err) {
        console.error('Error fetching community stats:', err)
        setError(err instanceof Error ? err.message : 'Failed to load stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statItems = [
    {
      icon: Home,
      label: 'Hosts Available',
      value: stats.totalHostsCount,
      description: 'Places to stay with friends'
    },
    {
      icon: Users,
      label: 'Connections Made',
      value: stats.totalConnectionsCount,
      description: 'Trusted friendships built'
    },
    {
      icon: Calendar,
      label: 'Stays Completed',
      value: stats.totalBookingsCount,
      description: 'Memorable experiences shared'
    }
  ]

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Growing Community</h2>
            <p className="text-xl text-gray-600">See how our trusted network is expanding</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {statItems.map((item, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Growing Community</h2>
            <p className="text-xl text-gray-600">See how our trusted network is expanding</p>
          </div>
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Stats temporarily unavailable</h3>
              <p className="text-gray-600">We&apos;re working on bringing you the latest community numbers.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Growing Community</h2>
          <p className="text-xl text-gray-600">See how our trusted network is expanding</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {statItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {item.value.toLocaleString()}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    {item.label}
                  </div>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            Join our community and be part of the trusted network revolution
          </p>
        </div>
      </div>
    </section>
  )
}