"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCHEMAS = exports.InvitationSchema = exports.ConnectionSchema = exports.BookingRequestSchema = exports.AvailabilitySchema = exports.HostSchema = exports.UserSchema = exports.ENTITIES = exports.InvitationEntity = exports.ConnectionEntity = exports.BookingRequestEntity = exports.AvailabilityEntity = exports.HostEntity = exports.UserEntity = void 0;
const zod_1 = require("zod");
// Base field types with database metadata
const StringField = (opts = {}) => ({
    schema: opts.nullable ? zod_1.z.string().optional() : zod_1.z.string(),
    meta: { type: 'string', ...opts }
});
const IntegerField = (opts = {}) => ({
    schema: opts.nullable ? zod_1.z.number().int().optional() : zod_1.z.number().int(),
    meta: { type: 'integer', ...opts }
});
const RealField = (opts = {}) => ({
    schema: opts.nullable ? zod_1.z.number().optional() : zod_1.z.number(),
    meta: { type: 'real', ...opts }
});
const DateTimeField = (opts = {}) => ({
    schema: opts.nullable ? zod_1.z.string().optional() : zod_1.z.string(),
    meta: { type: 'datetime', ...opts }
});
const JsonField = (innerSchema, opts = {}) => ({
    schema: opts.nullable ? innerSchema.optional() : innerSchema,
    meta: { type: 'json', ...opts }
});
// Entity definitions with full schema and metadata
exports.UserEntity = {
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
exports.HostEntity = {
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
        amenities: JsonField(zod_1.z.array(zod_1.z.string()), { nullable: true, jsonType: 'string[]' }),
        house_rules: StringField({ nullable: true }),
        check_in_time: StringField({ nullable: true }),
        check_out_time: StringField({ nullable: true }),
        max_guests: IntegerField({ nullable: true }),
        bedrooms: IntegerField({ nullable: true }),
        bathrooms: IntegerField({ nullable: true }),
        photos: JsonField(zod_1.z.array(zod_1.z.string()), { nullable: true, jsonType: 'string[]' }),
        created_at: DateTimeField({ default: 'CURRENT_TIMESTAMP' }),
        updated_at: DateTimeField({ default: 'CURRENT_TIMESTAMP' }),
    }
};
exports.AvailabilityEntity = {
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
exports.BookingRequestEntity = {
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
exports.ConnectionEntity = {
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
exports.InvitationEntity = {
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
exports.ENTITIES = {
    User: exports.UserEntity,
    Host: exports.HostEntity,
    Availability: exports.AvailabilityEntity,
    BookingRequest: exports.BookingRequestEntity,
    Connection: exports.ConnectionEntity,
    Invitation: exports.InvitationEntity,
};
// Generate runtime Zod schemas from the entity definitions
exports.UserSchema = zod_1.z.object(Object.fromEntries(Object.entries(exports.UserEntity.fields).map(([key, field]) => [key, field.schema])));
exports.HostSchema = zod_1.z.object(Object.fromEntries(Object.entries(exports.HostEntity.fields).map(([key, field]) => [key, field.schema])));
exports.AvailabilitySchema = zod_1.z.object(Object.fromEntries(Object.entries(exports.AvailabilityEntity.fields).map(([key, field]) => [key, field.schema])));
exports.BookingRequestSchema = zod_1.z.object(Object.fromEntries(Object.entries(exports.BookingRequestEntity.fields).map(([key, field]) => [key, field.schema])));
exports.ConnectionSchema = zod_1.z.object(Object.fromEntries(Object.entries(exports.ConnectionEntity.fields).map(([key, field]) => [key, field.schema])));
exports.InvitationSchema = zod_1.z.object(Object.fromEntries(Object.entries(exports.InvitationEntity.fields).map(([key, field]) => [key, field.schema])));
// Export schema collection
exports.SCHEMAS = {
    User: exports.UserSchema,
    Host: exports.HostSchema,
    Availability: exports.AvailabilitySchema,
    BookingRequest: exports.BookingRequestSchema,
    Connection: exports.ConnectionSchema,
    Invitation: exports.InvitationSchema,
};
// ...existing code...
