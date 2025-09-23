"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookingRequest, BookingRequestWithRelations } from '@/types'
import { BookingRequestCard } from '@/components/BookingRequestCard'

interface BookingRequestsDisplayProps {
  myRequests: BookingRequestWithRelations[]
  incomingRequests: BookingRequestWithRelations[]
  onStatusUpdate: (requestId: string, status: string, responseMessage?: string) => void
}

export function BookingRequestsDisplay({
  myRequests,
  incomingRequests,
  onStatusUpdate
}: BookingRequestsDisplayProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('my-requests')

  const filterRequests = (requests: BookingRequest[]) => {
    if (statusFilter === 'all') return requests
    return requests.filter(request => request.status === statusFilter)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                <Button className="mt-4" onClick={() => window.location.href = '/search'}>
                  Find Places to Stay
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
                <Button className="mt-4" onClick={() => window.location.href = '/hosting'}>
                  Manage Your Listings
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