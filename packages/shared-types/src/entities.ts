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
  email?: boolean;
} = {}) => ({
  schema: opts.nullable 
    ? (opts.email ? z.string().email().optional() : z.string().optional())
    : (opts.email ? z.string().email() : z.string()),
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

// Helper for string-array fields stored as JSON in the DB but typed as arrays at runtime
// Accepts either a JSON string (e.g. '["a","b"]') or an actual array and normalizes to string[]
const StringArrayField = (opts: {
  nullable?: boolean;
} = {}) => ({
  schema: opts.nullable
    ? z.preprocess((val) => {
        if (val == null) return undefined;
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') {
          try {
            return JSON.parse(val);
          } catch {
            return val;
          }
        }
        return val;
      }, z.array(z.string()).optional())
    : z.preprocess((val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') {
          try {
            return JSON.parse(val);
          } catch {
            return val;
          }
        }
        return val;
      }, z.array(z.string())),
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
    amenities: StringArrayField({ nullable: true }),
    house_rules: StringField({ nullable: true }),
    check_in_time: StringField({ nullable: true }),
    check_out_time: StringField({ nullable: true }),
    max_guests: IntegerField({ nullable: true }),
    bedrooms: IntegerField({ nullable: true }),
    bathrooms: IntegerField({ nullable: true }),
    photos: StringArrayField({ nullable: true }),
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
    invitee_email: StringField({ email: true }),
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

// Input schemas for API endpoints (only required/provided fields)
export const CreateInvitationSchema = z.object({
  inviter_id: z.string(),
  invitee_email: z.string().email(),
  token: z.string(),
  expires_at: z.string(),
  message: z.string().optional(),
});

// Export schema collection
export const SCHEMAS = {
  User: UserSchema,
  Host: HostSchema,
  Availability: AvailabilitySchema,
  BookingRequest: BookingRequestSchema,
  Connection: ConnectionSchema,
  Invitation: InvitationSchema,
} as const;

/**
 * Helpers to convert between runtime objects and DB rows using entity metadata.
 * - toDbRow: returns an object mapping column -> value suitable for DB insertion (JSON fields stringified)
 * - toDbValues: returns an array of values in the entity field order (useful for prepared statements)
 * - fromDbRow: parses a DB row into a runtime-typed object using the Zod schema (this also applies preprocessors)
 */
export function toDbRow<T extends keyof typeof ENTITIES>(
  entityName: T,
  obj: Record<string, unknown>
): Record<string, unknown> {
  const entity = ENTITIES[entityName];
  const out: Record<string, any> = {};
  for (const [key, field] of Object.entries(entity.fields)) {
    const meta = (field as any).meta as BaseFieldMeta;
    const val = obj[key];

    if (meta?.type === 'json') {
      if (val === undefined || val === null) {
        out[key] = null;
      } else if (typeof val === 'string') {
        // already serialized
        out[key] = val;
      } else {
        try {
          out[key] = JSON.stringify(val);
        } catch {
          // fallback to storing original value if stringify fails
          out[key] = val;
        }
      }
    } else {
      out[key] = val === undefined ? null : val;
    }
  }
  return out;
}

export function toDbValues<T extends keyof typeof ENTITIES>(
  entityName: T,
  obj: Record<string, unknown>
): unknown[] {
  const entity = ENTITIES[entityName];
  return Object.keys(entity.fields).map((k) => toDbRow(entityName, obj)[k]);
}

export function fromDbRow<T extends keyof typeof SCHEMAS>(
  schemaName: T,
  row: Record<string, unknown>
): z.infer<typeof SCHEMAS[T]> {
  const schema = SCHEMAS[schemaName];
  // first try direct parse (this will run any preprocessors like StringArrayField)
  const safe = schema.safeParse(row as any);
  if (safe.success) return safe.data as z.infer<typeof SCHEMAS[T]>;

  // If parse failed, attempt to normalize the row: convert NULL -> undefined for nullable fields,
  // apply defaults where provided, and coerce numeric strings to numbers.
  const entity = (ENTITIES as any)[schemaName];
  const normalized: Record<string, any> = { ...(row as Record<string, any>) };

  for (const [key, field] of Object.entries(entity.fields)) {
    const meta = (field as any).meta as BaseFieldMeta;
    const val = (row as Record<string, any>)[key];

    if (val === null || val === undefined) {
      if (meta?.nullable) {
        normalized[key] = undefined;
      } else if (meta?.default !== undefined) {
        normalized[key] = meta.default;
      } else {
        // sensible fallbacks to allow parsing; these avoid throwing but keep the shape reasonable
        switch (meta?.type) {
          case 'string':
          case 'datetime':
            normalized[key] = '';
            break;
          case 'integer':
          case 'real':
            normalized[key] = 0;
            break;
          case 'json':
            normalized[key] = meta?.jsonType === 'string[]' ? [] : {};
            break;
          default:
            normalized[key] = undefined;
        }
      }
    } else {
      // try to coerce numeric strings coming from the DB into numbers
      if ((meta?.type === 'integer' || meta?.type === 'real') && typeof val === 'string') {
        const n = Number(val);
        normalized[key] = Number.isNaN(n) ? val : n;
      }
    }
  }

  const second = schema.safeParse(normalized as any);
  if (second.success) return second.data as z.infer<typeof SCHEMAS[T]>;

  // Last resort: return normalized object (best-effort coercion) to avoid blowing up the API.
  return normalized as z.infer<typeof SCHEMAS[T]>;
}

// Type inference from Zod schemas
export type User = z.infer<typeof UserSchema>;
export type Host = z.infer<typeof HostSchema>;
export type Availability = z.infer<typeof AvailabilitySchema>;
export type BookingRequest = z.infer<typeof BookingRequestSchema>;
export type Connection = z.infer<typeof ConnectionSchema>;
export type Invitation = z.infer<typeof InvitationSchema>;

// ...existing code...