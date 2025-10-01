/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  setupTestDatabase, 
  teardownTestDatabase, 
  getTestDatabase
} from '../setup';

describe('Database Derived Data - Read-Only Queries', () => {
  beforeEach(() => {
    setupTestDatabase();
  });

  afterEach(() => {
    teardownTestDatabase();
  });

  describe('getAvailabilityDates', () => {
    beforeEach(() => {
      const db = getTestDatabase();
      
      // Create users and hosts
      const insertUser = db.prepare(`INSERT INTO users (id, email, name) VALUES (?, ?, ?)`);
      insertUser.run('user-1', 'user1@example.com', 'User 1');
      
      const insertHost = db.prepare(`INSERT INTO hosts (id, user_id, name, email) VALUES (?, ?, ?, ?)`);
      insertHost.run('host-1', 'user-1', 'Test Host', 'host1@example.com');
    });

    it('should return empty array for empty date range', () => {
      const db = getTestDatabase();
      
      const getAvailabilityDates = db.prepare(`
        WITH RECURSIVE date_series AS (
          SELECT ? as date
          UNION ALL
          SELECT date(date, '+1 day')
          FROM date_series
          WHERE date < ?
        ),
        availability_ranges AS (
          SELECT start_date, end_date
          FROM availabilities
          WHERE status = 'available'
          AND start_date <= ?
          AND end_date >= ?
        )
        SELECT DISTINCT ds.date
        FROM date_series ds
        JOIN availability_ranges ar
        ON ds.date >= ar.start_date AND ds.date <= ar.end_date
        ORDER BY ds.date
      `);
      
      // No availabilities exist
      const results = getAvailabilityDates.all('2025-12-01', '2025-12-07', '2025-12-07', '2025-12-01');
      
      expect(results).toEqual([]);
    });

    it('should return all dates in a single availability window', () => {
      const db = getTestDatabase();
      
      // Create availability
      const insertAvailability = db.prepare(`
        INSERT INTO availabilities (id, host_id, start_date, end_date, status) 
        VALUES (?, ?, ?, ?, ?)
      `);
      insertAvailability.run('avail-1', 'host-1', '2025-12-01', '2025-12-05', 'available');
      
      const getAvailabilityDates = db.prepare(`
        WITH RECURSIVE date_series AS (
          SELECT ? as date
          UNION ALL
          SELECT date(date, '+1 day')
          FROM date_series
          WHERE date < ?
        ),
        availability_ranges AS (
          SELECT start_date, end_date
          FROM availabilities
          WHERE status = 'available'
          AND start_date <= ?
          AND end_date >= ?
        )
        SELECT DISTINCT ds.date
        FROM date_series ds
        JOIN availability_ranges ar
        ON ds.date >= ar.start_date AND ds.date <= ar.end_date
        ORDER BY ds.date
      `);
      
      const results = getAvailabilityDates.all('2025-12-01', '2025-12-05', '2025-12-05', '2025-12-01');
      
      expect(results).toHaveLength(5);
      expect(results[0]).toMatchObject({ date: '2025-12-01' });
      expect(results[4]).toMatchObject({ date: '2025-12-05' });
    });

    it('should handle overlapping availability windows', () => {
      const db = getTestDatabase();
      
      // Create overlapping availabilities
      const insertAvailability = db.prepare(`
        INSERT INTO availabilities (id, host_id, start_date, end_date, status) 
        VALUES (?, ?, ?, ?, ?)
      `);
      insertAvailability.run('avail-1', 'host-1', '2025-12-01', '2025-12-05', 'available');
      insertAvailability.run('avail-2', 'host-1', '2025-12-03', '2025-12-08', 'available');
      
      const getAvailabilityDates = db.prepare(`
        WITH RECURSIVE date_series AS (
          SELECT ? as date
          UNION ALL
          SELECT date(date, '+1 day')
          FROM date_series
          WHERE date < ?
        ),
        availability_ranges AS (
          SELECT start_date, end_date
          FROM availabilities
          WHERE status = 'available'
          AND start_date <= ?
          AND end_date >= ?
        )
        SELECT DISTINCT ds.date
        FROM date_series ds
        JOIN availability_ranges ar
        ON ds.date >= ar.start_date AND ds.date <= ar.end_date
        ORDER BY ds.date
      `);
      
      const results = getAvailabilityDates.all('2025-12-01', '2025-12-08', '2025-12-08', '2025-12-01');
      
      // Should have 8 unique dates despite overlap
      expect(results).toHaveLength(8);
      expect(results[0]).toMatchObject({ date: '2025-12-01' });
      expect(results[7]).toMatchObject({ date: '2025-12-08' });
    });

    it('should exclude booked and blocked statuses', () => {
      const db = getTestDatabase();
      
      // Create availabilities with different statuses
      const insertAvailability = db.prepare(`
        INSERT INTO availabilities (id, host_id, start_date, end_date, status) 
        VALUES (?, ?, ?, ?, ?)
      `);
      insertAvailability.run('avail-1', 'host-1', '2025-12-01', '2025-12-03', 'available');
      insertAvailability.run('avail-2', 'host-1', '2025-12-04', '2025-12-06', 'booked');
      insertAvailability.run('avail-3', 'host-1', '2025-12-07', '2025-12-09', 'blocked');
      
      const getAvailabilityDates = db.prepare(`
        WITH RECURSIVE date_series AS (
          SELECT ? as date
          UNION ALL
          SELECT date(date, '+1 day')
          FROM date_series
          WHERE date < ?
        ),
        availability_ranges AS (
          SELECT start_date, end_date
          FROM availabilities
          WHERE status = 'available'
          AND start_date <= ?
          AND end_date >= ?
        )
        SELECT DISTINCT ds.date
        FROM date_series ds
        JOIN availability_ranges ar
        ON ds.date >= ar.start_date AND ds.date <= ar.end_date
        ORDER BY ds.date
      `);
      
      const results = getAvailabilityDates.all('2025-12-01', '2025-12-09', '2025-12-09', '2025-12-01');
      
      // Should only return dates from available status (Dec 1-3)
      expect(results).toHaveLength(3);
      expect(results[0]).toMatchObject({ date: '2025-12-01' });
      expect(results[2]).toMatchObject({ date: '2025-12-03' });
    });

    it('should handle gaps in availability', () => {
      const db = getTestDatabase();
      
      // Create availabilities with gaps
      const insertAvailability = db.prepare(`
        INSERT INTO availabilities (id, host_id, start_date, end_date, status) 
        VALUES (?, ?, ?, ?, ?)
      `);
      insertAvailability.run('avail-1', 'host-1', '2025-12-01', '2025-12-03', 'available');
      insertAvailability.run('avail-2', 'host-1', '2025-12-06', '2025-12-08', 'available');
      
      const getAvailabilityDates = db.prepare(`
        WITH RECURSIVE date_series AS (
          SELECT ? as date
          UNION ALL
          SELECT date(date, '+1 day')
          FROM date_series
          WHERE date < ?
        ),
        availability_ranges AS (
          SELECT start_date, end_date
          FROM availabilities
          WHERE status = 'available'
          AND start_date <= ?
          AND end_date >= ?
        )
        SELECT DISTINCT ds.date
        FROM date_series ds
        JOIN availability_ranges ar
        ON ds.date >= ar.start_date AND ds.date <= ar.end_date
        ORDER BY ds.date
      `);
      
      const results = getAvailabilityDates.all('2025-12-01', '2025-12-08', '2025-12-08', '2025-12-01');
      
      // Should return 6 dates (3 + 3, skipping Dec 4-5)
      expect(results).toHaveLength(6);
      expect(results.map(r => (r as any).date)).toEqual([
        '2025-12-01', '2025-12-02', '2025-12-03',
        '2025-12-06', '2025-12-07', '2025-12-08'
      ]);
    });

    it('should handle query range that extends beyond availability', () => {
      const db = getTestDatabase();
      
      // Create availability
      const insertAvailability = db.prepare(`
        INSERT INTO availabilities (id, host_id, start_date, end_date, status) 
        VALUES (?, ?, ?, ?, ?)
      `);
      insertAvailability.run('avail-1', 'host-1', '2025-12-05', '2025-12-10', 'available');
      
      const getAvailabilityDates = db.prepare(`
        WITH RECURSIVE date_series AS (
          SELECT ? as date
          UNION ALL
          SELECT date(date, '+1 day')
          FROM date_series
          WHERE date < ?
        ),
        availability_ranges AS (
          SELECT start_date, end_date
          FROM availabilities
          WHERE status = 'available'
          AND start_date <= ?
          AND end_date >= ?
        )
        SELECT DISTINCT ds.date
        FROM date_series ds
        JOIN availability_ranges ar
        ON ds.date >= ar.start_date AND ds.date <= ar.end_date
        ORDER BY ds.date
      `);
      
      // Query for Dec 1-15, but availability is only Dec 5-10
      const results = getAvailabilityDates.all('2025-12-01', '2025-12-15', '2025-12-15', '2025-12-01');
      
      // Should only return Dec 5-10
      expect(results).toHaveLength(6);
      expect(results[0]).toMatchObject({ date: '2025-12-05' });
      expect(results[5]).toMatchObject({ date: '2025-12-10' });
    });
  });

  describe('searchHostsAvailableOnDate', () => {
    beforeEach(() => {
      const db = getTestDatabase();
      
      // Create multiple users and hosts
      const insertUser = db.prepare(`INSERT INTO users (id, email, name) VALUES (?, ?, ?)`);
      insertUser.run('user-1', 'user1@example.com', 'User 1');
      insertUser.run('user-2', 'user2@example.com', 'User 2');
      insertUser.run('user-3', 'user3@example.com', 'User 3');
      
      const insertHost = db.prepare(`
        INSERT INTO hosts (id, user_id, name, email, description, location, city, state) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertHost.run('host-1', 'user-1', 'Beach House', 'host1@example.com', 'Cozy beach house', 'Malibu Beach', 'Malibu', 'CA');
      insertHost.run('host-2', 'user-2', 'Mountain Cabin', 'host2@example.com', 'Rustic mountain retreat', 'Rocky Mountains', 'Denver', 'CO');
      insertHost.run('host-3', 'user-3', 'City Apartment', 'host3@example.com', 'Modern downtown apartment', 'Downtown', 'New York', 'NY');
    });

    it('should return empty array when no hosts are available', () => {
      const db = getTestDatabase();
      
      const searchHostsAvailableOnDate = db.prepare(`
        SELECT DISTINCT h.*
        FROM hosts h
        INNER JOIN availabilities a ON h.id = a.host_id
        WHERE a.start_date <= ? 
          AND a.end_date >= ?
          AND a.status = 'available'
          AND (h.name LIKE ? OR h.description LIKE ? OR h.location LIKE ? OR h.city LIKE ? OR h.state LIKE ?)
        ORDER BY h.name
      `);
      
      const searchTerm = '%beach%';
      const results = searchHostsAvailableOnDate.all(
        '2025-12-01', '2025-12-01', searchTerm, searchTerm, searchTerm, searchTerm, searchTerm
      );
      
      expect(results).toEqual([]);
    });

    it('should find hosts available on a specific date', () => {
      const db = getTestDatabase();
      
      // Create availabilities
      const insertAvailability = db.prepare(`
        INSERT INTO availabilities (id, host_id, start_date, end_date, status) 
        VALUES (?, ?, ?, ?, ?)
      `);
      insertAvailability.run('avail-1', 'host-1', '2025-12-01', '2025-12-10', 'available');
      insertAvailability.run('avail-2', 'host-2', '2025-12-05', '2025-12-15', 'available');
      
      const searchHostsAvailableOnDate = db.prepare(`
        SELECT DISTINCT h.*
        FROM hosts h
        INNER JOIN availabilities a ON h.id = a.host_id
        WHERE a.start_date <= ? 
          AND a.end_date >= ?
          AND a.status = 'available'
          AND (h.name LIKE ? OR h.description LIKE ? OR h.location LIKE ? OR h.city LIKE ? OR h.state LIKE ?)
        ORDER BY h.name
      `);
      
      const searchTerm = '%%'; // Match all
      const results = searchHostsAvailableOnDate.all(
        '2025-12-07', '2025-12-07', searchTerm, searchTerm, searchTerm, searchTerm, searchTerm
      );
      
      // Both hosts available on Dec 7
      expect(results).toHaveLength(2);
      expect((results[0] as any).name).toBe('Beach House');
      expect((results[1] as any).name).toBe('Mountain Cabin');
    });

    it('should filter by search term in name', () => {
      const db = getTestDatabase();
      
      // Create availabilities
      const insertAvailability = db.prepare(`
        INSERT INTO availabilities (id, host_id, start_date, end_date, status) 
        VALUES (?, ?, ?, ?, ?)
      `);
      insertAvailability.run('avail-1', 'host-1', '2025-12-01', '2025-12-10', 'available');
      insertAvailability.run('avail-2', 'host-2', '2025-12-01', '2025-12-10', 'available');
      insertAvailability.run('avail-3', 'host-3', '2025-12-01', '2025-12-10', 'available');
      
      const searchHostsAvailableOnDate = db.prepare(`
        SELECT DISTINCT h.*
        FROM hosts h
        INNER JOIN availabilities a ON h.id = a.host_id
        WHERE a.start_date <= ? 
          AND a.end_date >= ?
          AND a.status = 'available'
          AND (h.name LIKE ? OR h.description LIKE ? OR h.location LIKE ? OR h.city LIKE ? OR h.state LIKE ?)
        ORDER BY h.name
      `);
      
      const searchTerm = '%Beach%';
      const results = searchHostsAvailableOnDate.all(
        '2025-12-05', '2025-12-05', searchTerm, searchTerm, searchTerm, searchTerm, searchTerm
      );
      
      expect(results).toHaveLength(1);
      expect((results[0] as any).name).toBe('Beach House');
    });

    it('should filter by search term in description', () => {
      const db = getTestDatabase();
      
      // Create availabilities
      const insertAvailability = db.prepare(`
        INSERT INTO availabilities (id, host_id, start_date, end_date, status) 
        VALUES (?, ?, ?, ?, ?)
      `);
      insertAvailability.run('avail-1', 'host-1', '2025-12-01', '2025-12-10', 'available');
      insertAvailability.run('avail-2', 'host-2', '2025-12-01', '2025-12-10', 'available');
      
      const searchHostsAvailableOnDate = db.prepare(`
        SELECT DISTINCT h.*
        FROM hosts h
        INNER JOIN availabilities a ON h.id = a.host_id
        WHERE a.start_date <= ? 
          AND a.end_date >= ?
          AND a.status = 'available'
          AND (h.name LIKE ? OR h.description LIKE ? OR h.location LIKE ? OR h.city LIKE ? OR h.state LIKE ?)
        ORDER BY h.name
      `);
      
      const searchTerm = '%rustic%';
      const results = searchHostsAvailableOnDate.all(
        '2025-12-05', '2025-12-05', searchTerm, searchTerm, searchTerm, searchTerm, searchTerm
      );
      
      expect(results).toHaveLength(1);
      expect((results[0] as any).name).toBe('Mountain Cabin');
    });

    it('should filter by search term in location or city', () => {
      const db = getTestDatabase();
      
      // Create availabilities
      const insertAvailability = db.prepare(`
        INSERT INTO availabilities (id, host_id, start_date, end_date, status) 
        VALUES (?, ?, ?, ?, ?)
      `);
      insertAvailability.run('avail-1', 'host-1', '2025-12-01', '2025-12-10', 'available');
      insertAvailability.run('avail-2', 'host-2', '2025-12-01', '2025-12-10', 'available');
      insertAvailability.run('avail-3', 'host-3', '2025-12-01', '2025-12-10', 'available');
      
      const searchHostsAvailableOnDate = db.prepare(`
        SELECT DISTINCT h.*
        FROM hosts h
        INNER JOIN availabilities a ON h.id = a.host_id
        WHERE a.start_date <= ? 
          AND a.end_date >= ?
          AND a.status = 'available'
          AND (h.name LIKE ? OR h.description LIKE ? OR h.location LIKE ? OR h.city LIKE ? OR h.state LIKE ?)
        ORDER BY h.name
      `);
      
      const searchTerm = '%New York%';
      const results = searchHostsAvailableOnDate.all(
        '2025-12-05', '2025-12-05', searchTerm, searchTerm, searchTerm, searchTerm, searchTerm
      );
      
      expect(results).toHaveLength(1);
      expect((results[0] as any).name).toBe('City Apartment');
    });

    it('should exclude hosts with booked status', () => {
      const db = getTestDatabase();
      
      // Create availabilities with different statuses
      const insertAvailability = db.prepare(`
        INSERT INTO availabilities (id, host_id, start_date, end_date, status) 
        VALUES (?, ?, ?, ?, ?)
      `);
      insertAvailability.run('avail-1', 'host-1', '2025-12-01', '2025-12-10', 'available');
      insertAvailability.run('avail-2', 'host-2', '2025-12-01', '2025-12-10', 'booked');
      insertAvailability.run('avail-3', 'host-3', '2025-12-01', '2025-12-10', 'blocked');
      
      const searchHostsAvailableOnDate = db.prepare(`
        SELECT DISTINCT h.*
        FROM hosts h
        INNER JOIN availabilities a ON h.id = a.host_id
        WHERE a.start_date <= ? 
          AND a.end_date >= ?
          AND a.status = 'available'
          AND (h.name LIKE ? OR h.description LIKE ? OR h.location LIKE ? OR h.city LIKE ? OR h.state LIKE ?)
        ORDER BY h.name
      `);
      
      const searchTerm = '%%';
      const results = searchHostsAvailableOnDate.all(
        '2025-12-05', '2025-12-05', searchTerm, searchTerm, searchTerm, searchTerm, searchTerm
      );
      
      // Only host-1 should be returned
      expect(results).toHaveLength(1);
      expect((results[0] as any).name).toBe('Beach House');
    });

    it('should handle date range boundaries correctly', () => {
      const db = getTestDatabase();
      
      // Create availabilities with specific date ranges
      const insertAvailability = db.prepare(`
        INSERT INTO availabilities (id, host_id, start_date, end_date, status) 
        VALUES (?, ?, ?, ?, ?)
      `);
      insertAvailability.run('avail-1', 'host-1', '2025-12-05', '2025-12-10', 'available');
      
      const searchHostsAvailableOnDate = db.prepare(`
        SELECT DISTINCT h.*
        FROM hosts h
        INNER JOIN availabilities a ON h.id = a.host_id
        WHERE a.start_date <= ? 
          AND a.end_date >= ?
          AND a.status = 'available'
          AND (h.name LIKE ? OR h.description LIKE ? OR h.location LIKE ? OR h.city LIKE ? OR h.state LIKE ?)
        ORDER BY h.name
      `);
      
      const searchTerm = '%%';
      
      // Query for dates on boundaries
      const resultsOnStart = searchHostsAvailableOnDate.all(
        '2025-12-05', '2025-12-05', searchTerm, searchTerm, searchTerm, searchTerm, searchTerm
      );
      const resultsOnEnd = searchHostsAvailableOnDate.all(
        '2025-12-10', '2025-12-10', searchTerm, searchTerm, searchTerm, searchTerm, searchTerm
      );
      const resultsBeforeStart = searchHostsAvailableOnDate.all(
        '2025-12-04', '2025-12-04', searchTerm, searchTerm, searchTerm, searchTerm, searchTerm
      );
      const resultsAfterEnd = searchHostsAvailableOnDate.all(
        '2025-12-11', '2025-12-11', searchTerm, searchTerm, searchTerm, searchTerm, searchTerm
      );
      
      expect(resultsOnStart).toHaveLength(1);
      expect(resultsOnEnd).toHaveLength(1);
      expect(resultsBeforeStart).toHaveLength(0);
      expect(resultsAfterEnd).toHaveLength(0);
    });

    it('should deduplicate hosts with multiple overlapping availabilities', () => {
      const db = getTestDatabase();
      
      // Create multiple overlapping availabilities for the same host
      const insertAvailability = db.prepare(`
        INSERT INTO availabilities (id, host_id, start_date, end_date, status) 
        VALUES (?, ?, ?, ?, ?)
      `);
      insertAvailability.run('avail-1', 'host-1', '2025-12-01', '2025-12-10', 'available');
      insertAvailability.run('avail-2', 'host-1', '2025-12-05', '2025-12-15', 'available');
      insertAvailability.run('avail-3', 'host-1', '2025-12-08', '2025-12-20', 'available');
      
      const searchHostsAvailableOnDate = db.prepare(`
        SELECT DISTINCT h.*
        FROM hosts h
        INNER JOIN availabilities a ON h.id = a.host_id
        WHERE a.start_date <= ? 
          AND a.end_date >= ?
          AND a.status = 'available'
          AND (h.name LIKE ? OR h.description LIKE ? OR h.location LIKE ? OR h.city LIKE ? OR h.state LIKE ?)
        ORDER BY h.name
      `);
      
      const searchTerm = '%%';
      const results = searchHostsAvailableOnDate.all(
        '2025-12-09', '2025-12-09', searchTerm, searchTerm, searchTerm, searchTerm, searchTerm
      );
      
      // Should return only 1 host despite 3 matching availabilities
      expect(results).toHaveLength(1);
      expect((results[0] as any).name).toBe('Beach House');
    });
  });

  describe('getPendingBookingRequestsCountByHostUser', () => {
    beforeEach(() => {
      const db = getTestDatabase();
      
      // Create users and hosts
      const insertUser = db.prepare(`INSERT INTO users (id, email, name) VALUES (?, ?, ?)`);
      insertUser.run('host-user-1', 'host1@example.com', 'Host User 1');
      insertUser.run('host-user-2', 'host2@example.com', 'Host User 2');
      insertUser.run('guest-user-1', 'guest1@example.com', 'Guest User 1');
      insertUser.run('guest-user-2', 'guest2@example.com', 'Guest User 2');
      
      const insertHost = db.prepare(`
        INSERT INTO hosts (id, user_id, name, email) VALUES (?, ?, ?, ?)
      `);
      insertHost.run('host-1', 'host-user-1', 'Beach House', 'host1@example.com');
      insertHost.run('host-2', 'host-user-1', 'Mountain Cabin', 'host1-cabin@example.com'); // Same user
      insertHost.run('host-3', 'host-user-2', 'City Apartment', 'host2@example.com');
    });

    it('should return 0 for host with no booking requests', () => {
      const db = getTestDatabase();
      
      const getPendingBookingRequestsCountByHostUser = db.prepare(`
        SELECT COUNT(*) as count
        FROM booking_requests br
        JOIN hosts h ON br.host_id = h.id
        WHERE h.user_id = ? AND br.status = 'pending'
      `);
      
      const result = getPendingBookingRequestsCountByHostUser.get('host-user-1') as any;
      
      expect(result.count).toBe(0);
    });

    it('should count pending booking requests for single host', () => {
      const db = getTestDatabase();
      
      // Create booking requests
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertBooking.run('booking-1', 'host-1', 'guest-user-1', '2025-12-01', '2025-12-05', 2, 'pending');
      insertBooking.run('booking-2', 'host-1', 'guest-user-2', '2025-12-10', '2025-12-15', 3, 'pending');
      
      const getPendingBookingRequestsCountByHostUser = db.prepare(`
        SELECT COUNT(*) as count
        FROM booking_requests br
        JOIN hosts h ON br.host_id = h.id
        WHERE h.user_id = ? AND br.status = 'pending'
      `);
      
      const result = getPendingBookingRequestsCountByHostUser.get('host-user-1') as any;
      
      expect(result.count).toBe(2);
    });

    it('should count pending booking requests across multiple hosts owned by same user', () => {
      const db = getTestDatabase();
      
      // Create booking requests for multiple hosts owned by same user
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertBooking.run('booking-1', 'host-1', 'guest-user-1', '2025-12-01', '2025-12-05', 2, 'pending');
      insertBooking.run('booking-2', 'host-2', 'guest-user-2', '2025-12-10', '2025-12-15', 3, 'pending');
      insertBooking.run('booking-3', 'host-1', 'guest-user-2', '2025-12-20', '2025-12-25', 4, 'pending');
      
      const getPendingBookingRequestsCountByHostUser = db.prepare(`
        SELECT COUNT(*) as count
        FROM booking_requests br
        JOIN hosts h ON br.host_id = h.id
        WHERE h.user_id = ? AND br.status = 'pending'
      `);
      
      const result = getPendingBookingRequestsCountByHostUser.get('host-user-1') as any;
      
      // Should count all 3 pending requests across host-1 and host-2
      expect(result.count).toBe(3);
    });

    it('should exclude non-pending booking statuses', () => {
      const db = getTestDatabase();
      
      // Create booking requests with mixed statuses
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertBooking.run('booking-1', 'host-1', 'guest-user-1', '2025-12-01', '2025-12-05', 2, 'pending');
      insertBooking.run('booking-2', 'host-1', 'guest-user-2', '2025-12-10', '2025-12-15', 3, 'approved');
      insertBooking.run('booking-3', 'host-1', 'guest-user-1', '2025-12-20', '2025-12-25', 4, 'declined');
      insertBooking.run('booking-4', 'host-1', 'guest-user-2', '2025-12-26', '2025-12-30', 2, 'cancelled');
      insertBooking.run('booking-5', 'host-2', 'guest-user-1', '2025-12-01', '2025-12-05', 3, 'pending');
      
      const getPendingBookingRequestsCountByHostUser = db.prepare(`
        SELECT COUNT(*) as count
        FROM booking_requests br
        JOIN hosts h ON br.host_id = h.id
        WHERE h.user_id = ? AND br.status = 'pending'
      `);
      
      const result = getPendingBookingRequestsCountByHostUser.get('host-user-1') as any;
      
      // Should only count booking-1 and booking-5 (pending status)
      expect(result.count).toBe(2);
    });

    it('should isolate counts between different host users', () => {
      const db = getTestDatabase();
      
      // Create booking requests for different hosts
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertBooking.run('booking-1', 'host-1', 'guest-user-1', '2025-12-01', '2025-12-05', 2, 'pending');
      insertBooking.run('booking-2', 'host-2', 'guest-user-2', '2025-12-10', '2025-12-15', 3, 'pending');
      insertBooking.run('booking-3', 'host-3', 'guest-user-1', '2025-12-20', '2025-12-25', 4, 'pending');
      
      const getPendingBookingRequestsCountByHostUser = db.prepare(`
        SELECT COUNT(*) as count
        FROM booking_requests br
        JOIN hosts h ON br.host_id = h.id
        WHERE h.user_id = ? AND br.status = 'pending'
      `);
      
      const resultUser1 = getPendingBookingRequestsCountByHostUser.get('host-user-1') as any;
      const resultUser2 = getPendingBookingRequestsCountByHostUser.get('host-user-2') as any;
      
      // host-user-1 owns host-1 and host-2
      expect(resultUser1.count).toBe(2);
      // host-user-2 owns host-3
      expect(resultUser2.count).toBe(1);
    });

    it('should handle mixed booking statuses for same host user', () => {
      const db = getTestDatabase();
      
      // Create diverse booking scenarios
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      // Host 1 - Beach House
      insertBooking.run('booking-1', 'host-1', 'guest-user-1', '2025-11-01', '2025-11-05', 2, 'approved');
      insertBooking.run('booking-2', 'host-1', 'guest-user-2', '2025-11-10', '2025-11-15', 3, 'pending');
      insertBooking.run('booking-3', 'host-1', 'guest-user-1', '2025-11-20', '2025-11-25', 2, 'declined');
      
      // Host 2 - Mountain Cabin (same user)
      insertBooking.run('booking-4', 'host-2', 'guest-user-2', '2025-12-01', '2025-12-05', 4, 'pending');
      insertBooking.run('booking-5', 'host-2', 'guest-user-1', '2025-12-10', '2025-12-15', 2, 'pending');
      insertBooking.run('booking-6', 'host-2', 'guest-user-2', '2025-12-20', '2025-12-25', 3, 'cancelled');
      
      // Host 3 - City Apartment (different user)
      insertBooking.run('booking-7', 'host-3', 'guest-user-1', '2025-12-01', '2025-12-05', 2, 'pending');
      
      const getPendingBookingRequestsCountByHostUser = db.prepare(`
        SELECT COUNT(*) as count
        FROM booking_requests br
        JOIN hosts h ON br.host_id = h.id
        WHERE h.user_id = ? AND br.status = 'pending'
      `);
      
      const resultUser1 = getPendingBookingRequestsCountByHostUser.get('host-user-1') as any;
      const resultUser2 = getPendingBookingRequestsCountByHostUser.get('host-user-2') as any;
      
      // host-user-1: booking-2, booking-4, booking-5 = 3 pending
      expect(resultUser1.count).toBe(3);
      // host-user-2: booking-7 = 1 pending
      expect(resultUser2.count).toBe(1);
    });

    it('should return 0 for user with no hosts', () => {
      const db = getTestDatabase();
      
      // Create a user with no associated hosts
      const insertUser = db.prepare(`INSERT INTO users (id, email, name) VALUES (?, ?, ?)`);
      insertUser.run('user-no-hosts', 'nohost@example.com', 'No Host User');
      
      const getPendingBookingRequestsCountByHostUser = db.prepare(`
        SELECT COUNT(*) as count
        FROM booking_requests br
        JOIN hosts h ON br.host_id = h.id
        WHERE h.user_id = ? AND br.status = 'pending'
      `);
      
      const result = getPendingBookingRequestsCountByHostUser.get('user-no-hosts') as any;
      
      expect(result.count).toBe(0);
    });

    it('should handle empty database gracefully', () => {
      const db = getTestDatabase();
      
      // Clear all data
      db.exec('DELETE FROM booking_requests');
      db.exec('DELETE FROM hosts');
      db.exec('DELETE FROM users');
      
      const getPendingBookingRequestsCountByHostUser = db.prepare(`
        SELECT COUNT(*) as count
        FROM booking_requests br
        JOIN hosts h ON br.host_id = h.id
        WHERE h.user_id = ? AND br.status = 'pending'
      `);
      
      const result = getPendingBookingRequestsCountByHostUser.get('non-existent-user') as any;
      
      expect(result.count).toBe(0);
    });
  });

  describe('Complex Scenarios - Mixed Statuses and Overlapping Data', () => {
    beforeEach(() => {
      const db = getTestDatabase();
      
      // Set up comprehensive test scenario
      const insertUser = db.prepare(`INSERT INTO users (id, email, name) VALUES (?, ?, ?)`);
      insertUser.run('host-user-1', 'host1@example.com', 'Host User 1');
      insertUser.run('guest-user-1', 'guest1@example.com', 'Guest User 1');
      insertUser.run('guest-user-2', 'guest2@example.com', 'Guest User 2');
      
      const insertHost = db.prepare(`
        INSERT INTO hosts (id, user_id, name, email, description, city, state) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertHost.run('host-1', 'host-user-1', 'Test Property', 'host1@example.com', 'Great place', 'TestCity', 'TS');
    });

    it('should correctly handle host with overlapping availabilities and mixed booking statuses', () => {
      const db = getTestDatabase();
      
      // Create overlapping availabilities with mixed statuses
      const insertAvailability = db.prepare(`
        INSERT INTO availabilities (id, host_id, start_date, end_date, status) 
        VALUES (?, ?, ?, ?, ?)
      `);
      insertAvailability.run('avail-1', 'host-1', '2025-12-01', '2025-12-10', 'available');
      insertAvailability.run('avail-2', 'host-1', '2025-12-05', '2025-12-08', 'booked');
      insertAvailability.run('avail-3', 'host-1', '2025-12-11', '2025-12-20', 'available');
      
      // Create booking requests with mixed statuses
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertBooking.run('booking-1', 'host-1', 'guest-user-1', '2025-12-01', '2025-12-03', 2, 'pending');
      insertBooking.run('booking-2', 'host-1', 'guest-user-2', '2025-12-05', '2025-12-08', 3, 'approved');
      insertBooking.run('booking-3', 'host-1', 'guest-user-1', '2025-12-15', '2025-12-18', 2, 'pending');
      insertBooking.run('booking-4', 'host-1', 'guest-user-2', '2025-12-20', '2025-12-25', 4, 'declined');
      
      // Test availability dates query
      const getAvailabilityDates = db.prepare(`
        WITH RECURSIVE date_series AS (
          SELECT ? as date
          UNION ALL
          SELECT date(date, '+1 day')
          FROM date_series
          WHERE date < ?
        ),
        availability_ranges AS (
          SELECT start_date, end_date
          FROM availabilities
          WHERE status = 'available'
          AND start_date <= ?
          AND end_date >= ?
        )
        SELECT DISTINCT ds.date
        FROM date_series ds
        JOIN availability_ranges ar
        ON ds.date >= ar.start_date AND ds.date <= ar.end_date
        ORDER BY ds.date
      `);
      
      const availableDates = getAvailabilityDates.all('2025-12-01', '2025-12-20', '2025-12-20', '2025-12-01');
      
      // Should return dates from avail-1 (Dec 1-10) and avail-3 (Dec 11-20), excluding avail-2 (booked)
      expect(availableDates).toHaveLength(20);
      
      // Test pending booking count
      const getPendingBookingRequestsCountByHostUser = db.prepare(`
        SELECT COUNT(*) as count
        FROM booking_requests br
        JOIN hosts h ON br.host_id = h.id
        WHERE h.user_id = ? AND br.status = 'pending'
      `);
      
      const pendingCount = getPendingBookingRequestsCountByHostUser.get('host-user-1') as any;
      
      // Should only count booking-1 and booking-3 (pending)
      expect(pendingCount.count).toBe(2);
      
      // Test search by date
      const searchHostsAvailableOnDate = db.prepare(`
        SELECT DISTINCT h.*
        FROM hosts h
        INNER JOIN availabilities a ON h.id = a.host_id
        WHERE a.start_date <= ? 
          AND a.end_date >= ?
          AND a.status = 'available'
          AND (h.name LIKE ? OR h.description LIKE ? OR h.location LIKE ? OR h.city LIKE ? OR h.state LIKE ?)
        ORDER BY h.name
      `);
      
      const searchTerm = '%%';
      // Search for Dec 7 (within booked range in avail-2, but also overlaps with available avail-1)
      const searchResults = searchHostsAvailableOnDate.all(
        '2025-12-07', '2025-12-07', searchTerm, searchTerm, searchTerm, searchTerm, searchTerm
      );
      
      // Should return the host because avail-1 is available and covers Dec 7
      expect(searchResults).toHaveLength(1);
      expect((searchResults[0] as any).name).toBe('Test Property');
    });

    it('should handle edge case with same-day availabilities and bookings', () => {
      const db = getTestDatabase();
      
      // Create same-day availability
      const insertAvailability = db.prepare(`
        INSERT INTO availabilities (id, host_id, start_date, end_date, status) 
        VALUES (?, ?, ?, ?, ?)
      `);
      insertAvailability.run('avail-1', 'host-1', '2025-12-15', '2025-12-15', 'available');
      
      // Create same-day booking
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertBooking.run('booking-1', 'host-1', 'guest-user-1', '2025-12-15', '2025-12-15', 2, 'pending');
      
      // Test availability dates
      const getAvailabilityDates = db.prepare(`
        WITH RECURSIVE date_series AS (
          SELECT ? as date
          UNION ALL
          SELECT date(date, '+1 day')
          FROM date_series
          WHERE date < ?
        ),
        availability_ranges AS (
          SELECT start_date, end_date
          FROM availabilities
          WHERE status = 'available'
          AND start_date <= ?
          AND end_date >= ?
        )
        SELECT DISTINCT ds.date
        FROM date_series ds
        JOIN availability_ranges ar
        ON ds.date >= ar.start_date AND ds.date <= ar.end_date
        ORDER BY ds.date
      `);
      
      const availableDates = getAvailabilityDates.all('2025-12-15', '2025-12-15', '2025-12-15', '2025-12-15');
      
      expect(availableDates).toHaveLength(1);
      expect((availableDates[0] as any).date).toBe('2025-12-15');
      
      // Test pending count
      const getPendingBookingRequestsCountByHostUser = db.prepare(`
        SELECT COUNT(*) as count
        FROM booking_requests br
        JOIN hosts h ON br.host_id = h.id
        WHERE h.user_id = ? AND br.status = 'pending'
      `);
      
      const pendingCount = getPendingBookingRequestsCountByHostUser.get('host-user-1') as any;
      
      expect(pendingCount.count).toBe(1);
    });
  });
});
