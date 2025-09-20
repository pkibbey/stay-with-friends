import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, CheckCircle, XCircle } from "lucide-react"
import type { BookingRequest } from '@/types'

interface ExistingBookingRequestsProps {
  requests: BookingRequest[]
  hostName: string
}

export function ExistingBookingRequests({ requests, hostName }: ExistingBookingRequestsProps) {
  if (requests.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Requests to Stay</CardTitle>
        <CardDescription>Your previous booking requests with {hostName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {request.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                  {request.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {request.status === 'declined' && <XCircle className="w-4 h-4 text-red-500" />}
                  {request.status === 'cancelled' && <XCircle className="w-4 h-4 text-gray-500" />}
                  <span className="font-medium capitalize">{request.status}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(request.createdAt!).toLocaleDateString()}
                </span>
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
      </CardContent>
    </Card>
  )
}