import { z } from 'zod';

/**
 * ENTITY SCHEMAS - Single Source of Truth
 *
 * These Zod schemas define the complete entity structure including:
 * - Field types and validation
 * - Database table mapping
 * - Frontend/backend transformations
 */

// Base field metadata type
interface BaseFieldMeta {
  type: 'string' | 'integer' | 'real' | 'datetime' | 'json';
  primary?: boolean;
  unique?: boolean;
  nullable?: boolean;
  default?: string | number;
  table?: string;
  jsonType?: string;
}

// Base field types with database metadata
const StringField = (opts: { 
  primary?: boolean; 
  unique?: boolean; 
  nullable?: boolean; 
  default?: string;
  table?: string;
} = {}) => ({
  schema: opts.nullable ? z.string().optional() : z.string(),
  meta: { type: 'string' as const, ...opts } as BaseFieldMeta
});

const IntegerField = (opts: { 
  primary?: boolean;
  nullable?: boolean; 
  default?: number;
} = {}) => ({
  schema: opts.nullable ? z.number().int().optional() : z.number().int(),
  meta: { type: 'integer' as const, ...opts } as BaseFieldMeta
});

const RealField = (opts: { 
  nullable?: boolean; 
  default?: number;
} = {}) => ({
  schema: opts.nullable ? z.number().optional() : z.number(),
  meta: { type: 'real' as const, ...opts } as BaseFieldMeta
});

const DateTimeField = (opts: { 
  nullable?: boolean; 
  default?: string;
} = {}) => ({
  schema: opts.nullable ? z.string().optional() : z.string(),
  meta: { type: 'datetime' as const, ...opts } as BaseFieldMeta
});

const JsonField = <T>(innerSchema: z.ZodType<T>, opts: { 
  nullable?: boolean;
  jsonType?: string;
} = {}) => ({
  schema: opts.nullable ? innerSchema.optional() : innerSchema,
  meta: { type: 'json' as const, ...opts } as BaseFieldMeta
});

// Entity definitions with full schema and metadata
export const UserEntity = {
  table: 'users',
  fields: {
    id: StringField({ primary: true }),
    email: StringField({ unique: true }),
    name: StringField({ nullable: true }),
    email_verified: DateTimeField({ nullable: true }),
    image: StringField({ nullable: true }),
    created_at: DateTimeField({ default: 'CURRENT_TIMESTAMP' }),
  }
};

export const HostEntity = {
  table: 'hosts',
  fields: {
    id: StringField({ primary: true }),
    user_id: StringField({ nullable: true }),
    name: StringField(),
    location: StringField({ nullable: true }),
    description: StringField({ nullable: true }),
    address: StringField({ nullable: true }),
    city: StringField({ nullable: true }),
    state: StringField({ nullable: true }),
    zip_code: StringField({ nullable: true }),
    country: StringField({ nullable: true }),
    latitude: RealField({ nullable: true }),
    longitude: RealField({ nullable: true }),
    amenities: JsonField(z.array(z.string()), { nullable: true, jsonType: 'string[]' }),
    house_rules: StringField({ nullable: true }),
    check_in_time: StringField({ nullable: true }),
    check_out_time: StringField({ nullable: true }),
    max_guests: IntegerField({ nullable: true }),
    bedrooms: IntegerField({ nullable: true }),
    bathrooms: IntegerField({ nullable: true }),
    photos: JsonField(z.array(z.string()), { nullable: true, jsonType: 'string[]' }),
    created_at: DateTimeField({ default: 'CURRENT_TIMESTAMP' }),
    updated_at: DateTimeField({ default: 'CURRENT_TIMESTAMP' }),
  }
};

export const AvailabilityEntity = {
  table: 'availabilities',
  fields: {
    id: StringField({ primary: true }),
    host_id: StringField(),
    start_date: StringField(),
    end_date: StringField(),
    status: StringField({ default: 'available' }),
    notes: StringField({ nullable: true }),
  }
};

