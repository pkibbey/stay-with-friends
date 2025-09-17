// Core Host interface with all possible fields
export interface Host {
  id: string
  name: string
  email?: string
  location?: string
  relationship?: string
  availability?: string
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
  relationship?: string
  description: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  latitude?: number
  longitude?: number
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
  relationship?: string
  availability?: string
  description?: string
}

// For booking requests
export interface BookingRequest {
  id: string
  hostId: string
  requesterName: string
  requesterEmail: string
  startDate: string
  endDate: string
  guests: number
  message?: string
  status: string
  createdAt: string
  host?: Host
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
  status: string
  createdAt: string
  connectedUser?: User
}