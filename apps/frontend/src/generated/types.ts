// Generated types - do not edit
// Frontend types with camelCase field names

export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified?: string;
  image?: string;
  createdAt?: string;
}

export interface Host {
  id: string;
  userId?: string;
  name: string;
  email?: string;
  location?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  amenities?: string[];
  houseRules?: string;
  checkInTime?: string;
  checkOutTime?: string;
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  photos?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Availability {
  id: string;
  hostId: string;
  startDate: string;
  endDate: string;
  status?: string;
  notes?: string;
}

export interface BookingRequest {
  id: string;
  hostId: string;
  requesterId: string;
  startDate: string;
  endDate: string;
  guests: number;
  message?: string;
  status?: string;
  responseMessage?: string;
  respondedAt?: string;
  createdAt?: string;
}

export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  relationship?: string;
  status?: string;
  createdAt?: string;
}

export interface Invitation {
  id: string;
  inviterId: string;
  inviteeEmail: string;
  inviteeName?: string;
  message?: string;
  token: string;
  status?: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt?: string;
}
