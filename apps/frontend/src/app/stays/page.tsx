import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PageLayout } from '@/components/PageLayout'
import { BookingRequestWithRelations } from '@/types'
import { BookingRequestsManager } from '@/components/BookingRequestsManager'
import { serverAuthenticatedGraphQLRequest } from '@/lib/graphql-server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Send, Inbox } from 'lucide-react'

async function getMyBookingRequests(userId: string): Promise<BookingRequestWithRelations[]> {
  try {
    const result = await serverAuthenticatedGraphQLRequest<{
      bookingRequestsByRequester?: BookingRequestWithRelations[]
    }>(`
      query GetMyBookingRequests($requesterId: ID!) {
        bookingRequestsByRequester(requesterId: $requesterId) {
          id
          hostId
          requesterId
          startDate
          endDate
          guests
          message
          status
          responseMessage
          respondedAt
          createdAt
          host {
            id
            name
            location
          }
          requester {
            id
            email
            name
          }
        }
      }
    `, { requesterId: userId })

    return result.data?.bookingRequestsByRequester || []
  } catch (error) {
    console.error('Error fetching my booking requests:', error)
    return []
  }
}

async function getIncomingBookingRequests(userId: string): Promise<BookingRequestWithRelations[]> {
  try {
    const result = await serverAuthenticatedGraphQLRequest<{
      bookingRequestsByHostUser?: BookingRequestWithRelations[]
    }>(`
      query GetIncomingBookingRequests($userId: ID!) {
        bookingRequestsByHostUser(userId: $userId) {
          id
          hostId
          requesterId
          startDate
          endDate
          guests
          message
          status
          responseMessage
          respondedAt
          createdAt
          host {
            id
            name
            location
          }
          requester {
            id
            email
            name
            image
          }
        }
      }
    `, { userId })

    return result.data?.bookingRequestsByHostUser || []
  } catch (error) {
    console.error('Error fetching incoming booking requests:', error)
    return []
  }
}

export default async function BookingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return (
      <PageLayout title="Stays" showHeader={false}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to manage your stays</h1>
          <p className="text-gray-600">You need to be signed in to access stay management features.</p>
        </div>
      </PageLayout>
    )
  }

  const [myRequests, incomingRequests] = await Promise.all([
    getMyBookingRequests(session.user.id),
    getIncomingBookingRequests(session.user.id)
  ])

  return (
    <Tabs defaultValue="my-requests" className="space-y-6">
      <PageLayout
        title="Encourage friends to visit"
        subtitle="Manage your stay requests and hosting"
        headerActions={
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-requests" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              My Requests ({myRequests.length})
            </TabsTrigger>
            <TabsTrigger value="incoming" className="flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              Incoming Requests ({incomingRequests.length})
            </TabsTrigger>
          </TabsList>
        }>
        <TabsContent value="my-requests" className="space-y-4">
          <BookingRequestsManager
            initialMyRequests={myRequests}
            initialIncomingRequests={incomingRequests}
            activeTab="my-requests"
          />
        </TabsContent>
        <TabsContent value="incoming" className="space-y-4">
          <BookingRequestsManager
            initialMyRequests={myRequests}
            initialIncomingRequests={incomingRequests}
            activeTab="incoming"
          />
        </TabsContent>
      </PageLayout>
    </Tabs>
  )
}