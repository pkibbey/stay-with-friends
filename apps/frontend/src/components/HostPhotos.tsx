import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image'
import { ImageIcon } from "lucide-react"
import { HostWithAvailabilities } from "@/types"

interface HostPhotosProps {
  host: HostWithAvailabilities
}

// Helper to ensure photos is always an array
function parsePhotos(photos: unknown): string[] {
  if (Array.isArray(photos)) return photos
  if (typeof photos === 'string') {
    // Handle case where photos might be double-stringified
    let parsed = photos
    try {
      // First parse attempt
      parsed = JSON.parse(photos)
      // If the result is a string, parse again (handles double-stringification)
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed)
      }
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export function HostPhotos({ host }: HostPhotosProps) {
  const displayPhotos = parsePhotos(host.photos)

  // Don't render if no photos
  if (!displayPhotos || displayPhotos.length === 0) {
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
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {displayPhotos.map((photo, index) => (
            <Image
              unoptimized
              key={index}
              src={photo}
              alt={`${host.name}'s place`}
              className="w-full object-cover rounded-lg"
              width={400}
              height={192}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}