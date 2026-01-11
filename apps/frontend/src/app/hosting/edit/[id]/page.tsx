'use client'

import { useSession } from '@/lib/auth-client'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PageLayout } from '@/components/PageLayout'
import { HostingEditForm } from '@/components/HostingEditForm'
import { HostWithAvailabilities } from '@/types'
import { apiGet } from '@/lib/api'
import { User } from '@stay-with-friends/shared-types'

async function getHosting(id: string): Promise<HostWithAvailabilities | null> {
  try {
    // REST endpoint: /hosts/:id
    return await apiGet<HostWithAvailabilities>(`/hosts/${id}`)
  } catch (error) {
    console.error('Error fetching hosting:', error)
    return null
  }
}

export default function EditHostingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [hosting, setHosting] = useState<HostWithAvailabilities | null>(null)
  const [loading, setLoading] = useState(true)

  const userId = (session?.user as User | undefined)?.id
  const hostingId = params.id as string

  useEffect(() => {
    if (hostingId) {
      getHosting(hostingId).then((data) => {
        setHosting(data)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [hostingId])

  if (loading) {
    return (
      <PageLayout title="Hosting" showHeader={false}>
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </PageLayout>
    )
  }

  if (!hosting) {
    return (
      <PageLayout title="Hosting" showHeader={false}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Hosting not found</h1>
          <p className="text-gray-600">The hosting property you&apos;re trying to edit doesn&apos;t exist.</p>
        </div>
      </PageLayout>
    )
  }

  // Check if user owns this hosting
  if (hosting.user_id !== userId) {
    return (
      <PageLayout title="Hosting" showHeader={false}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access denied</h1>
          <p className="text-gray-600">You can only edit your own hosting properties.</p>
        </div>
      </PageLayout>
    )
  }

  const handleEditSuccess = () => {
    // Redirect back to the main hosting page
    router.push('/hosting')
  }

  return (
    <PageLayout
      title="Edit Hosting"
      subtitle={`Edit ${hosting.name}`}
    >
      <HostingEditForm
        initialData={{
          id: hosting.id || '',
          name: hosting.name || '',
          description: hosting.description,
          location: hosting.location,
          address: hosting.address,
          city: hosting.city,
          state: hosting.state,
          zipCode: hosting.zip_code,
          country: hosting.country,
          latitude: hosting.latitude,
          longitude: hosting.longitude,
          maxGuests: hosting.max_guests || 2,
          bedrooms: hosting.bedrooms || 1,
          bathrooms: hosting.bathrooms || 1,
          checkInTime: hosting.check_in_time,
          checkOutTime: hosting.check_out_time,
          amenities: hosting.amenities,
          houseRules: hosting.house_rules,
          photos: hosting.photos
        }}
        onSuccess={handleEditSuccess}
        onCancel={() => router.push('/hosting')}
      />
    </PageLayout>
  )
}