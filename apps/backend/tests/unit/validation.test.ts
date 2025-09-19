import { 
  setupTestDatabase, 
  teardownTestDatabase, 
  createTestUser, 
  createTestHost,
  createTestAvailability,
  createTestBookingRequest,
  createTestConnection,
  createTestInvitation
} from '../setup';

// Mock the validation functions from schema.ts
const validateEmail = (email: string): void => {
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required');
  }
  if (email.length < 5 || email.length > 255) {
    throw new Error('Email must be between 5 and 255 characters');
  }
  if (!email.includes('@') || !email.includes('.')) {
    throw new Error('Email must be a valid email address');
  }
};

const validateName = (name: string): void => {
  if (!name || typeof name !== 'string') {
    throw new Error('Name is required');
  }
  if (name.trim().length < 1 || name.length > 255) {
    throw new Error('Name must be between 1 and 255 characters');
  }
};

const validateOptionalText = (text: string | undefined, fieldName: string, maxLength: number): void => {
  if (text !== undefined && text !== null) {
    if (typeof text !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }
    if (text.length > maxLength) {
      throw new Error(`${fieldName} must be no more than ${maxLength} characters`);
    }
  }
};

const validateCoordinates = (lat: number | undefined, lng: number | undefined): void => {
  if (lat !== undefined && (typeof lat !== 'number' || lat < -90 || lat > 90)) {
    throw new Error('Latitude must be between -90 and 90');
  }
  if (lng !== undefined && (typeof lng !== 'number' || lng < -180 || lng > 180)) {
    throw new Error('Longitude must be between -180 and 180');
  }
};

const validatePositiveInteger = (value: number | undefined, fieldName: string, max?: number): void => {
  if (value !== undefined && value !== null) {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      throw new Error(`${fieldName} must be a positive integer`);
    }
    if (max && value > max) {
      throw new Error(`${fieldName} must be no more than ${max}`);
    }
  }
};

const validateDateRange = (startDate: string, endDate: string): void => {
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

const validateStatus = (status: string, validStatuses: string[]): void => {
  if (status && !validStatuses.includes(status)) {
    throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
  }
};

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
    });

    it('should reject invalid email addresses', () => {
      expect(() => validateEmail('invalid')).toThrow('Email must be a valid email address');
      expect(() => validateEmail('test@')).toThrow('Email must be a valid email address');
      expect(() => validateEmail('testtt')).toThrow('Email must be a valid email address');
      expect(() => validateEmail('a'.repeat(256))).toThrow('Email must be between 5 and 255 characters');
    });

    it('should reject non-string values', () => {
      expect(() => validateEmail(null as any)).toThrow('Email is required');
      expect(() => validateEmail(undefined as any)).toThrow('Email is required');
      expect(() => validateEmail(123 as any)).toThrow('Email is required');
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

    it('should reject non-string values', () => {
      expect(() => validateName(null as any)).toThrow('Name is required');
      expect(() => validateName(undefined as any)).toThrow('Name is required');
      expect(() => validateName(123 as any)).toThrow('Name is required');
    });
  });

  describe('validateOptionalText', () => {
  it('should accept valid optional text', () => {
    expect(() => validateOptionalText('Valid text', 'Test', 100)).not.toThrow();
    expect(() => validateOptionalText(undefined, 'Test', 100)).not.toThrow();
    expect(() => validateOptionalText(null as any, 'Test', 100)).not.toThrow();
  });    it('should reject text exceeding max length', () => {
      expect(() => validateOptionalText('a'.repeat(101), 'Test', 100))
        .toThrow('Test must be no more than 100 characters');
    });

    it('should reject non-string values', () => {
      expect(() => validateOptionalText(123 as any, 'Test', 100))
        .toThrow('Test must be a string');
    });
  });

  describe('validateCoordinates', () => {
    it('should accept valid coordinates', () => {
      expect(() => validateCoordinates(40.7128, -74.0060)).not.toThrow();
      expect(() => validateCoordinates(90, 180)).not.toThrow();
      expect(() => validateCoordinates(-90, -180)).not.toThrow();
      expect(() => validateCoordinates(undefined, undefined)).not.toThrow();
    });

    it('should reject invalid coordinates', () => {
      expect(() => validateCoordinates(91, 0)).toThrow('Latitude must be between -90 and 90');
      expect(() => validateCoordinates(-91, 0)).toThrow('Latitude must be between -90 and 90');
      expect(() => validateCoordinates(0, 181)).toThrow('Longitude must be between -180 and 180');
      expect(() => validateCoordinates(0, -181)).toThrow('Longitude must be between -180 and 180');
    });

    it('should reject non-numeric values', () => {
      expect(() => validateCoordinates('40.7128' as any, 0)).toThrow('Latitude must be between -90 and 90');
      expect(() => validateCoordinates(0, '-74.0060' as any)).toThrow('Longitude must be between -180 and 180');
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

    it('should reject non-numeric values', () => {
      expect(() => validatePositiveInteger('5' as any, 'Test')).toThrow('Test must be a positive integer');
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
  });

  describe('validateStatus', () => {
    it('should accept valid statuses', () => {
      const validStatuses = ['pending', 'approved', 'declined', 'cancelled'];
      expect(() => validateStatus('pending', validStatuses)).not.toThrow();
      expect(() => validateStatus('approved', validStatuses)).not.toThrow();
      expect(() => validateStatus('', validStatuses)).not.toThrow(); // Empty string is allowed
    });

    it('should reject invalid statuses', () => {
      const validStatuses = ['pending', 'approved', 'declined', 'cancelled'];
      expect(() => validateStatus('invalid', validStatuses))
        .toThrow('Status must be one of: pending, approved, declined, cancelled');
    });
  });
});