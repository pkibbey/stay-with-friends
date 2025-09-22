"use client"

import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { authenticatedGraphQLRequest } from '@/lib/graphql'
import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLayout } from '@/components/PageLayout'
import { User } from '@/types'

export default function Profile() {
  const { data: session, update } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<{ name: string }>({
    defaultValues: { name: '' }
  })

  const fetchUserData = useCallback(async (email: string) => {
    try {
      const result = await authenticatedGraphQLRequest(`
        query GetUser($email: String!) {
          user(email: $email) {
            id
            email
            name
          }
        }
      `, { email })
      type UserResponse = { user?: { id: string; email?: string; name?: string } }
      const userData = (result.data || {}) as UserResponse
      let userObj = userData.user

      // If backend doesn't have a user row yet, create one (authenticated)
      if (!userObj) {
        try {
          const createMutation = `
            mutation CreateUser($email: String!, $name: String) {
              createUser(email: $email, name: $name) {
                id
                email
                name
              }
            }
          `
          const createResult = await authenticatedGraphQLRequest<{ createUser?: { id: string; email?: string; name?: string } }>(createMutation, { email, name: undefined })
          const created = (createResult.data as { createUser?: { id: string; email?: string; name?: string } } | undefined)?.createUser
          if (created) {
            userObj = created
            console.log('Created backend user:', created)
          }
        } catch (err) {
          console.error('Failed to create backend user:', err)
        }
      }

      if (userObj) {
        setUser((userObj as unknown) as User)
        // Populate the form
        reset({ name: userObj.name || '' })
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }, [reset])

  useEffect(() => {
    if (session?.user) {
      console.log('session: ', session);
      // Fetch user data from backend
      fetchUserData(session.user.email!)
    }
  }, [session, fetchUserData])

  // Populate form when session becomes available
  useEffect(() => {
    if (session?.user?.name) {
      reset({ name: session.user.name })
    }
  }, [session?.user?.name, reset])

  const handleUpdateProfile = handleSubmit(async (values) => {
    if (!user) return
    setLoading(true)
    try {
      const mutation = `
        mutation UpdateUser($id: ID!, $name: String) {
          updateUser(id: $id, name: $name) {
            id
            name
          }
        }
      `

      const result = await authenticatedGraphQLRequest<{ updateUser?: { id: string; name?: string } }>(mutation, { id: user.id, name: values.name || undefined })

      const updated = (result.data as { updateUser?: { id: string; name?: string } } | undefined)?.updateUser
      if (updated) {
        setUser({ ...user, name: updated.name })
        reset({ name: updated.name || '' })
        
        // Update the session to reflect the new name
        await update({
          ...session,
          user: {
            ...session?.user,
            name: updated.name
          }
        })
        
        toast.success('Profile updated')
      } else {
        console.error('Failed to update profile:', result)
        toast.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  })

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
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Your name"
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{String(errors.name.message)}</p>}
              </div>
              <div className="flex gap-4">
                <Button type="submit" disabled={loading || isSubmitting}>
                  {loading || isSubmitting ? 'Updating...' : 'Update Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}