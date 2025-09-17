import { Button } from "@/components/ui/button"
import { Host } from "@/types"
import { ArrowLeft, Users } from "lucide-react"
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface HostHeaderProps {
  host: Host
}

export function HostHeader({ host }: HostHeaderProps) {
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date')
  const backUrl = dateParam ? `/?date=${dateParam}` : '/'

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Link href={backUrl}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{host.name}</h1>
            <p className="text-gray-600 dark:text-gray-300">{host.relationship} • {host.location}</p>
          </div>
        </div>
      </div>
    </div>
  )
}