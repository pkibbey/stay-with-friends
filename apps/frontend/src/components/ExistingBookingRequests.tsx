import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, XCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import type { BookingRequest } from '@/types'

interface ExistingBookingRequestsProps {
  requests: BookingRequest[]
  hostName: string
}

export function ExistingBookingRequests({ requests, hostName }: ExistingBookingRequestsProps) {
  const [showOnlyPending, setShowOnlyPending] = useState(true)
  const [cancellingRequest, setCancellingRequest] = useState<string | null>(null)

  if (requests.length === 0) return null

  // Filter requests based on showOnlyPending state
  const filteredRequests = showOnlyPending 
    ? requests.filter(request => request.status === 'pending')
    : requests

  const pendingCount = requests.filter(request => request.status === 'pending').length

  const handleCancelRequest = async (requestId: string) => {
    setCancellingRequest(requestId)
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation UpdateBookingRequestStatus($id: ID!, $status: String!) {
              updateBookingRequestStatus(id: $id, status: $status) {
                id
                status
              }
            }
          `,
          variables: { id: requestId, status: 'cancelled' },
        }),
      })
      
      const data = await response.json()
      if (data.data?.updateBookingRequestStatus) {
        // Refresh the page to update the requests
        window.location.reload()
      }
    } catch (error) {
      console.error('Error cancelling booking request:', error)
    } finally {
      setCancellingRequest(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Requests to Stay</CardTitle>
            <CardDescription>Your previous booking requests with {hostName}</CardDescription>
          </div>
          {requests.length > pendingCount && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOnlyPending(!showOnlyPending)}
              className="flex items-center gap-2"
            >
              {showOnlyPending ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showOnlyPending ? 'Show All' : 'Show Only Pending'} ({showOnlyPending ? requests.length : pendingCount})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredRequests.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            {showOnlyPending ? 'No pending requests found' : 'No requests found'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {request.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                    {request.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {request.status === 'declined' && <XCircle className="w-4 h-4 text-red-500" />}
                    {request.status === 'cancelled' && <XCircle className="w-4 h-4 text-gray-500" />}
                    <span className="font-medium capitalize">{request.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {new Date(request.createdAt!).toLocaleDateString()}
                    </span>
                    {request.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelRequest(request.id)}
                        disabled={cancellingRequest === request.id}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        {cancellingRequest === request.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          'Cancel'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <div>Dates: {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</div>
                  <div>Guests: {request.guests}</div>
                  {request.message && <div>Message: {request.message}</div>}
                  {request.responseMessage && (
                    <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded">
                      <strong>Response:</strong> {request.responseMessage}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}