"use client"

import { useState } from 'react'
import { apiPatch } from '@/lib/api'
import { BookingRequestWithRelations } from '@/types'
import { BookingRequestsDisplay } from '@/components/BookingRequestsDisplay'

interface BookingRequestsManagerProps {
  initialMyRequests: BookingRequestWithRelations[]
  initialIncomingRequests: BookingRequestWithRelations[]
  activeTab?: string
}

export function BookingRequestsManager({
  initialMyRequests,
  initialIncomingRequests,
  activeTab
}: BookingRequestsManagerProps) {
  const [myRequests, setMyRequests] = useState<BookingRequestWithRelations[]>(initialMyRequests)
  const [incomingRequests, setIncomingRequests] = useState<BookingRequestWithRelations[]>(initialIncomingRequests)

  const handleStatusUpdate = async (requestId: string, status: string, responseMessage?: string) => {
    try {
      // REST endpoint: PUT /booking-requests/:id/status
      await apiPatch(`/booking-requests/${requestId}/status`, { status, response_message: responseMessage })
      // Update the local state to reflect the change
      setMyRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status, responseMessage, respondedAt: new Date().toISOString() }
            : req
        )
      )
      setIncomingRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status, responseMessage, respondedAt: new Date().toISOString() }
            : req
        )
      )
    } catch (error) {
      console.error('Error updating booking request:', error)
      // In a real app, you'd want to show an error message to the user
    }
  }

  return (
    <BookingRequestsDisplay
      myRequests={myRequests}
      incomingRequests={incomingRequests}
      onStatusUpdate={handleStatusUpdate}
      activeTab={activeTab}
    />
  )
}