// Re-export all entities, schemas, and types
export * from './entities';
export * from './validators';

// Convenience exports for commonly used items
export {
  // Entity schemas
  UserSchema,
  HostSchema,
  AvailabilitySchema,
  BookingRequestSchema,
  ConnectionSchema,
  InvitationSchema,
  
  // Types
  User,
  Host,
  Availability,
  BookingRequest,
  Connection,
  Invitation,
  
  // Entity definitions
  ENTITIES,
  SCHEMAS,
} from './entities';

export {
  // Validation functions
  validate,
  safeParse,
  
  // Common validators
  validateEmail,
  validateName,
  validateOptionalText,
  validateCoordinates,
  validatePositiveInteger,
  validateUUID,
  validateDateRange,
  validateStatus,
  
  // Transformations
  transformToFrontend,
  transformToBackend,
} from './validators';