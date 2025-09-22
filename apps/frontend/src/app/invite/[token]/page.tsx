
"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { graphqlRequest } from '@/lib/graphql'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Home, CheckCircle } from "lucide-react"
import Link from "next/link"
import { InvitationWithUser } from "@/types"

export default function AcceptInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [invitation, setInvitation] = useState<InvitationWithUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [wasExistingUser, setWasExistingUser] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [userData, setUserData] = useState({
    name: '',
    image: ''
  })

  useEffect(() => {
    if (!token) return

    const fetchInvitation = async () => {
      try {
        const result = await graphqlRequest(`
          query GetInvitation($token: String!) {
            invitation(token: $token) {
              id
              inviterId
              inviteeEmail
              message
              token
              status
              expiresAt
              createdAt
              inviter {
                id
                name
                email
              }
            }
          }
        `, { token })

        type InvitationResponse = { invitation?: InvitationWithUser }
        const invitationData = ((result.data as unknown) as InvitationResponse).invitation
        if (invitationData) {
          setInvitation(invitationData)
          // Pre-fill name if available
          if (invitationData.inviteeEmail) {
            setUserData(prev => ({ ...prev, email: invitationData.inviteeEmail }))
          }
        } else {
          setError('Invalid invitation token')
        }
      } catch (err) {
        console.error('Error fetching invitation:', err)
        setError('Failed to load invitation')
      } finally {
        setLoading(false)
      }
    }

    fetchInvitation()
  }, [token])

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invitation) return

    setAccepting(true)
    try {
      const result = await graphqlRequest(`
        mutation AcceptInvitation($token: String!, $userData: AcceptInvitationInput!) {
          acceptInvitation(token: $token, userData: $userData) {
            id
            email
            name
            emailVerified
            createdAt
          }
        }
      `, { token, userData: { name: userData.name || undefined, image: userData.image || undefined } })

      type AcceptInvitationResponse = { acceptInvitation?: { id: string; createdAt?: string } }
      const acceptedUser = ((result.data as unknown) as AcceptInvitationResponse).acceptInvitation
      if (acceptedUser) {
        const userCreatedAt = new Date(acceptedUser.createdAt || '')
        const now = new Date()
        const wasExisting = (now.getTime() - userCreatedAt.getTime()) > 10000

        setWasExistingUser(wasExisting)
        setAccepted(true)
        setTimeout(() => router.push('/auth/signin'), 3000)
      } else {
        setError('Failed to accept invitation')
      }
    } catch (err) {
      console.error('Error accepting invitation:', err)
      setError('Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">
                Invitation Error
              </h2>
              <p className="text-red-700 dark:text-red-300 mb-6">
                {error}
              </p>
              <Link href="/">
                <Button variant="outline">
                  Go to Homepage
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
                {wasExistingUser ? 'Connection Request Sent!' : 'Welcome to Stay With Friends!'}
              </h2>
              <p className="text-green-700 dark:text-green-300 mb-6">
                {wasExistingUser 
                  ? `A connection request has been sent to you from ${invitation?.inviterUser?.name || invitation?.inviterUser?.email}. Check your connections page after signing in to accept it.`
                  : `Your account has been created and you're now connected with ${invitation?.inviterUser?.name || invitation?.inviterUser?.email}. You'll be redirected to sign in shortly.`
                }
              </p>
              <Link href="/auth/signin">
                <Button>
                  Sign In Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invitation) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter">
              <span className="text-yellow-500 dark:text-yellow-500">Join</span> <span className="text-gray-900 dark:text-white">Stay</span>
              <span className="text-blue-500 dark:text-blue-300">With</span>
              <span className="text-blue-600 dark:text-blue-400">Friends</span>
            </h1>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
              <p className="text-green-800 dark:text-green-200 text-sm">
                <strong>{invitation.inviterUser?.name || invitation.inviterUser?.email}</strong> has invited you to join Stay With Friends!
              </p>
            </div>

            {invitation.message && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                <p className="text-blue-800 dark:text-blue-200 text-sm italic">
                  &ldquo;{invitation.message}&rdquo;
                </p>
              </div>
            )}

            <Badge variant="outline" className="text-sm">
              Invitation for: {invitation.inviteeEmail}
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Accept Invitation
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect with {invitation.inviterUser?.name || invitation.inviterUser?.email} on Stay With Friends.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAcceptInvitation} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={invitation.inviteeEmail}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">This email was used for your invitation</p>
                </div>

                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={userData.name}
                    onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={accepting}
                >
                  {accepting ? 'Processing...' : 'Accept Invitation'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Link href="/">
              <Button variant="ghost">
                Back to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}