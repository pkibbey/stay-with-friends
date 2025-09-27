#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { ENTITIES, SCHEMAS } from '../schema/entities.js';

/**
 * ZOD-FIRST TYPE GENERATION (TypeScript)
 * 
 * This is the actual generation logic that runs using the Zod schemas
 * as the single source of truth.
 */

const repoRoot = path.resolve(process.cwd());
const backendOutDir = path.join(repoRoot, 'apps', 'backend', 'src', 'generated');
const frontendOutDir = path.join(repoRoot, 'apps', 'frontend', 'src', 'generated');

// Ensure output directories exist
if (!fs.existsSync(backendOutDir)) fs.mkdirSync(backendOutDir, { recursive: true });
if (!fs.existsSync(frontendOutDir)) fs.mkdirSync(frontendOutDir, { recursive: true });

console.log('🔨 Generating types from Zod schemas...');

// Helper functions
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

// Generate backend types (snake_case for database compatibility)
const generateBackendTypes = (): string => {
  const lines = [
    '// Generated from Zod schemas - do not edit',
    '// Backend types with snake_case field names',
    '',
    "import { z } from 'zod'",
    '',
  ];

  // Generate interfaces and schemas for each entity
  Object.entries(ENTITIES).forEach(([entityName, entity]) => {
    // Generate TypeScript interface
    lines.push(`export interface ${entityName} {`);
    
    Object.entries(entity.fields).forEach(([fieldName, fieldDef]) => {
      const { nullable, primary = false } = fieldDef.meta;
      const optional = (nullable && !primary) ? '?' : '';
      
      let tsType: string;
      switch (fieldDef.meta.type) {
        case 'integer':
          tsType = 'number';
          break;
        case 'real':
          tsType = 'number';
          break;
        case 'datetime':
          tsType = 'string';
          break;
        case 'json':
          tsType = fieldDef.meta.jsonType || 'unknown';
          break;
        default:
          tsType = 'string';
      }
      
      lines.push(`  ${fieldName}${optional}: ${tsType};`);
    });
    
    lines.push('}', '');

    // Generate Zod schema export
    lines.push(`export const ${entityName}Schema = z.object({`);
    
    Object.entries(entity.fields).forEach(([fieldName, fieldDef]) => {
      let zodType: string;
      
      switch (fieldDef.meta.type) {
        case 'integer':
          zodType = 'z.number().int()';
          break;
        case 'real':
          zodType = 'z.number()';
          break;
        case 'datetime':
          zodType = 'z.string()';
          break;
        case 'json':
          zodType = fieldDef.meta.jsonType === 'string[]' ? 'z.array(z.string())' : 'z.unknown()';
          break;
        default:
          zodType = 'z.string()';
      }
      
      if (fieldDef.meta.nullable && !(fieldDef.meta.primary ?? false)) {
        zodType += '.optional()';
      }
      
      lines.push(`  ${fieldName}: ${zodType},`);
    });
    
    lines.push('})', '');
  });

  // Add validation helpers
  lines.push('// Validation helpers');
  lines.push('export const validate = {');
  Object.keys(ENTITIES).forEach(name => {
    lines.push(`  ${name.toLowerCase()}: (data: unknown) => ${name}Schema.parse(data),`);
  });
  lines.push('}', '');

  lines.push('// Safe parsing helpers');
  lines.push('export const safeParse = {');
  Object.keys(ENTITIES).forEach(name => {
    lines.push(`  ${name.toLowerCase()}: (data: unknown) => ${name}Schema.safeParse(data),`);
  });
  lines.push('}');

  return lines.join('\n');
};

