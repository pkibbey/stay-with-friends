"use client"

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AvailabilityManager } from '@/components/AvailabilityManager'
import { FileUpload } from '@/components/ui/file-upload'
import { PageLayout } from '@/components/PageLayout'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, MapPin, Users, Bed, Bath, Clock, Calendar, MessageSquare, Trash2 } from 'lucide-react'

interface Availability {
  id: string
  hostId: string
  startDate: string
  endDate: string
  status: string
  notes?: string
}

interface HostData {
  id: string
  name: string
  title: string
  location: string
  description: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  latitude?: number
  longitude?: number
  amenities: string[]
  houseRules?: string
  checkInTime?: string
  checkOutTime?: string
  maxGuests: number
  bedrooms: number
  bathrooms: number
  photos: string[]
  availabilities: Availability[]
}

export default function ManageHostingPage() {
  const { data: session } = useSession()
  const [showAddForm, setShowAddForm] = useState(false)
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0)
  const [hostings, setHostings] = useState<HostData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingHostId, setEditingHostId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<HostData>>({})
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchHostings = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetHosts {
              hosts {
                id
                name
                title
                location
                description
                address
                city
                state
                zipCode
                country
                latitude
                longitude
                amenities
                houseRules
                checkInTime
                checkOutTime
                maxGuests
                bedrooms
                bathrooms
                photos
                userId
                availabilities {
                  id
                  startDate
                  endDate
                  status
                  notes
                }
              }
            }
          `,
        }),
      })
      const data = await response.json()
      if (data.data?.hosts) {
        // Filter to only hosts owned by the current signed-in user
        // session?.user.id may be a string or number, so compare as strings
        const userId = (session?.user as { id?: string | number } | undefined)?.id
        if (userId) {
          const filtered = data.data.hosts.filter((h: { userId?: string | number }) => String(h.userId) === String(userId))
          setHostings(filtered)
        } else {
          // If no session user id available, fall back to empty list
          setHostings([])
        }
      }
    } catch (error) {
      console.error('Error fetching hostings:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user])

  useEffect(() => {
    const fetchPendingRequestsCount = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userId = (session?.user as any)?.id
      if (!userId) return

      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetPendingRequestsCount($userId: ID!) {
                pendingBookingRequestsCount(userId: $userId)
              }
            `,
            variables: { userId },
          }),
        })
        const data = await response.json()
        setPendingRequestsCount(data.data?.pendingBookingRequestsCount || 0)
      } catch (error) {
        console.error('Error fetching pending requests count:', error)
      }
    }

    if (session?.user) {
      fetchPendingRequestsCount()
      fetchHostings()
    }
  }, [fetchHostings, session?.user])

  const [newHosting, setNewHosting] = useState({
    title: '',
    description: '',
    location: '',
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    checkInTime: '3:00 PM',
    checkOutTime: '11:00 AM',
    amenities: '',
    houseRules: ''
  })

  const handleAddHosting = () => {
    const hosting: HostData = {
      id: Date.now().toString(),
      name: newHosting.title,
      ...newHosting,
      amenities: newHosting.amenities.split(',').map(a => a.trim()).filter(a => a),
      photos: [],
      availabilities: []
    }
    setHostings([...hostings, hosting])
    setNewHosting({
      title: '',
      description: '',
      location: '',
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      checkInTime: '3:00 PM',
      checkOutTime: '11:00 AM',
      amenities: '',
      houseRules: ''
    })
    setShowAddForm(false)
  }

  const handleAddAvailability = (hostId: string) => async (startDate: string, endDate: string, notes?: string) => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation CreateAvailability($hostId: ID!, $startDate: String!, $endDate: String!, $notes: String) {
              createAvailability(hostId: $hostId, startDate: $startDate, endDate: $endDate, notes: $notes) {
                id
                hostId
                startDate
                endDate
                status
                notes
              }
            }
          `,
          variables: { hostId, startDate, endDate, notes },
        }),
      })
      const data = await response.json()
      if (data.data?.createAvailability) {
        // Refresh the hostings data to include the new availability
        await fetchHostings()
      }
    } catch (error) {
      console.error('Error adding availability:', error)
    }
  }

  const handleRemoveAvailability = async (id: string) => {
    try {
      // You'll need to implement a deleteAvailability mutation in your backend
      console.log('Remove availability:', id)
      // For now, refresh the data
      await fetchHostings()
    } catch (error) {
      console.error('Error removing availability:', error)
    }
  }

  const getHostAvailabilities = (hostId: string) => {
    const host = hostings.find(h => h.id === hostId)
    return host?.availabilities || []
  }

  const startEdit = (hosting: HostData) => {
    setEditingHostId(hosting.id)
    setEditForm({
      ...hosting,
      amenities: hosting.amenities // Keep as array for editing
    })
  }

  const cancelEdit = () => {
    setEditingHostId(null)
    setEditForm({})
  }

  const saveEdit = async () => {
    if (!editForm.id) return

    setSaving(true)
    try {
      // Build the input object with only defined values
      const input: Partial<Omit<HostData, 'id' | 'title' | 'availabilities'>> = {}
      
      if (editForm.name !== undefined) input.name = editForm.name || editForm.title
      if (editForm.location !== undefined) input.location = editForm.location
      if (editForm.description !== undefined) input.description = editForm.description
      if (editForm.address !== undefined) input.address = editForm.address
      if (editForm.city !== undefined) input.city = editForm.city
      if (editForm.state !== undefined) input.state = editForm.state
      if (editForm.zipCode !== undefined) input.zipCode = editForm.zipCode
      if (editForm.country !== undefined) input.country = editForm.country
      if (editForm.latitude !== undefined && editForm.latitude !== null) input.latitude = editForm.latitude
      if (editForm.longitude !== undefined && editForm.longitude !== null) input.longitude = editForm.longitude
      if (editForm.amenities !== undefined) input.amenities = editForm.amenities
      if (editForm.houseRules !== undefined) input.houseRules = editForm.houseRules
      if (editForm.checkInTime !== undefined) input.checkInTime = editForm.checkInTime
      if (editForm.checkOutTime !== undefined) input.checkOutTime = editForm.checkOutTime
      if (editForm.maxGuests !== undefined) input.maxGuests = editForm.maxGuests
      if (editForm.bedrooms !== undefined) input.bedrooms = editForm.bedrooms
      if (editForm.bathrooms !== undefined) input.bathrooms = editForm.bathrooms
      if (editForm.photos !== undefined) input.photos = editForm.photos

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation UpdateHost($id: ID!, $input: UpdateHostInput!) {
              updateHost(id: $id, input: $input) {
                id
                name
                title
                location
                description
                address
                city
                state
                zipCode
                country
                latitude
                longitude
                amenities
                houseRules
                checkInTime
                checkOutTime
                maxGuests
                bedrooms
                bathrooms
                photos
              }
            }
          `,
          variables: {
            id: editForm.id,
            input
          },
        }),
      })

      const data = await response.json()
      if (data.data?.updateHost) {
        // Refresh the hostings data to get the latest updates
        await fetchHostings()
        setEditingHostId(null)
        setEditForm({})
      } else {
        console.error('Failed to update host:', data.errors)
        alert('Failed to save changes')
      }
    } catch (error) {
      console.error('Error saving host:', error)
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  // Upload a single image file to backend and append returned URL to editForm.photos
  const handleFileUpload = async (file: File | null) => {
    if (!file) return
    // Client-side validation: type and size
    if (!file.type || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file')
      return
    }
    const maxBytes = 5 * 1024 * 1024 // 5MB
    if (file.size > maxBytes) {
      alert('Image is too large. Maximum size is 5 MB.')
      return
    }
    try {
      const formData = new FormData()
      formData.append('image', file)

      const resp = await fetch('http://localhost:4000/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await resp.json()
      if (data?.url) {
        const currentPhotos = Array.isArray(editForm.photos) ? editForm.photos : []
        updateEditForm('photos', [...currentPhotos, data.url])
      } else {
        console.error('Upload failed', data)
        alert('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    }
  }

  const updateEditForm = (field: keyof HostData, value: string | number | string[]) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const handleDeleteHost = async (hostId: string) => {
    setDeleting(true)
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation DeleteHost($id: ID!) {
              deleteHost(id: $id)
            }
          `,
          variables: { id: hostId },
        }),
      })

      const data = await response.json()
      if (data.data?.deleteHost) {
        // Remove the host from local state
        setHostings(hostings.filter(h => h.id !== hostId))
        setDeleteConfirmId(null)
      } else {
        console.error('Failed to delete host:', data.errors)
        alert('Failed to delete host')
      }
    } catch (error) {
      console.error('Error deleting host:', error)
      alert('Failed to delete host')
    } finally {
      setDeleting(false)
    }
  }

  const confirmDelete = (hostId: string) => {
    setDeleteConfirmId(hostId)
  }

  const cancelDelete = () => {
    setDeleteConfirmId(null)
  }

  if (!session) {
    return (
      <PageLayout title="Hosting" showHeader={false}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to manage your hosting</h1>
          <p className="text-gray-600">You need to be signed in to access hosting management features.</p>
        </div>
      </PageLayout>
    )
  }

  const headerActions = (
    <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
      <Plus className="w-4 h-4" />
      Add New Hosting
    </Button>
  )

  return (
    <PageLayout 
      title="Manage Your Hosting" 
      subtitle="Add and manage your properties for friends to stay"
      headerActions={headerActions}
    >
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>

      {/* Booking Requests Summary */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="font-medium">Booking Requests</h3>
                <p className="text-sm text-gray-600">
                  {pendingRequestsCount > 0 
                    ? `You have ${pendingRequestsCount} pending request${pendingRequestsCount !== 1 ? 's' : ''}`
                    : 'No pending requests'
                  }
                </p>
              </div>
            </div>
            <Link href="/bookings">
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                View All Requests
                {pendingRequestsCount > 0 && (
                  <Badge variant="destructive" className="ml-2 px-1 py-0 text-xs min-w-[1.2rem] h-5">
                    {pendingRequestsCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {showAddForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Hosting</CardTitle>
            <CardDescription>Create a new hosting opportunity for your friends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newHosting.title}
                  onChange={(e) => setNewHosting({...newHosting, title: e.target.value})}
                  placeholder="e.g., Cozy Downtown Apartment"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newHosting.location}
                  onChange={(e) => setNewHosting({...newHosting, location: e.target.value})}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newHosting.description}
                onChange={(e) => setNewHosting({...newHosting, description: e.target.value})}
                placeholder="Describe your space..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="maxGuests">Max Guests</Label>
                <Input
                  id="maxGuests"
                  type="number"
                  value={newHosting.maxGuests}
                  onChange={(e) => setNewHosting({...newHosting, maxGuests: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={newHosting.bedrooms}
                  onChange={(e) => setNewHosting({...newHosting, bedrooms: parseInt(e.target.value)})}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={newHosting.bathrooms}
                  onChange={(e) => setNewHosting({...newHosting, bathrooms: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkInTime">Check-in Time</Label>
                <Input
                  id="checkInTime"
                  value={newHosting.checkInTime}
                  onChange={(e) => setNewHosting({...newHosting, checkInTime: e.target.value})}
                  placeholder="e.g., 3:00 PM"
                />
              </div>
              <div>
                <Label htmlFor="checkOutTime">Check-out Time</Label>
                <Input
                  id="checkOutTime"
                  value={newHosting.checkOutTime}
                  onChange={(e) => setNewHosting({...newHosting, checkOutTime: e.target.value})}
                  placeholder="e.g., 11:00 AM"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                value={newHosting.amenities}
                onChange={(e) => setNewHosting({...newHosting, amenities: e.target.value})}
                placeholder="e.g., WiFi, Kitchen, Parking"
              />
            </div>

            <div>
              <Label htmlFor="houseRules">House Rules</Label>
              <Textarea
                id="houseRules"
                value={newHosting.houseRules}
                onChange={(e) => setNewHosting({...newHosting, houseRules: e.target.value})}
                placeholder="e.g., No smoking, quiet hours after 10pm"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddHosting} disabled={!newHosting.title || !newHosting.location}>
                Add Hosting
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p>Loading your hosting properties...</p>
            </CardContent>
          </Card>
        ) : hostings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No hosting properties yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first hosting opportunity for friends</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Hosting
              </Button>
            </CardContent>
          </Card>
        ) : (
          hostings.map((hosting) => (
            <Card key={hosting.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {editingHostId === hosting.id ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`edit-title-${hosting.id}`}>Title</Label>
                          <Input
                            id={`edit-title-${hosting.id}`}
                            value={editForm.title || ''}
                            onChange={(e) => updateEditForm('title', e.target.value)}
                            placeholder="Property title"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-location-${hosting.id}`}>Location</Label>
                          <Input
                            id={`edit-location-${hosting.id}`}
                            value={editForm.location || ''}
                            onChange={(e) => updateEditForm('location', e.target.value)}
                            placeholder="Location"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {hosting.title || hosting.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {hosting.location}
                        </CardDescription>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {editingHostId === hosting.id ? (
                      <>
                        <Button 
                          onClick={saveEdit} 
                          disabled={saving}
                          size="sm"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={cancelEdit}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => startEdit(hosting)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => confirmDelete(hosting.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingHostId === hosting.id ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`edit-description-${hosting.id}`}>Description</Label>
                      <Textarea
                        id={`edit-description-${hosting.id}`}
                        value={editForm.description || ''}
                        onChange={(e) => updateEditForm('description', e.target.value)}
                        placeholder="Describe your space..."
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label>Photos</Label>
                      <div className="flex items-center gap-2 mb-2">
                        <FileUpload onChange={(files) => handleFileUpload(files && files.length ? files[0] : null)} />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {(Array.isArray(editForm.photos) ? editForm.photos : []).map((p: string, idx: number) => (
                          <div key={idx} className="w-24 h-16 bg-gray-100 rounded overflow-hidden relative">
                            <Image unoptimized src={p} alt={`photo-${idx}`} fill className="object-cover" sizes="96px" />
                            <button
                              type="button"
                              className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1"
                              onClick={() => {
                                const photos = Array.isArray(editForm.photos) ? [...editForm.photos] : []
                                photos.splice(idx, 1)
                                updateEditForm('photos', photos)
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor={`edit-maxGuests-${hosting.id}`}>Max Guests</Label>
                        <Input
                          id={`edit-maxGuests-${hosting.id}`}
                          type="number"
                          value={editForm.maxGuests || 1}
                          onChange={(e) => updateEditForm('maxGuests', parseInt(e.target.value))}
                          min="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-bedrooms-${hosting.id}`}>Bedrooms</Label>
                        <Input
                          id={`edit-bedrooms-${hosting.id}`}
                          type="number"
                          value={editForm.bedrooms || 1}
                          onChange={(e) => updateEditForm('bedrooms', parseInt(e.target.value))}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-bathrooms-${hosting.id}`}>Bathrooms</Label>
                        <Input
                          id={`edit-bathrooms-${hosting.id}`}
                          type="number"
                          value={editForm.bathrooms || 1}
                          onChange={(e) => updateEditForm('bathrooms', parseInt(e.target.value))}
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`edit-checkInTime-${hosting.id}`}>Check-in Time</Label>
                        <Input
                          id={`edit-checkInTime-${hosting.id}`}
                          value={editForm.checkInTime || ''}
                          onChange={(e) => updateEditForm('checkInTime', e.target.value)}
                          placeholder="e.g., 3:00 PM"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-checkOutTime-${hosting.id}`}>Check-out Time</Label>
                        <Input
                          id={`edit-checkOutTime-${hosting.id}`}
                          value={editForm.checkOutTime || ''}
                          onChange={(e) => updateEditForm('checkOutTime', e.target.value)}
                          placeholder="e.g., 11:00 AM"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`edit-amenities-${hosting.id}`}>Amenities (comma-separated)</Label>
                      <Input
                        id={`edit-amenities-${hosting.id}`}
                        value={Array.isArray(editForm.amenities) ? editForm.amenities.join(', ') : ''}
                        onChange={(e) => updateEditForm('amenities', e.target.value.split(',').map(a => a.trim()).filter(a => a))}
                        placeholder="e.g., WiFi, Kitchen, Parking"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`edit-houseRules-${hosting.id}`}>House Rules</Label>
                      <Textarea
                        id={`edit-houseRules-${hosting.id}`}
                        value={editForm.houseRules || ''}
                        onChange={(e) => updateEditForm('houseRules', e.target.value)}
                        placeholder="e.g., No smoking, quiet hours after 10pm"
                        rows={2}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">{hosting.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        {hosting.maxGuests} guests
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Bed className="w-4 h-4" />
                        {hosting.bedrooms} bedrooms
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Bath className="w-4 h-4" />
                        {hosting.bathrooms} bathrooms
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {hosting.checkInTime} - {hosting.checkOutTime}
                      </div>
                    </div>

                    {hosting.amenities && hosting.amenities.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                          {hosting.amenities.map((amenity: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {hosting.houseRules && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">House Rules</h4>
                        <p className="text-sm text-gray-600">{hosting.houseRules}</p>
                      </div>
                    )}
                  </>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Manage Availability</h4>
                  <AvailabilityManager 
                    availabilities={hosting.availabilities || getHostAvailabilities(hosting.id)}
                    onAddAvailability={handleAddAvailability(hosting.id)}
                    onRemoveAvailability={handleRemoveAvailability}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Hosting Property</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this hosting property? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={cancelDelete}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteHost(deleteConfirmId)}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}