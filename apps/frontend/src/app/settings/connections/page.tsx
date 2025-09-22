"use client"

import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { authenticatedGraphQLRequest } from '@/lib/graphql'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLayout } from '@/components/PageLayout'
import { ConnectionWithUser, Invitation } from '@/types'
import { Status, StatusIndicator, StatusLabel } from '@/components/ui/status'
import { Banner, BannerTitle, BannerClose } from '@/components/ui/banner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CheckCircle, UserPlus, Clock, X, AlertCircle } from 'lucide-react'

export default function Connections() {
  const { data: session } = useSession()
  const [connections, setConnections] = useState<ConnectionWithUser[]>([])
  const [requests, setRequests] = useState<ConnectionWithUser[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [newInvitationEmail, setNewInvitationEmail] = useState('')
  const [newInvitationMessage, setNewInvitationMessage] = useState('')
  const [lastInvitationUrl, setLastInvitationUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchConnections = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session?.user as any)?.id
    if (!userId) return
    try {
      const result = await authenticatedGraphQLRequest(`
        query GetConnections($userId: ID!) {
          connections(userId: $userId) {
            id
            connectedUser {
              id
              email
              name
              image
            }
            status
          }
        }
      `, { userId })

      type ConnectionsResponse = { connections?: ConnectionWithUser[] }
      const authenticatedConnections = ((result.data as unknown) as ConnectionsResponse).connections

      setConnections(authenticatedConnections || [])
    } catch (error) {
      console.error('Error fetching connections:', error)
    }
  }, [session])

  const fetchRequests = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session?.user as any)?.id
    if (!userId) return
    try {
      const result = await authenticatedGraphQLRequest(`
        query GetConnectionRequests($userId: ID!) {
          connectionRequests(userId: $userId) {
            id
            connectedUser {
              id
              email
              name
              image
            }
            status
          }
        }
      `, { userId })

      type RequestsResponse = { connectionRequests?: ConnectionWithUser[] }
      const requestsData = ((result.data as unknown) as RequestsResponse).connectionRequests
      setRequests(requestsData || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }, [session])

  const fetchInvitations = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inviterId = (session?.user as any)?.id
    if (!inviterId) return
    try {
      const result = await authenticatedGraphQLRequest(`
        query GetInvitations($inviterId: ID!) {
          invitations(inviterId: $inviterId) {
            id
            inviteeEmail
            message
            status
            createdAt
          }
        }
      `, { inviterId })

      type InvitationsResponse = { invitations?: Invitation[] }
      const invitationsData = ((result.data as unknown) as InvitationsResponse).invitations
      setInvitations(invitationsData || [])
    } catch (error) {
      console.error('Error fetching invitations:', error)
    }
  }, [session])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((session?.user as any)?.id) {
      fetchConnections()
      fetchRequests()
      fetchInvitations()
    }
  }, [session, fetchConnections, fetchRequests, fetchInvitations])

  const handleUpdateConnectionStatus = async (connectionId: string, status: string) => {
    try {
      const result = await authenticatedGraphQLRequest(`
        mutation UpdateConnectionStatus($connectionId: ID!, $status: String!) {
          updateConnectionStatus(connectionId: $connectionId, status: $status) {
            id
            status
          }
        }
      `, { connectionId, status })

      if ((result.data as { updateConnectionStatus?: { id: string } })?.updateConnectionStatus) {
        fetchConnections()
        fetchRequests()
      }
    } catch (error) {
      console.error('Error updating connection:', error)
    }
  }

  const handleDeleteConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to remove this connection? This action cannot be undone.')) {
      return
    }
    
    try {
      const result = await authenticatedGraphQLRequest(`
        mutation DeleteConnection($connectionId: ID!) {
          deleteConnection(connectionId: $connectionId)
        }
      `, { connectionId })

      if ((result.data as { deleteConnection?: boolean })?.deleteConnection) {
        fetchConnections()
      } else {
        toast.error('Failed to remove connection')
      }
    } catch (error) {
      console.error('Error deleting connection:', error)
      toast.error('Failed to remove connection')
    }
  }

  const handleDeleteInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to delete this invitation? This action cannot be undone.')) {
      return
    }
    
    try {
      const result = await authenticatedGraphQLRequest(`
        mutation DeleteInvitation($invitationId: ID!) {
          deleteInvitation(invitationId: $invitationId)
        }
      `, { invitationId })

      if ((result.data as { deleteInvitation?: boolean })?.deleteInvitation) {
        fetchInvitations()
      } else {
        toast.error('Failed to delete invitation')
      }
    } catch (error) {
      console.error('Error deleting invitation:', error)
      toast.error('Failed to delete invitation')
    }
  }

  const handleCreateInvitation = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session?.user as any)?.id
    const email = session?.user?.email || undefined
    console.log('email: ', email);
    if (!userId || !newInvitationEmail) return
    setLoading(true)
    try {
      const result = await authenticatedGraphQLRequest(`
        mutation CreateInvitation($inviterId: ID!, $inviteeEmail: String!, $message: String) {
          createInvitation(inviterId: $inviterId, inviteeEmail: $inviteeEmail, message: $message) {
            id
            inviteeEmail
            message
            status
            createdAt
            token
          }
        }
      `, { inviterId: userId, inviteeEmail: newInvitationEmail, message: newInvitationMessage || undefined })

      type CreateInvitationResponse = { createInvitation?: { id: string; status?: string; token?: string } }
      const invitation = ((result.data as unknown) as CreateInvitationResponse).createInvitation
      if (invitation) {
        if (invitation.status === 'connection-sent') {
            toast.success('Connection request sent! The user is already registered, so a connection request has been sent instead.')
          setNewInvitationEmail('')
          setNewInvitationMessage('')
          fetchConnections()
          fetchRequests()
        } else {
          const invitationUrl = `http://localhost:3000/invite/${invitation.token}`
          setLastInvitationUrl(invitationUrl)
          setNewInvitationEmail('')
          setNewInvitationMessage('')
          fetchInvitations()
        }
      } else {
  console.error('GraphQL error:', ((result as unknown) as { errors?: { message: string }[] }).errors)
  toast.error('Failed to send invitation. ' + (((result as unknown) as { errors?: { message: string }[] }).errors?.[0]?.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating invitation:', error)
      toast.error('Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <PageLayout title="Connections" showHeader={false}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card>
            <CardHeader>
              <CardTitle>Please sign in</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = '/auth/signin'}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Connections" subtitle="Manage your trusted network">
      <div className="grid gap-8">
        {/* Send Invitation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite Friends
            </CardTitle>
            <CardDescription>Send invitations to friends to join the platform, or connection requests to existing users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="invitation-email">Friend&apos;s Email</Label>
                <Input
                  id="invitation-email"
                  type="email"
                  value={newInvitationEmail}
                  onChange={(e) => setNewInvitationEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="invitation-message">Personal Message (Optional)</Label>
                <textarea
                  id="invitation-message"
                  value={newInvitationMessage}
                  onChange={(e) => setNewInvitationMessage(e.target.value)}
                  placeholder="Hey! Join me on Stay With Friends so we can share our homes with each other..."
                  className="w-full px-3 py-2 mt-1 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-background"
                  rows={3}
                />
              </div>
              <Button onClick={handleCreateInvitation} disabled={loading || !newInvitationEmail} className="w-full sm:w-auto">
                {loading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {lastInvitationUrl && (
          <Banner 
            className="bg-green-100 border-green-200 text-green-800 dark:bg-green-900/20 dark:text-green-200" 
            inset
            onClose={() => setLastInvitationUrl(null)}
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <BannerTitle className="text-green-800 dark:text-green-200">
                <strong>Invitation link created!</strong> Share this link with your friend:
              </BannerTitle>
            </div>
            <BannerClose />
          </Banner>
        )}

        {lastInvitationUrl && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
            <CardContent className="pt-4">
              <div className="text-sm">
                <div className="p-3 bg-white dark:bg-gray-800 rounded border font-mono text-xs break-all">
                  {lastInvitationUrl}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connection Requests and Verified Connections */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Connection Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Connection Requests
                {requests.length > 0 && (
                  <span className="ml-auto text-sm font-normal text-muted-foreground">
                    ({requests.length})
                  </span>
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
                            onClick={() => handleUpdateConnectionStatus(request.id, 'accepted')}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleUpdateConnectionStatus(request.id, 'blocked')}
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

          {/* Verified Connections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Verified Connections
                {connections.length > 0 && (
                  <span className="ml-auto text-sm font-normal text-muted-foreground">
                    ({connections.length})
                  </span>
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
                        <Button
                          variant="outline"
                          onClick={() => handleDeleteConnection(connection.id)}
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sent Invitations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Sent Invitations
              {invitations.length > 0 && (
                <span className="ml-auto text-sm font-normal text-muted-foreground">
                  ({invitations.length})
                </span>
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
                          <AvatarFallback>
                            {invitation.inviteeEmail.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{invitation.inviteeEmail}</p>
                          <p className="text-xs text-muted-foreground">
                            Invited on {invitation.createdAt ? new Date(invitation.createdAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                          <Status 
                            status={invitation.status as 'accepted' | 'pending' | 'blocked' | 'cancelled' | 'connection-sent'} 
                            className="mt-1"
                          >
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
                            onClick={() => handleDeleteInvitation(invitation.id)}
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
      </div>
    </PageLayout>
  )
}