"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Status, StatusIndicator, StatusLabel } from '@/components/ui/status'
import { AlertCircle, CheckCircle, X, Clock } from 'lucide-react'

import { ConnectionWithUser } from '@/types'
import { apiGet, apiPatch } from '@/lib/api'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export default function Requests() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<ConnectionWithUser[]>([])
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())

  const fetchRequests = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session?.user as any)?.id
    if (!userId) return
    try {
      // REST endpoint: /connection-requests?user_id=xxx
      const data = await apiGet<ConnectionWithUser[]>(`/connection-requests?user_id=${userId}`)
      setRequests(data || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }, [session])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleUpdateConnectionStatus = async (connectionId: string, status: string) => {
    setUpdatingIds(prev => new Set(prev).add(connectionId))
    try {
      // REST endpoint: PATCH /connections/:id { status }
      const res = await apiPatch(`/connections/${connectionId}`, { status })
      if (res.ok) {
        fetchRequests()
      }
    } catch (error) {
      console.error('Error updating connection:', error)
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(connectionId)
        return newSet
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Connection Requests
          {requests.length > 0 && (
            <span className="ml-auto text-sm font-normal text-muted-foreground">({requests.length})</span>
          )}
        </CardTitle>
        <CardDescription>Pending requests from others</CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.connectedUser.image || ''} />
                      <AvatarFallback>
                        {(request.connectedUser.name || request.connectedUser.email)?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{request.connectedUser.name || request.connectedUser.email}</p>
                      <p className="text-xs text-muted-foreground">{request.connectedUser.email}</p>
                      <Status status="pending" className="mt-1">
                        <StatusIndicator />
                        <StatusLabel>Pending request</StatusLabel>
                      </Status>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => request.id && handleUpdateConnectionStatus(request.id, 'accepted')}
                      disabled={typeof request.id === 'undefined' || updatingIds.has(request.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => request.id && handleUpdateConnectionStatus(request.id, 'blocked')}
                      disabled={typeof request.id === 'undefined' || updatingIds.has(request.id)}
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
