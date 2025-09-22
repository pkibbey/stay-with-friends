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
import Image from 'next/image'

export default function Profile() {
  const { data: session, update } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

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
            image
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
                image
              }
            }
          `
          const createResult = await authenticatedGraphQLRequest<{ createUser?: { id: string; email?: string; name?: string; image?: string } }>(createMutation, { email, name: undefined })
          const created = (createResult.data as { createUser?: { id: string; email?: string; name?: string; image?: string } } | undefined)?.createUser
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
        mutation UpdateUser($id: ID!, $name: String, $image: String) {
          updateUser(id: $id, name: $name, image: $image) {
            id
            name
            image
          }
        }
      `

      const result = await authenticatedGraphQLRequest<{ updateUser?: { id: string; name?: string; image?: string } }>(mutation, { id: user.id, name: values.name || undefined, image: user.image || undefined })

      const updated = (result.data as { updateUser?: { id: string; name?: string; image?: string } } | undefined)?.updateUser
      if (updated) {
        setUser({ ...user, name: updated.name, image: updated.image })
        reset({ name: updated.name || '' })
        
        // Update the session to reflect the new name and image
        await update({
          ...session,
          user: {
            ...session?.user,
            name: updated.name,
            image: updated.image
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

  // Handle avatar upload
  const handleAvatarUpload = async (file: File) => {
    if (!user) return

    setUploadingImage(true)
    try {
      // Client-side validation
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file')
        return
      }

      const maxBytes = 5 * 1024 * 1024 // 5MB
      if (file.size > maxBytes) {
        toast.error('Image is too large. Maximum size is 5 MB.')
        return
      }

      const formData = new FormData()
      formData.append('avatar', file)

      // Get the session with apiToken for authentication
      const sessionData = session as { apiToken?: string }
      
      const headers: Record<string, string> = {}
      if (sessionData?.apiToken) {
        headers['Authorization'] = `Bearer ${sessionData.apiToken}`
      }

      const response = await fetch('http://localhost:4000/api/upload-avatar', {
        method: 'POST',
        body: formData,
        headers,
      })

      const data = await response.json()
      if (data?.url) {
        // Update user in backend with new image URL
        const mutation = `
          mutation UpdateUser($id: ID!, $name: String, $image: String) {
            updateUser(id: $id, name: $name, image: $image) {
              id
              name
              image
            }
          }
        `

        const result = await authenticatedGraphQLRequest<{ updateUser?: { id: string; name?: string; image?: string } }>(
          mutation, 
          { id: user.id, name: user.name, image: data.url }
        )

        const updated = result.data?.updateUser
        if (updated) {
          setUser({ ...user, image: updated.image })
          
          // Update the session to reflect the new image
          await update({
            ...session,
            user: {
              ...session?.user,
              image: updated.image
            }
          })
          
          toast.success('Profile picture updated')
        }
      } else {
        console.error('Upload failed', data)
        toast.error('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
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
            {/* Profile Image Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {user?.image ? (
                  <Image
                    unoptimized
                    priority
                    src={user.image}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                    <span className="text-gray-500 text-lg font-semibold">
                      {session?.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleAvatarUpload(file)
                    }
                  }}
                  className="hidden"
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingImage}
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    {uploadingImage ? 'Uploading...' : 'Change Photo'}
                  </Button>
                </label>
              </div>
            </div>
            
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