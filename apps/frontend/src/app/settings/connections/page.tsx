import { PageLayout } from '@/components/PageLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserPlus, Clock, CheckCircle } from 'lucide-react'
import Invite from './components/Invite'
import Requests from './components/Requests'
import VerifiedConnections from './components/VerifiedConnections'
import SentInvitations from './components/SentInvitations'

export default function Connections() {

  return (
    <Tabs defaultValue="invite" className="space-y-6">
      <PageLayout
        title="Connections"
        subtitle="Manage your trusted network"
        headerActions={
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="invite" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Invitations
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="verified" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Verified
            </TabsTrigger>
          </TabsList>
        }>
        <TabsContent value="invite" className="space-y-4">
          <Invite />
          <SentInvitations />
        </TabsContent>
        <TabsContent value="requests" className="space-y-4">
          <Requests />
        </TabsContent>
        <TabsContent value="verified" className="space-y-4">
          <VerifiedConnections />
        </TabsContent>
      </PageLayout>
    </Tabs>
  )
}