export const typeDefs = `#graphql
  type Host {
    id: ID!
    name: String!
    title: String! # Alias for name to match frontend expectations
    email: String
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
    inviteeName: String
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
      endDate: String
      location: String
      amenities: [String!]
      trustedOnly: Boolean
      guests: Int
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
      userId: ID
      name: String!
      email: String!
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
    createInvitation(inviterId: ID!, inviteeEmail: String!, inviteeName: String, message: String): Invitation!
    acceptInvitation(token: String!, userData: AcceptInvitationInput!): User!
    cancelInvitation(invitationId: ID!): Boolean!
  }

  input CreateListingInput {
    title: String!
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
    email: String
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

import { getAllHosts, getHostById, getHostByEmail, searchHosts, insertHost, getHostAvailabilities, getAvailabilitiesByDateRange, insertAvailability, getAvailabilityDates, insertBookingRequest, getBookingRequestsByHost, getBookingRequestsByRequester, updateBookingRequestStatus, getBookingRequestById, getPendingBookingRequestsCountByHostUser, getUserByEmail, getUserById, insertUser, updateUser, getConnections, getConnectionRequests, insertConnection, updateConnectionStatus, insertInvitation, getInvitationByToken, getInvitationsByInviter, updateInvitationStatus, getInvitationByEmail } from './db';
import fs from 'fs';
import path from 'path';

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
    hosts: () => getAllHosts.all(),
    searchHosts: (_: any, { query }: { query: string }) => {
      const searchTerm = `%${query}%`;
      return searchHosts.all(searchTerm, searchTerm);
    },
    host: (_: any, { id }: { id: string }) => {
      return getHostById.get(id);
    },
    searchHostsAdvanced: (_: any, args: any) => {
      // For now, use the basic search - can be enhanced later
      if (args.query) {
        const searchTerm = `%${args.query}%`;
        return searchHosts.all(searchTerm, searchTerm);
      }
      // If no query, return all hosts
      return getAllHosts.all();
    },
    availabilitiesByDate: (_: any, { date }: { date: string }) => {
      return getAvailabilitiesByDateRange.all(date, date);
    },
    availabilitiesByDateRange: (_: any, { startDate, endDate }: { startDate: string, endDate: string }) => {
      return getAvailabilitiesByDateRange.all(endDate, startDate);
    },
    hostAvailabilities: (_: any, { hostId }: { hostId: string }) => {
      return getHostAvailabilities.all(hostId);
    },
    availabilityDates: (_: any, { startDate, endDate }: { startDate: string, endDate: string }) => {
      const results = getAvailabilityDates.all(startDate, endDate, endDate, startDate) as { date: string }[];
      return results.map(row => row.date);
    },
    user: (_: any, { email }: { email: string }) => {
      return getUserByEmail.get(email);
    },
    connections: (_: any, { userId }: { userId: string }) => {
      return getConnections.all(userId);
    },
    connectionRequests: (_: any, { userId }: { userId: string }) => {
      return getConnectionRequests.all(userId);
    },
    invitation: (_: any, { token }: { token: string }) => {
      return getInvitationByToken.get(token);
    },
    invitations: (_: any, { inviterId }: { inviterId: string }) => {
      return getInvitationsByInviter.all(inviterId);
    },
    bookingRequestsByHost: (_: any, { hostId }: { hostId: string }) => {
      return getBookingRequestsByHost.all(hostId);
    },
    bookingRequestsByRequester: (_: any, { requesterId }: { requesterId: string }) => {
      return getBookingRequestsByRequester.all(requesterId);
    },
    bookingRequestsByHostUser: (_: any, { userId }: { userId: string }) => {
      // Get all booking requests for hosts owned by this user
      const allHosts = getAllHosts.all();
      const userHosts = allHosts.filter((host: any) => host.user_id === parseInt(userId));
      const allRequests: any[] = [];
      
      for (const host of userHosts) {
        const requests = getBookingRequestsByHost.all((host as any).id);
        allRequests.push(...requests);
      }
      
      // Sort by created_at desc
      return allRequests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    pendingBookingRequestsCount: (_: any, { userId }: { userId: string }) => {
      const result = getPendingBookingRequestsCountByHostUser.get(userId) as any;
      return result?.count || 0;
    },
  },
  Mutation: {
    createHost: (_: any, args: any) => {
      try {
        // Validate required fields
        validateName(args.name);
        if (args.email) validateEmail(args.email);
        
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

        const result = insertHost.run(
          args.userId || null, // user_id - should be provided by authentication context
          args.name,
          args.email,
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
          id: result.lastInsertRowid,
          ...args,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          throw new Error('A host with this email already exists');
        }
        throw error;
      }
    },
    createAvailability: (_: any, args: any) => {
      // Validate required fields
      validatePositiveInteger(parseInt(args.hostId), 'Host ID');
      validateDateRange(args.startDate, args.endDate);
      
      // Validate optional fields
      if (args.status) {
        validateStatus(args.status, ['available', 'unavailable', 'booked']);
      }
      validateOptionalText(args.notes, 'Notes', 500);

      const result = insertAvailability.run(
        parseInt(args.hostId),
        args.startDate,
        args.endDate,
        args.status || 'available',
        args.notes
      );
      return {
        id: result.lastInsertRowid.toString(),
        host_id: parseInt(args.hostId),
        start_date: args.startDate,
        end_date: args.endDate,
        status: args.status || 'available',
        notes: args.notes || null,
      };
    },
    createBookingRequest: (_: any, args: any) => {
      // Validate required fields
      validatePositiveInteger(parseInt(args.hostId), 'Host ID');
      validatePositiveInteger(parseInt(args.requesterId), 'Requester ID');
      validateDateRange(args.startDate, args.endDate);
      validatePositiveInteger(args.guests, 'Guests count', 50);
      
      // Validate optional fields
      validateOptionalText(args.message, 'Message', 1000);

      const result = insertBookingRequest.run(
        parseInt(args.hostId),
        parseInt(args.requesterId),
        args.startDate,
        args.endDate,
        args.guests,
        args.message,
        'pending'
      );
      return {
        id: result.lastInsertRowid.toString(),
        host_id: parseInt(args.hostId),
        requester_id: parseInt(args.requesterId),
        start_date: args.startDate,
        end_date: args.endDate,
        guests: args.guests,
        message: args.message,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
    },
    updateBookingRequestStatus: (_: any, { id, status, responseMessage }: { id: string, status: string, responseMessage?: string }) => {
      // Validate status
      validateStatus(status, ['pending', 'approved', 'declined', 'cancelled']);

      // Get current booking request to check it exists and get details for availability update
      const bookingRequest = getBookingRequestById.get(id) as any;
      if (!bookingRequest) {
        throw new Error('Booking request not found');
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
          const Database = require('better-sqlite3');
          const dbPath = require('path').join(__dirname, '..', 'database.db');
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
      return getBookingRequestById.get(id);
    },
    checkEmailExists: (_: any, { email }: { email: string }) => {
      validateEmail(email);
      const host = getHostByEmail.get(email);
      return !!host;
    },
    sendInvitationEmail: (_: any, { email, invitationUrl }: { email: string, invitationUrl: string }) => {
      validateEmail(email);
      if (!invitationUrl || typeof invitationUrl !== 'string') {
        throw new Error('Invitation URL is required');
      }
      // In a real implementation, you'd integrate with an email service like SendGrid, Mailgun, etc.
      // For now, we'll just log the invitation and return the URL for testing
      
      console.log(`Invitation email would be sent to ${email} with URL: ${invitationUrl}`);
      
      return invitationUrl;
    },
    updateHost: (_: any, { id, input }: { id: string, input: any }) => {
      const db = require('better-sqlite3')(require('path').join(__dirname, '..', 'database.db'));

      try {
        // Validate fields if provided
        if (input.name !== undefined) validateName(input.name);
        if (input.email !== undefined) validateEmail(input.email);
        
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
          const existingPhotos = existingHost && existingHost.photos ? JSON.parse(existingHost.photos) : [];
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
      if (input.email !== undefined) {
        updates.push('email = ?')
        values.push(input.email)
      }        
        if (updates.length === 0) {
          // No updates provided, return current host
          return getHostById.get(id)
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
        return getHostById.get(id)
      } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          throw new Error('A host with this email already exists');
        }
        throw error;
      } finally {
        db.close()
      }
    },
    deleteHost: (_: any, { id }: { id: string }) => {
      const db = require('better-sqlite3')(require('path').join(__dirname, '..', 'database.db'));

      try {
        // Delete availabilities first (foreign key constraint)
        db.prepare('DELETE FROM availabilities WHERE host_id = ?').run(id)

        // Delete booking requests
        db.prepare('DELETE FROM booking_requests WHERE host_id = ?').run(id)

        // Delete the host
        const result = db.prepare('DELETE FROM hosts WHERE id = ?').run(id)

        return result.changes > 0
      } catch (error) {
        
        return false
      } finally {
        db.close()
      }
    },
    createUser: (_: any, { email, name, image }: { email: string, name?: string, image?: string }) => {
      const result = insertUser.run(email, name, null, image);
      return {
        id: result.lastInsertRowid,
        email,
        name,
        image,
        createdAt: new Date().toISOString(),
      };
    },
    updateUser: (_: any, { id, name, image }: { id: string, name?: string, image?: string }) => {
      updateUser.run(name, image, id);
      return getUserById.get(id);
    },
    createConnection: (_: any, { userId, connectedUserEmail, relationship }: { userId: string, connectedUserEmail: string, relationship?: string }) => {
      // Validate required fields
      validatePositiveInteger(parseInt(userId), 'User ID');
      validateEmail(connectedUserEmail);
      
      // Validate optional relationship field
      validateOptionalText(relationship, 'Relationship', 50);

      const connectedUser = getUserByEmail.get(connectedUserEmail) as any;
      if (!connectedUser) {
        throw new Error('User with this email not found');
      }
      
      const result = insertConnection.run(userId, connectedUser.id, relationship, 'pending');
      return {
        id: result.lastInsertRowid,
        userId,
        connectedUserId: connectedUser.id,
        relationship,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
    },
    updateConnectionStatus: (_: any, { connectionId, status }: { connectionId: string, status: string }) => {
      // Validate required fields
      validatePositiveInteger(parseInt(connectionId), 'Connection ID');
      validateStatus(status, ['pending', 'accepted', 'declined', 'cancelled']);

      const result = updateConnectionStatus.run(status, connectionId);
      // Return the updated connection
      const db = require('better-sqlite3')(require('path').join(__dirname, '..', 'database.db'));
      const connection = db.prepare('SELECT * FROM connections WHERE id = ?').get(connectionId);
      db.close();
      return connection;
    },
    createInvitation: (_: any, { inviterId, inviteeEmail, inviteeName, message }: { inviterId: string, inviteeEmail: string, inviteeName?: string, message?: string }) => {
      // Validate required fields
      validatePositiveInteger(parseInt(inviterId), 'Inviter ID');
      validateEmail(inviteeEmail);
      
      // Validate optional fields
      validateOptionalText(inviteeName, 'Invitee name', 100);
      validateOptionalText(message, 'Invitation message', 500);

      // Check if user is already registered
      const existingUser = getUserByEmail.get(inviteeEmail);
      if (existingUser) {
        throw new Error('User is already registered on the platform');
      }

      // Check for existing pending invitation
      const existingInvitation = getInvitationByEmail.get(inviteeEmail);
      if (existingInvitation) {
        throw new Error('Invitation already sent to this email');
      }

      // Generate unique token
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');

      // Set expiration to 30 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const result = insertInvitation.run(
        inviterId,
        inviteeEmail,
        inviteeName,
        message,
        token,
        expiresAt.toISOString()
      );

      const invitation = {
        id: result.lastInsertRowid,
        // DB-shaped fields (snake_case) used by field resolvers
        inviter_id: inviterId,
        invitee_email: inviteeEmail,
        invitee_name: inviteeName,
        message,
        token,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      };

      // Send invitation email
      const invitationUrl = `http://localhost:3000/invite/${token}`;
      const emailResult = resolvers.Mutation.sendInvitationEmail(null, { email: inviteeEmail, invitationUrl });
      console.log('emailResult: ', emailResult);

      return invitation;
    },
    acceptInvitation: (_: any, { token, userData }: { token: string, userData: any }) => {
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

      // Check if user already exists
      const existingUser = getUserByEmail.get(invitation.invitee_email);
      if (existingUser) {
        throw new Error('User is already registered');
      }

      // Create new user
      const userResult = insertUser.run(
        invitation.invitee_email,
        userData.name || invitation.invitee_name,
        new Date().toISOString(), // email_verified
        userData.image
      );

      // Update invitation status
      updateInvitationStatus.run('accepted', new Date().toISOString(), invitation.id);

      // Create automatic connection between inviter and new user
      insertConnection.run(invitation.inviter_id, userResult.lastInsertRowid, 'friend', 'accepted');
      insertConnection.run(userResult.lastInsertRowid, invitation.inviter_id, 'friend', 'accepted');

      // Return the DB row (snake_case) so field resolvers can map to GraphQL fields
      const userRow = getUserById.get(userResult.lastInsertRowid);
      return userRow;
    },
    cancelInvitation: (_: any, { invitationId }: { invitationId: string }) => {
      // Validate required field
      validatePositiveInteger(parseInt(invitationId), 'Invitation ID');

      const result = updateInvitationStatus.run('cancelled', null, invitationId);
      return result.changes > 0;
    },
  },
  Host: {
    title: (parent: any) => parent.name, // Alias name as title for frontend compatibility
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
    userId: (parent: any) => parent.user_id,
    zipCode: (parent: any) => parent.zip_code,
    houseRules: (parent: any) => parent.house_rules,
    checkInTime: (parent: any) => parent.check_in_time,
    checkOutTime: (parent: any) => parent.check_out_time,
    maxGuests: (parent: any) => parent.max_guests,
    amenities: (parent: any) => parent.amenities ? JSON.parse(parent.amenities) : [],
    photos: (parent: any) => parent.photos ? JSON.parse(parent.photos) : [],
  },
  Availability: {
    host: (parent: any) => {
      return getHostById.get(parent.host_id);
    },
    startDate: (parent: any) => parent.start_date,
    endDate: (parent: any) => parent.end_date,
    hostId: (parent: any) => parent.host_id,
  },
  BookingRequest: {
    host: (parent: any) => {
      return getHostById.get(parent.host_id);
    },
    hostId: (parent: any) => parent.host_id,
    requesterId: (parent: any) => parent.requester_id,
    requester: (parent: any) => {
      return getUserById.get(parent.requester_id);
    },
    startDate: (parent: any) => parent.start_date,
    endDate: (parent: any) => parent.end_date,
    createdAt: (parent: any) => parent.created_at,
    responseMessage: (parent: any) => parent.response_message,
    respondedAt: (parent: any) => parent.responded_at,
  },
  User: {
    emailVerified: (parent: any) => parent.email_verified,
    createdAt: (parent: any) => parent.created_at,
  },
  Connection: {
    connectedUser: (parent: any) => {
      return getUserById.get(parent.connected_user_id);
    },
    createdAt: (parent: any) => parent.created_at,
    userId: (parent: any) => parent.user_id,
    connectedUserId: (parent: any) => parent.connected_user_id,
  },
  Invitation: {
    inviterId: (parent: any) => parent.inviter_id,
    inviteeEmail: (parent: any) => parent.invitee_email,
    inviteeName: (parent: any) => parent.invitee_name,
    expiresAt: (parent: any) => parent.expires_at,
    acceptedAt: (parent: any) => parent.accepted_at,
    createdAt: (parent: any) => parent.created_at,
    inviter: (parent: any) => {
      return getUserById.get(parent.inviter_id);
    },
  },
};