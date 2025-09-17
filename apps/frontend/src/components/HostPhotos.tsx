import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import { useCallback } from 'react'
import { X, ImageIcon } from "lucide-react"
import { FileUpload } from "@/components/ui/file-upload"
import { Host, PartialHost } from "@/types"

interface HostPhotosProps {
  host: Host
  isEditing?: boolean
  editedData?: PartialHost
  onUpdate?: (field: string, value: string[]) => void
}

export function HostPhotos({
  host,
  isEditing = false,
  editedData = {},
  onUpdate
}: HostPhotosProps) {
  const displayPhotos = isEditing ? (editedData.photos || []) : host.photos || []

  const removePhoto = useCallback((index: number) => {
    const updatedPhotos = displayPhotos.filter((_, i) => i !== index)
    onUpdate?.('photos', updatedPhotos)
  }, [displayPhotos, onUpdate])

  const handleFileUpload = useCallback((files: File[]) => {
    // Convert files to data URLs and add them to photos
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string
          if (dataUrl) {
            const updatedPhotos = [...displayPhotos, dataUrl]
            onUpdate?.('photos', updatedPhotos)
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }, [displayPhotos, onUpdate])

  if (!isEditing && (!displayPhotos || displayPhotos.length === 0)) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Photos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Upload Photos
              </h4>
              <FileUpload onChange={handleFileUpload} />
            </div>

            {/* Photo Grid with Remove Buttons */}
            {displayPhotos.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Photos ({displayPhotos.length})
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {displayPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <Image
                        unoptimized
                        src={photo}
                        alt={`${name}'s place`}
                        className="w-full h-48 object-cover rounded-lg"
                        width={400}
                        height={192}
                      />
                      <Button
                        onClick={() => removePhoto(index)}
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {displayPhotos.length === 0 && !isEditing && (
              <div className="text-center py-8 text-gray-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No photos added yet</p>
                <p className="text-sm">Upload files or add photo URLs above to showcase the place</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {displayPhotos.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {displayPhotos.map((photo, index) => (
                  <Image
                    unoptimized
                    key={index}
                    src={photo}
                    alt={`${name}'s place`}
                    className="w-full h-48 object-cover rounded-lg"
                    width={400}
                    height={192}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No photos available</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}