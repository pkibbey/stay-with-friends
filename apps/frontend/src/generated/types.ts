// Generated from Zod schemas - do not edit
// Frontend types with camelCase field names

import { z } from 'zod'
import type {
  User as BackendUser,
  Host as BackendHost,
  Availability as BackendAvailability,
  BookingRequest as BackendBookingRequest,
  Connection as BackendConnection,
  Invitation as BackendInvitation,
} from '../../../backend/src/generated/types'

export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified?: string;
  image?: string;
  createdAt: string;
}

export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().optional(),
  emailVerified: z.string().optional(),
  image: z.string().optional(),
  createdAt: z.string(),
})

export interface Host {
  id: string;
  userId?: string;
  name: string;
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
  createdAt: string;
  updatedAt: string;
}

export const HostSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  name: z.string(),
  location: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  amenities: z.array(z.string()).optional(),
  houseRules: z.string().optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  maxGuests: z.number().int().optional(),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().int().optional(),
  photos: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export interface Availability {
  id: string;
  hostId: string;
  startDate: string;
  endDate: string;
  status: string;
  notes?: string;
}

export const AvailabilitySchema = z.object({
  id: z.string(),
  hostId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.string(),
  notes: z.string().optional(),
})

export interface BookingRequest {
  id: string;
  hostId: string;
  requesterId: string;
  startDate: string;
  endDate: string;
  guests: number;
  message?: string;
  status: string;
  responseMessage?: string;
  respondedAt?: string;
  createdAt: string;
}

export const BookingRequestSchema = z.object({
  id: z.string(),
  hostId: z.string(),
  requesterId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  guests: z.number().int(),
  message: z.string().optional(),
  status: z.string(),
  responseMessage: z.string().optional(),
  respondedAt: z.string().optional(),
  createdAt: z.string(),
})

export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  relationship?: string;
  status: string;
  createdAt: string;
}

export const ConnectionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  connectedUserId: z.string(),
  relationship: z.string().optional(),
  status: z.string(),
  createdAt: z.string(),
})

export interface Invitation {
  id: string;
  inviterId: string;
  inviteeEmail: string;
  message?: string;
  token: string;
  status: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

export const InvitationSchema = z.object({
  id: z.string(),
  inviterId: z.string(),
  inviteeEmail: z.string(),
  message: z.string().optional(),
  token: z.string(),
  status: z.string(),
  expiresAt: z.string(),
  acceptedAt: z.string().optional(),
  createdAt: z.string(),
})

// Transformation utilities
export function transformUser(backend: BackendUser): User {
  return {
    id: backend.id,
    email: backend.email,
    name: backend.name,
    emailVerified: backend.email_verified,
    image: backend.image,
    createdAt: backend.created_at,
  }
}

export function safeTransformUser(backend: unknown): { success: true, data: User } | { success: false, error: string } {
  try {
    const transformed = transformUser(backend as BackendUser);
    const validated = UserSchema.parse(transformed);
    return { success: true, data: validated };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export function transformHost(backend: BackendHost): Host {
  return {
    id: backend.id,
    userId: backend.user_id,
    name: backend.name,
    location: backend.location,
    description: backend.description,
    address: backend.address,
    city: backend.city,
    state: backend.state,
    zipCode: backend.zip_code,
    country: backend.country,
    latitude: backend.latitude,
    longitude: backend.longitude,
    amenities: backend.amenities,
    houseRules: backend.house_rules,
    checkInTime: backend.check_in_time,
    checkOutTime: backend.check_out_time,
    maxGuests: backend.max_guests,
    bedrooms: backend.bedrooms,
    bathrooms: backend.bathrooms,
    photos: backend.photos,
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
  }
}

export function safeTransformHost(backend: unknown): { success: true, data: Host } | { success: false, error: string } {
  try {
    const transformed = transformHost(backend as BackendHost);
    const validated = HostSchema.parse(transformed);
    return { success: true, data: validated };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export function transformAvailability(backend: BackendAvailability): Availability {
  return {
    id: backend.id,
    hostId: backend.host_id,
    startDate: backend.start_date,
    endDate: backend.end_date,
    status: backend.status,
    notes: backend.notes,
  }
}

export function safeTransformAvailability(backend: unknown): { success: true, data: Availability } | { success: false, error: string } {
  try {
    const transformed = transformAvailability(backend as BackendAvailability);
    const validated = AvailabilitySchema.parse(transformed);
    return { success: true, data: validated };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export function transformBookingRequest(backend: BackendBookingRequest): BookingRequest {
  return {
    id: backend.id,
    hostId: backend.host_id,
    requesterId: backend.requester_id,
    startDate: backend.start_date,
    endDate: backend.end_date,
    guests: backend.guests,
    message: backend.message,
    status: backend.status,
    responseMessage: backend.response_message,
    respondedAt: backend.responded_at,
    createdAt: backend.created_at,
  }
}

export function safeTransformBookingRequest(backend: unknown): { success: true, data: BookingRequest } | { success: false, error: string } {
  try {
    const transformed = transformBookingRequest(backend as BackendBookingRequest);
    const validated = BookingRequestSchema.parse(transformed);
    return { success: true, data: validated };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export function transformConnection(backend: BackendConnection): Connection {
  return {
    id: backend.id,
    userId: backend.user_id,
    connectedUserId: backend.connected_user_id,
    relationship: backend.relationship,
    status: backend.status,
    createdAt: backend.created_at,
  }
}

export function safeTransformConnection(backend: unknown): { success: true, data: Connection } | { success: false, error: string } {
  try {
    const transformed = transformConnection(backend as BackendConnection);
    const validated = ConnectionSchema.parse(transformed);
    return { success: true, data: validated };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export function transformInvitation(backend: BackendInvitation): Invitation {
  return {
    id: backend.id,
    inviterId: backend.inviter_id,
    inviteeEmail: backend.invitee_email,
    message: backend.message,
    token: backend.token,
    status: backend.status,
    expiresAt: backend.expires_at,
    acceptedAt: backend.accepted_at,
    createdAt: backend.created_at,
  }
}

export function safeTransformInvitation(backend: unknown): { success: true, data: Invitation } | { success: false, error: string } {
  try {
    const transformed = transformInvitation(backend as BackendInvitation);
    const validated = InvitationSchema.parse(transformed);
    return { success: true, data: validated };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Validation helpers
export const validate = {
  user: (data: unknown) => UserSchema.parse(data),
  host: (data: unknown) => HostSchema.parse(data),
  availability: (data: unknown) => AvailabilitySchema.parse(data),
  bookingrequest: (data: unknown) => BookingRequestSchema.parse(data),
  connection: (data: unknown) => ConnectionSchema.parse(data),
  invitation: (data: unknown) => InvitationSchema.parse(data),
}

// Safe parsing helpers
export const safeParse = {
  user: (data: unknown) => UserSchema.safeParse(data),
  host: (data: unknown) => HostSchema.safeParse(data),
  availability: (data: unknown) => AvailabilitySchema.safeParse(data),
  bookingrequest: (data: unknown) => BookingRequestSchema.safeParse(data),
  connection: (data: unknown) => ConnectionSchema.safeParse(data),
  invitation: (data: unknown) => InvitationSchema.safeParse(data),
}