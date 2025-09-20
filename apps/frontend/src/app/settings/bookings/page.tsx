'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageLayout } from '@/components/PageLayout'
import { Loader2 } from 'lucide-react'
import { BookingRequest, BookingRequestWithRelations } from '@/types'
import { BookingRequestCard } from '@/components/BookingRequestCard'

export default function BookingsPage() {
  const { data: session, status } = useSession()
  const [myRequests, setMyRequests] = useState<BookingRequestWithRelations[]>([])
  const [incomingRequests, setIncomingRequests] = useState<BookingRequestWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('my-requests')

  const fetchBookingRequests = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session?.user as any)?.id
    if (!userId) {
      console.log('No userId found, skipping fetch')
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      console.log('Making GraphQL request for booking requests...')
      
      // Fetch requests made by this user (as guest)
      const myRequestsResponse = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetMyBookingRequests($requesterId: ID!) {
              bookingRequestsByRequester(requesterId: $requesterId) {
                id
                hostId
                requesterId
                startDate
                endDate
                guests
                message
                status
                responseMessage
                respondedAt
                createdAt
                host {
                  id
                  name
                  location
                  email
                }
                requester {
                  id
                  email
                  name
                  image
                }
              }
            }
          `,
          variables: { requesterId: userId },
        }),
      })
      
      const myRequestsData = await myRequestsResponse.json()
      
      if (myRequestsData.errors) {
        console.error('GraphQL errors in my requests:', myRequestsData.errors)
      }
      
      setMyRequests(myRequestsData.data?.bookingRequestsByRequester || [])

      // Fetch requests for hosts owned by this user
      const incomingRequestsResponse = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetIncomingBookingRequests($userId: ID!) {
              bookingRequestsByHostUser(userId: $userId) {
                id
                hostId
                requesterId
                startDate
                endDate
                guests
                message
                status
                responseMessage
                respondedAt
                createdAt
                host {
                  id
                  name
                  location
                  email
                }
                requester {
                  id
                  email
                  name
                  image
                }
              }
            }
          `,
          variables: { userId },
        }),
      })
      
      const incomingRequestsData = await incomingRequestsResponse.json()
      
      if (incomingRequestsData.errors) {
        console.error('GraphQL errors in incoming requests:', incomingRequestsData.errors)
      }
      
      setIncomingRequests(incomingRequestsData.data?.bookingRequestsByHostUser || [])
    } catch (error) {
      console.error('Error fetching booking requests:', error)
      setError(`Failed to load booking requests: ${error}`)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session?.user as any)?.id
    
    if (userId) {
      fetchBookingRequests()
    } else if (status !== 'loading') {
      // If we're not loading and have no userId, stop loading
      setLoading(false)
    }
  }, [fetchBookingRequests, session, status])

  const handleStatusUpdate = async (requestId: string, status: string, responseMessage?: string) => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation UpdateBookingRequestStatus($id: ID!, $status: String!, $responseMessage: String) {
              updateBookingRequestStatus(id: $id, status: $status, responseMessage: $responseMessage) {
                id
                status
                responseMessage
                respondedAt
              }
            }
          `,
          variables: { id: requestId, status, responseMessage },
        }),
      })
      
      const data = await response.json()
      if (data.data?.updateBookingRequestStatus) {
        // Refresh the booking requests
        fetchBookingRequests()
      }
    } catch (error) {
      console.error('Error updating booking request:', error)
    }
  }

  const filterRequests = (requests: BookingRequest[]) => {
    if (statusFilter === 'all') return requests
    return requests.filter(request => request.status === statusFilter)
  }

  if (status === 'loading' || loading) {
    return (
      <PageLayout title="Booking Requests" showHeader={false}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout title="Booking Requests" showHeader={false}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Error Loading Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => {
                setError(null)
                setLoading(true)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const userId = (session?.user as any)?.id
                if (userId) {
                  fetchBookingRequests()
                }
              }}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  if (!session) {
    return (
      <PageLayout title="Booking Requests" showHeader={false}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card>
            <CardHeader>
              <CardTitle>Please sign in</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = '/auth/signin'}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Booking Requests" subtitle="Manage your stay requests and hosting">
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
                    onStatusUpdate={handleStatusUpdate}
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
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  )
}