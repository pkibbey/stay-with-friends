'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLayout } from '@/components/PageLayout'
import { ConnectionWithUser, Invitation } from '@/types'


export default function Connections() {
  const { data: session, status } = useSession()
  const [connections, setConnections] = useState<ConnectionWithUser[]>([])
  const [requests, setRequests] = useState<ConnectionWithUser[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [newInvitationEmail, setNewInvitationEmail] = useState('')
  const [newInvitationName, setNewInvitationName] = useState('')
  const [newInvitationMessage, setNewInvitationMessage] = useState('')
  const [lastInvitationUrl, setLastInvitationUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchConnections = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session?.user as any)?.id
    if (!userId) return
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
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
          `,
          variables: { userId },
        }),
      })
      const data = await response.json()
      setConnections(data.data?.connections || [])
    } catch (error) {
      console.error('Error fetching connections:', error)
    }
  }, [session])

  const fetchRequests = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session?.user as any)?.id
    if (!userId) return
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
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
          `,
          variables: { userId },
        }),
      })
      const data = await response.json()
      setRequests(data.data?.connectionRequests || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }, [session])

  const fetchInvitations = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inviterId = (session?.user as any)?.id
    if (!inviterId) return
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetInvitations($inviterId: ID!) {
              invitations(inviterId: $inviterId) {
                id
                inviteeEmail
                message
                status
                createdAt
              }
            }
          `,
          variables: { inviterId },
        }),
      })
      const data = await response.json()
      setInvitations(data.data?.invitations || [])
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
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation UpdateConnectionStatus($connectionId: ID!, $status: String!) {
              updateConnectionStatus(connectionId: $connectionId, status: $status) {
                id
                status
              }
            }
          `,
          variables: { connectionId, status },
        }),
      })
      const data = await response.json()
      if (data.data?.updateConnectionStatus) {
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
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation DeleteConnection($connectionId: ID!) {
              deleteConnection(connectionId: $connectionId)
            }
          `,
          variables: { connectionId },
        }),
      })
      const data = await response.json()
      if (data.data?.deleteConnection) {
        fetchConnections()
      } else {
        alert('Failed to remove connection')
      }
    } catch (error) {
      console.error('Error deleting connection:', error)
      alert('Failed to remove connection')
    }
  }

  const handleDeleteInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to delete this invitation? This action cannot be undone.')) {
      return
    }
    
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation DeleteInvitation($invitationId: ID!) {
              deleteInvitation(invitationId: $invitationId)
            }
          `,
          variables: { invitationId },
        }),
      })
      const data = await response.json()
      if (data.data?.deleteInvitation) {
        fetchInvitations()
      } else {
        alert('Failed to delete invitation')
      }
    } catch (error) {
      console.error('Error deleting invitation:', error)
      alert('Failed to delete invitation')
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
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
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
          `,
          variables: { 
            inviterId: userId, 
            inviteeEmail: newInvitationEmail,
            message: newInvitationMessage || undefined
          },
        }),
      })
      const data = await response.json()
      if (data.data?.createInvitation) {
        const invitation = data.data.createInvitation
        
        if (invitation.status === 'connection-sent') {
          // Connection request was sent to existing user
          alert('Connection request sent! The user is already registered, so a connection request has been sent instead.')
          setNewInvitationEmail('')
          setNewInvitationName('')
          setNewInvitationMessage('')
          // Refresh connections data since we may have sent a connection request
          fetchConnections()
          fetchRequests()
        } else {
          // Normal invitation created
          const invitationUrl = `http://localhost:3000/invite/${invitation.token}`
          setLastInvitationUrl(invitationUrl)
          setNewInvitationEmail('')
          setNewInvitationName('')
          setNewInvitationMessage('')
          fetchInvitations()
        }
      } else {
        console.error('GraphQL error:', data.errors)
        alert('Failed to send invitation. ' + (data.errors?.[0]?.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating invitation:', error)
      alert('Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
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
      <div>
        <div className="grid gap-6">
          {/* Send Invitation */}
          <Card>
            <CardHeader>
              <CardTitle>Invite Friends</CardTitle>
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
                  />
                </div>
                <div>
                  <Label htmlFor="invitation-message">Personal Message (Optional)</Label>
                  <textarea
                    id="invitation-message"
                    value={newInvitationMessage}
                    onChange={(e) => setNewInvitationMessage(e.target.value)}
                    placeholder="Hey! Join me on Stay With Friends so we can share our homes with each other..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <Button onClick={handleCreateInvitation} disabled={loading || !newInvitationEmail}>
                  {loading ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {lastInvitationUrl && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
              <CardContent className="pt-4">
                <div className="text-sm text-green-800 dark:text-green-200">
                  <strong>Invitation link created!</strong> Share this link with your friend:
                  <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border font-mono text-xs break-all">
                    {lastInvitationUrl}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Connection Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Connection Requests</CardTitle>
              <CardDescription>Pending requests from others</CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <p className="text-gray-500">No pending requests</p>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{request.connectedUser.name || request.connectedUser.email}</p>
                        <p className="text-sm text-gray-500">{request.connectedUser.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdateConnectionStatus(request.id, 'accepted')}
                          size="sm"
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleUpdateConnectionStatus(request.id, 'blocked')}
                          size="sm"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verified Connections */}
          <Card>
            <CardHeader>
              <CardTitle>Verified Connections</CardTitle>
              <CardDescription>Your trusted network</CardDescription>
            </CardHeader>
            <CardContent>
              {connections.length === 0 ? (
                <p className="text-gray-500">No connections yet</p>
              ) : (
                <div className="space-y-4">
                  {connections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{connection.connectedUser.name || connection.connectedUser.email}</p>
                        <p className="text-sm text-gray-500">{connection.connectedUser.email}</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteConnection(connection.id)}
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sent Invitations */}
          <Card>
            <CardHeader>
              <CardTitle>Sent Invitations</CardTitle>
              <CardDescription>Invitations you&apos;ve sent to friends</CardDescription>
            </CardHeader>
            <CardContent>
              {invitations.length === 0 ? (
                <p className="text-gray-500">No pending invitations</p>
              ) : (
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-sm text-gray-500">{invitation.inviteeEmail}</p>
                        <p className={`text-xs font-medium ${
                          invitation.status === 'pending' ? 'text-yellow-600' :
                          invitation.status === 'accepted' ? 'text-green-600' :
                          invitation.status === 'connection-sent' ? 'text-blue-600' :
                          invitation.status === 'cancelled' ? 'text-gray-500' :
                          'text-gray-400'
                        }`}>
                          Status: {
                            invitation.status === 'connection-sent' ? 'Connection Request Sent' :
                            invitation.status ? invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1) : 'Unknown'
                          }
                        </p>
                      </div>
                      {(invitation.status === 'pending' || invitation.status === 'cancelled') && (
                        <Button
                          variant="outline"
                          onClick={() => handleDeleteInvitation(invitation.id)}
                          size="sm"
                        >
                          Delete
                        </Button>
                      )}
                      {invitation.status === 'accepted' && (
                        <span className="text-xs text-green-600 font-medium">
                          ✓ User joined & connected
                        </span>
                      )}
                      {invitation.status === 'connection-sent' && (
                        <span className="text-xs text-blue-600 font-medium">
                          ✓ Connection request sent to existing user
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}