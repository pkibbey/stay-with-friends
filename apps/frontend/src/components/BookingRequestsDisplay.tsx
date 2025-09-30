"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookingRequestWithRelations } from '@/types'
import { BookingRequestCard } from '@/components/BookingRequestCard'
import Link from 'next/link'
import { BookingRequest } from '@stay-with-friends/shared-types'

interface BookingRequestsDisplayProps {
  myRequests: BookingRequestWithRelations[]
  incomingRequests: BookingRequestWithRelations[]
  onStatusUpdate: (requestId: string, status: string, responseMessage?: string) => void
  activeTab?: string
}

export function BookingRequestsDisplay({
  myRequests,
  incomingRequests,
  onStatusUpdate,
  activeTab
}: BookingRequestsDisplayProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [internalActiveTab, setInternalActiveTab] = useState('my-requests')

  const currentActiveTab = activeTab || internalActiveTab

  const filterRequests = (requests: BookingRequest[]) => {
    if (statusFilter === 'all') return requests
    return requests.filter(request => request.status === statusFilter)
  }

  // If activeTab is provided, render only the content for that tab
  if (activeTab) {
    return (
      <div className="space-y-6">
        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === 'approved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('approved')}
          >
            Approved
          </Button>
          <Button
            variant={statusFilter === 'declined' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('declined')}
          >
            Declined
          </Button>
          <Button
            variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('cancelled')}
          >
            Cancelled
          </Button>
        </div>

        {activeTab === 'my-requests' ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Requests you&apos;ve made to stay with friends
            </div>
            {filterRequests(myRequests).length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500">No booking requests found</p>
                  <Button asChild className="mt-4">
                    <Link href="/search">
                      Find Places to Stay
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterRequests(myRequests).map((request) => (
                  <BookingRequestCard
                    key={request.id}
                    request={request}
                    type="guest"
                    onStatusUpdate={onStatusUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Requests from friends to stay at your places
            </div>
            {filterRequests(incomingRequests).length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500">No incoming requests</p>
                  <Button asChild className="mt-4">
                    <Link href="/hosting">
                      Manage Your Hosting
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterRequests(incomingRequests).map((request) => (
                  <BookingRequestCard
                    key={request.id}
                    request={request}
                    type="host"
                    onStatusUpdate={onStatusUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Original tab rendering when activeTab is not provided
  return (
    <div className="space-y-6">
      <Tabs value={currentActiveTab} onValueChange={setInternalActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-requests">
            My Requests ({myRequests.length})
          </TabsTrigger>
          <TabsTrigger value="incoming">
            Incoming Requests ({incomingRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === 'approved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('approved')}
          >
            Approved
          </Button>
          <Button
            variant={statusFilter === 'declined' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('declined')}
          >
            Declined
          </Button>
          <Button
            variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('cancelled')}
          >
            Cancelled
          </Button>
        </div>

        <TabsContent value="my-requests" className="space-y-4">
          <div className="text-sm text-gray-600">
            Requests you&apos;ve made to stay with friends
          </div>
          {filterRequests(myRequests).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500">No booking requests found</p>
                <Button asChild className="mt-4">
                  <Link href="/search">
                    Find Places to Stay
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filterRequests(myRequests).map((request) => (
                <BookingRequestCard
                  key={request.id}
                  request={request}
                  type="guest"
                  onStatusUpdate={onStatusUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="incoming" className="space-y-4">
          <div className="text-sm text-gray-600">
            Requests from friends to stay at your places
          </div>
          {filterRequests(incomingRequests).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500">No incoming requests</p>
                <Button asChild className="mt-4">
                  <Link href="/hosting">
                    Manage Your Hosting
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filterRequests(incomingRequests).map((request) => (
                <BookingRequestCard
                  key={request.id}
                  request={request}
                  type="host"
                  onStatusUpdate={onStatusUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}