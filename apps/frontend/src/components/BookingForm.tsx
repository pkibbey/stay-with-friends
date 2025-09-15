import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, Star } from "lucide-react"
import { formatDateForUrl } from '@/lib/date-utils'

interface BookingFormProps {
  personId: string
  personName: string
  maxGuests: number
  selectedDateRange: {from: Date | undefined, to: Date | undefined}
}

interface BookingFormData {
  requesterName: string
  requesterEmail: string
  guests: number
  message: string
}

export function BookingForm({ personId, personName, maxGuests, selectedDateRange }: BookingFormProps) {
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    requesterName: '',
    requesterEmail: '',
    guests: 1,
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSubmitted, setBookingSubmitted] = useState(false)

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDateRange.from || !selectedDateRange.to) return

    setIsSubmitting(true)
    try {
      const response = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreateBookingRequest($personId: ID!, $requesterName: String!, $requesterEmail: String!, $startDate: String!, $endDate: String!, $guests: Int!, $message: String) {
              createBookingRequest(personId: $personId, requesterName: $requesterName, requesterEmail: $requesterEmail, startDate: $startDate, endDate: $endDate, guests: $guests, message: $message) {
                id
                status
              }
            }
          `,
          variables: {
            personId,
            requesterName: bookingForm.requesterName,
            requesterEmail: bookingForm.requesterEmail,
            startDate: formatDateForUrl(selectedDateRange.from),
            endDate: formatDateForUrl(selectedDateRange.to),
            guests: bookingForm.guests,
            message: bookingForm.message
          },
        }),
      })

      const data = await response.json()
      if (data.data?.createBookingRequest) {
        setBookingSubmitted(true)
      }
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
        <CardDescription>Send a booking request to {personName}</CardDescription>
      </CardHeader>
      <CardContent>
        {bookingSubmitted ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-600 mb-2">Request Sent!</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {`Your booking request has been sent to ${personName}. They'll get back to you soon.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={bookingForm.requesterName}
                onChange={(e) => setBookingForm(prev => ({ ...prev, requesterName: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={bookingForm.requesterEmail}
                onChange={(e) => setBookingForm(prev => ({ ...prev, requesterEmail: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="guests">Number of Guests</Label>
              <Input
                id="guests"
                type="number"
                min="1"
                max={maxGuests}
                value={bookingForm.guests}
                onChange={(e) => setBookingForm(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
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
              disabled={!selectedDateRange.from || !selectedDateRange.to || isSubmitting}
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

            {!selectedDateRange.from || !selectedDateRange.to ? (
              <p className="text-sm text-gray-500 text-center">
                Please select dates to continue
              </p>
            ) : null}
          </form>
        )}
      </CardContent>
    </Card>
  )
}