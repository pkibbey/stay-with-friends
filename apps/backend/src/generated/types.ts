// Generated from Zod schemas - do not edit
// Backend types with snake_case field names

import { z } from 'zod'

export interface User {
  id: string;
  email: string;
  name?: string;
  email_verified?: string;
  image?: string;
  created_at: string;
}

export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().optional(),
  email_verified: z.string().optional(),
  image: z.string().optional(),
  created_at: z.string(),
})

export interface Host {
  id: string;
  user_id?: string;
  name: string;
  location?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  amenities?: string[];
  house_rules?: string;
  check_in_time?: string;
  check_out_time?: string;
  max_guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  photos?: string[];
  created_at: string;
  updated_at: string;
}

export const HostSchema = z.object({
  id: z.string(),
  user_id: z.string().optional(),
  name: z.string(),
  location: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  amenities: z.array(z.string()).optional(),
  house_rules: z.string().optional(),
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional(),
  max_guests: z.number().int().optional(),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().int().optional(),
  photos: z.array(z.string()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export interface Availability {
  id: string;
  host_id: string;
  start_date: string;
  end_date: string;
  status: string;
  notes?: string;
}

export const AvailabilitySchema = z.object({
  id: z.string(),
  host_id: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  status: z.string(),
  notes: z.string().optional(),
})

export interface BookingRequest {
  id: string;
  host_id: string;
  requester_id: string;
  start_date: string;
  end_date: string;
  guests: number;
  message?: string;
  status: string;
  response_message?: string;
  responded_at?: string;
  created_at: string;
}

export const BookingRequestSchema = z.object({
  id: z.string(),
  host_id: z.string(),
  requester_id: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  guests: z.number().int(),
  message: z.string().optional(),
  status: z.string(),
  response_message: z.string().optional(),
  responded_at: z.string().optional(),
  created_at: z.string(),
})

export interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  relationship?: string;
  status: string;
  created_at: string;
}

export const ConnectionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  connected_user_id: z.string(),
  relationship: z.string().optional(),
  status: z.string(),
  created_at: z.string(),
})

export interface Invitation {
  id: string;
  inviter_id: string;
  invitee_email: string;
  message?: string;
  token: string;
  status: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

export const InvitationSchema = z.object({
  id: z.string(),
  inviter_id: z.string(),
  invitee_email: z.string(),
  message: z.string().optional(),
  token: z.string(),
  status: z.string(),
  expires_at: z.string(),
  accepted_at: z.string().optional(),
  created_at: z.string(),
})

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