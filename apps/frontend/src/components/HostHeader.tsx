import { Host } from "@/types"
import {  Users } from "lucide-react"

interface HostHeaderProps {
  host: Host
}

export function HostHeader({ host }: HostHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{host.name}</h1>
            <p className="text-gray-600 dark:text-gray-300">{host.location}</p>
          </div>
        </div>
      </div>
    </div>
  )
}