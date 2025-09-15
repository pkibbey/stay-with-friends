import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image'

interface PersonPhotosProps {
  name: string
  photos?: string[]
}

export function PersonPhotos({ name, photos }: PersonPhotosProps) {
  if (!photos || photos.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {photos.map((photo, index) => (
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
      </CardContent>
    </Card>
  )
}