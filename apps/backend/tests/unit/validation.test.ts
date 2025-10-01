import { 
  setupTestDatabase, 
  teardownTestDatabase, 
} from '../setup';
import {
  validateEmail,
  validateName,
  validateOptionalText,
  validateCoordinates,
  validatePositiveInteger,
  validateDateRange,
  validateStatus,
} from '@stay-with-friends/shared-types';

describe('Validation Functions', () => {
  beforeEach(() => {
    setupTestDatabase();
  });

  afterEach(() => {
    teardownTestDatabase();
  });

  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      expect(() => validateEmail('test@example.com')).not.toThrow();
      expect(() => validateEmail('user.name+tag@domain.co.uk')).not.toThrow();
      expect(() => validateEmail('a@b.c')).not.toThrow(); // Minimum valid length (5 chars)
    });

    it('should reject invalid email addresses', () => {
      expect(() => validateEmail('invalid')).toThrow('Email must be a valid email address');
      expect(() => validateEmail('test@')).toThrow('Email must be a valid email address');
      expect(() => validateEmail('testtt')).toThrow('Email must be a valid email address');
      expect(() => validateEmail('a'.repeat(256))).toThrow('Email must be between 5 and 255 characters');
    });

    it('should reject emails with invalid domains', () => {
      expect(() => validateEmail('test@domain')).toThrow('Email must be a valid email address');
      expect(() => validateEmail('test@.com')).toThrow('Email must be a valid email address');
      expect(() => validateEmail('test@domain.')).toThrow('Email must be a valid email address');
      expect(() => validateEmail('@domain.com')).toThrow('Email must be a valid email address');
    });

    it('should reject emails with whitespace', () => {
      expect(() => validateEmail('test @example.com')).toThrow('Email must be a valid email address');
      expect(() => validateEmail('test@ example.com')).toThrow('Email must be a valid email address');
      expect(() => validateEmail(' test@example.com')).toThrow('Email must be a valid email address');
      expect(() => validateEmail('test@example.com ')).toThrow('Email must be a valid email address');
    });

    it('should reject very short emails', () => {
      expect(() => validateEmail('a@b')).toThrow('Email must be between 5 and 255 characters');
      expect(() => validateEmail('a@')).toThrow('Email must be between 5 and 255 characters');
    });

    it('should reject non-string values', () => {
      expect(() => validateEmail(null as unknown as string)).toThrow('Email is required');
      expect(() => validateEmail(undefined as unknown as string)).toThrow('Email is required');
      expect(() => validateEmail(123 as unknown as string)).toThrow('Email is required');
    });
  });

  describe('validateName', () => {
    it('should accept valid names', () => {
      expect(() => validateName('John Doe')).not.toThrow();
      expect(() => validateName('A')).not.toThrow();
      expect(() => validateName('Mary-Jane O\'Connor')).not.toThrow();
    });

    it('should reject invalid names', () => {
      expect(() => validateName('')).toThrow('Name is required');
      expect(() => validateName('   ')).toThrow('Name must be between 1 and 255 characters');
      expect(() => validateName('a'.repeat(256))).toThrow('Name must be between 1 and 255 characters');
    });

    it('should reject very long names', () => {
      const longName = 'a'.repeat(300);
      expect(() => validateName(longName)).toThrow('Name must be between 1 and 255 characters');
    });

    it('should handle names with mixed whitespace', () => {
      expect(() => validateName('  ')).toThrow('Name must be between 1 and 255 characters');
      expect(() => validateName('\t')).toThrow('Name must be between 1 and 255 characters');
      expect(() => validateName('\n')).toThrow('Name must be between 1 and 255 characters');
      expect(() => validateName(' \t\n ')).toThrow('Name must be between 1 and 255 characters');
    });

    it('should accept names with leading/trailing spaces that have content', () => {
      expect(() => validateName(' John ')).not.toThrow();
      expect(() => validateName('  Jane  ')).not.toThrow();
    });

    it('should reject non-string values', () => {
      expect(() => validateName(null as unknown as string)).toThrow('Name is required');
      expect(() => validateName(undefined as unknown as string)).toThrow('Name is required');
      expect(() => validateName(123 as unknown as string)).toThrow('Name is required');
    });
  });

  describe('validateOptionalText', () => {
    it('should accept valid optional text', () => {
      expect(() => validateOptionalText('Valid text', 'Test', 100)).not.toThrow();
      expect(() => validateOptionalText(undefined, 'Test', 100)).not.toThrow();
      expect(() => validateOptionalText('', 'Test', 100)).not.toThrow();
    });
  
    it('should reject text exceeding max length', () => {
      expect(() => validateOptionalText('a'.repeat(101), 'Test', 100))
        .toThrow('Test must be no more than 100 characters');
    });

    it('should reject very long text', () => {
      const veryLongText = 'a'.repeat(10000);
      expect(() => validateOptionalText(veryLongText, 'Description', 5000))
        .toThrow('Description must be no more than 5000 characters');
    });

    it('should accept text with mixed whitespace', () => {
      expect(() => validateOptionalText('  spaces  ', 'Test', 100)).not.toThrow();
      expect(() => validateOptionalText('\t\n\r', 'Test', 100)).not.toThrow();
    });

    it('should reject non-string values', () => {
      expect(() => validateOptionalText(123 as unknown as string, 'Test', 100))
        .toThrow('Test must be a string');
    });
  });

  describe('validateCoordinates', () => {
    it('should accept valid coordinates', () => {
      expect(() => validateCoordinates(40.7128, -74.0060)).not.toThrow();
      expect(() => validateCoordinates(90, 180)).not.toThrow();
      expect(() => validateCoordinates(-90, -180)).not.toThrow();
      expect(() => validateCoordinates(undefined, undefined)).not.toThrow();
      expect(() => validateCoordinates(0, 0)).not.toThrow(); // Null Island
    });

    it('should reject invalid coordinates', () => {
      expect(() => validateCoordinates(91, 0)).toThrow('Latitude must be between -90 and 90');
      expect(() => validateCoordinates(-91, 0)).toThrow('Latitude must be between -90 and 90');
      expect(() => validateCoordinates(0, 181)).toThrow('Longitude must be between -180 and 180');
      expect(() => validateCoordinates(0, -181)).toThrow('Longitude must be between -180 and 180');
    });

    it('should reject out-of-range coordinates', () => {
      expect(() => validateCoordinates(100, 0)).toThrow('Latitude must be between -90 and 90');
      expect(() => validateCoordinates(-100, 0)).toThrow('Latitude must be between -90 and 90');
      expect(() => validateCoordinates(0, 200)).toThrow('Longitude must be between -180 and 180');
      expect(() => validateCoordinates(0, -200)).toThrow('Longitude must be between -180 and 180');
      expect(() => validateCoordinates(500, 500)).toThrow('Latitude must be between -90 and 90');
    });

    it('should reject non-numeric values', () => {
      expect(() => validateCoordinates('40.7128' as unknown as number, 0)).toThrow('Latitude must be between -90 and 90');
      expect(() => validateCoordinates(0, '-74.0060' as unknown as number)).toThrow('Longitude must be between -180 and 180');
    });

    it('should handle extreme precision coordinates', () => {
      expect(() => validateCoordinates(40.712775897, -74.005973754)).not.toThrow();
      expect(() => validateCoordinates(89.99999999, 179.99999999)).not.toThrow();
    });
  });

  describe('validatePositiveInteger', () => {
    it('should accept valid positive integers', () => {
      expect(() => validatePositiveInteger(1, 'Test')).not.toThrow();
      expect(() => validatePositiveInteger(100, 'Test', 200)).not.toThrow();
      expect(() => validatePositiveInteger(0, 'Test')).not.toThrow();
      expect(() => validatePositiveInteger(undefined, 'Test')).not.toThrow();
    });

    it('should reject invalid values', () => {
      expect(() => validatePositiveInteger(-1, 'Test')).toThrow('Test must be a positive integer');
      expect(() => validatePositiveInteger(1.5, 'Test')).toThrow('Test must be a positive integer');
      expect(() => validatePositiveInteger(101, 'Test', 100)).toThrow('Test must be no more than 100');
    });

    it('should reject negative values including negative guest counts', () => {
      expect(() => validatePositiveInteger(-1, 'Guest count')).toThrow('Guest count must be a positive integer');
      expect(() => validatePositiveInteger(-10, 'Guest count')).toThrow('Guest count must be a positive integer');
      expect(() => validatePositiveInteger(-100, 'Max guests')).toThrow('Max guests must be a positive integer');
    });

    it('should reject floating point numbers', () => {
      expect(() => validatePositiveInteger(1.1, 'Test')).toThrow('Test must be a positive integer');
      expect(() => validatePositiveInteger(99.9, 'Test')).toThrow('Test must be a positive integer');
      expect(() => validatePositiveInteger(0.5, 'Test')).toThrow('Test must be a positive integer');
    });

    it('should handle large integers', () => {
      expect(() => validatePositiveInteger(1000000, 'Test')).not.toThrow();
      expect(() => validatePositiveInteger(Number.MAX_SAFE_INTEGER, 'Test')).not.toThrow();
    });

    it('should reject non-numeric values', () => {
      expect(() => validatePositiveInteger('5' as unknown as number, 'Test')).toThrow('Test must be a positive integer');
    });
  });

  describe('validateDateRange', () => {
    it('should accept valid date ranges', () => {
      expect(() => validateDateRange('2025-12-01', '2025-12-07')).not.toThrow();
      expect(() => validateDateRange('2025-12-01', '2025-12-01')).not.toThrow(); // Same date
    });

    it('should reject invalid date ranges', () => {
      expect(() => validateDateRange('', '2025-12-07')).toThrow('Start date and end date are required');
      expect(() => validateDateRange('2025-12-01', '')).toThrow('Start date and end date are required');
      expect(() => validateDateRange('invalid-date', '2025-12-07')).toThrow('Invalid date format');
      expect(() => validateDateRange('2025-12-07', '2025-12-01')).toThrow('Start date must be before or equal to end date');
    });

    it('should handle various invalid date formats', () => {
      expect(() => validateDateRange('not-a-date', '2025-12-07')).toThrow('Invalid date format');
      expect(() => validateDateRange('2025-12-01', 'not-a-date')).toThrow('Invalid date format');
      // Note: JavaScript Date constructor is lenient and accepts '12/01/2025' format
      // The validator uses new Date() which will parse various formats
      expect(() => validateDateRange('2025-13-01', '2025-12-07')).toThrow('Invalid date format');
      expect(() => validateDateRange('2025-12-32', '2025-12-07')).toThrow('Invalid date format');
    });

    it('should accept long date ranges', () => {
      expect(() => validateDateRange('2025-01-01', '2025-12-31')).not.toThrow();
      expect(() => validateDateRange('2025-01-01', '2026-01-01')).not.toThrow();
    });
  });

  describe('validateStatus', () => {
    it('should accept valid statuses', () => {
      const validStatuses = ['pending', 'approved', 'declined', 'cancelled'];
      expect(() => validateStatus('pending', validStatuses)).not.toThrow();
      expect(() => validateStatus('approved', validStatuses)).not.toThrow();
      expect(() => validateStatus('declined', validStatuses)).not.toThrow();
      expect(() => validateStatus('cancelled', validStatuses)).not.toThrow();
    });

    it('should reject invalid statuses', () => {
      const validStatuses = ['pending', 'approved', 'declined', 'cancelled'];
      expect(() => validateStatus('invalid', validStatuses))
        .toThrow('Status must be one of: pending, approved, declined, cancelled');
      expect(() => validateStatus('PENDING', validStatuses))
        .toThrow('Status must be one of: pending, approved, declined, cancelled');
      expect(() => validateStatus('Pending', validStatuses))
        .toThrow('Status must be one of: pending, approved, declined, cancelled');
    });

    it('should reject empty or whitespace statuses', () => {
      const validStatuses = ['pending', 'approved', 'declined', 'cancelled'];
      expect(() => validateStatus('', validStatuses))
        .toThrow('Status must be one of: pending, approved, declined, cancelled');
      expect(() => validateStatus(' ', validStatuses))
        .toThrow('Status must be one of: pending, approved, declined, cancelled');
    });

    it('should be case-sensitive', () => {
      const validStatuses = ['active', 'inactive'];
      expect(() => validateStatus('ACTIVE', validStatuses))
        .toThrow('Status must be one of: active, inactive');
    });
  });
});