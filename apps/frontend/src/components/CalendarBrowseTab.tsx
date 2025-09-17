import { CalendarWidget } from "./CalendarWidget"
import { SelectedDateAvailabilities } from "./SelectedDateAvailabilities"
import { AllAvailabilities } from "./AllAvailabilities"
import { Search, Users } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import Link from 'next/link'
import type { HostSummary, Availability } from '@/types'

interface CalendarBrowseTabProps {
  selectedDate: Date | undefined
  setSelectedDate: (date: Date | undefined) => void
  currentMonth: Date
  setCurrentMonth: (month: Date) => void
  availabilityDates: Set<string>
  calendarResults: Availability[]
  isLoadingCalendar: boolean
  allAvailabilities: Availability[]
  isLoadingAll: boolean
  maxMonthsDisplayed: number
  searchQuery: string
  searchResults: HostSummary[]
  isSearching: boolean
  isEmailInput: boolean
  emailExists: boolean | null
  isCheckingEmail: boolean
  handleSearchChange: (value: string) => void
  sendInvitationEmail: (email: string) => void
}

export function CalendarBrowseTab({
  selectedDate,
  setSelectedDate,
  currentMonth,
  setCurrentMonth,
  availabilityDates,
  calendarResults,
  isLoadingCalendar,
  allAvailabilities,
  isLoadingAll,
  maxMonthsDisplayed,
  searchQuery,
  searchResults,
  isSearching,
  isEmailInput,
  emailExists,
  isCheckingEmail,
  handleSearchChange,
  sendInvitationEmail
}: CalendarBrowseTabProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Browse Available Dates</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select dates to see who&apos;s available in your network during that time, or search for specific friends.
        </p>
      </div>

      {/* Search Box */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search by name, location, or relationship..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-white/50 dark:bg-gray-900"
          />
        </div>
        <div className="flex gap-2">
          <Button disabled={isSearching} className="w-full sm:w-auto">
            <Search className="w-4 h-4 mr-2" />
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
          <Link href="/search">
            <Button variant="outline" className="w-full sm:w-auto">
              Advanced Search
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Email Invitation Section */}
      {isEmailInput && searchQuery && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                {isCheckingEmail ? 'Checking email...' : `Invite ${searchQuery}`}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {emailExists === null ? 'Checking if this host is already a member...' :
                  emailExists ? 'This host is already a member. Send them a connection request.' :
                  'This host has not yet confirmed friend status. Send them an invitation to connect.'}
              </p>
            </div>
          </div>
          
          {!isCheckingEmail && (
            <div className="flex gap-2">
              <Button 
                onClick={() => sendInvitationEmail(searchQuery.trim())}
                className="flex-1"
                variant={emailExists ? "outline" : "default"}
                disabled={emailExists === true}
              >
                {emailExists ? 'Connection Request (Coming Soon)' : 'Send Invitation Email'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  handleSearchChange('')
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Search Results */}
      {searchQuery && !isEmailInput && (
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {searchResults.length > 0 ? (
            searchResults.slice(0, 6).map((host) => (
              <Link key={host.id} href={`/host/${host.id}`}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{host.name}</h4>
                        <p className="text-xs text-gray-600 truncate">
                          {host.relationship} • {host.location}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">View Details</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : searchQuery && !isSearching ? (
            <div className="col-span-full text-center py-4">
              <p className="text-gray-500 text-sm">No people found matching your search.</p>
            </div>
          ) : null}
        </div>
      )}
      
      <div className="flex gap-6">
        <CalendarWidget
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          availabilityDates={availabilityDates}
          maxMonthsDisplayed={maxMonthsDisplayed}
        />
        <div className="space-y-6 flex-1">
          <SelectedDateAvailabilities
            selectedDate={selectedDate}
            calendarResults={calendarResults}
            isLoadingCalendar={isLoadingCalendar}
          />

          <AllAvailabilities
            allAvailabilities={allAvailabilities}
            isLoadingAll={isLoadingAll}
          />
        </div>
      </div>
    </div>
  )
}