// Re-export generated types
export * from '../generated/types';
export * from '../generated/transformers';

// Additional utility types
import type { Host, Availability } from '../generated/types';

export type PartialHost = Partial<Host>;
export type HostWithAvailabilities = Host & { availabilities: Availability[] };

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