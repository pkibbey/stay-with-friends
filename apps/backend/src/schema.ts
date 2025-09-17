export const typeDefs = `#graphql
  type Host {
    id: ID!
    name: String!
    email: String
    location: String
    relationship: String
    availability: String
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
    requesterName: String!
    requesterEmail: String!
    startDate: String!
    endDate: String!
    guests: Int!
    message: String
    status: String!
    createdAt: String!
    host: Host!
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
    status: String!
    createdAt: String!
    connectedUser: User!
  }

  type Query {
    hello: String
    hosts: [Host!]!
    searchHosts(query: String!): [Host!]!
    host(id: ID!): Host
    availabilitiesByDate(date: String!): [Availability!]!
    availabilitiesByDateRange(startDate: String!, endDate: String!): [Availability!]!
    hostAvailabilities(hostId: ID!): [Availability!]!
    availabilityDates(startDate: String!, endDate: String!): [String!]!
    user(email: String!): User
    connections(userId: ID!): [Connection!]!
    connectionRequests(userId: ID!): [Connection!]!
  }

  type Mutation {
    createHost(
      name: String!
      email: String!
      location: String
      relationship: String
      availability: String
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
      requesterName: String!
      requesterEmail: String!
      startDate: String!
      endDate: String!
      guests: Int!
      message: String
    ): BookingRequest!
    checkEmailExists(email: String!): Boolean!
    sendInvitationEmail(email: String!, invitationUrl: String!): Boolean!
    createPlace(input: CreatePlaceInput!): Host!
    updateHost(id: ID!, input: UpdateHostInput!): Host!
    deleteHost(id: ID!): Boolean!
    createUser(email: String!, name: String, image: String): User!
    updateUser(id: ID!, name: String, image: String): User!
    createConnection(userId: ID!, connectedUserEmail: String!): Connection!
    updateConnectionStatus(connectionId: ID!, status: String!): Connection!
  }

  input CreatePlaceInput {
    name: String!
    location: String
    relationship: String
    availability: String
    description: String
    email: String!
  }

  input UpdateHostInput {
    name: String
    location: String
    relationship: String
    availability: String
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
`;

import { getAllHosts, getHostById, getHostByEmail, searchHosts, insertHost, getHostAvailabilities, getAvailabilitiesByDateRange, insertAvailability, getAvailabilityDates, insertBookingRequest, getUserByEmail, getUserById, insertUser, updateUser, getConnections, getConnectionRequests, insertConnection, updateConnectionStatus } from './db';

export const resolvers = {
  Query: {
    hello: () => 'Hello world!',
    hosts: () => getAllHosts.all(),
    searchHosts: (_: any, { query }: { query: string }) => {
      const searchTerm = `%${query}%`;
      return searchHosts.all(searchTerm, searchTerm, searchTerm);
    },
    host: (_: any, { id }: { id: string }) => {
      return getHostById.get(id);
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
  },
  Mutation: {
    createHost: (_: any, args: any) => {
      try {
        const result = insertHost.run(
          args.name,
          args.email,
          args.location,
          args.relationship,
          args.availability,
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
        };
      } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          throw new Error('A host with this email already exists');
        }
        throw error;
      }
    },
    createAvailability: (_: any, args: any) => {
      const result = insertAvailability.run(
        args.hostId,
        args.startDate,
        args.endDate,
        args.status || 'available',
        args.notes
      );
      return {
        id: result.lastInsertRowid,
        hostId: args.hostId,
        ...args,
      };
    },
    createBookingRequest: (_: any, args: any) => {
      const result = insertBookingRequest.run(
        args.hostId,
        args.requesterName,
        args.requesterEmail,
        args.startDate,
        args.endDate,
        args.guests,
        args.message,
        'pending'
      );
      return {
        id: result.lastInsertRowid,
        ...args,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
    },
    checkEmailExists: (_: any, { email }: { email: string }) => {
      const host = getHostByEmail.get(email);
      return !!host;
    },
    sendInvitationEmail: (_: any, { email, invitationUrl }: { email: string, invitationUrl: string }) => {
      // In a real implementation, you'd integrate with an email service like SendGrid, Mailgun, etc.
      // For now, we'll just log the invitation and return success
      console.log(`Sending invitation email to ${email} with URL: ${invitationUrl}`);
      return true;
    },
    createPlace: (_: any, { input }: { input: any }) => {
      const result = insertHost.run(
        input.name,
        input.email,
        input.location,
        input.relationship,
        input.availability,
        input.description,
        null, // address
        null, // city
        null, // state
        null, // zipCode
        null, // country
        null, // latitude
        null, // longitude
        null, // amenities
        null, // houseRules
        null, // checkInTime
        null, // checkOutTime
        null, // maxGuests
        null, // bedrooms
        null, // bathrooms
        null  // photos
      );
      return {
        id: result.lastInsertRowid,
        ...input,
      };
    },
    updateHost: (_: any, { id, input }: { id: string, input: any }) => {
      const db = require('better-sqlite3')(require('path').join(__dirname, '..', 'database.db'));

      try {
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
        if (input.relationship !== undefined) {
          updates.push('relationship = ?')
          values.push(input.relationship)
        }
        if (input.availability !== undefined) {
          updates.push('availability = ?')
          values.push(input.availability)
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
        console.error('Error deleting host:', error)
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
    createConnection: (_: any, { userId, connectedUserEmail }: { userId: string, connectedUserEmail: string }) => {
      const connectedUser = getUserByEmail.get(connectedUserEmail) as any;
      if (!connectedUser) {
        throw new Error('User with this email not found');
      }
      
      const result = insertConnection.run(userId, connectedUser.id, 'pending');
      return {
        id: result.lastInsertRowid,
        userId,
        connectedUserId: connectedUser.id,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
    },
    updateConnectionStatus: (_: any, { connectionId, status }: { connectionId: string, status: string }) => {
      const result = updateConnectionStatus.run(status, connectionId);
      // Return the updated connection
      const db = require('better-sqlite3')(require('path').join(__dirname, '..', 'database.db'));
      const connection = db.prepare('SELECT * FROM connections WHERE id = ?').get(connectionId);
      db.close();
      return connection;
    },
  },
  Host: {
    availabilities: (parent: any) => {
      return getHostAvailabilities.all(parent.id);
    },
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
    requesterName: (parent: any) => parent.requester_name,
    requesterEmail: (parent: any) => parent.requester_email,
    startDate: (parent: any) => parent.start_date,
    endDate: (parent: any) => parent.end_date,
    createdAt: (parent: any) => parent.created_at,
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
  },
};