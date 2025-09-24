'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PageLayout } from '@/components/PageLayout'
import { HostingEditForm } from '@/components/HostingEditForm'
import { User } from '@/types'

export default function AddHostingPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const userId = (session?.user as User | undefined)?.id

  if (!userId) {
    return (
      <PageLayout title="Hosting" showHeader={false}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to manage your hosting</h1>
          <p className="text-gray-600">You need to be signed in to access hosting management features.</p>
        </div>
      </PageLayout>
    )
  }

  const handleAddSuccess = () => {
    // Redirect back to the main hosting page
    router.push('/settings/hosting')
  }

  return (
    <PageLayout
      title="Add New Hosting"
      subtitle="Create a new hosting opportunity for your friends"
    >
      <HostingEditForm
        onSuccess={handleAddSuccess}
        onCancel={() => router.push('/settings/hosting')}
      />
    </PageLayout>
  )
}