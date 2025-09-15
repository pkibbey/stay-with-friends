import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Users } from "lucide-react"
import Link from 'next/link'
import { useState, useEffect } from "react"

interface Person {
  id: string
  name: string
  location?: string
  relationship?: string
  availability?: string
  description?: string
}

interface PersonSearchTabProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export function PersonSearchTab({ searchQuery, setSearchQuery }: PersonSearchTabProps) {
  const [searchResults, setSearchResults] = useState<Person[]>([])
  const [isSearching, setIsSearching] = useState(false)

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
                <Link key={person.id} href={`/person/${person.id}`}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
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
                      <Badge variant="outline">View Details</Badge>
                    </CardContent>
                  </Card>
                </Link>
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
  )
}