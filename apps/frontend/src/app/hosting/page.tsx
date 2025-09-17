'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AvailabilityManager } from '@/components/AvailabilityManager'
import { PageLayout } from '@/components/PageLayout'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, MapPin, Users, Bed, Bath, Clock } from 'lucide-react'

interface Availability {
  id: string
  hostId: string
  startDate: string
  endDate: string
  status: string
  notes?: string
}

export default function ManageHostingPage() {
  const { data: session } = useSession()
  const [showAddForm, setShowAddForm] = useState(false)

  // Mock data - in real app this would come from your backend
  const [hostings, setHostings] = useState([
    {
      id: 1,
      title: "Cozy Downtown Apartment",
      description: "Beautiful 2-bedroom apartment in the heart of the city with amazing views",
      location: "San Francisco, CA",
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      checkInTime: "3:00 PM",
      checkOutTime: "11:00 AM",
      amenities: ["WiFi", "Kitchen", "Washer/Dryer", "Parking"],
      houseRules: "No smoking, quiet hours after 10pm",
      photos: [],
      isActive: true
    }
  ])

  // Mock availabilities data
  const [availabilities, setAvailabilities] = useState<Availability[]>([
    {
      id: '1',
      hostId: '1',
      startDate: '2025-12-15',
      endDate: '2025-12-20',
      status: 'available',
      notes: 'Holiday break'
    }
  ])

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
    const hosting = {
      id: Date.now(),
      ...newHosting,
      amenities: newHosting.amenities.split(',').map(a => a.trim()).filter(a => a),
      photos: [],
      isActive: true
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

  const toggleHostingStatus = (id: number) => {
    setHostings(hostings.map(h => 
      h.id === id ? { ...h, isActive: !h.isActive } : h
    ))
  }

  const handleAddAvailability = (hostId: number) => (startDate: string, endDate: string, notes?: string) => {
    const newAvailability: Availability = {
      id: Date.now().toString(),
      hostId: hostId.toString(),
      startDate,
      endDate,
      status: 'available',
      notes
    }
    setAvailabilities([...availabilities, newAvailability])
  }

  const handleRemoveAvailability = (id: string) => {
    setAvailabilities(availabilities.filter(a => a.id !== id))
  }

  const getHostAvailabilities = (hostId: number) => {
    return availabilities.filter(a => a.hostId === hostId.toString())
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
        {hostings.length === 0 ? (
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
            <Card key={hosting.id} className={!hosting.isActive ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {hosting.title}
                      <Badge variant={hosting.isActive ? 'default' : 'secondary'}>
                        {hosting.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {hosting.location}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleHostingStatus(hosting.id)}
                    >
                      {hosting.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
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

                {hosting.amenities.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {hosting.amenities.map((amenity, index) => (
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

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Manage Availability</h4>
                  <AvailabilityManager 
                    availabilities={getHostAvailabilities(hosting.id)}
                    onAddAvailability={handleAddAvailability(hosting.id)}
                    onRemoveAvailability={handleRemoveAvailability}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PageLayout>
  )
}