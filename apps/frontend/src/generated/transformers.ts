// Generated transformation utilities - do not edit

import type { 
  User as BackendUser, 
  Host as BackendHost, 
  Availability as BackendAvailability,
  BookingRequest as BackendBookingRequest,
  Connection as BackendConnection,
  Invitation as BackendInvitation
} from '../../../backend/src/generated/types';

import type { 
  User as FrontendUser, 
  Host as FrontendHost, 
  Availability as FrontendAvailability,
  BookingRequest as FrontendBookingRequest,
  Connection as FrontendConnection,
  Invitation as FrontendInvitation
} from './types';

// Transform backend snake_case data to frontend camelCase data
export function transformUser(backendUser: BackendUser): FrontendUser {
  return {
    id: String(backendUser.id),
    email: backendUser.email,
    name: backendUser.name,
    emailVerified: backendUser.email_verified,
    image: backendUser.image,
    createdAt: backendUser.created_at,
  };
}

export function transformHost(backendHost: BackendHost): FrontendHost {
  return {
    id: String(backendHost.id),
    userId: backendHost.user_id ? String(backendHost.user_id) : undefined,
    name: backendHost.name,
    email: backendHost.email,
    location: backendHost.location,
    description: backendHost.description,
    address: backendHost.address,
    city: backendHost.city,
    state: backendHost.state,
    zipCode: backendHost.zip_code,
    country: backendHost.country,
    latitude: backendHost.latitude,
    longitude: backendHost.longitude,
    amenities: backendHost.amenities,
    houseRules: backendHost.house_rules,
    checkInTime: backendHost.check_in_time,
    checkOutTime: backendHost.check_out_time,
    maxGuests: backendHost.max_guests,
    bedrooms: backendHost.bedrooms,
    bathrooms: backendHost.bathrooms,
    photos: backendHost.photos,
    createdAt: backendHost.created_at,
    updatedAt: backendHost.updated_at,
  };
}

export function transformAvailability(backendAvailability: BackendAvailability): FrontendAvailability {
  return {
    id: String(backendAvailability.id),
    hostId: String(backendAvailability.host_id),
    startDate: backendAvailability.start_date,
    endDate: backendAvailability.end_date,
    status: backendAvailability.status,
    notes: backendAvailability.notes,
  };
}

export function transformBookingRequest(backendBookingRequest: BackendBookingRequest): FrontendBookingRequest {
  return {
    id: String(backendBookingRequest.id),
    hostId: String(backendBookingRequest.host_id),
    requesterId: String(backendBookingRequest.requester_id),
    startDate: backendBookingRequest.start_date,
    endDate: backendBookingRequest.end_date,
    guests: backendBookingRequest.guests,
    message: backendBookingRequest.message,
    status: backendBookingRequest.status,
    responseMessage: backendBookingRequest.response_message,
    respondedAt: backendBookingRequest.responded_at,
    createdAt: backendBookingRequest.created_at,
  };
}

export function transformConnection(backendConnection: BackendConnection): FrontendConnection {
  return {
    id: String(backendConnection.id),
    userId: String(backendConnection.user_id),
    connectedUserId: String(backendConnection.connected_user_id),
    relationship: backendConnection.relationship,
    status: backendConnection.status,
    createdAt: backendConnection.created_at,
  };
}

export function transformInvitation(backendInvitation: BackendInvitation): FrontendInvitation {
  return {
    id: String(backendInvitation.id),
    inviterId: String(backendInvitation.inviter_id),
    inviteeEmail: backendInvitation.invitee_email,
    inviteeName: backendInvitation.invitee_name,
    message: backendInvitation.message,
    token: backendInvitation.token,
    status: backendInvitation.status,
    expiresAt: backendInvitation.expires_at,
    acceptedAt: backendInvitation.accepted_at,
    createdAt: backendInvitation.created_at,
  };
}

// Transform frontend camelCase data to backend snake_case data
export function transformToBackendUser(frontendUser: Partial<FrontendUser>): Partial<BackendUser> {
  return {
    id: frontendUser.id ? Number(frontendUser.id) : undefined,
    email: frontendUser.email,
    name: frontendUser.name,
    email_verified: frontendUser.emailVerified,
    image: frontendUser.image,
    created_at: frontendUser.createdAt,
  };
}

export function transformToBackendHost(frontendHost: Partial<FrontendHost>): Partial<BackendHost> {
  return {
    id: frontendHost.id ? Number(frontendHost.id) : undefined,
    user_id: frontendHost.userId ? Number(frontendHost.userId) : undefined,
    name: frontendHost.name,
    email: frontendHost.email,
    location: frontendHost.location,
    description: frontendHost.description,
    address: frontendHost.address,
    city: frontendHost.city,
    state: frontendHost.state,
    zip_code: frontendHost.zipCode,
    country: frontendHost.country,
    latitude: frontendHost.latitude,
    longitude: frontendHost.longitude,
    amenities: frontendHost.amenities,
    house_rules: frontendHost.houseRules,
    check_in_time: frontendHost.checkInTime,
    check_out_time: frontendHost.checkOutTime,
    max_guests: frontendHost.maxGuests,
    bedrooms: frontendHost.bedrooms,
    bathrooms: frontendHost.bathrooms,
    photos: frontendHost.photos,
    created_at: frontendHost.createdAt,
    updated_at: frontendHost.updatedAt,
  };
}

// Array transformation helpers
export function transformUsers(backendUsers: BackendUser[]): FrontendUser[] {
  return backendUsers.map(transformUser);
}

export function transformHosts(backendHosts: BackendHost[]): FrontendHost[] {
  return backendHosts.map(transformHost);
}

export function transformAvailabilities(backendAvailabilities: BackendAvailability[]): FrontendAvailability[] {
  return backendAvailabilities.map(transformAvailability);
}

export function transformBookingRequests(backendBookingRequests: BackendBookingRequest[]): FrontendBookingRequest[] {
  return backendBookingRequests.map(transformBookingRequest);
}

export function transformConnections(backendConnections: BackendConnection[]): FrontendConnection[] {
  return backendConnections.map(transformConnection);
}

export function transformInvitations(backendInvitations: BackendInvitation[]): FrontendInvitation[] {
  return backendInvitations.map(transformInvitation);
}