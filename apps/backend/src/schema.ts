export const typeDefs = `#graphql
  type Person {
    id: ID!
    name: String!
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
    personId: ID!
    startDate: String!
    endDate: String!
    status: String!
    notes: String
    person: Person!
  }

  type BookingRequest {
    id: ID!
    personId: ID!
    requesterName: String!
    requesterEmail: String!
    startDate: String!
    endDate: String!
    guests: Int!
    message: String
    status: String!
    createdAt: String!
    person: Person!
  }

  type Query {
    hello: String
    people: [Person!]!
    searchPeople(query: String!): [Person!]!
    person(id: ID!): Person
    availabilitiesByDate(date: String!): [Availability!]!
    availabilitiesByDateRange(startDate: String!, endDate: String!): [Availability!]!
    personAvailabilities(personId: ID!): [Availability!]!
    availabilityDates(startDate: String!, endDate: String!): [String!]!
  }

  type Mutation {
    createPerson(
      name: String!
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
    ): Person!
    createAvailability(
      personId: ID!
      startDate: String!
      endDate: String!
      status: String
      notes: String
    ): Availability!
    createBookingRequest(
      personId: ID!
      requesterName: String!
      requesterEmail: String!
      startDate: String!
      endDate: String!
      guests: Int!
      message: String
    ): BookingRequest!
  }
`;

import { getAllPeople, getPersonById, searchPeople, insertPerson, getPersonAvailabilities, getAvailabilitiesByDateRange, insertAvailability, getAvailabilityDates, insertBookingRequest } from './db';

export const resolvers = {
  Query: {
    hello: () => 'Hello world!',
    people: () => getAllPeople.all(),
    searchPeople: (_: any, { query }: { query: string }) => {
      const searchTerm = `%${query}%`;
      return searchPeople.all(searchTerm, searchTerm, searchTerm);
    },
    person: (_: any, { id }: { id: string }) => {
      return getPersonById.get(id);
    },
    availabilitiesByDate: (_: any, { date }: { date: string }) => {
      return getAvailabilitiesByDateRange.all(date, date);
    },
    availabilitiesByDateRange: (_: any, { startDate, endDate }: { startDate: string, endDate: string }) => {
      return getAvailabilitiesByDateRange.all(endDate, startDate);
    },
    personAvailabilities: (_: any, { personId }: { personId: string }) => {
      return getPersonAvailabilities.all(personId);
    },
    availabilityDates: (_: any, { startDate, endDate }: { startDate: string, endDate: string }) => {
      const results = getAvailabilityDates.all(startDate, endDate, endDate, startDate) as { date: string }[];
      return results.map(row => row.date);
    },
  },
  Mutation: {
    createPerson: (_: any, args: any) => {
      const result = insertPerson.run(
        args.name,
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
    },
    createAvailability: (_: any, args: any) => {
      const result = insertAvailability.run(
        args.personId,
        args.startDate,
        args.endDate,
        args.status || 'available',
        args.notes
      );
      return {
        id: result.lastInsertRowid,
        personId: args.personId,
        ...args,
      };
    },
    createBookingRequest: (_: any, args: any) => {
      const result = insertBookingRequest.run(
        args.personId,
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
  },
  Person: {
    availabilities: (parent: any) => {
      return getPersonAvailabilities.all(parent.id);
    },
    zipCode: (parent: any) => parent.zip_code,
    amenities: (parent: any) => parent.amenities ? JSON.parse(parent.amenities) : [],
    photos: (parent: any) => parent.photos ? JSON.parse(parent.photos) : [],
  },
  Availability: {
    person: (parent: any) => {
      return getPersonById.get(parent.person_id);
    },
    startDate: (parent: any) => parent.start_date,
    endDate: (parent: any) => parent.end_date,
    personId: (parent: any) => parent.person_id,
  },
  BookingRequest: {
    person: (parent: any) => {
      return getPersonById.get(parent.person_id);
    },
    personId: (parent: any) => parent.person_id,
    requesterName: (parent: any) => parent.requester_name,
    requesterEmail: (parent: any) => parent.requester_email,
    startDate: (parent: any) => parent.start_date,
    endDate: (parent: any) => parent.end_date,
    createdAt: (parent: any) => parent.created_at,
  },
};