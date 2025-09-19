"use client"

import { useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Home } from "lucide-react"
import Link from "next/link"

function InvitePageContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    relationship: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation createHost($input: CreateHostInput!) {
              createHost(input: $input) {
                id
                name
                location
                description
              }
            }
          `,
          variables: {
            input: {
              ...formData,
              email: email
            }
          },
        }),
      })

      const data = await response.json()
      if (data.data?.createHost) {
        setIsSubmitted(true)
      } else {
        console.error('GraphQL error:', data.errors)
        alert('Failed to create host. Please try again.')
      }
    } catch (error) {
      console.error('Failed to create host:', error)
      alert('Failed to create host. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
                Welcome to Stay With Friends!
              </h2>
              <p className="text-green-700 dark:text-green-300 mb-6">
                Your place is now available for friends to request stays. You&apos;ll have full control over who can stay and when. Check your dashboard to manage requests and your trusted network.
              </p>
              <Link href="/">
                <Button className="w-full">
                  Go to Homepage
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div>
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter">
              <span className="text-yellow-500 dark:text-yellow-500">Join</span> <span className="text-gray-900 dark:text-white">Stay</span>
              <span className="text-blue-500 dark:text-blue-300">With</span>
              <span className="text-blue-600 dark:text-blue-400">Friends</span>
            </h1>

            <div className="max-w-2xl mx-auto mb-6">
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                You&apos;ve been invited to share your place with friends!
              </p>
              
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
                <p className="text-green-800 dark:text-green-200 text-sm">
                  <strong>You&apos;re in control:</strong> This invitation is your chance to say &quot;Yes, I&apos;d love to have friends stay with me&quot; or &quot;No thanks, I&apos;m happy with fewer visitors for now.&quot;
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-4">
                <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3 text-left">
                  How it works
                </h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">1</span>
                    </div>
                    <p className="text-blue-800 dark:text-blue-200">
                      <strong>Offer your place</strong> - Share a few details about how friends can stay with you
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">2</span>
                    </div>
                    <p className="text-blue-800 dark:text-blue-200">
                      <strong>Manage your trusted network</strong> - Easily control who can request stays
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">4</span>
                    </div>
                    <p className="text-blue-800 dark:text-blue-200">
                      <strong>Review</strong> - You can approve, decline or reschedule any request
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {email && (
              <Badge variant="outline" className="text-sm">
                Invitation sent to: {email}
              </Badge>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Share Your Place with Friends
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tell us about your space so friends can request to stay with you. You control who gets invited and when.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, State/Country"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="relationship">Relationship to Inviter</Label>
                  <Input
                    id="relationship"
                    value={formData.relationship}
                    onChange={(e) => handleInputChange('relationship', e.target.value)}
                    placeholder="Friend, Family, Colleague, etc."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Tell us about your place</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={`Describe your accommodation, amenities, and what makes it special...`}
                    rows={4}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating your place...' : 'Share My Place with Friends'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Link href="/">
              <Button variant="ghost">
                Back to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InvitePageContent />
    </Suspense>
  )
}