'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PageLayout } from '@/components/PageLayout'
import { HostWithAvailabilities } from '@/types'
import { apiGet } from '@/lib/api'
import { HostingDisplay } from '@/components/HostingDisplay'
import { User } from '@stay-with-friends/shared-types'

async function getHostings(userId: string): Promise<HostWithAvailabilities[]> {
  try {
    // REST endpoint: /hosts?user_id=xxx
    const hosts = await apiGet<HostWithAvailabilities[]>(`/hosts?user_id=${userId}`)
    return hosts || []
  } catch (error) {
    console.error('Error fetching hostings:', error)
    return []
  }
}

export default function ManageHostingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [hostings, setHostings] = useState<HostWithAvailabilities[]>([])
  const [loading, setLoading] = useState(true)

  const userId = (session?.user as User | undefined)?.id

  useEffect(() => {
    if (userId) {
      getHostings(userId).then((data) => {
        setHostings(data)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [userId])

  if (loading) {
    return (
      <PageLayout title="Hosting" showHeader={false}>
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </PageLayout>
    )
  }

  const handleRefresh = () => {
    // Refetch hostings
    if (userId) {
      getHostings(userId).then(setHostings)
    }
  }

  return (
    <PageLayout
      title="Describe your space"
      subtitle="Add and manage your properties for friends to stay"
    >
      <HostingDisplay
        hostings={hostings}
        onRefresh={handleRefresh}
        onAddNew={() => router.push('/hosting/add')}
      />
    </PageLayout>
  )
}
