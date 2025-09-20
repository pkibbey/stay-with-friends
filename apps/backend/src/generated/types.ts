// Generated types - do not edit

export interface User {
  id: string;
  email: string;
  name?: string;
  email_verified?: string;
  image?: string;
  created_at?: string;
}

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
  created_at?: string;
  updated_at?: string;
}

export interface Availability {
  id: string;
  host_id: string;
  start_date: string;
  end_date: string;
  status?: string;
  notes?: string;
}

export interface BookingRequest {
  id: string;
  host_id: string;
  requester_id: string;
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
  id: string;
  user_id: string;
  connected_user_id: string;
  relationship?: string;
  status?: string;
  created_at?: string;
}

export interface Invitation {
  id: string;
  inviter_id: string;
  invitee_email: string;
  invitee_name?: string;
  message?: string;
  token: string;
  status?: string;
  expires_at: string;
  accepted_at?: string;
  created_at?: string;
}
