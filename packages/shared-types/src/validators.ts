import { z } from 'zod';
import { 
  UserSchema, 
  HostSchema, 
  AvailabilitySchema, 
  BookingRequestSchema, 
  ConnectionSchema, 
  InvitationSchema,
  User,
  Host,
  Availability,
  BookingRequest,
  Connection,
  Invitation
} from './entities';

// Validation functions that throw on error
export const validate = {
  user: (data: unknown): User => UserSchema.parse(data),
  host: (data: unknown): Host => HostSchema.parse(data),
  availability: (data: unknown): Availability => AvailabilitySchema.parse(data),
  bookingRequest: (data: unknown): BookingRequest => BookingRequestSchema.parse(data),
  connection: (data: unknown): Connection => ConnectionSchema.parse(data),
  invitation: (data: unknown): Invitation => InvitationSchema.parse(data),
};

// Safe parsing functions that return results
export const safeParse = {
  user: (data: unknown) => UserSchema.safeParse(data),
  host: (data: unknown) => HostSchema.safeParse(data),
  availability: (data: unknown) => AvailabilitySchema.safeParse(data),
  bookingRequest: (data: unknown) => BookingRequestSchema.safeParse(data),
  connection: (data: unknown) => ConnectionSchema.safeParse(data),
  invitation: (data: unknown) => InvitationSchema.safeParse(data),
};

// Common validation helpers
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

export const validateCoordinates = (lat: number | undefined, lng: number | undefined): void => {
  if (lat !== undefined && (typeof lat !== 'number' || lat < -90 || lat > 90)) {
    throw new Error('Latitude must be between -90 and 90');
  }
  if (lng !== undefined && (typeof lng !== 'number' || lng < -180 || lng > 180)) {
    throw new Error('Longitude must be between -180 and 180');
  }
};

export const validatePositiveInteger = (value: number | undefined, fieldName: string, max?: number): void => {
  if (value !== undefined && value !== null) {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      throw new Error(`${fieldName} must be a positive integer`);
    }
    if (max && value > max) {
      throw new Error(`${fieldName} must be no more than ${max}`);
    }
  }
};

export const validateUUID = (value: string | undefined, fieldName: string): void => {
  if (!value || typeof value !== 'string') {
    throw new Error(`${fieldName} is required and must be a UUID string`);
  }
  // Basic UUID v4 format check (does not enforce v4 specifically, but ensures UUID structure)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    throw new Error(`${fieldName} must be a valid UUID`);
  }
};

export const validateDateRange = (startDate: string, endDate: string): void => {
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

export const validateStatus = (status: string, validStatuses: string[]): void => {
  if (!validStatuses.includes(status)) {
    throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
  }
};

// Transformation utilities for frontend/backend compatibility
export const transformToFrontend = {
  user: (backendUser: any): User => {
    return {
      ...backendUser,
      emailVerified: backendUser.email_verified,
      createdAt: backendUser.created_at,
    };
  },
  host: (backendHost: any): Host => {
    return {
      ...backendHost,
      userId: backendHost.user_id,
      zipCode: backendHost.zip_code,
      maxGuests: backendHost.max_guests,
      houseRules: backendHost.house_rules,
      checkInTime: backendHost.check_in_time,
      checkOutTime: backendHost.check_out_time,
      createdAt: backendHost.created_at,
      updatedAt: backendHost.updated_at,
    };
  },
};

export const transformToBackend = {
  user: (frontendUser: any): User => {
    return {
      ...frontendUser,
      email_verified: frontendUser.emailVerified,
      created_at: frontendUser.createdAt,
    };
  },
  host: (frontendHost: any): Host => {
    return {
      ...frontendHost,
      user_id: frontendHost.userId,
      zip_code: frontendHost.zipCode,
      max_guests: frontendHost.maxGuests,
      house_rules: frontendHost.houseRules,
      check_in_time: frontendHost.checkInTime,
      check_out_time: frontendHost.checkOutTime,
      created_at: frontendHost.createdAt,
      updated_at: frontendHost.updatedAt,
    };
  },
};