export const BookingRequestEntity = {
  table: 'booking_requests',
  fields: {
    id: StringField({ primary: true }),
    host_id: StringField(),
    requester_id: StringField(),
    start_date: StringField(),
    end_date: StringField(),
    guests: IntegerField(),
    message: StringField({ nullable: true }),
    status: StringField({ default: 'pending' }),
    response_message: StringField({ nullable: true }),
    responded_at: DateTimeField({ nullable: true }),
    created_at: DateTimeField({ default: 'CURRENT_TIMESTAMP' }),
  }
};

export const ConnectionEntity = {
  table: 'connections',
  fields: {
    id: StringField({ primary: true }),
    user_id: StringField(),
    connected_user_id: StringField(),
    relationship: StringField({ nullable: true }),
    status: StringField({ default: 'pending' }),
    created_at: DateTimeField({ default: 'CURRENT_TIMESTAMP' }),
  }
};

export const InvitationEntity = {
  table: 'invitations',
  fields: {
    id: StringField({ primary: true }),
    inviter_id: StringField(),
    invitee_email: StringField(),
    message: StringField({ nullable: true }),
    token: StringField({ unique: true }),
    status: StringField({ default: 'pending' }),
    expires_at: DateTimeField(),
    accepted_at: DateTimeField({ nullable: true }),
    created_at: DateTimeField({ default: 'CURRENT_TIMESTAMP' }),
  }
};

// Collect all entities
export const ENTITIES = {
  User: UserEntity,
  Host: HostEntity,
  Availability: AvailabilityEntity,
  BookingRequest: BookingRequestEntity,
  Connection: ConnectionEntity,
  Invitation: InvitationEntity,
} as const;

// Generate runtime Zod schemas from the entity definitions
export const UserSchema = z.object(
  Object.fromEntries(
    Object.entries(UserEntity.fields).map(([key, field]) => [key, field.schema])
  ) as {
    [K in keyof typeof UserEntity.fields]: (typeof UserEntity.fields)[K]['schema'];
  }
);

export const HostSchema = z.object(
  Object.fromEntries(
    Object.entries(HostEntity.fields).map(([key, field]) => [key, field.schema])
  ) as {
    [K in keyof typeof HostEntity.fields]: (typeof HostEntity.fields)[K]['schema'];
  }
);

export const AvailabilitySchema = z.object(
  Object.fromEntries(
    Object.entries(AvailabilityEntity.fields).map(([key, field]) => [key, field.schema])
  ) as {
    [K in keyof typeof AvailabilityEntity.fields]: (typeof AvailabilityEntity.fields)[K]['schema'];
  }
);

export const BookingRequestSchema = z.object(
  Object.fromEntries(
    Object.entries(BookingRequestEntity.fields).map(([key, field]) => [key, field.schema])
  ) as {
    [K in keyof typeof BookingRequestEntity.fields]: (typeof BookingRequestEntity.fields)[K]['schema'];
  }
);

export const ConnectionSchema = z.object(
  Object.fromEntries(
    Object.entries(ConnectionEntity.fields).map(([key, field]) => [key, field.schema])
  ) as {
    [K in keyof typeof ConnectionEntity.fields]: (typeof ConnectionEntity.fields)[K]['schema'];
  }
);

export const InvitationSchema = z.object(
  Object.fromEntries(
    Object.entries(InvitationEntity.fields).map(([key, field]) => [key, field.schema])
  ) as {
    [K in keyof typeof InvitationEntity.fields]: (typeof InvitationEntity.fields)[K]['schema'];
  }
);

// Export schema collection
export const SCHEMAS = {
  User: UserSchema,
  Host: HostSchema,
  Availability: AvailabilitySchema,
  BookingRequest: BookingRequestSchema,
  Connection: ConnectionSchema,
  Invitation: InvitationSchema,
} as const;

// Type inference from Zod schemas
export type User = z.infer<typeof UserSchema>;
export type Host = z.infer<typeof HostSchema>;
export type Availability = z.infer<typeof AvailabilitySchema>;
export type BookingRequest = z.infer<typeof BookingRequestSchema>;
export type Connection = z.infer<typeof ConnectionSchema>;
export type Invitation = z.infer<typeof InvitationSchema>;

// ...existing code...