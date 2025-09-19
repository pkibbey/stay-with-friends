// Core Host interface with all possible fields
export interface Host {
  id: string
  title: string
  name: string
  email?: string
  location?: string
  description?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  latitude?: number
  longitude?: number
  amenities?: string[]
  houseRules?: string
  checkInTime?: string
  checkOutTime?: string
  maxGuests?: number
  bedrooms?: number
  bathrooms?: number
  photos?: string[]
  availabilities?: Availability[]
  createdAt?: string
  updatedAt?: string
  user?: User
}

// Availability interface
export interface Availability {
  id: string
  hostId: string
  startDate: string
  endDate: string
  status: string
  notes?: string
  host?: Host
}

// For form data and creation/updates
export interface HostProfileData {
  id?: string
  name: string
  email: string
  location: string
  description: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  latitude?: number
  longitude?: number
  title: string
  availabilities?: Array<{
    id: string
    startDate: string
    endDate: string
    status: string
    notes?: string
  }>
  amenities: string[]
  houseRules: string
  checkInTime: string
  checkOutTime: string
  maxGuests?: number
  bedrooms?: number
  bathrooms?: number
  photos: string[]
}

// For search results and simplified displays
export interface HostSummary {
  id: string
  name: string
  location?: string
  description?: string
}

// For booking requests
export interface BookingRequest {
  id: string
  hostId: string
  requesterId: string
  startDate: string
  endDate: string
  guests: number
  message?: string
  status: string
  createdAt: string
  host?: Host
  requester?: User
}

// User interface for authentication and connections
export interface User {
  id: string
  email: string
  name?: string
  emailVerified?: string
  image?: string
  createdAt: string
}

// Connection interface for friend connections
export interface Connection {
  id: string
  userId: string
  connectedUserId: string
  relationship?: string
  status: string
  createdAt: string
  connectedUser?: User
}

// Invitation interface for user invitations
export interface Invitation {
  id: string
  inviterId: string
  inviteeEmail: string
  inviteeName?: string
  message?: string
  token: string
  status: string
  expiresAt: string
  acceptedAt?: string
  createdAt: string
}