// Generate frontend types (camelCase for JavaScript conventions)
const generateFrontendTypes = (): string => {
  const lines = [
    '// Generated from Zod schemas - do not edit',
    '// Frontend types with camelCase field names',
    '',
    "import { z } from 'zod'",
    "import type {",
    ...Object.keys(ENTITIES).map(name => `  ${name} as Backend${name},`),
    "} from '../../../backend/src/generated/types'",
    '',
  ];

  // Generate frontend interfaces and schemas
  Object.entries(ENTITIES).forEach(([entityName, entity]) => {
    // Generate frontend interface (camelCase)
    lines.push(`export interface ${entityName} {`);
    
    Object.entries(entity.fields).forEach(([fieldName, fieldDef]) => {
      const camelFieldName = toCamelCase(fieldName);
      const { nullable, primary = false } = fieldDef.meta;
      const optional = (nullable && !primary) ? '?' : '';
      
      let tsType: string;
      switch (fieldDef.meta.type) {
        case 'integer':
          // IDs should be strings in frontend
          tsType = fieldName.includes('id') || fieldName === 'id' ? 'string' : 'number';
          break;
        case 'real':
          tsType = 'number';
          break;
        case 'datetime':
          tsType = 'string';
          break;
        case 'json':
          tsType = fieldDef.meta.jsonType || 'unknown';
          break;
        default:
          tsType = 'string';
      }
      
      lines.push(`  ${camelFieldName}${optional}: ${tsType};`);
    });
    
    lines.push('}', '');

    // Generate frontend Zod schema
    lines.push(`export const ${entityName}Schema = z.object({`);
    
    Object.entries(entity.fields).forEach(([fieldName, fieldDef]) => {
      const camelFieldName = toCamelCase(fieldName);
      let zodType: string;
      
      switch (fieldDef.meta.type) {
        case 'integer':
          zodType = fieldName.includes('id') || fieldName === 'id' ? 'z.string()' : 'z.number().int()';
          break;
        case 'real':
          zodType = 'z.number()';
          break;
        case 'datetime':
          zodType = 'z.string()';
          break;
        case 'json':
          zodType = fieldDef.meta.jsonType === 'string[]' ? 'z.array(z.string())' : 'z.unknown()';
          break;
        default:
          zodType = 'z.string()';
      }
      
      if (fieldDef.meta.nullable && !(fieldDef.meta.primary ?? false)) {
        zodType += '.optional()';
      }
      
      lines.push(`  ${camelFieldName}: ${zodType},`);
    });
    
    lines.push('})', '');
  });

  // Generate transformation functions
  lines.push('// Transformation utilities');
  Object.entries(ENTITIES).forEach(([entityName, entity]) => {
    lines.push(`export function transform${entityName}(backend: Backend${entityName}): ${entityName} {`);
    lines.push('  return {');
    
    Object.keys(entity.fields).forEach(fieldName => {
      const camelFieldName = toCamelCase(fieldName);
      lines.push(`    ${camelFieldName}: backend.${fieldName},`);
    });
    
    lines.push('  }');
    lines.push('}', '');
    
    // Safe transform with validation
    lines.push(`export function safeTransform${entityName}(backend: unknown): { success: true, data: ${entityName} } | { success: false, error: string } {`);
    lines.push('  try {');
    lines.push(`    const transformed = transform${entityName}(backend as Backend${entityName});`);
    lines.push(`    const validated = ${entityName}Schema.parse(transformed);`);
    lines.push('    return { success: true, data: validated };');
    lines.push('  } catch (error) {');
    lines.push('    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };');
    lines.push('  }');
    lines.push('}', '');
  });

  // Add validation helpers
  lines.push('// Validation helpers');
  lines.push('export const validate = {');
  Object.keys(ENTITIES).forEach(name => {
    lines.push(`  ${name.toLowerCase()}: (data: unknown) => ${name}Schema.parse(data),`);
  });
  lines.push('}', '');

  lines.push('// Safe parsing helpers');
  lines.push('export const safeParse = {');
  Object.keys(ENTITIES).forEach(name => {
    lines.push(`  ${name.toLowerCase()}: (data: unknown) => ${name}Schema.safeParse(data),`);
  });
  lines.push('}');

  return lines.join('\n');
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

// Write all generated files
fs.writeFileSync(path.join(backendOutDir, 'types.ts'), generateBackendTypes());
fs.writeFileSync(path.join(frontendOutDir, 'types.ts'), generateFrontendTypes());
fs.writeFileSync(path.join(backendOutDir, 'schema.graphql'), generateGraphQLTypeDefs());
fs.writeFileSync(path.join(backendOutDir, 'typedefs.ts'), generateTypescriptTypeDefs());

console.log('✅ Generated backend types:', path.join(backendOutDir, 'types.ts'));
console.log('✅ Generated frontend types:', path.join(frontendOutDir, 'types.ts'));
console.log('✅ Generated GraphQL schema:', path.join(backendOutDir, 'schema.graphql'));
console.log('✅ Generated TypeScript typeDefs:', path.join(backendOutDir, 'typedefs.ts'));
console.log('');
console.log('🎯 Zod-first benefits:');
console.log('  ✓ Single source of truth in TypeScript');
console.log('  ✓ Type-safe schema definitions');
console.log('  ✓ Built-in runtime validation');
console.log('  ✓ No JSON parsing/conversion needed');
console.log('  ✓ Full IDE support and autocomplete');
console.log('');
console.log('📚 Next steps:');
console.log('  1. Import schemas: import { SCHEMAS } from "../schema/entities"');
console.log('  2. Use validation: SCHEMAS.User.parse(data)');
console.log('  3. Import typeDefs: import { typeDefs } from "./generated/typedefs"');
console.log('  4. Replace models.json workflow entirely');