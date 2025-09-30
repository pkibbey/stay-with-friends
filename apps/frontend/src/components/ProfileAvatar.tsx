"use client"

import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { apiPatch } from '@/lib/api'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { User } from '@stay-with-friends/shared-types'
import Image from 'next/image'

interface ProfileAvatarProps {
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

export function ProfileAvatar({ user, onUserUpdate, sessionData }: ProfileAvatarProps) {
  const { update } = useSession()
  const [uploadingImage, setUploadingImage] = useState(false)

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

      // Upload avatar to backend (assume /api/upload-avatar returns { url })
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
        // Update user in backend with new image URL via REST
        await apiPatch(`/users/${user.id}`, { image: data.url })
        const updatedUser = { ...user, image: data.url }
        onUserUpdate(updatedUser)
        // Update the session to reflect the new image
        await update({
          user: {
            ...sessionData.user,
            image: data.url
          }
        })
        toast.success('Profile picture updated')
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

  return (
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
              {sessionData?.user?.name?.charAt(0)?.toUpperCase() || '?'}
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
  )
}