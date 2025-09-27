// Re-export generated types (now with built-in validation and transformers)
export * from '../generated/types';

// Additional utility types (using enhanced generated types with validation)
import type { Host, Availability, Invitation, User, BookingRequest, Connection } from '../generated/types';

export type HostWithAvailabilities = Host & { 
  availabilities: Availability[]
  user?: User
};


export interface SearchFiltersState {
  query: string
  startDate: string | null
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
  user?: User;
}

// Extended type for component-specific data (includes nested inviter data from GraphQL)
export interface InvitationWithUser extends Invitation {
  inviterUser?: User
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
