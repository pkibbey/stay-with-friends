"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle, UserPlus, X } from 'lucide-react'
import { Status, StatusIndicator, StatusLabel } from '@/components/ui/status'
import { apiGet, apiDelete } from '@/lib/api'
import { toast } from 'sonner'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from '@/lib/auth-client'
import { Invitation } from '@stay-with-friends/shared-types'

export default function SentInvitations() {
  const { data: session } = useSession()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const fetchInvitations = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inviterId = (session?.user as any)?.id
    if (!inviterId) return
    try {
      // REST endpoint: /invitations?inviter_id=xxx
      const data = await apiGet<Invitation[]>(`/invitations?inviter_id=${inviterId}`)
      setInvitations(data || [])
    } catch (error) {
      console.error('Error fetching invitations:', error)
    }
  }, [session])

  useEffect(() => {
    fetchInvitations()
  }, [fetchInvitations])

  const handleDeleteInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to delete this invitation? This action cannot be undone.')) {
      return
    }
    setDeletingIds(prev => new Set(prev).add(invitationId))
    try {
      // REST endpoint: DELETE /invitations/:id
      const res = await apiDelete(`/invitations/${invitationId}`)
      if (res) {
        fetchInvitations()
      } else {
        toast.error('Failed to delete invitation')
      }
    } catch (error) {
      console.error('Error deleting invitation:', error)
      toast.error('Failed to delete invitation')
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(invitationId)
        return newSet
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Sent Invitations
          {invitations.length > 0 && (
            <span className="ml-auto text-sm font-normal text-muted-foreground">({invitations.length})</span>
          )}
        </CardTitle>
        <CardDescription>Invitations you&apos;ve sent to friends</CardDescription>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No pending invitations</p>
            <p className="text-xs text-muted-foreground mt-1">Send an invitation above to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <Card key={invitation.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{invitation.invitee_email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{invitation.invitee_email}</p>
                      <p className="text-xs text-muted-foreground">Invited on {invitation.created_at ? new Date(invitation.created_at).toLocaleDateString() : 'Unknown date'}</p>
                      <Status status={invitation.status as 'accepted' | 'pending' | 'blocked' | 'cancelled' | 'connection-sent'} className="mt-1">
                        <StatusIndicator />
                        <StatusLabel>
                          {invitation.status === 'connection-sent' ? 'Connection Request Sent' :
                            invitation.status ? invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1) : 'Unknown'}
                        </StatusLabel>
                      </Status>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {invitation.status === 'accepted' && (
                      <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle size={14} />
                        User joined & connected
                      </div>
                    )}
                    {invitation.status === 'connection-sent' && (
                      <div className="flex items-center gap-1 text-blue-600 text-xs font-medium">
                        <UserPlus size={14} />
                        Connection request sent
                      </div>
                    )}
                    {(invitation.status === 'pending' || invitation.status === 'cancelled') && (
                      <Button
                        variant="outline"
                        onClick={() => invitation.id && handleDeleteInvitation(invitation.id)}
                        disabled={typeof invitation.id === 'undefined' || deletingIds.has(invitation.id)}
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    )}
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
