"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformToBackend = exports.transformToFrontend = exports.validateStatus = exports.validateDateRange = exports.validateUUID = exports.validatePositiveInteger = exports.validateCoordinates = exports.validateOptionalText = exports.validateName = exports.validateEmail = exports.safeParse = exports.validate = exports.SCHEMAS = exports.ENTITIES = exports.InvitationSchema = exports.ConnectionSchema = exports.BookingRequestSchema = exports.AvailabilitySchema = exports.HostSchema = exports.UserSchema = void 0;
// Re-export all entities, schemas, and types
__exportStar(require("./entities"), exports);
__exportStar(require("./validators"), exports);
// Convenience exports for commonly used items
var entities_1 = require("./entities");
// Entity schemas
Object.defineProperty(exports, "UserSchema", { enumerable: true, get: function () { return entities_1.UserSchema; } });
Object.defineProperty(exports, "HostSchema", { enumerable: true, get: function () { return entities_1.HostSchema; } });
Object.defineProperty(exports, "AvailabilitySchema", { enumerable: true, get: function () { return entities_1.AvailabilitySchema; } });
Object.defineProperty(exports, "BookingRequestSchema", { enumerable: true, get: function () { return entities_1.BookingRequestSchema; } });
Object.defineProperty(exports, "ConnectionSchema", { enumerable: true, get: function () { return entities_1.ConnectionSchema; } });
Object.defineProperty(exports, "InvitationSchema", { enumerable: true, get: function () { return entities_1.InvitationSchema; } });
// Entity definitions
Object.defineProperty(exports, "ENTITIES", { enumerable: true, get: function () { return entities_1.ENTITIES; } });
Object.defineProperty(exports, "SCHEMAS", { enumerable: true, get: function () { return entities_1.SCHEMAS; } });
var validators_1 = require("./validators");
// Validation functions
Object.defineProperty(exports, "validate", { enumerable: true, get: function () { return validators_1.validate; } });
Object.defineProperty(exports, "safeParse", { enumerable: true, get: function () { return validators_1.safeParse; } });
// Common validators
Object.defineProperty(exports, "validateEmail", { enumerable: true, get: function () { return validators_1.validateEmail; } });
Object.defineProperty(exports, "validateName", { enumerable: true, get: function () { return validators_1.validateName; } });
Object.defineProperty(exports, "validateOptionalText", { enumerable: true, get: function () { return validators_1.validateOptionalText; } });
Object.defineProperty(exports, "validateCoordinates", { enumerable: true, get: function () { return validators_1.validateCoordinates; } });
Object.defineProperty(exports, "validatePositiveInteger", { enumerable: true, get: function () { return validators_1.validatePositiveInteger; } });
Object.defineProperty(exports, "validateUUID", { enumerable: true, get: function () { return validators_1.validateUUID; } });
Object.defineProperty(exports, "validateDateRange", { enumerable: true, get: function () { return validators_1.validateDateRange; } });
Object.defineProperty(exports, "validateStatus", { enumerable: true, get: function () { return validators_1.validateStatus; } });
// Transformations
Object.defineProperty(exports, "transformToFrontend", { enumerable: true, get: function () { return validators_1.transformToFrontend; } });
Object.defineProperty(exports, "transformToBackend", { enumerable: true, get: function () { return validators_1.transformToBackend; } });
