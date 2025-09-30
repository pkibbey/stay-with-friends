import { useState } from 'react'
import { apiPost } from '@/lib/api'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, Star } from "lucide-react"
import { formatDateForUrl } from '@/lib/date-utils'
import { Host } from '@stay-with-friends/shared-types'

interface BookingFormProps {
  host: Host
  maxNights: number
  selectedDate: Date | undefined
}

interface BookingFormData {
  guests: number
  nights: number
  message: string
}

export function BookingForm({ host, maxNights, selectedDate }: BookingFormProps) {
  const { data: session } = useSession()
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    guests: 1,
    nights: 1,
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSubmitted, setBookingSubmitted] = useState(false)

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate) return

    // Calculate end date based on start date + number of nights
    const startDate = new Date(selectedDate)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + bookingForm.nights)

    setIsSubmitting(true)
    try {
      // REST endpoint: POST /booking-requests
      await apiPost('/booking-requests', {
        id: crypto.randomUUID(),
        host_id: host.id,
        requester_id: (session?.user as { id?: string })?.id,
        start_date: formatDateForUrl(startDate),
        end_date: formatDateForUrl(endDate),
        guests: bookingForm.guests,
        message: bookingForm.message,
        status: 'pending'
      })
      setBookingSubmitted(true)
    } catch (error) {
      console.error('Failed to submit booking request:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request to Stay</CardTitle>
        <CardDescription>Send a booking request to {host.name}</CardDescription>
      </CardHeader>
      <CardContent>
        {bookingSubmitted ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-600 mb-2">Request Sent!</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {`Your booking request has been sent to ${host.name}. They'll get back to you soon.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            {/* Date Summary */}
            {selectedDate && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Stay Details</h4>
                <div className="text-sm space-y-1">
                  <div>Check-in: {selectedDate.toLocaleDateString()}</div>
                  <div>Check-out: {(() => {
                    const endDate = new Date(selectedDate)
                    endDate.setDate(selectedDate.getDate() + bookingForm.nights)
                    return endDate.toLocaleDateString()
                  })()}</div>
                  <div>Duration: {bookingForm.nights} night{bookingForm.nights !== 1 ? 's' : ''}</div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="guests">Number of Guests</Label>
              <Input
                id="guests"
                type="number"
                min="1"
                max={host.max_guests || 1}
                value={bookingForm.guests}
                onChange={(e) => setBookingForm(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="nights">Number of Nights</Label>
              <Input
                id="nights"
                type="number"
                min="1"
                max={maxNights}
                value={bookingForm.nights}
                onChange={(e) => setBookingForm(prev => ({ ...prev, nights: parseInt(e.target.value) }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Tell them a bit about yourself and your trip..."
                value={bookingForm.message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBookingForm(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!selectedDate || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Request...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Booking Request
                </>
              )}
            </Button>

            {!selectedDate ? (
              <p className="text-sm text-gray-500 text-center">
                Please select a date to continue
              </p>
            ) : null}
          </form>
        )}
      </CardContent>
    </Card>
  )
}