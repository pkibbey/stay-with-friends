/* eslint-disable @typescript-eslint/no-explicit-any */
export const typeDefs = `#graphql
  type Host {
    id: ID!
    name: String!
    location: String
    description: String
    address: String
    city: String
    state: String
    zipCode: String
    country: String
    latitude: Float
    longitude: Float
    amenities: [String!]
    houseRules: String
    checkInTime: String
    checkOutTime: String
    maxGuests: Int
    bedrooms: Int
    bathrooms: Int
    photos: [String!]
    availabilities: [Availability!]!
    createdAt: String!
    updatedAt: String!
    userId: ID!
    user: User!
  }

  type Availability {
    id: ID!
    hostId: ID!
    startDate: String!
    endDate: String!
    status: String!
    notes: String
    host: Host!
  }

  type BookingRequest {
    id: ID!
    hostId: ID!
    requesterId: ID!
    startDate: String!
    endDate: String!
    guests: Int!
    message: String
    status: String!
    responseMessage: String
    respondedAt: String
    createdAt: String!
    host: Host!
    requester: User!
  }

  type User {
    id: ID!
    email: String!
    name: String
    emailVerified: String
    image: String
    createdAt: String!
  }

  type Connection {
    id: ID!
    userId: ID!
    connectedUserId: ID!
    relationship: String
    status: String!
    createdAt: String!
    connectedUser: User!
  }

  type Invitation {
    id: ID!
    inviterId: ID!
    inviteeEmail: String!
    message: String
    token: String!
    status: String!
    expiresAt: String!
    acceptedAt: String
    createdAt: String!
    inviter: User!
  }

  type Query {
    hosts: [Host!]!
    searchHosts(query: String!): [Host!]!
    host(id: ID!): Host
    searchHostsAdvanced(
      query: String
      startDate: String
    ): [Host!]!
    availabilitiesByDate(date: String!): [Availability!]!
    availabilitiesByDateRange(startDate: String!, endDate: String!): [Availability!]!
    hostAvailabilities(hostId: ID!): [Availability!]!
    availabilityDates(startDate: String!, endDate: String!): [String!]!
    user(email: String!): User
    connections(userId: ID!): [Connection!]!
    connectionRequests(userId: ID!): [Connection!]!
    bookingRequestsByHost(hostId: ID!): [BookingRequest!]!
    bookingRequestsByRequester(requesterId: ID!): [BookingRequest!]!
    bookingRequestsByHostUser(userId: ID!): [BookingRequest!]!
    pendingBookingRequestsCount(userId: ID!): Int!
    invitation(token: String!): Invitation
    invitations(inviterId: ID!): [Invitation!]!
  }

  type Mutation {
    createHost(
      userId: ID!
      name: String!
      location: String
      description: String
      address: String
      city: String
      state: String
      zipCode: String
      country: String
      latitude: Float
      longitude: Float
      amenities: [String!]
      houseRules: String
      checkInTime: String
      checkOutTime: String
      maxGuests: Int
      bedrooms: Int
      bathrooms: Int
      photos: [String!]
    ): Host!
    createAvailability(
      hostId: ID!
      startDate: String!
      endDate: String!
      status: String
      notes: String
    ): Availability!
    createBookingRequest(
      hostId: ID!
      requesterId: ID!
      startDate: String!
      endDate: String!
      guests: Int!
      message: String
    ): BookingRequest!
    updateBookingRequestStatus(
      id: ID!
      status: String!
      responseMessage: String
    ): BookingRequest!
    checkEmailExists(email: String!): Boolean!
    sendInvitationEmail(email: String!, invitationUrl: String!): String!
    updateHost(id: ID!, input: UpdateHostInput!): Host!
    deleteHost(id: ID!): Boolean!
    createUser(email: String!, name: String, image: String): User!
    updateUser(id: ID!, name: String, image: String): User!
    createConnection(userId: ID!, connectedUserEmail: String!, relationship: String): Connection!
    updateConnectionStatus(connectionId: ID!, status: String!): Connection!
  deleteConnection(connectionId: ID!): Boolean!
    createInvitation(inviterId: ID!, inviteeEmail: String!, message: String): Invitation!
    acceptInvitation(token: String!, userData: AcceptInvitationInput!): User!
    cancelInvitation(invitationId: ID!): Boolean!
    deleteInvitation(invitationId: ID!): Boolean!
  }

  input CreateListingInput {
    name: String!
    description: String!
    address: String!
    city: String!
    state: String!
    zipCode: String!
    country: String!
    latitude: Float
    longitude: Float
    maxGuests: Int
    bedrooms: Int
    bathrooms: Int
    amenities: [String!]
    houseRules: String
    checkInTime: String
    checkOutTime: String
    photos: [String!]
  }

  input UpdateHostInput {
    name: String
    location: String    
    description: String
    address: String
    city: String
    state: String
    zipCode: String
    country: String
    latitude: Float
    longitude: Float
    amenities: [String!]
    houseRules: String
    checkInTime: String
    checkOutTime: String
    maxGuests: Int
    bedrooms: Int
    bathrooms: Int
    photos: [String!]
    availabilities: [AvailabilityInput!]
  }

  input AvailabilityInput {
    startDate: String!
    endDate: String!
    status: String
    notes: String
  }

  input AcceptInvitationInput {
    name: String
    image: String
  }
`;

