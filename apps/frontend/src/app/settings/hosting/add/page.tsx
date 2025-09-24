'use client'

import { useRouter } from 'next/navigation'
import { PageLayout } from '@/components/PageLayout'
import { HostingEditForm } from '@/components/HostingEditForm'

export default function AddHostingPage() {
  const router = useRouter()


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