"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Home } from "lucide-react"

export default function InvitePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      // Redirect to the proper accept invitation page
      window.location.href = `/invite/${token}`
    }
  }, [token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Invitation Link
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {token ? 'Redirecting to accept your invitation...' : 'Invalid invitation link'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}