import { getAllHosts, getHostById, searchHosts, insertHost, getHostAvailabilities, getAvailabilitiesByDateRange, insertAvailability, getAvailabilityDates, insertBookingRequest, getBookingRequestsByHost, getBookingRequestsByRequester, updateBookingRequestStatus, getBookingRequestById, getPendingBookingRequestsCountByHostUser, getUserByEmail, getUserById, insertUser, updateUser, getConnections, getConnectionRequests, insertConnection, updateConnectionStatus, insertInvitation, getInvitationByToken, getInvitationById, getInvitationsByInviter, updateInvitationStatus, getInvitationByEmail, getConnectionById, deleteConnectionsBetweenUsers, deleteInvitation, getConnectionBetweenUsers, searchHostsAvailableOnDate } from './db';
// Use generated types from the single source-of-truth
import type { User as GeneratedUser, Host as GeneratedHost, Connection as GeneratedConnection, Availability as GeneratedAvailability, BookingRequest as GeneratedBookingRequest, Invitation as GeneratedInvitation, Host, Availability, BookingRequest, User, Connection, Invitation } from './generated/types';
import fs from 'fs';
import path from 'path';
import Crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import BetterSqlite3 from 'better-sqlite3';
import Path from 'path';

// Authentication context interface
interface AuthContext {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

// Validation functions
export const validateEmail = (email: string): void => {
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required');
  }
  if (email.length < 5 || email.length > 255) {
    throw new Error('Email must be between 5 and 255 characters');
  }
  // More robust email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Email must be a valid email address');
  }
};

export const validateName = (name: string): void => {
  if (!name || typeof name !== 'string') {
    throw new Error('Name is required');
  }
  if (name.trim().length < 1 || name.length > 255) {
    throw new Error('Name must be between 1 and 255 characters');
  }
};

export const validateOptionalText = (text: string | undefined, fieldName: string, maxLength: number): void => {
  if (text !== undefined && text !== null) {
    if (typeof text !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }
    if (text.length > maxLength) {
      throw new Error(`${fieldName} must be no more than ${maxLength} characters`);
    }
  }
};

const validateCoordinates = (lat: number | undefined, lng: number | undefined): void => {
  if (lat !== undefined && (typeof lat !== 'number' || lat < -90 || lat > 90)) {
    throw new Error('Latitude must be between -90 and 90');
  }
  if (lng !== undefined && (typeof lng !== 'number' || lng < -180 || lng > 180)) {
    throw new Error('Longitude must be between -180 and 180');
  }
};

const validatePositiveInteger = (value: number | undefined, fieldName: string, max?: number): void => {
  if (value !== undefined && value !== null) {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      throw new Error(`${fieldName} must be a positive integer`);
    }
    if (max && value > max) {
      throw new Error(`${fieldName} must be no more than ${max}`);
    }
  }
};

const validateUUID = (value: string | undefined, fieldName: string): void => {
  if (!value || typeof value !== 'string') {
    throw new Error(`${fieldName} is required and must be a UUID string`);
  }
  // Basic UUID v4 format check (does not enforce v4 specifically, but ensures UUID structure)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    throw new Error(`${fieldName} must be a valid UUID`);
  }
};

const validateDateRange = (startDate: string, endDate: string): void => {
  if (!startDate || !endDate) {
    throw new Error('Start date and end date are required');
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date format');
  }
  
  if (start > end) {
    throw new Error('Start date must be before or equal to end date');
  }
};

const validateStatus = (status: string, validStatuses: string[]): void => {
  if (status && !validStatuses.includes(status)) {
    throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
  }
};

