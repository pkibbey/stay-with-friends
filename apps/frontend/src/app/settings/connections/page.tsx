import { PageLayout } from '@/components/PageLayout'
import Invite from './components/Invite'
import Requests from './components/Requests'
import VerifiedConnections from './components/VerifiedConnections'
import SentInvitations from './components/SentInvitations'

export default function Connections() {

  return (
    <PageLayout title="Connections" subtitle="Manage your trusted network">
      <div className="grid gap-8">
        <Invite />
        <div className="grid gap-6 lg:grid-cols-2">
          <Requests />
          <VerifiedConnections />
        </div>
        <SentInvitations />
      </div>
    </PageLayout>
  )
}