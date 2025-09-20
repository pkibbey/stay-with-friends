// Re-export generated types
export * from '../generated/types';
export * from '../generated/transformers';

// Additional utility types
import type { Host, Availability, Invitation, User, BookingRequest, Connection } from '../generated/types';

export type PartialHost = Partial<Host>;
export type HostWithAvailabilities = Host & { availabilities: Availability[] };

export interface SearchFiltersState {
  query: string
  startDate: string | null
  endDate: string | null
  location: string
  amenities: string[]
  trustedHostsOnly: boolean
  guests: number
}

// For form data and creation/updates (frontend-specific types that extend the generated base types)
export interface HostProfileData extends Omit<Host, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
  availabilities?: Array<{
    id: string;
    startDate: string;
    endDate: string;
    status: string;
    notes?: string;
  }>;
}

// For search results and simplified displays
export interface HostSummary {
  id: string;
  name: string;
  location?: string;
  description?: string;
}

// Extended type for component-specific data (includes nested inviter data from GraphQL)
export interface InvitationWithUser extends Invitation {
  inviterUser: User
}

// Extended type for component-specific data (includes nested data from GraphQL)
export interface BookingRequestWithRelations extends BookingRequest {
  host?: Host
  requester?: User
}

// Extended types for component-specific data (includes nested user data from GraphQL)
export interface ConnectionWithUser extends Connection {
  connectedUser: User
}
