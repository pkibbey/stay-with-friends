"use client"

import { useState } from 'react'
import { User } from '@/types'
import { ProfileAvatar } from './ProfileAvatar'
import { ProfileForm } from './ProfileForm'

interface ProfileClientProps {
  initialUser: User
  userEmail: string
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

export function ProfileClient({ initialUser, userEmail, sessionData }: ProfileClientProps) {
  const [user, setUser] = useState<User>(initialUser)

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser)
  }

  return (
    <div className="flex gap-6 sm:flex-row flex-col">
      {/* Profile Image Section */}
      <div className="flex flex-col items-center space-y-2 py-4 px-6">
        <ProfileAvatar user={user} onUserUpdate={handleUserUpdate} sessionData={sessionData} />
      </div>
      
      {/* Profile Form Section */}
      <div className="space-y-4 flex-1">
        {/* Profile Form */}
        <ProfileForm user={user} onUserUpdate={handleUserUpdate} sessionData={sessionData} />
      </div>
    </div>
  )
}