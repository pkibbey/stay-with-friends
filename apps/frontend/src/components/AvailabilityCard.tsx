import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import Link from 'next/link'
import { formatDateRange } from '@/lib/date-utils'
import type { AvailabilityWithHost } from '@/types'

interface AvailabilityCardProps {
  availability: AvailabilityWithHost
  linkHref: string
  iconColor?: string
}

export function AvailabilityCard({ availability, linkHref, iconColor = "purple" }: AvailabilityCardProps) {
  const getIconClasses = () => {
    switch (iconColor) {
      case "purple":
        return "bg-purple-100 text-purple-600"
      case "green":
        return "bg-green-100 text-green-600"
      default:
        return "bg-blue-100 text-blue-600"
    }
  }

  // If no host data, return empty fragment
  if (!availability.host) {
    return null
  }

  const cardContent = (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="flex flex-col gap-2 px-6">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getIconClasses()}`}>
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-medium">{availability.host.name}</h4>
            <p className="text-sm text-gray-600">
              {availability.host.location}
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 line-clamp-1">
          {availability.host.description}
        </p>
        <div className="grid md:flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-xs">
            {formatDateRange(availability.startDate, availability.endDate)}
          </Badge>
          {availability.notes && (
            <span className="text-xs text-gray-500 truncate">{availability.notes}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Link href={linkHref}>
      {cardContent}
    </Link>
  )
}