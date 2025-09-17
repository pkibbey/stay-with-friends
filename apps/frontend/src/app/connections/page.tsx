'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Connection {
  id: string
  connectedUser: {
    id: string
    email: string
    name?: string
    image?: string
  }
  status: string
}

export default function Connections() {
  const { data: session, status } = useSession()
  const [connections, setConnections] = useState<Connection[]>([])
  const [requests, setRequests] = useState<Connection[]>([])
  const [newConnectionEmail, setNewConnectionEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchConnections()
      fetchRequests()
    }
  }, [session])

  const fetchConnections = async () => {
    if (!session?.user?.id) return
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
          variables: { userId: session.user.id },
        }),
      })
      const data = await response.json()
      setConnections(data.data?.connections || [])
    } catch (error) {
      console.error('Error fetching connections:', error)
    }
  }

  const fetchRequests = async () => {
    if (!session?.user?.id) return
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
          variables: { userId: session.user.id },
        }),
      })
      const data = await response.json()
      setRequests(data.data?.connectionRequests || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }

  const handleAddConnection = async () => {
    if (!session?.user?.id || !newConnectionEmail) return
    setLoading(true)
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation CreateConnection($userId: ID!, $connectedUserEmail: String!) {
              createConnection(userId: $userId, connectedUserEmail: $connectedUserEmail) {
                id
              }
            }
          `,
          variables: { userId: session.user.id, connectedUserEmail: newConnectionEmail },
        }),
      })
      const data = await response.json()
      if (data.data?.createConnection) {
        alert('Connection request sent!')
        setNewConnectionEmail('')
        fetchRequests()
      }
    } catch (error) {
      console.error('Error creating connection:', error)
      alert('Failed to send connection request')
    } finally {
      setLoading(false)
    }
  }

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

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid gap-6">
          {/* Add Connection */}
          <Card>
            <CardHeader>
              <CardTitle>Add Connection</CardTitle>
              <CardDescription>Send a connection request to another user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newConnectionEmail}
                    onChange={(e) => setNewConnectionEmail(e.target.value)}
                    placeholder="friend@example.com"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddConnection} disabled={loading}>
                    {loading ? 'Sending...' : 'Send Request'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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
                        onClick={() => handleUpdateConnectionStatus(connection.id, 'blocked')}
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
        </div>
      </div>
    </div>
  )
}