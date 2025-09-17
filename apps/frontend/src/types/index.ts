// Re-export all types for easy importing
export * from './host'

// Additional utility types
export type PartialHost = Partial<Host>
export type HostWithAvailabilities = Host & { availabilities: Availability[] }

import type { Host, Availability, HostProfileData, HostSummary, BookingRequest, User, Connection } from './host'
export type { Host, Availability, HostProfileData, HostSummary, BookingRequest, User, Connection }