import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, MapPin, Users, MessageSquare, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { BookingRequestWithRelations } from '@/types'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  declined: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
} as const

type StatusKey = keyof typeof statusColors

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  declined: XCircle,
  cancelled: XCircle,
} as const

interface BookingRequestCardProps {
  request: BookingRequestWithRelations
  type: 'guest' | 'host'
  onStatusUpdate: (requestId: string, status: string, responseMessage?: string) => void
}

export function BookingRequestCard({ request, type, onStatusUpdate }: BookingRequestCardProps) {
  const [responseMessage, setResponseMessage] = useState('')
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [pendingAction, setPendingAction] = useState<string | null>(null)

  const StatusIcon = request.status && request.status in statusIcons
    ? statusIcons[request.status as StatusKey]
    : Clock

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
                {type === 'guest'
                  ? request.host?.name || 'Unknown Host'
                  : request.requester?.name || request.requester?.email || 'Unknown User'
                }
              </h3>
              <Badge className={`${request.status && request.status in statusColors
                ? statusColors[request.status as StatusKey]
                : statusColors.pending} border`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {request.status
                  ? request.status.charAt(0).toUpperCase() + request.status.slice(1)
                  : 'Pending'
                }
              </Badge>
            </div>

            {type === 'guest' && request.host?.location && (
              <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                <MapPin className="w-4 h-4" />
                {request.host.location}
              </div>
            )}
          </div>

          <div className="text-right text-sm text-gray-500">
            {request.createdAt && (
              <div>Requested {format(new Date(request.createdAt), 'MMM d, yyyy')}</div>
            )}
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