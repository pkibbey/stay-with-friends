"use client"

import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { authenticatedGraphQLRequest } from '@/lib/graphql'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from '@/types'

interface ProfileFormProps {
  user: User
  onUserUpdate: (updatedUser: User) => void
  sessionData: {
    user?: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
    apiToken?: string
  }
}

export function ProfileForm({ user, onUserUpdate, sessionData }: ProfileFormProps) {
  const { update } = useSession()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(user.name || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

      const result = await authenticatedGraphQLRequest<{ updateUser?: { id: string; name?: string; image?: string } }>(mutation, { id: user.id, name: name || undefined, image: user.image || undefined })

      const updated = (result.data as { updateUser?: { id: string; name?: string; image?: string } } | undefined)?.updateUser
      if (updated) {
        const updatedUser = { ...user, name: updated.name, image: updated.image }
        onUserUpdate(updatedUser)
        setName(updated.name || '')
        
        // Update the session to reflect the new name and image
        await update({
          user: {
            ...sessionData.user,
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
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          suppressHydrationWarning
        />
      </div>
      {/* Email Field (Static) */}
      <div>
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email"
          value={user.email}
          disabled
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </Button>
      </div>
    </form>
  )
}