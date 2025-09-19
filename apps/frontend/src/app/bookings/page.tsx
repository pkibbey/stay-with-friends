'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { PageLayout } from '@/components/PageLayout'
import { Calendar, MapPin, Users, MessageSquare, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface BookingRequest {
  id: string
  hostId: string
  requesterId: string
  startDate: string
  endDate: string
  guests: number
  message?: string
  status: 'pending' | 'approved' | 'declined' | 'cancelled'
  responseMessage?: string
  respondedAt?: string
  createdAt: string
  host: {
    id: string
    name: string
    location?: string
    email?: string
  }
  requester: {
    id: string
    email: string
    name?: string
    image?: string
  }
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  declined: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
}

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  declined: XCircle,
  cancelled: XCircle,
}

export default function BookingsPage() {
  const { data: session, status } = useSession()
  const [myRequests, setMyRequests] = useState<BookingRequest[]>([])
  const [incomingRequests, setIncomingRequests] = useState<BookingRequest[]>([])
  console.log('incomingRequests: ', incomingRequests);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('my-requests')

  const fetchBookingRequests = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session?.user as any)?.id
    console.log('userId: ', userId);
    console.log('Fetching booking requests for userId:', userId)
    console.log('Full session object:', session)
    console.log('Session status:', status)
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
      
      console.log('My requests response status:', myRequestsResponse.status)
      const myRequestsData = await myRequestsResponse.json()
      console.log('My requests data:', myRequestsData)
      
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
      
      console.log('Incoming requests response status:', incomingRequestsResponse.status)
      const incomingRequestsData = await incomingRequestsResponse.json()
      console.log('Incoming requests data:', incomingRequestsData)
      
      if (incomingRequestsData.errors) {
        console.error('GraphQL errors in incoming requests:', incomingRequestsData.errors)
      }
      
      console.log('incomingRequestsData.data: ', incomingRequestsData.data);
      setIncomingRequests(incomingRequestsData.data?.bookingRequestsByHostUser || [])
    } catch (error) {
      console.error('Error fetching booking requests:', error)
      setError(`Failed to load booking requests: ${error}`)
    } finally {
      setLoading(false)
    }
  }, [session, status])

  useEffect(() => {
    console.log('Session state changed:', session, 'Status:', status)
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
        {/* Debug info - remove this later */}
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="py-2">
            <small className="text-gray-600">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              Debug: Session status: {status}, User ID: {(session?.user as any)?.id || 'none'}, 
              Loading: {loading.toString()}, Error: {error || 'none'}
            </small>
          </CardContent>
        </Card>
        
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

interface BookingRequestCardProps {
  request: BookingRequest
  type: 'guest' | 'host'
  onStatusUpdate: (requestId: string, status: string, responseMessage?: string) => void
}

function BookingRequestCard({ request, type, onStatusUpdate }: BookingRequestCardProps) {
  const [responseMessage, setResponseMessage] = useState('')
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [pendingAction, setPendingAction] = useState<string | null>(null)

  const StatusIcon = statusIcons[request.status]
  
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM d, yyyy')
  }

  const calculateNights = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleAction = async (action: string) => {
    if (action === 'approve' || action === 'decline') {
      if (showResponseForm) {
        setPendingAction(action)
        await onStatusUpdate(request.id, action === 'approve' ? 'approved' : 'declined', responseMessage)
        setShowResponseForm(false)
        setResponseMessage('')
        setPendingAction(null)
      } else {
        setShowResponseForm(true)
      }
    } else if (action === 'cancel') {
      await onStatusUpdate(request.id, 'cancelled')
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">
                {type === 'guest' ? request.host.name : request.requester.name || request.requester.email}
              </h3>
              <Badge className={`${statusColors[request.status]} border`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </Badge>
            </div>
            
            {type === 'guest' && request.host.location && (
              <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                <MapPin className="w-4 h-4" />
                {request.host.location}
              </div>
            )}
          </div>
          
          <div className="text-right text-sm text-gray-500">
            <div>Requested {format(new Date(request.createdAt), 'MMM d, yyyy')}</div>
            {request.respondedAt && (
              <div>Responded {format(new Date(request.respondedAt), 'MMM d, yyyy')}</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <div className="font-medium">{formatDate(request.startDate)} - {formatDate(request.endDate)}</div>
              <div className="text-sm text-gray-500">{calculateNights(request.startDate, request.endDate)} nights</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <div>
              <div className="font-medium">{request.guests} guest{request.guests !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>

        {request.message && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Request Message:</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              {request.message}
            </div>
          </div>
        )}

        {request.responseMessage && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">
                {type === 'guest' ? 'Host Response:' : 'Your Response:'}
              </span>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              {request.responseMessage}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {type === 'host' && request.status === 'pending' && (
          <div className="space-y-3">
            {showResponseForm && (
              <div>
                <label className="block text-sm font-medium mb-1">Response Message (optional)</label>
                <Textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Add a message for the guest..."
                  rows={2}
                />
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={() => handleAction('approve')}
                disabled={pendingAction === 'approve'}
                className="bg-green-600 hover:bg-green-700"
              >
                {pendingAction === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve'}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction('decline')}
                disabled={pendingAction === 'decline'}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                {pendingAction === 'decline' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Decline'}
              </Button>
              {showResponseForm && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowResponseForm(false)
                    setResponseMessage('')
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}

        {type === 'guest' && request.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleAction('cancel')}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              Cancel Request
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}