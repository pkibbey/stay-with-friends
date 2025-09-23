"use client"

import { useState } from 'react'
import { authenticatedGraphQLRequest } from '@/lib/graphql'
import { BookingRequestWithRelations } from '@/types'
import { BookingRequestsDisplay } from '@/components/BookingRequestsDisplay'

interface BookingRequestsManagerProps {
  initialMyRequests: BookingRequestWithRelations[]
  initialIncomingRequests: BookingRequestWithRelations[]
}

export function BookingRequestsManager({
  initialMyRequests,
  initialIncomingRequests
}: BookingRequestsManagerProps) {
  const [myRequests, setMyRequests] = useState<BookingRequestWithRelations[]>(initialMyRequests)
  const [incomingRequests, setIncomingRequests] = useState<BookingRequestWithRelations[]>(initialIncomingRequests)

  const handleStatusUpdate = async (requestId: string, status: string, responseMessage?: string) => {
    try {
      const result = await authenticatedGraphQLRequest(`
        mutation UpdateBookingRequestStatus($id: ID!, $status: String!, $responseMessage: String) {
          updateBookingRequestStatus(id: $id, status: $status, responseMessage: $responseMessage) {
            id
            status
            responseMessage
            respondedAt
          }
        }
      `, { id: requestId, status, responseMessage })

      const updated = (result.data as { updateBookingRequestStatus?: { id: string } })?.updateBookingRequestStatus
      if (updated) {
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
      }
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
    />
  )
}