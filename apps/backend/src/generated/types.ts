// Generated types - do not edit

export interface User {
  id: number;
  email: string;
  name?: string;
  email_verified?: string;
  image?: string;
  created_at?: string;
}

export interface Host {
  id: number;
  user_id?: number;
  name: string;
  email?: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface Availability {
  id: number;
  host_id: number;
  start_date: string;
  end_date: string;
  status?: string;
  notes?: string;
}

export interface BookingRequest {
  id: number;
  host_id: number;
  requester_id: number;
  start_date: string;
  end_date: string;
  guests: number;
  message?: string;
  status?: string;
  response_message?: string;
  responded_at?: string;
  created_at?: string;
}

export interface Connection {
  id: number;
  user_id: number;
  connected_user_id: number;
  relationship?: string;
  status?: string;
  created_at?: string;
}

export interface Invitation {
  id: number;
  inviter_id: number;
  invitee_email: string;
  invitee_name?: string;
  message?: string;
  token: string;
  status?: string;
  expires_at: string;
  accepted_at?: string;
  created_at?: string;
}
