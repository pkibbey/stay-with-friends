// Generated GraphQL TypeDefs from Zod schemas - do not edit

export const typeDefs = `#graphql
type User {
  id: ID!
  email: String!
  name: String
  emailVerified: String
  image: String
  createdAt: String!
}

type Host {
  id: ID!
  userId: String
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
  createdAt: String!
  updatedAt: String!
  availabilities: [Availability!]!
  user: User!
}

type Availability {
  id: ID!
  hostId: String!
  startDate: String!
  endDate: String!
  status: String!
  notes: String
  host: Host!
}

type BookingRequest {
  id: ID!
  hostId: String!
  requesterId: String!
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

type Connection {
  id: ID!
  userId: String!
  connectedUserId: String!
  relationship: String
  status: String!
  createdAt: String!
  connectedUser: User!
}

type Invitation {
  id: ID!
  inviterId: String!
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
  searchHostsAdvanced(query: String, startDate: String): [Host!]!
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
  totalHostsCount: Int!
  totalConnectionsCount: Int!
  totalBookingsCount: Int!
}

type Mutation {
  createHost(userId: ID!, name: String!, location: String, description: String, address: String, city: String, state: String, zipCode: String, country: String, latitude: Float, longitude: Float, amenities: [String!], houseRules: String, checkInTime: String, checkOutTime: String, maxGuests: Int, bedrooms: Int, bathrooms: Int, photos: [String!]): Host!
  createAvailability(hostId: ID!, startDate: String!, endDate: String!, status: String, notes: String): Availability!
  createBookingRequest(hostId: ID!, requesterId: ID!, startDate: String!, endDate: String!, guests: Int!, message: String): BookingRequest!
  updateBookingRequestStatus(id: ID!, status: String!, responseMessage: String): BookingRequest!
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