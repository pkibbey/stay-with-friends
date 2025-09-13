"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar as CalendarIcon, Users, MapPin } from "lucide-react"
import { useState, useEffect } from "react"

interface Person {
  id: string
  name: string
  location?: string
  relationship?: string
  availability?: string
  description?: string
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Person[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const searchPeople = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query SearchPeople($query: String!) {
              searchPeople(query: $query) {
                id
                name
                location
                relationship
                availability
                description
              }
            }
          `,
          variables: { query },
        }),
      })

      const data = await response.json()
      setSearchResults(data.data?.searchPeople || [])
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchPeople(searchQuery)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Stay with <span className="text-blue-600 dark:text-blue-400">Friends</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Find the perfect place to stay with people you know. Like Airbnb, but only for your trusted network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Badge variant="secondary" className="px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              Trusted Network Only
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <MapPin className="w-4 h-4 mr-2" />
              Unique Locations
            </Badge>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="person" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="person" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Find by Person
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Browse Calendar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="person" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Search for Someone to Stay With</CardTitle>
                  <CardDescription>
                    Enter a name or location to find available stays with your friends and connections.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search by name, location, or relationship..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button disabled={isSearching}>
                      <Search className="w-4 h-4 mr-2" />
                      {isSearching ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                  {searchQuery && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {searchResults.length > 0 ? (
                        searchResults.map((person) => (
                          <Card key={person.id} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{person.name}</h3>
                                  <p className="text-sm text-gray-600">
                                    {person.relationship} • {person.location}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Available {person.availability}
                              </p>
                              {person.description && (
                                <p className="text-sm text-gray-600 mb-2">{person.description}</p>
                              )}
                              <Badge variant="outline">View Calendar</Badge>
                            </CardContent>
                          </Card>
                        ))
                      ) : searchQuery && !isSearching ? (
                        <div className="col-span-full text-center py-8">
                          <p className="text-gray-500">No people found matching your search.</p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Browse Available Dates</CardTitle>
                  <CardDescription>
                    Select dates to see who&apos;s available in your network during that time.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                      />
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold">
                        Available on {selectedDate?.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                      <div className="space-y-3">
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">Emma Davis</h4>
                                <p className="text-sm text-gray-600">Austin, TX</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">Spacious guest room with private bath</p>
                          </CardContent>
                        </Card>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">Alex Rodriguez</h4>
                                <p className="text-sm text-gray-600">Seattle, WA</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">Cozy apartment downtown</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}
