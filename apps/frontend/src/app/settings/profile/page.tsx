import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { apiGet } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLayout } from '@/components/PageLayout'
import type { User } from '@stay-with-friends/shared-types'
import { ProfileClient } from '@/components/ProfileClient'
import { SignInButton } from '@/components/SignInButton'

export default async function Profile() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    return (
      <PageLayout title="Profile" showHeader={false}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card>
            <CardHeader>
              <CardTitle>Please sign in</CardTitle>
            </CardHeader>
            <CardContent>
              <SignInButton />
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  // Fetch user data server-side via REST
  let userData = null
  try {
    userData = await apiGet<User>(`/users/email/${encodeURIComponent(session.user.email)}`)
  } catch {
    // fallback to session if not found
  }

  // Create user object for client components with stable values
  const user: User = userData ? {
    id: userData.id,
    email: userData.email || session.user.email || '',
    name: userData.name || session.user.name || '',
    image: userData.image || session.user.image || null,
    created_at: userData.created_at || new Date().toISOString(),
    email_verified: userData.email_verified || undefined,
  } : {
    id: session.user.id || '',
    email: session.user.email || '',
    name: session.user.name || '',
    image: session.user.image || null,
    created_at: new Date().toISOString(),
    email_verified: undefined,
  }

  return (
    <PageLayout title="Edit Profile" subtitle="Manage your account information">
      <div>
        <Card>
          <CardContent>
            <ProfileClient 
              initialUser={user} 
              userEmail={session.user.email}
              sessionData={{
                user: session.user,
                apiToken: (session as { apiToken?: string }).apiToken
              }}
            />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}