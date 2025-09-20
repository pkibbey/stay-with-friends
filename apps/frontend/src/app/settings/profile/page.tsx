'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLayout } from '@/components/PageLayout'
import { User } from '@/types'

export default function Profile() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [image, setImage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session?.user) {
      // Fetch user data from backend
      fetchUserData(session.user.email!)
    }
  }, [session])

  const fetchUserData = async (email: string) => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetUser($email: String!) {
              user(email: $email) {
                id
                email
                name
                image
              }
            }
          `,
          variables: { email },
        }),
      })
      const data = await response.json()
      const userData = data.data?.user
      if (userData) {
        setUser(userData)
        setName(userData.name || '')
        setImage(userData.image || '')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) return
    setLoading(true)
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation UpdateUser($id: ID!, $name: String, $image: String) {
              updateUser(id: $id, name: $name, image: $image) {
                id
                name
                image
              }
            }
          `,
          variables: { id: user.id, name: name || undefined, image: image || undefined },
        }),
      })
      const data = await response.json()
      if (data.data?.updateUser) {
        setUser({ ...user, name: data.data.updateUser.name, image: data.data.updateUser.image })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return (
      <PageLayout title="Profile" showHeader={false}>
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
    <PageLayout title="Profile" subtitle="Manage your account information">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={session.user?.email || ''} disabled />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <Label htmlFor="image">Profile Image URL</Label>
              <Input
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={handleUpdateProfile} disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}