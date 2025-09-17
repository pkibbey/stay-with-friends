import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image'
import { ImageIcon } from "lucide-react"
import { Host } from "@/types"

interface HostPhotosProps {
  host: Host
}

export function HostPhotos({ host }: HostPhotosProps) {
  const displayPhotos = host.photos || []

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
              className="w-full h-48 object-cover rounded-lg"
              width={400}
              height={192}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}