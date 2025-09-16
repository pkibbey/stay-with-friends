import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react"
import { parseLocalDate } from '@/lib/date-utils'
import { useState } from 'react'

interface Availability {
  id: string
  personId: string
  startDate: string
  endDate: string
  status: string
  notes?: string
}

interface AvailabilityManagerProps {
  availabilities: Availability[]
  onAddAvailability: (startDate: string, endDate: string, notes?: string) => void
  onRemoveAvailability: (id: string) => void
}

export function AvailabilityManager({
  availabilities,
  onAddAvailability,
  onRemoveAvailability
}: AvailabilityManagerProps) {
  const [newStartDate, setNewStartDate] = useState('')
  const [newEndDate, setNewEndDate] = useState('')
  const [newNotes, setNewNotes] = useState('')

  const handleAddAvailability = () => {
    if (newStartDate && newEndDate) {
      onAddAvailability(newStartDate, newEndDate, newNotes || undefined)
      setNewStartDate('')
      setNewEndDate('')
      setNewNotes('')
    }
  }

  const formatDisplayDate = (dateString: string) => {
    const date = parseLocalDate(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Manage Availability
        </CardTitle>
        <CardDescription>Add or remove available date ranges</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Availability Form */}
        <div className="space-y-4">
          <h4 className="font-medium">Add New Availability Period</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="e.g., Special event, flexible dates..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
            />
          </div>
          <Button
            onClick={handleAddAvailability}
            disabled={!newStartDate || !newEndDate}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Availability Period
          </Button>
        </div>

        {/* Current Availabilities List */}
        <div className="space-y-4">
          <h4 className="font-medium">Current Availability Periods</h4>
          {availabilities.length === 0 ? (
            <p className="text-gray-500 text-sm">No availability periods set</p>
          ) : (
            <div className="space-y-3">
              {availabilities.map((availability) => (
                <div
                  key={availability.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {formatDisplayDate(availability.startDate)} - {formatDisplayDate(availability.endDate)}
                    </div>
                    {availability.notes && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {availability.notes}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Status: {availability.status}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveAvailability(availability.id)}
                    className="ml-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}