"use client"

import { useState } from 'react'
import { HostingEditForm } from '@/components/HostingEditForm'
import { HostingDisplay } from '@/components/HostingDisplay'
import { HostWithAvailabilities } from '@/types'

interface HostingManagerProps {
  initialHostings: HostWithAvailabilities[]
}

export function HostingManager({ initialHostings }: HostingManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)

  const handleRefresh = () => {
    // In a real app, this would refetch from the server
    // For now, we'll just update the local state when mutations occur
    window.location.reload()
  }

  const handleAddSuccess = () => {
    setShowAddForm(false)
    handleRefresh()
  }

  if (showAddForm) {
    return (
      <HostingEditForm
        onSuccess={handleAddSuccess}
        onCancel={() => setShowAddForm(false)}
      />
    )
  }

  return (
    <HostingDisplay
      hostings={initialHostings}
      onRefresh={handleRefresh}
      onAddNew={() => setShowAddForm(true)}
    />
  )
}