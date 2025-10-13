/* eslint-disable @typescript-eslint/no-explicit-any */
import { validateDateRange } from '@stay-with-friends/shared-utils';

describe('validateDateRange', () => {
  describe('valid date ranges', () => {
    it('should accept valid date range with start before end', () => {
      expect(() => {
        validateDateRange('2025-12-01', '2025-12-05');
      }).not.toThrow();
    });

    it('should accept same start and end date', () => {
      expect(() => {
        validateDateRange('2025-12-01', '2025-12-01');
      }).not.toThrow();
    });

    it('should accept valid date range with different months', () => {
      expect(() => {
        validateDateRange('2025-11-30', '2025-12-01');
      }).not.toThrow();
    });

    it('should accept valid date range with different years', () => {
      expect(() => {
        validateDateRange('2025-12-31', '2026-01-01');
      }).not.toThrow();
    });
  });

  describe('invalid date ranges - missing values', () => {
    it('should throw error when startDate is empty string', () => {
      expect(() => {
        validateDateRange('', '2025-12-05');
      }).toThrow('Start date and end date are required');
    });

    it('should throw error when endDate is empty string', () => {
      expect(() => {
        validateDateRange('2025-12-01', '');
      }).toThrow('Start date and end date are required');
    });

    it('should throw error when startDate is null', () => {
      expect(() => {
        validateDateRange(null as any, '2025-12-05');
      }).toThrow('Start date and end date are required');
    });

    it('should throw error when endDate is null', () => {
      expect(() => {
        validateDateRange('2025-12-01', null as any);
      }).toThrow('Start date and end date are required');
    });

    it('should throw error when startDate is undefined', () => {
      expect(() => {
        validateDateRange(undefined as any, '2025-12-05');
      }).toThrow('Start date and end date are required');
    });

    it('should throw error when endDate is undefined', () => {
      expect(() => {
        validateDateRange('2025-12-01', undefined as any);
      }).toThrow('Start date and end date are required');
    });
  });

  describe('invalid date ranges - invalid formats', () => {
    it('should throw error for invalid startDate format', () => {
      expect(() => {
        validateDateRange('not-a-date', '2025-12-05');
      }).toThrow('Invalid date format');
    });

    it('should throw error for invalid endDate format', () => {
      expect(() => {
        validateDateRange('2025-12-01', 'not-a-date');
      }).toThrow('Invalid date format');
    });

    it('should throw error for both invalid date formats', () => {
      expect(() => {
        validateDateRange('invalid', 'also-invalid');
      }).toThrow('Invalid date format');
    });

    it('should throw error for malformed date string', () => {
      expect(() => {
        validateDateRange('2025-13-01', '2025-12-05'); // Invalid month
      }).toThrow('Invalid date format');
    });

    it('should throw error for date with invalid day', () => {
      expect(() => {
        validateDateRange('2025-12-32', '2025-12-05'); // Invalid day
      }).toThrow('Invalid date format');
    });

    it('should throw error for non-ISO date format', () => {
      expect(() => {
        validateDateRange('12/01/2025', '12/05/2025');
      }).toThrow('Invalid date format');
    });

    it('should throw error for date with time component', () => {
      expect(() => {
        validateDateRange('2025-12-01T10:00:00Z', '2025-12-05');
      }).toThrow('Invalid date format');
    });
  });

  describe('invalid date ranges - reversed ranges', () => {
    it('should throw error when start date is after end date', () => {
      expect(() => {
        validateDateRange('2025-12-05', '2025-12-01');
      }).toThrow('Start date must be before or equal to end date');
    });

    it('should throw error when start date is much later than end date', () => {
      expect(() => {
        validateDateRange('2025-12-15', '2025-12-01');
      }).toThrow('Start date must be before or equal to end date');
    });

    it('should throw error when dates are in different years and reversed', () => {
      expect(() => {
        validateDateRange('2026-01-01', '2025-12-31');
      }).toThrow('Start date must be before or equal to end date');
    });
  });

  describe('edge cases', () => {
    it('should handle leap year dates correctly', () => {
      expect(() => {
        validateDateRange('2024-02-28', '2024-02-29'); // Leap year
      }).not.toThrow();
    });

    it('should reject invalid leap year date', () => {
      expect(() => {
        validateDateRange('2023-02-29', '2023-03-01'); // Not a leap year
      }).toThrow('Invalid date format');
    });

    it('should handle month boundaries correctly', () => {
      expect(() => {
        validateDateRange('2025-01-31', '2025-02-01');
      }).not.toThrow();
    });

    it('should reject invalid day for specific month', () => {
      expect(() => {
        validateDateRange('2025-04-31', '2025-05-01'); // April has only 30 days
      }).toThrow('Invalid date format');
    });

    it('should handle year boundaries correctly', () => {
      expect(() => {
        validateDateRange('2025-12-31', '2026-01-01');
      }).not.toThrow();
    });
  });

  describe('type validation', () => {
    it('should accept string inputs', () => {
      expect(() => {
        validateDateRange('2025-12-01', '2025-12-05');
      }).not.toThrow();
    });

    it('should reject non-string startDate', () => {
      expect(() => {
        validateDateRange(20251201 as any, '2025-12-05');
      }).toThrow('Start date and end date are required');
    });

    it('should reject non-string endDate', () => {
      expect(() => {
        validateDateRange('2025-12-01', 20251205 as any);
      }).toThrow('Start date and end date are required');
    });
  });
});