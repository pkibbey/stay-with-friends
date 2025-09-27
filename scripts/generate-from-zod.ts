#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { ENTITIES, SCHEMAS } from '../packages/shared-types/src/entities.js';

/**
 * ZOD-FIRST TYPE GENERATION (TypeScript)
 * 
 * This is the actual generation logic that runs using the Zod schemas
 * as the single source of truth.
 */

const repoRoot = path.resolve(process.cwd());
const backendOutDir = path.join(repoRoot, 'apps', 'backend', 'src', 'generated');

// Ensure output directory exists
if (!fs.existsSync(backendOutDir)) fs.mkdirSync(backendOutDir, { recursive: true });

console.log('🔨 Generating types from Zod schemas...');

// Helper functions for GraphQL generation only
const toCamelCase = (str: string): string => 
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const toGraphQLType = (fieldMeta: { type: string; nullable?: boolean; primary?: boolean; jsonType?: string }): string => {
  const { type, nullable, primary } = fieldMeta;
  
  let gqlType: string;
  switch (type) {
    case 'string':
      gqlType = primary ? 'ID' : 'String';
      break;
    case 'integer':
      gqlType = 'Int';
      break;
    case 'real':
      gqlType = 'Float';
      break;
    case 'datetime':
      gqlType = 'String';
      break;
    case 'json':
      gqlType = fieldMeta.jsonType === 'string[]' ? '[String!]' : 'String';
      break;
    default:
      gqlType = 'String';
  }
  
  return nullable ? gqlType : `${gqlType}!`;
};





// Generate GraphQL typeDefs
const generateGraphQLTypeDefs = (): string => {
  const lines = ['# Generated from Zod schemas - do not edit', ''];
  
  // Generate type definitions
  Object.entries(ENTITIES).forEach(([entityName, entity]) => {
    lines.push(`type ${entityName} {`);
    
    Object.entries(entity.fields).forEach(([fieldName, fieldDef]) => {
      const camelFieldName = toCamelCase(fieldName);
      const gqlType = toGraphQLType(fieldDef.meta);
      lines.push(`  ${camelFieldName}: ${gqlType}`);
    });
    
    // Add relationship fields
    if (entityName === 'Host') {
      lines.push('  availabilities: [Availability!]!');
      lines.push('  user: User!');
    } else if (entityName === 'Availability') {
      lines.push('  host: Host!');
    } else if (entityName === 'BookingRequest') {
      lines.push('  host: Host!');
      lines.push('  requester: User!');
    } else if (entityName === 'Connection') {
      lines.push('  connectedUser: User!');
    } else if (entityName === 'Invitation') {
      lines.push('  inviter: User!');
    }
    
    lines.push('}', '');
  });

  // Add standard Query and Mutation types (same as before)
  lines.push(`type Query {
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
}`);

  return lines.join('\n');
};

// Generate TypeScript typeDefs export
const generateTypescriptTypeDefs = (): string => {
  const gqlSchema = generateGraphQLTypeDefs();
  return [
    '// Generated GraphQL TypeDefs from Zod schemas - do not edit',
    '',
    'export const typeDefs = `#graphql',
    ...gqlSchema.split('\n').slice(2), // Skip the comment header
    '`;',
  ].join('\n');
};

// Write only the files that absolutely need generation
fs.writeFileSync(path.join(backendOutDir, 'schema.graphql'), generateGraphQLTypeDefs());
fs.writeFileSync(path.join(backendOutDir, 'typedefs.ts'), generateTypescriptTypeDefs());

console.log('✅ Generated GraphQL schema:', path.join(backendOutDir, 'schema.graphql'));
console.log('✅ Generated TypeScript typeDefs:', path.join(backendOutDir, 'typedefs.ts'));
console.log('');
console.log('🎯 Shared Types Benefits:');
console.log('  ✓ Single source of truth in @stay-with-friends/shared-types');
console.log('  ✓ No schema duplication - import directly from shared package');
console.log('  ✓ Runtime validation with Zod schemas');
console.log('  ✓ Consistent types across backend and frontend');
console.log('');
console.log('📚 Recommended Usage:');
console.log('  Backend: import { User, validate } from "@stay-with-friends/shared-types"');
console.log('  Frontend: import { User, safeParse } from "@stay-with-friends/shared-types"');
console.log('  GraphQL: import { typeDefs } from "./generated/typedefs"');
console.log('  ✨ No more generated types - everything comes from shared-types!');