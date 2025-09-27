"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformToBackend = exports.transformToFrontend = exports.validateStatus = exports.validateDateRange = exports.validateUUID = exports.validatePositiveInteger = exports.validateCoordinates = exports.validateOptionalText = exports.validateName = exports.validateEmail = exports.safeParse = exports.validate = void 0;
const entities_1 = require("./entities");
// Validation functions that throw on error
exports.validate = {
    user: (data) => entities_1.UserSchema.parse(data),
    host: (data) => entities_1.HostSchema.parse(data),
    availability: (data) => entities_1.AvailabilitySchema.parse(data),
    bookingRequest: (data) => entities_1.BookingRequestSchema.parse(data),
    connection: (data) => entities_1.ConnectionSchema.parse(data),
    invitation: (data) => entities_1.InvitationSchema.parse(data),
};
// Safe parsing functions that return results
exports.safeParse = {
    user: (data) => entities_1.UserSchema.safeParse(data),
    host: (data) => entities_1.HostSchema.safeParse(data),
    availability: (data) => entities_1.AvailabilitySchema.safeParse(data),
    bookingRequest: (data) => entities_1.BookingRequestSchema.safeParse(data),
    connection: (data) => entities_1.ConnectionSchema.safeParse(data),
    invitation: (data) => entities_1.InvitationSchema.safeParse(data),
};
// Common validation helpers
const validateEmail = (email) => {
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
exports.validateEmail = validateEmail;
const validateName = (name) => {
    if (!name || typeof name !== 'string') {
        throw new Error('Name is required');
    }
    if (name.trim().length < 1 || name.length > 255) {
        throw new Error('Name must be between 1 and 255 characters');
    }
};
exports.validateName = validateName;
const validateOptionalText = (text, fieldName, maxLength) => {
    if (text !== undefined && text !== null) {
        if (typeof text !== 'string') {
            throw new Error(`${fieldName} must be a string`);
        }
        if (text.length > maxLength) {
            throw new Error(`${fieldName} must be no more than ${maxLength} characters`);
        }
    }
};
exports.validateOptionalText = validateOptionalText;
const validateCoordinates = (lat, lng) => {
    if (lat !== undefined && (typeof lat !== 'number' || lat < -90 || lat > 90)) {
        throw new Error('Latitude must be between -90 and 90');
    }
    if (lng !== undefined && (typeof lng !== 'number' || lng < -180 || lng > 180)) {
        throw new Error('Longitude must be between -180 and 180');
    }
};
exports.validateCoordinates = validateCoordinates;
const validatePositiveInteger = (value, fieldName, max) => {
    if (value !== undefined && value !== null) {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
            throw new Error(`${fieldName} must be a positive integer`);
        }
        if (max && value > max) {
            throw new Error(`${fieldName} must be no more than ${max}`);
        }
    }
};
exports.validatePositiveInteger = validatePositiveInteger;
const validateUUID = (value, fieldName) => {
    if (!value || typeof value !== 'string') {
        throw new Error(`${fieldName} is required and must be a UUID string`);
    }
    // Basic UUID v4 format check (does not enforce v4 specifically, but ensures UUID structure)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
        throw new Error(`${fieldName} must be a valid UUID`);
    }
};
exports.validateUUID = validateUUID;
const validateDateRange = (startDate, endDate) => {
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
exports.validateDateRange = validateDateRange;
const validateStatus = (status, validStatuses) => {
    if (!validStatuses.includes(status)) {
        throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
    }
};
exports.validateStatus = validateStatus;
// Transformation utilities for frontend/backend compatibility
exports.transformToFrontend = {
    user: (backendUser) => {
        return {
            ...backendUser,
            emailVerified: backendUser.email_verified,
            createdAt: backendUser.created_at,
        };
    },
    host: (backendHost) => {
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
exports.transformToBackend = {
    user: (frontendUser) => {
        return {
            ...frontendUser,
            email_verified: frontendUser.emailVerified,
            created_at: frontendUser.createdAt,
        };
    },
    host: (frontendHost) => {
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
