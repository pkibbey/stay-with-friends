"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, Clock, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { apiPost } from '@/lib/api'
import { Banner, BannerTitle, BannerClose } from '@/components/ui/banner'

export default function Invite() {
  const { data: session } = useSession()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastInvitationUrl, setLastInvitationUrl] = useState<string | null>(null)

  const handleCreateInvitation = async (email: string, message: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session?.user as any)?.id
    if (!userId || !email) return
    try {
      // REST endpoint: POST /invitations
  const invitation = await apiPost<{ id: string; status?: string; token?: string }>('/invitations', {
        inviter_id: userId,
        invitee_email: email,
        message: message || undefined,
      })
      if (invitation) {
        if (invitation.status === 'connection-sent') {
          toast.success('Connection request sent! The user is already registered, so a connection request has been sent instead.')
        } else if (invitation.token) {
          const invitationUrl = `http://localhost:3000/invite/${invitation.token}`
          setLastInvitationUrl(invitationUrl)
        } else {
          toast.success('Invitation sent!')
        }
      } else {
        toast.error('Failed to send invitation.')
      }
    } catch (error) {
      console.error('Error creating invitation:', error)
      toast.error('Failed to send invitation')
    }
  }

  const handleSubmit = async () => {
    if (!email) return
    setLoading(true)
    try {
      await handleCreateInvitation(email, message)
      setEmail('')
      setMessage('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Connections
          </CardTitle>
          <CardDescription>Send invitations to connections to others who may like to join the platform, or make requests to existing users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invitation-email">Connection&apos;s Email</Label>
              <Input
                id="invitation-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="friend@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="invitation-message">Personal Message (Optional)</Label>
              <textarea
                id="invitation-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hey! Join me on Stay With Friends so we can share our homes with each other..."
                className="w-full px-3 py-2 mt-1 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-background"
                rows={3}
              />
            </div>
            <Button onClick={handleSubmit} disabled={loading || !email} className="w-full sm:w-auto">
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
    </>
  )
}
