import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Users } from "lucide-react"
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface PersonHeaderProps {
  name: string
  relationship?: string
  location?: string
  email?: string
  isEditing?: boolean
  editedData?: {
    name?: string
    relationship?: string
    location?: string
    email?: string
  }
  onUpdate?: (field: string, value: string) => void
  children?: React.ReactNode
}

export function PersonHeader({ 
  name, 
  relationship, 
  location, 
  email,
  isEditing = false,
  editedData = {},
  onUpdate,
  children
}: PersonHeaderProps) {
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date')
  const backUrl = dateParam ? `/?date=${dateParam}` : '/'

  const displayData = isEditing ? editedData : { name, relationship, location, email }

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
          {children}
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                  <Input
                    id="name"
                    value={displayData.name || ''}
                    onChange={(e) => onUpdate?.('name', e.target.value)}
                    className="text-2xl font-bold"
                    placeholder="Enter name..."
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="relationship" className="text-sm font-medium">Relationship</Label>
                    <Input
                      id="relationship"
                      value={displayData.relationship || ''}
                      onChange={(e) => onUpdate?.('relationship', e.target.value)}
                      placeholder="e.g., Friend, Family, Colleague"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                    <Input
                      id="location"
                      value={displayData.location || ''}
                      onChange={(e) => onUpdate?.('location', e.target.value)}
                      placeholder="City, State/Country"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={displayData.email || ''}
                    onChange={(e) => onUpdate?.('email', e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{displayData.name}</h1>
                <p className="text-gray-600 dark:text-gray-300">{displayData.relationship} • {displayData.location}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}