export const resolvers = {
  Query: {
    hosts: (): GeneratedHost[] => {
      // Hosts query is public - anyone can view available hosts
      return getAllHosts.all() as GeneratedHost[];
    },
    searchHosts: (_: any, { query }: { query: string }): GeneratedHost[] => {
      // Search is public
      const searchTerm = `%${query}%`;
      return searchHosts.all(searchTerm, searchTerm) as GeneratedHost[];
    },
    host: (_: any, { id }: { id: string }): GeneratedHost | undefined => {
      // Host details are public
      return getHostById.get(id) as GeneratedHost | undefined;
    },
    searchHostsAdvanced: (_: any, args: any) => {
      // Advanced search is public
      const searchTerm = args.query ? `%${args.query}%` : '%';
      
      if (args.startDate) {
        // If a date is provided, filter hosts that are available on that specific date
        return searchHostsAvailableOnDate.all(
          args.startDate, // start_date <= ?
          args.startDate, // end_date >= ?
          searchTerm,     // name LIKE ?
          searchTerm,     // description LIKE ?
          searchTerm,     // location LIKE ?
          searchTerm,     // city LIKE ?
          searchTerm      // state LIKE ?
        ) as GeneratedHost[];
      } else {
        // If no date filter, use the standard search
        if (args.query) {
          return searchHosts.all(searchTerm, searchTerm) as GeneratedHost[];
        }
        // If no query, return all hosts
        return getAllHosts.all() as GeneratedHost[];
      }
    },
    availabilitiesByDate: (_: any, { date }: { date: string }): GeneratedAvailability[] => {
      // Availability info is public
      return getAvailabilitiesByDateRange.all(date, date) as GeneratedAvailability[];
    },
    availabilitiesByDateRange: (_: any, { startDate, endDate }: { startDate: string, endDate: string }): GeneratedAvailability[] => {
      // Availability info is public
      return getAvailabilitiesByDateRange.all(endDate, startDate) as GeneratedAvailability[];
    },
    hostAvailabilities: (_: any, { hostId }: { hostId: string }): GeneratedAvailability[] => {
      // Availability info is public
      return getHostAvailabilities.all(hostId) as GeneratedAvailability[];
    },
    availabilityDates: (_: any, { startDate, endDate }: { startDate: string, endDate: string }) => {
      // Availability info is public
      const results = getAvailabilityDates.all(startDate, endDate, endDate, startDate) as { date: string }[];
      return results.map(row => row.date);
    },
    user: (_: any, { email }: { email: string }, context: AuthContext) => {
      // User lookup requires authentication
      if (!context.user) {
        throw new Error('Authentication required');
      }
      // Return typed user based on generated types
      const row = getUserByEmail.get(email) as any;
      return row as GeneratedUser | undefined;
    },
    connections: (_: any, { userId }: { userId: string }, context: AuthContext): GeneratedConnection[] => {
      // Connections require authentication and user can only see their own connections
      if (!context.user) {
        throw new Error('Authentication required');
      }
      if (context.user.id !== userId) {
        throw new Error('Unauthorized: Can only view your own connections');
      }
      return getConnections.all(userId, userId, userId) as GeneratedConnection[];
    },
    connectionRequests: (_: any, { userId }: { userId: string }, context: AuthContext): GeneratedConnection[] => {
      // Connection requests require authentication
      if (!context.user) {
        throw new Error('Authentication required');
      }
      if (context.user.id !== userId) {
        throw new Error('Unauthorized: Can only view your own connection requests');
      }
      return getConnectionRequests.all(userId) as GeneratedConnection[];
    },
    invitation: (_: any, { token }: { token: string }): GeneratedInvitation | undefined => {
      // Invitation lookup is public (for accepting invitations)
      return getInvitationByToken.get(token) as GeneratedInvitation | undefined;
    },
    invitations: (_: any, { inviterId }: { inviterId: string }, context: AuthContext): GeneratedInvitation[] => {
      // Invitations require authentication
      if (!context.user) {
        throw new Error('Authentication required');
      }
      if (context.user.id !== inviterId) {
        throw new Error('Unauthorized: Can only view your own invitations');
      }
      return getInvitationsByInviter.all(inviterId) as GeneratedInvitation[];
    },
    bookingRequestsByHost: (_: any, { hostId }: { hostId: string }, context: AuthContext): GeneratedBookingRequest[] => {
      // Booking requests require authentication and user must own the host
      if (!context.user) {
        throw new Error('Authentication required');
      }
      const host = getHostById.get(hostId) as any;
      if (!host || host.user_id !== context.user.id) {
        throw new Error('Unauthorized: Can only view booking requests for your own hosts');
      }
      return getBookingRequestsByHost.all(hostId) as GeneratedBookingRequest[];
    },
    bookingRequestsByRequester: (_: any, { requesterId }: { requesterId: string }, context: AuthContext): GeneratedBookingRequest[] => {
      // Booking requests require authentication
      if (!context.user) {
        throw new Error('Authentication required');
      }
      if (context.user.id !== requesterId) {
        throw new Error('Unauthorized: Can only view your own booking requests');
      }
      return getBookingRequestsByRequester.all(requesterId) as GeneratedBookingRequest[];
    },
    bookingRequestsByHostUser: (_: any, { userId }: { userId: string }, context: AuthContext) => {
      // Booking requests require authentication
      if (!context.user) {
        throw new Error('Authentication required');
      }
      if (context.user.id !== userId) {
        throw new Error('Unauthorized: Can only view booking requests for your own hosts');
      }
      // Get all booking requests for hosts owned by this user
      const allHosts = getAllHosts.all();
      const userHosts = allHosts.filter((host: any) => host.user_id === userId);
      const allRequests: any[] = [];
      
      for (const host of userHosts) {
        const requests = getBookingRequestsByHost.all((host as any).id);
        allRequests.push(...requests);
      }
      
      // Sort by created_at desc
      return allRequests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    pendingBookingRequestsCount: (_: any, { userId }: { userId: string }, context: AuthContext) => {
      // Booking requests require authentication
      if (!context.user) {
        throw new Error('Authentication required');
      }
      if (context.user.id !== userId) {
        throw new Error('Unauthorized: Can only view your own pending requests count');
      }
      const result = getPendingBookingRequestsCountByHostUser.get(userId) as any;
      return result?.count || 0;
    },
  },
  Mutation: {
    createHost: (_: any, args: any, context: AuthContext): GeneratedHost => {
      // Creating a host requires authentication
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
      try {
        // Validate required fields
        validateName(args.name);
        if (!args.userId) {
          throw new Error('User ID is required');
        }
        
        // Ensure user can only create hosts for themselves
        if (args.userId !== context.user.id) {
          throw new Error('Unauthorized: Can only create hosts for yourself');
        }
        
        // Validate optional text fields
        validateOptionalText(args.location, 'Location', 255);
        validateOptionalText(args.description, 'Description', 2000);
        validateOptionalText(args.address, 'Address', 255);
        validateOptionalText(args.city, 'City', 100);
        validateOptionalText(args.state, 'State', 100);
        validateOptionalText(args.zipCode, 'Zip code', 20);
        validateOptionalText(args.country, 'Country', 100);
        validateOptionalText(args.houseRules, 'House rules', 2000);
        
        // Validate coordinates
        validateCoordinates(args.latitude, args.longitude);
        
        // Validate numbers
        validatePositiveInteger(args.maxGuests, 'Max guests', 50);
        validatePositiveInteger(args.bedrooms, 'Bedrooms', 20);
        validatePositiveInteger(args.bathrooms, 'Bathrooms', 20);
        
        // Validate arrays
        if (args.amenities && !Array.isArray(args.amenities)) {
          throw new Error('Amenities must be an array');
        }
        if (args.photos && !Array.isArray(args.photos)) {
          throw new Error('Photos must be an array');
        }

        const newHostId = uuidv4();
        insertHost.run(
          newHostId,
          args.userId,
          args.name,
          args.location,
          args.description,
          args.address,
          args.city,
          args.state,
          args.zipCode,
          args.country,
          args.latitude,
          args.longitude,
          args.amenities ? JSON.stringify(args.amenities) : null,
          args.houseRules,
          args.checkInTime,
          args.checkOutTime,
          args.maxGuests,
          args.bedrooms,
          args.bathrooms,
          args.photos ? JSON.stringify(args.photos) : null
        );
        return {
          id: newHostId,
          user_id: args.userId,
          name: args.name,
          location: args.location,
          description: args.description,
          address: args.address,
          city: args.city,
          state: args.state,
          zip_code: args.zipCode,
          country: args.country,
          latitude: args.latitude,
          longitude: args.longitude,
          amenities: args.amenities ? JSON.stringify(args.amenities) : null,
          house_rules: args.houseRules,
          check_in_time: args.checkInTime,
          check_out_time: args.checkOutTime,
          max_guests: args.maxGuests,
          bedrooms: args.bedrooms,
          bathrooms: args.bathrooms,
          photos: args.photos ? JSON.stringify(args.photos) : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any;
      } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          throw new Error('A host with this information already exists');
        }
        throw error;
      }
    },
    createAvailability: (_: any, args: any, context: AuthContext): GeneratedAvailability => {
      // Creating availability requires authentication
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
  // Validate required fields
  validateUUID(args.hostId, 'Host ID');
      validateDateRange(args.startDate, args.endDate);
      
      // Ensure user owns the host
      const host = getHostById.get(args.hostId) as any;
      if (!host || host.user_id !== context.user.id) {
        throw new Error('Unauthorized: Can only manage availability for your own hosts');
      }
      
      // Validate optional fields
      if (args.status) {
        validateStatus(args.status, ['available', 'unavailable', 'booked']);
      }
      validateOptionalText(args.notes, 'Notes', 500);

      const newAvailabilityId = uuidv4();
      insertAvailability.run(
        newAvailabilityId,
        args.hostId,
        args.startDate,
        args.endDate,
        args.status || 'available',
        args.notes
      );
      return {
        id: newAvailabilityId,
        host_id: args.hostId,
        start_date: args.startDate,
        end_date: args.endDate,
        status: args.status || 'available',
        notes: args.notes || null,
      } as GeneratedAvailability;
    },
    createBookingRequest: (_: any, args: any, context: AuthContext): GeneratedBookingRequest => {
      // Creating booking requests requires authentication
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
  // Validate required fields
  validateUUID(args.hostId, 'Host ID');
      if (!args.requesterId) {
        throw new Error('Requester ID is required');
      }
      
      // Ensure user can only create booking requests for themselves
      if (args.requesterId !== context.user.id) {
        throw new Error('Unauthorized: Can only create booking requests for yourself');
      }
      
      validateDateRange(args.startDate, args.endDate);
      validatePositiveInteger(args.guests, 'Guests count', 50);
      
      // Validate optional fields
      validateOptionalText(args.message, 'Message', 1000);

      const newBookingId = uuidv4();
      insertBookingRequest.run(
        newBookingId,
        args.hostId,
        args.requesterId,
        args.startDate,
        args.endDate,
        args.guests,
        args.message,
        'pending'
      );
      return {
        id: newBookingId,
        host_id: args.hostId,
        requester_id: args.requesterId,
        start_date: args.startDate,
        end_date: args.endDate,
        guests: args.guests,
        message: args.message,
        status: 'pending',
        created_at: new Date().toISOString(),
      } as GeneratedBookingRequest;
    },
    updateBookingRequestStatus: (_: any, { id, status, responseMessage }: { id: string, status: string, responseMessage?: string }, context: AuthContext): GeneratedBookingRequest => {
      // Updating booking request status requires authentication
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
      // Validate status
      validateStatus(status, ['pending', 'approved', 'declined', 'cancelled']);

      // Get current booking request to check it exists and get details for availability update
      const bookingRequest = getBookingRequestById.get(id) as any;
      if (!bookingRequest) {
        throw new Error('Booking request not found');
      }

      // Check if user owns the host for this booking request
      const host = getHostById.get(bookingRequest.host_id) as any;
      if (!host || host.user_id !== context.user.id) {
        throw new Error('Unauthorized: Can only update booking requests for your own hosts');
      }

      // Update the booking request status
      updateBookingRequestStatus.run(status, responseMessage || null, id);

      // If approved, update availability to mark dates as booked
      if (status === 'approved') {
        // First check if there are overlapping availabilities for these dates
        const overlappingAvailabilities = getAvailabilitiesByDateRange.all(bookingRequest.end_date, bookingRequest.start_date);
        
        if (overlappingAvailabilities.length === 0) {
          // No existing availability period, create a new one marked as booked
          insertAvailability.run(
            bookingRequest.host_id,
            bookingRequest.start_date,
            bookingRequest.end_date,
            'booked',
            `Booked by ${bookingRequest.requester_name || bookingRequest.requester_email}`
          );
        } else {
          // Update existing availability periods to booked status
          // This is a simplified approach - in production you might want more sophisticated availability management
          const Database = BetterSqlite3;
          const dbPath = Path.join(__dirname, '..', 'database.db');
          const tempDb = new Database(dbPath);
          
          try {
            tempDb.prepare(`
              UPDATE availabilities 
              SET status = 'booked', notes = ?
              WHERE host_id = ? 
              AND start_date <= ? 
              AND end_date >= ?
              AND status = 'available'
            `).run(
              `Booked by ${bookingRequest.requester_name || bookingRequest.requester_email}`,
              bookingRequest.host_id,
              bookingRequest.end_date,
              bookingRequest.start_date
            );
          } finally {
            tempDb.close();
          }
        }
      }

      // Return updated booking request
      return getBookingRequestById.get(id) as GeneratedBookingRequest;
    },
    checkEmailExists: (_: any, { email }: { email: string }) => {
      validateEmail(email);
      const user = getUserByEmail.get(email);
      return !!user;
    },
    sendInvitationEmail: (_: any, { email, invitationUrl }: { email: string, invitationUrl: string }) => {
      validateEmail(email);
      if (!invitationUrl || typeof invitationUrl !== 'string') {
        throw new Error('Invitation URL is required');
      }
      // In a real implementation, you'd integrate with an email service like SendGrid, Mailgun, etc.
      // For now, we'll just log the invitation and return the URL for testing
            
      return invitationUrl;
    },
    updateHost: (_: any, { id, input }: { id: string, input: any }, context: AuthContext): GeneratedHost | undefined => {
      // Updating hosts requires authentication
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
      // Ensure user can only update their own hosts
      const host = getHostById.get(id) as any;
      if (!host || host.user_id !== context.user.id) {
        throw new Error('Unauthorized: Can only update your own hosts');
      }
      
      const db = BetterSqlite3(Path.join(__dirname, '..', 'database.db'));

      try {
        // Validate fields if provided
        if (input.name !== undefined) validateName(input.name);
        
        // Validate optional text fields if provided
        if (input.location !== undefined) validateOptionalText(input.location, 'Location', 255);
        if (input.description !== undefined) validateOptionalText(input.description, 'Description', 2000);
        if (input.address !== undefined) validateOptionalText(input.address, 'Address', 255);
        if (input.city !== undefined) validateOptionalText(input.city, 'City', 100);
        if (input.state !== undefined) validateOptionalText(input.state, 'State', 100);
        if (input.zipCode !== undefined) validateOptionalText(input.zipCode, 'Zip code', 20);
        if (input.country !== undefined) validateOptionalText(input.country, 'Country', 100);
        if (input.houseRules !== undefined) validateOptionalText(input.houseRules, 'House rules', 2000);
        
        // Validate coordinates if provided
        if (input.latitude !== undefined || input.longitude !== undefined) {
          validateCoordinates(input.latitude, input.longitude);
        }
        
        // Validate numbers if provided
        if (input.maxGuests !== undefined) validatePositiveInteger(input.maxGuests, 'Max guests', 50);
        if (input.bedrooms !== undefined) validatePositiveInteger(input.bedrooms, 'Bedrooms', 20);
        if (input.bathrooms !== undefined) validatePositiveInteger(input.bathrooms, 'Bathrooms', 20);
        
        // Validate arrays if provided
        if (input.amenities !== undefined && !Array.isArray(input.amenities)) {
          throw new Error('Amenities must be an array');
        }
        if (input.photos !== undefined && !Array.isArray(input.photos)) {
          throw new Error('Photos must be an array');
        }
        
        // Validate availabilities if provided
        if (input.availabilities !== undefined) {
          if (!Array.isArray(input.availabilities)) {
            throw new Error('Availabilities must be an array');
          }
          for (const availability of input.availabilities) {
            validateDateRange(availability.startDate, availability.endDate);
            if (availability.status) {
              validateStatus(availability.status, ['available', 'unavailable', 'booked']);
            }
            if (availability.notes !== undefined) {
              validateOptionalText(availability.notes, 'Availability notes', 500);
            }
          }
        }

        // Build dynamic update query based on provided fields
        const updates = []
        const values = []

        if (input.name !== undefined) {
          updates.push('name = ?')
          values.push(input.name)
        }
        if (input.location !== undefined) {
          updates.push('location = ?')
          values.push(input.location)
        }
        if (input.description !== undefined) {
          updates.push('description = ?')
          values.push(input.description)
        }
        if (input.address !== undefined) {
          updates.push('address = ?')
          values.push(input.address)
        }
        if (input.city !== undefined) {
          updates.push('city = ?')
          values.push(input.city)
        }
        if (input.state !== undefined) {
          updates.push('state = ?')
          values.push(input.state)
        }
        if (input.zipCode !== undefined) {
          updates.push('zip_code = ?')
          values.push(input.zipCode)
        }
        if (input.country !== undefined) {
          updates.push('country = ?')
          values.push(input.country)
        }
        if (input.latitude !== undefined) {
          updates.push('latitude = ?')
          values.push(input.latitude)
        }
        if (input.longitude !== undefined) {
          updates.push('longitude = ?')
          values.push(input.longitude)
        }
        if (input.amenities !== undefined) {
          updates.push('amenities = ?')
          values.push(input.amenities ? JSON.stringify(input.amenities) : null)
        }
        if (input.houseRules !== undefined) {
          updates.push('house_rules = ?')
          values.push(input.houseRules)
        }
        if (input.checkInTime !== undefined) {
          updates.push('check_in_time = ?')
          values.push(input.checkInTime)
        }
        if (input.checkOutTime !== undefined) {
          updates.push('check_out_time = ?')
          values.push(input.checkOutTime)
        }
        if (input.maxGuests !== undefined) {
          updates.push('max_guests = ?')
          values.push(input.maxGuests)
        }
        if (input.bedrooms !== undefined) {
          updates.push('bedrooms = ?')
          values.push(input.bedrooms)
        }
        if (input.bathrooms !== undefined) {
          updates.push('bathrooms = ?')
          values.push(input.bathrooms)
        }
      if (input.photos !== undefined) {
        // Delete files that were removed from the photos list (only local uploads)
        try {
          const existingHost: any = getHostById.get(id);
          const existingPhotos = existingHost && existingHost.photos ? JSON.parse(existingHost.photos || '[]') : [];
          const newPhotos = input.photos || [];
          const removed = existingPhotos.filter((p: string) => !newPhotos.includes(p));
          const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
          for (const removedUrl of removed) {
            try {
              // Only delete files that point to our uploads directory
              if (typeof removedUrl === 'string' && removedUrl.includes('/uploads/')) {
                const fileName = path.basename(removedUrl);
                const filePath = path.join(uploadsDir, fileName);
                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
                }
              }
            } catch (e) {
              // Log and continue - do not fail the whole update for filesystem issues
              console.error('Failed to delete removed photo file', removedUrl, e);
            }
          }
        } catch (e) {
          console.error('Error while cleaning up removed photos:', e);
        }

        updates.push('photos = ?')
        values.push(input.photos ? JSON.stringify(input.photos) : null)
      }
        if (updates.length === 0) {
          // No updates provided, return current host
          return getHostById.get(id) as GeneratedHost | undefined
        }

        const updateQuery = `UPDATE hosts SET ${updates.join(', ')} WHERE id = ?`
        values.push(id)

        db.prepare(updateQuery).run(...values)

        // Handle availabilities update
        if (input.availabilities !== undefined) {
          // Delete existing availabilities for this host
          db.prepare('DELETE FROM availabilities WHERE host_id = ?').run(id)

          // Insert new availabilities
          const insertAvailabilityStmt = db.prepare(`
            INSERT INTO availabilities (host_id, start_date, end_date, status, notes)
            VALUES (?, ?, ?, ?, ?)
          `)

          for (const availability of input.availabilities) {
            insertAvailabilityStmt.run(
              id,
              availability.startDate,
              availability.endDate,
              availability.status || 'available',
              availability.notes || null
            )
          }
        }

        // Return updated host
        return getHostById.get(id) as GeneratedHost | undefined
      } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          throw new Error('A host with this email already exists');
        }
        throw error;
      } finally {
        db.close()
      }
    },
    deleteHost: (_: any, { id }: { id: string }, context: AuthContext) => {
      // Deleting hosts requires authentication
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
      // Ensure user can only delete their own hosts
      const host = getHostById.get(id) as any;
      if (!host || host.user_id !== context.user.id) {
        throw new Error('Unauthorized: Can only delete your own hosts');
      }
      
      const db = BetterSqlite3(Path.join(__dirname, '..', 'database.db'));

      try {
        // Delete availabilities first (foreign key constraint)
        db.prepare('DELETE FROM availabilities WHERE host_id = ?').run(id)

        // Delete booking requests
        db.prepare('DELETE FROM booking_requests WHERE host_id = ?').run(id)

        // Delete the host
        const result = db.prepare('DELETE FROM hosts WHERE id = ?').run(id)

        return result.changes > 0
      } catch (error) {
        console.log('error: ', error);      
        return false
      } finally {
        db.close()
      }
    },
    createUser: (_: any, { email, name, image }: { email: string, name?: string, image?: string }, context: AuthContext): GeneratedUser => {
      // Creating users requires authentication (called from auth callback)
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
      // Generate a unique string ID for the new user
  const newUserId = uuidv4();
      
  insertUser.run(newUserId, email, name, null, image);
      const created: GeneratedUser = {
        id: newUserId,
        email,
        name,
        image,
        created_at: new Date().toISOString(),
      } as any;
      return created as any;
    },
    updateUser: (_: any, { id, name, image }: { id: string, name?: string, image?: string }, context: AuthContext): GeneratedUser => {
      // Updating user requires authentication
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
      // Ensure user can only update their own profile
      // Allow update if the authenticated user's id matches the target id
      // OR if the authenticated user's email matches the target user's email.
      if (context.user.id !== id) {
        // Try email-based match as a fallback (useful when token contains email but not backendUserId)
        try {
          const targetUser: any = getUserById.get(id);
          const authenticatedEmail = context.user.email || '';
          if (!targetUser || !authenticatedEmail || targetUser.email !== authenticatedEmail) {
            throw new Error('Unauthorized: Can only update your own profile');
          }
        } catch {
          throw new Error('Unauthorized: Can only update your own profile');
        }
      }
      
      updateUser.run(name, image, id);
      return getUserById.get(id) as GeneratedUser;
    },
    createConnection: (_: any, { userId, connectedUserEmail, relationship }: { userId: string, connectedUserEmail: string, relationship?: string }, context: AuthContext): GeneratedConnection => {
      // Creating connections requires authentication
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
      // Ensure user can only create connections for themselves
      if (context.user.id !== userId) {
        throw new Error('Unauthorized: Can only create connections for yourself');
      }
      
      // Validate required fields
      if (!userId) {
        throw new Error('User ID is required');
      }
      validateEmail(connectedUserEmail);
      
      // Validate optional relationship field
      validateOptionalText(relationship, 'Relationship', 50);

      const connectedUser = getUserByEmail.get(connectedUserEmail) as any;
      if (!connectedUser) {
        throw new Error('User with this email not found');
      }
      
      const newConnectionId = uuidv4();
      insertConnection.run(newConnectionId, userId, connectedUser.id, relationship, 'pending');
      return {
        id: newConnectionId,
        user_id: userId,
        connected_user_id: connectedUser.id,
        relationship,
        status: 'pending',
        created_at: new Date().toISOString(),
      } as unknown as GeneratedConnection;
    },
    updateConnectionStatus: (_: any, { connectionId, status }: { connectionId: string, status: string }, context: AuthContext): GeneratedConnection | undefined => {
      // Updating connection status requires authentication
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
  // Validate required fields
  validateUUID(connectionId, 'Connection ID');
      validateStatus(status, ['pending', 'accepted', 'declined', 'cancelled']);

      // Check if user is part of this connection
      const db = BetterSqlite3(Path.join(__dirname, '..', 'database.db'));
      const connection = db.prepare('SELECT * FROM connections WHERE id = ?').get(connectionId) as any;
      db.close();
      
      if (!connection) {
        throw new Error('Connection not found');
      }
      
      if (connection.user_id !== context.user.id && connection.connected_user_id !== context.user.id) {
        throw new Error('Unauthorized: Can only update connections you are part of');
      }

      const result = updateConnectionStatus.run(status, connectionId);
      console.log('result: ', result);
      // Return the updated connection
      const db2 = BetterSqlite3(Path.join(__dirname, '..', 'database.db'));
      const updatedConnection = db2.prepare('SELECT * FROM connections WHERE id = ?').get(connectionId);
      db2.close();
      return updatedConnection as GeneratedConnection | undefined;
    },
    deleteConnection: (_: any, { connectionId }: { connectionId: string }, context: AuthContext) => {
      // Deleting connections requires authentication
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
  // Validate
  validateUUID(connectionId, 'Connection ID');

      // Use central prepared statements where possible
      const connRow: any = getConnectionById.get(connectionId);
      if (!connRow) {
        throw new Error('Connection not found');
      }

      // Check if user is part of this connection
      if (connRow.user_id !== context.user.id && connRow.connected_user_id !== context.user.id) {
        throw new Error('Unauthorized: Can only delete connections you are part of');
      }

      // Only allow deletion of accepted (verified) connections via this flow
      if (connRow.status !== 'accepted') {
        throw new Error('Only accepted connections can be removed via this operation');
      }

      try {
        // Delete both directions (if present) to fully remove the relationship
        const result = deleteConnectionsBetweenUsers.run(connRow.user_id, connRow.connected_user_id, connRow.user_id, connRow.connected_user_id);
        // If the above didn't remove the reciprocal row (because user/connected_user order differs), also attempt by swapping
        if (result.changes === 0) {
          deleteConnectionsBetweenUsers.run(connRow.connected_user_id, connRow.user_id, connRow.connected_user_id, connRow.user_id);
        }
        return true;
      } catch (e) {
        console.error('Failed to delete connection', e);
        return false;
      }
    },
    createInvitation: (_: any, { inviterId, inviteeEmail, message }: { inviterId: string, inviteeEmail: string, message?: string }, context: AuthContext): GeneratedInvitation => {
      // Creating invitations requires authentication
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
      // Ensure user can only create invitations for themselves
      if (context.user.id !== inviterId) {
        throw new Error('Unauthorized: Can only create invitations for yourself');
      }
      
      // Validate required fields
      if (!inviterId) {
        throw new Error('Inviter ID is required');
      }
      validateEmail(inviteeEmail);
      
      // Validate optional fields
      validateOptionalText(message, 'Invitation message', 500);

      // Check if user is already registered
      const existingUser = getUserByEmail.get(inviteeEmail) as any;
      if (existingUser) {
        // User already exists - create a connection request instead
        
        // Check if there's already a connection between these users
        const existingConnection = getConnectionBetweenUsers.get(
          inviterId, 
          existingUser.id, 
          existingUser.id, 
          inviterId
        );
        
        if (existingConnection) {
          throw new Error('Users are already connected or have a pending connection');
        }

        // Create a connection request
        const newConnId = uuidv4();
        insertConnection.run(newConnId, inviterId, existingUser.id, 'friend', 'pending');
        
        // Return a mock invitation-like response to maintain API compatibility
        return {
          id: newConnId,
          // inviterId may be a user id string; preserve as string
          inviter_id: inviterId,
          invitee_email: inviteeEmail,
          message: message || `Connection request sent to ${existingUser.name || inviteeEmail}`,
          token: 'connection-request', // Mock token to indicate this was a connection request
          status: 'connection-sent',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          created_at: new Date().toISOString(),
        } as GeneratedInvitation;
      }

      // Check for existing pending invitation
      const existingInvitation = getInvitationByEmail.get(inviteeEmail);
      if (existingInvitation) {
        throw new Error('Invitation already sent to this email');
      }
      
      // Generate unique token
      const token = Crypto.randomBytes(32).toString('hex');
      
      // Set expiration to 30 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const newInvitationId = uuidv4();
      insertInvitation.run(
        newInvitationId,
        inviterId,
        inviteeEmail,
        message,
        token,
        expiresAt.toISOString()
      );

      const invitation = {
        inviter_id: String(inviterId),
        invitee_email: inviteeEmail,
        message,
        token,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      } as GeneratedInvitation;

      // Send invitation email
      // const invitationUrl = `http://localhost:3000/invite/${token}`;
      // // For now, we'll just log the invitation and return the URL for testing
      // console.log('Invitation created:', { email: inviteeEmail, url: invitationUrl });

      return invitation;
    },
    acceptInvitation: (_: any, { token, userData }: { token: string, userData: any }, context: AuthContext) => {
      // Accepting invitations requires authentication
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
      // Validate token
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid token format');
      }
      
      // Validate userData
      if (userData.name) validateName(userData.name);
      validateOptionalText(userData.image, 'Image URL', 255);

      const invitation = getInvitationByToken.get(token) as any;
      if (!invitation) {
        throw new Error('Invalid invitation token');
      }

      if (invitation.status !== 'pending') {
        throw new Error('Invitation has already been used or cancelled');
      }

      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('Invitation has expired');
      }

      // Ensure the authenticated user matches the invitee
      if (context.user.email !== invitation.invitee_email) {
        throw new Error('Unauthorized: Can only accept invitations sent to your email');
      }

      // Check if user already exists
      const existingUser = getUserByEmail.get(invitation.invitee_email) as any;
      if (existingUser) {
        // User already exists - create a connection request instead
        
        // Check if there's already a connection between these users
        const existingConnection = getConnectionBetweenUsers.get(
          invitation.inviter_id, 
          existingUser.id, 
          existingUser.id, 
          invitation.inviter_id
        );
        
        if (existingConnection) {
          throw new Error('Users are already connected or have a pending connection');
        }

        // Create a connection request from inviter to existing user
        insertConnection.run(invitation.inviter_id, existingUser.id, 'friend', 'pending');
        
        // Update invitation status to accepted (since it served its purpose)
        updateInvitationStatus.run('accepted', new Date().toISOString(), invitation.id);
        
        // Return the existing user
        return existingUser;
      }

      // Create new user (original logic)
      // Generate a unique string ID for the new user
      const newUserId = uuidv4();
      
      insertUser.run(
        newUserId,
        invitation.invitee_email,
        userData.name,
        new Date().toISOString(), // email_verified
        userData.image
      );

      // Update invitation status
      updateInvitationStatus.run('accepted', new Date().toISOString(), invitation.id);

      // Create automatic connection between inviter and new user
      insertConnection.run(invitation.inviter_id, newUserId, 'friend', 'accepted');
      insertConnection.run(newUserId, invitation.inviter_id, 'friend', 'accepted');

      // Return the DB row (snake_case) so field resolvers can map to GraphQL fields
      const userRow = getUserById.get(newUserId);
      return userRow;
    },
    cancelInvitation: (_: any, { invitationId }: { invitationId: string }, context: AuthContext) => {
      // Cancelling invitations requires authentication
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
  // Validate required field
  validateUUID(invitationId, 'Invitation ID');

      // Get invitation to check ownership
      const invitation = getInvitationById.get(invitationId) as any;
      if (!invitation) {
        throw new Error('Invitation not found');
      }

      // Ensure user can only cancel their own invitations
      if (invitation.inviter_id !== context.user.id) {
        throw new Error('Unauthorized: Can only cancel your own invitations');
      }

      const result = updateInvitationStatus.run('cancelled', null, invitationId);
      return result.changes > 0;
    },
    deleteInvitation: (_: any, { invitationId }: { invitationId: string }, context: AuthContext) => {
      // Deleting invitations requires authentication
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
  // Validate required field
  validateUUID(invitationId, 'Invitation ID');

      // Get invitation to check ownership
      const invitation = getInvitationById.get(invitationId) as any;
      if (!invitation) {
        throw new Error('Invitation not found');
      }

      // Ensure user can only delete their own invitations
      if (invitation.inviter_id !== context.user.id) {
        throw new Error('Unauthorized: Can only delete your own invitations');
      }

      if (invitation.status !== 'pending' && invitation.status !== 'cancelled') {
        throw new Error('Only pending or cancelled invitations can be deleted');
      }

      const result = deleteInvitation.run(invitationId);
      return result.changes > 0;
    },
  },
  Host: {
    name: (parent: any) => parent.name,
    createdAt: (parent: any) => parent.created_at || new Date().toISOString(),
    updatedAt: (parent: any) => parent.updated_at || new Date().toISOString(),
    user: (parent: any) => {
      // If user_id exists, get the user
      if (parent.user_id) {
        const user = getUserById.get(parent.user_id);
        if (user) return user;
      }
      // Fallback: try to find user by email, or create a default user object
      if (parent.email) {
        const user = getUserByEmail.get(parent.email);
        if (user) return user;
      }
      // Return a default user object if no user found
      return {
        id: '1',
        name: parent.name,
        email: parent.email || 'unknown@example.com',
        createdAt: new Date().toISOString(),
      };
    },
    availabilities: (parent: any) => {
      return getHostAvailabilities.all(parent.id);
    },
    userId: (parent: Host) => parent.user_id,
    zipCode: (parent: Host) => parent.zip_code,
    houseRules: (parent: Host) => parent.house_rules,
    checkInTime: (parent: Host) => parent.check_in_time,
    checkOutTime: (parent: Host) => parent.check_out_time,
    maxGuests: (parent: Host) => parent.max_guests,
    amenities: (parent: Host) => {
      if (!parent.amenities) return [];
      if (Array.isArray(parent.amenities)) return parent.amenities;
      try {
        return JSON.parse(parent.amenities);
      } catch {
        return [];
      }
    },
    photos: (parent: Host) => {
      if (!parent.photos) return [];
      if (Array.isArray(parent.photos)) return parent.photos;
      try {
        return JSON.parse(parent.photos);
      } catch {
        return [];
      }
    },
  },
  Availability: {
    host: (parent: Availability) => {
      return getHostById.get(parent.host_id);
    },
    startDate: (parent: Availability) => parent.start_date,
    endDate: (parent: Availability) => parent.end_date,
    hostId: (parent: Availability) => parent.host_id,
  },
  BookingRequest: {
    host: (parent: BookingRequest) => {
      return getHostById.get(parent.host_id);
    },
    hostId: (parent: BookingRequest) => parent.host_id,
    requesterId: (parent: BookingRequest) => parent.requester_id,
    requester: (parent: BookingRequest) => {
      const user = getUserById.get(parent.requester_id);
      if (!user) {
        // Return a placeholder user object if the requester doesn't exist
        // This prevents GraphQL errors for orphaned booking requests
        return {
          id: parent.requester_id,
          email: 'unknown@example.com',
          name: 'Unknown User',
          image: null,
          email_verified: null,
          created_at: new Date().toISOString(),
        };
      }
      return user;
    },
    startDate: (parent: BookingRequest) => parent.start_date,
    endDate: (parent: BookingRequest) => parent.end_date,
    createdAt: (parent: BookingRequest) => parent.created_at,
    responseMessage: (parent: BookingRequest) => parent.response_message,
    respondedAt: (parent: BookingRequest) => parent.responded_at,
  },
  User: {
    emailVerified: (parent: User) => parent.email_verified,
    createdAt: (parent: User) => parent.created_at,
  },
  Connection: {
    connectedUser: (parent: Connection) => {
      return getUserById.get(parent.connected_user_id);
    },
    createdAt: (parent: Connection) => parent.created_at,
    userId: (parent: Connection) => parent.user_id,
    connectedUserId: (parent: Connection) => parent.connected_user_id,
  },
  Invitation: {
    inviterId: (parent: Invitation) => parent.inviter_id,
    inviteeEmail: (parent: Invitation) => parent.invitee_email,
    expiresAt: (parent: Invitation) => parent.expires_at,
    acceptedAt: (parent: Invitation) => parent.accepted_at,
    createdAt: (parent: Invitation) => parent.created_at,
    inviter: (parent: Invitation) => {
      return getUserById.get(parent.inviter_id);
    },
  },
};