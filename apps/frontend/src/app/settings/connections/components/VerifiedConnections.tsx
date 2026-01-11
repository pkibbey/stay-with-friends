"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { CheckCircle, UserPlus, X } from 'lucide-react'
import { Status, StatusIndicator, StatusLabel } from '@/components/ui/status'
import { ConnectionWithUser } from '@/types'
import { apiGet, apiDelete } from '@/lib/api'
import { toast } from 'sonner'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from '@/lib/auth-client'

export default function VerifiedConnections() {
  const { data: session } = useSession()
  const [connections, setConnections] = useState<ConnectionWithUser[]>([])
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const fetchConnections = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session?.user as any)?.id
    if (!userId) return
    try {
      // REST endpoint: /connections?user_id=xxx
      const data = await apiGet<ConnectionWithUser[]>(`/connections?user_id=${userId}`)
      setConnections(data || [])
    } catch (error) {
      console.error('Error fetching connections:', error)
    }
  }, [session])

  useEffect(() => {
    fetchConnections()
  }, [fetchConnections])

  const handleDeleteConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to remove this connection? This action cannot be undone.')) {
      return
    }
    setDeletingIds(prev => new Set(prev).add(connectionId))
    try {
      // REST endpoint: DELETE /connections/:id
      const res = await apiDelete(`/connections/${connectionId}`)
      if (res) {
        fetchConnections()
      } else {
        toast.error('Failed to remove connection')
      }
    } catch (error) {
      console.error('Error deleting connection:', error)
      toast.error('Failed to remove connection')
    } finally {
      setDeletingIds(prev => {
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
          <CheckCircle className="h-5 w-5" />
          Verified Connections
          {connections.length > 0 && (
            <span className="ml-auto text-sm font-normal text-muted-foreground">({connections.length})</span>
          )}
        </CardTitle>
        <CardDescription>Your trusted network</CardDescription>
      </CardHeader>
      <CardContent>
        {connections.length === 0 ? (
          <div className="text-center py-8">
            <UserPlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No connections yet</p>
            <p className="text-xs text-muted-foreground mt-1">Send invitations to start building your network</p>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((connection) => (
              <Card key={connection.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={connection.connectedUser.image || ''} />
                      <AvatarFallback>
                        {(connection.connectedUser.name || connection.connectedUser.email)?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{connection.connectedUser.name || connection.connectedUser.email}</p>
                      <p className="text-xs text-muted-foreground">{connection.connectedUser.email}</p>
                      <Status status="accepted" className="mt-1">
                        <StatusIndicator />
                        <StatusLabel>Connected</StatusLabel>
                      </Status>
                    </div>
                  </div>
                  {connection.id && (
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteConnection(connection.id!)}
                      disabled={deletingIds.has(connection.id!)}
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
