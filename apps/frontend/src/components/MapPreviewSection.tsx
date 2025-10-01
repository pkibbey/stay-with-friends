'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapComponent } from './MapComponent'
import { MapPin, ArrowRight } from 'lucide-react'
import { HostWithAvailabilities } from '@/types'
import { apiGet } from '@/lib/api'

export function MapPreviewSection() {
  const [hosts, setHosts] = useState<HostWithAvailabilities[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHostsForMap = async () => {
      try {
        setLoading(true)
        const hosts: HostWithAvailabilities[] = await apiGet('/hosts')
        setHosts(hosts)
      } catch (err) {
        console.error('Error fetching hosts for map:', err)
        setError(err instanceof Error ? err.message : 'Failed to load map')
      } finally {
        setLoading(false)
      }
    }
    fetchHostsForMap()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Where You Can Stay</h2>
            <p className="text-xl text-gray-600">Explore host locations across the country</p>
          </div>
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-0">
              <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  if (error || hosts.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Where You Can Stay</h2>
            <p className="text-xl text-gray-600">Explore host locations across the country</p>
          </div>
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8 text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {error ? 'Unable to load map' : 'No locations available'}
              </h3>
              <p className="text-gray-600 mb-6">
                {error ? 'Please try again later.' : 'Be the first to add a location!'}
              </p>
              {!error && (
                <Link href="/hosting">
                  <Button>
                    Add Your Location
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Where You Can Stay</h2>
          <p className="text-xl text-gray-600">Explore host locations across the country</p>
        </div>

        <Card className="max-w-4xl mx-auto overflow-hidden">
          <CardContent className="p-0">
            <div className="h-96 relative">
              <MapComponent
                hosts={hosts}
                className="h-full"
              />
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            {hosts.length} host{hosts.length !== 1 ? 's' : ''} available in {new Set(hosts.map(h => h.state).filter(Boolean)).size} state{new Set(hosts.map(h => h.state).filter(Boolean)).size !== 1 ? 's' : ''}
          </p>
          <Link href="/search">
            <Button size="lg" variant="outline">
              <MapPin className="w-5 h-5 mr-2" />
              View Full Map
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}