"use client"

import Image from 'next/image'
import { toast } from 'sonner'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, MapPin, Users, Bed, Bath, Clock, Trash2, Plus, Image as ImageIcon } from 'lucide-react'
import { HostWithAvailabilities } from '@/types'
import { apiDelete } from '@/lib/api'
import Link from 'next/link'

interface HostingDisplayProps {
  hostings: HostWithAvailabilities[]
  onRefresh: () => void
  onAddNew: () => void
}

export function HostingDisplay({ hostings, onRefresh, onAddNew }: HostingDisplayProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDeleteHost = async (hostId: string) => {
    setDeleting(true)
    try {
      const res = await apiDelete(`/hosts/${hostId}`) as Response
      if (res.ok) {
        onRefresh()
        setDeleteConfirmId(null)
      } else {
        const errorMsg = (await res.json())?.error || 'Failed to delete host'
        console.error('Failed to delete host:', errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      console.error('Error deleting host:', error)
      toast.error('Failed to delete host')
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

  return (
    <>
      <div className="grid gap-6">
        {hostings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No hosting properties yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first hosting opportunity for friends</p>
              <Button onClick={onAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Hosting
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Your Hosting Properties</h3>
                <p className="text-gray-600">Manage your properties and availability</p>
              </div>
              <Button onClick={onAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Hosting
              </Button>
            </div>
            {hostings.map((hosting) => (
              <Card key={hosting.id}>
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {hosting.user?.image ? (
                          <Image
                            unoptimized
                            src={hosting.user.image}
                            alt={`${hosting.user.name || 'User'} avatar`}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs text-gray-600">
                              {(hosting.user?.name || hosting.name || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {hosting.name}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            Hosted by {hosting.user?.name || 'Unknown User'}
                          </p>
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {hosting.address ?
                          `${hosting.address}, ${hosting.city}, ${hosting.state}` :
                          hosting.location || `${hosting.city}, ${hosting.state}`
                        }
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/host/${hosting.id}`}>
                        <Button
                          variant="secondary"
                          size="sm"
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          View Page
                        </Button>
                      </Link>
                      <Link href={`/hosting/edit/${hosting.id}`}>
                        <Button
                          variant="secondary"
                          size="sm"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => hosting.id && confirmDelete(hosting.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Featured image preview (first photo is treated as featured) */}
                  {hosting.photos && hosting.photos.length > 0 ? (
                    <div className="w-full h-48 md:h-56 rounded-lg overflow-hidden mb-4 bg-gray-100 relative">
                      <Image
                        unoptimized
                        priority
                        src={hosting.photos[0]}
                        alt={`${hosting.name} featured`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 md:h-56 rounded-lg overflow-hidden mb-4 bg-gray-100 relative flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">No photos uploaded</p>
                      </div>
                    </div>
                  )}

                  <p className="text-gray-600 mb-4">{hosting.description}</p>

                  {/* Address Information */}
                  {(hosting.address || hosting.city || hosting.state || hosting.zip_code || hosting.country) && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Address</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        {hosting.address && <p>{hosting.address}</p>}
                        <p>
                          {[hosting.city, hosting.state, hosting.zip_code].filter(Boolean).join(', ')}
                          {hosting.country && `, ${hosting.country}`}
                        </p>
                        {(hosting.latitude && hosting.longitude) && (
                          <p className="text-xs text-gray-500">
                            Coordinates: {hosting.latitude}, {hosting.longitude}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      {hosting.max_guests} guests
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
                      {hosting.check_in_time} - {hosting.check_out_time}
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

                  {hosting.house_rules && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">House Rules</h4>
                      <p className="text-sm text-gray-600">{hosting.house_rules}</p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Availability</h4>
                    {(hosting.availabilities && hosting.availabilities.length > 0) ? (
                      <div className="space-y-2">
                        {hosting.availabilities.map((availability) => (
                          <div key={availability.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {new Date(availability.start_date || '').toLocaleDateString()} - {new Date(availability.end_date || '').toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-600 capitalize">
                                Status: {availability.status}
                              </div>
                              {availability.notes && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {availability.notes}
                                </div>
                              )}
                            </div>
                            <Badge variant={availability.status === 'available' ? 'default' : 'secondary'}>
                              {availability.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No availability periods set.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
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
    </>
  )
}