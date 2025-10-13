/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  setupTestDatabase, 
  teardownTestDatabase, 
  getTestDatabase
} from '../setup';

describe('Database Statistics Queries', () => {
  beforeEach(() => {
    setupTestDatabase();
  });

  afterEach(() => {
    teardownTestDatabase();
  });

  describe('getTotalHostsCount', () => {
    it('should return 0 for empty database', () => {
      const db = getTestDatabase();
      
      const getTotalHostsCount = db.prepare(`SELECT COUNT(*) as count FROM hosts`);
      const result = getTotalHostsCount.get() as any;
      
      expect(result.count).toBe(0);
    });

    it('should return count of 1 for single host', () => {
      const db = getTestDatabase();
      
      // Create user and host
      const insertUser = db.prepare(`INSERT INTO users (id, email, name) VALUES (?, ?, ?)`);
      insertUser.run('user-1', 'user1@example.com', 'User 1');
      
      const insertHost = db.prepare(`
        INSERT INTO hosts (id, user_id, name, email) VALUES (?, ?, ?, ?)
      `);
      insertHost.run('host-1', 'user-1', 'Test Host', 'host1@example.com');
      
      const getTotalHostsCount = db.prepare(`SELECT COUNT(*) as count FROM hosts`);
      const result = getTotalHostsCount.get() as any;
      
      expect(result.count).toBe(1);
    });

    it('should return correct count for multiple hosts', () => {
      const db = getTestDatabase();
      
      // Create users and hosts
      const insertUser = db.prepare(`INSERT INTO users (id, email, name) VALUES (?, ?, ?)`);
      insertUser.run('user-1', 'user1@example.com', 'User 1');
      insertUser.run('user-2', 'user2@example.com', 'User 2');
      insertUser.run('user-3', 'user3@example.com', 'User 3');
      
      const insertHost = db.prepare(`
        INSERT INTO hosts (id, user_id, name, email) VALUES (?, ?, ?, ?)
      `);
      insertHost.run('host-1', 'user-1', 'Host 1', 'host1@example.com');
      insertHost.run('host-2', 'user-2', 'Host 2', 'host2@example.com');
      insertHost.run('host-3', 'user-3', 'Host 3', 'host3@example.com');
      insertHost.run('host-4', 'user-1', 'Host 4', 'host4@example.com'); // Same user with multiple hosts
      
      const getTotalHostsCount = db.prepare(`SELECT COUNT(*) as count FROM hosts`);
      const result = getTotalHostsCount.get() as any;
      
      expect(result.count).toBe(4);
    });

    it('should maintain count after deletions', () => {
      const db = getTestDatabase();
      
      // Create hosts
      const insertUser = db.prepare(`INSERT INTO users (id, email, name) VALUES (?, ?, ?)`);
      insertUser.run('user-1', 'user1@example.com', 'User 1');
      
      const insertHost = db.prepare(`
        INSERT INTO hosts (id, user_id, name, email) VALUES (?, ?, ?, ?)
      `);
      insertHost.run('host-1', 'user-1', 'Host 1', 'host1@example.com');
      insertHost.run('host-2', 'user-1', 'Host 2', 'host2@example.com');
      insertHost.run('host-3', 'user-1', 'Host 3', 'host3@example.com');
      
      // Delete one host
      const deleteHost = db.prepare('DELETE FROM hosts WHERE id = ?');
      deleteHost.run('host-2');
      
      const getTotalHostsCount = db.prepare(`SELECT COUNT(*) as count FROM hosts`);
      const result = getTotalHostsCount.get() as any;
      
      expect(result.count).toBe(2);
    });
  });

  describe('getTotalConnectionsCount', () => {
    beforeEach(() => {
      const db = getTestDatabase();
      
      // Create users for connection tests
      const insertUser = db.prepare(`INSERT INTO users (id, email, name) VALUES (?, ?, ?)`);
      insertUser.run('user-1', 'user1@example.com', 'User 1');
      insertUser.run('user-2', 'user2@example.com', 'User 2');
      insertUser.run('user-3', 'user3@example.com', 'User 3');
      insertUser.run('user-4', 'user4@example.com', 'User 4');
    });

    it('should return 0 for empty database', () => {
      const db = getTestDatabase();
      
      const getTotalConnectionsCount = db.prepare(`
        SELECT COUNT(*) as count FROM connections WHERE status = 'accepted'
      `);
      const result = getTotalConnectionsCount.get() as any;
      
      expect(result.count).toBe(0);
    });

    it('should count only accepted connections', () => {
      const db = getTestDatabase();
      
      // Create connections with different statuses
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'accepted');
      insertConnection.run('conn-2', 'user-2', 'user-3', 'friend', 'pending');
      insertConnection.run('conn-3', 'user-3', 'user-4', 'friend', 'declined');
      insertConnection.run('conn-4', 'user-1', 'user-3', 'friend', 'accepted');
      
      const getTotalConnectionsCount = db.prepare(`
        SELECT COUNT(*) as count FROM connections WHERE status = 'accepted'
      `);
      const result = getTotalConnectionsCount.get() as any;
      
      // Should only count conn-1 and conn-4
      expect(result.count).toBe(2);
    });

    it('should return 0 when only pending connections exist', () => {
      const db = getTestDatabase();
      
      // Create only pending connections
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'pending');
      insertConnection.run('conn-2', 'user-2', 'user-3', 'friend', 'pending');
      
      const getTotalConnectionsCount = db.prepare(`
        SELECT COUNT(*) as count FROM connections WHERE status = 'accepted'
      `);
      const result = getTotalConnectionsCount.get() as any;
      
      expect(result.count).toBe(0);
    });

    it('should return 0 when only declined connections exist', () => {
      const db = getTestDatabase();
      
      // Create only declined connections
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'declined');
      insertConnection.run('conn-2', 'user-2', 'user-3', 'friend', 'declined');
      
      const getTotalConnectionsCount = db.prepare(`
        SELECT COUNT(*) as count FROM connections WHERE status = 'accepted'
      `);
      const result = getTotalConnectionsCount.get() as any;
      
      expect(result.count).toBe(0);
    });

    it('should count single accepted connection', () => {
      const db = getTestDatabase();
      
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'accepted');
      
      const getTotalConnectionsCount = db.prepare(`
        SELECT COUNT(*) as count FROM connections WHERE status = 'accepted'
      `);
      const result = getTotalConnectionsCount.get() as any;
      
      expect(result.count).toBe(1);
    });

    it('should count multiple accepted connections correctly', () => {
      const db = getTestDatabase();
      
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'accepted');
      insertConnection.run('conn-2', 'user-2', 'user-3', 'friend', 'accepted');
      insertConnection.run('conn-3', 'user-3', 'user-4', 'friend', 'accepted');
      insertConnection.run('conn-4', 'user-1', 'user-4', 'family', 'accepted');
      
      const getTotalConnectionsCount = db.prepare(`
        SELECT COUNT(*) as count FROM connections WHERE status = 'accepted'
      `);
      const result = getTotalConnectionsCount.get() as any;
      
      expect(result.count).toBe(4);
    });

    it('should maintain count after status updates', () => {
      const db = getTestDatabase();
      
      // Create pending connections
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'pending');
      insertConnection.run('conn-2', 'user-2', 'user-3', 'friend', 'pending');
      
      // Accept one connection
      const updateConnection = db.prepare('UPDATE connections SET status = ? WHERE id = ?');
      updateConnection.run('accepted', 'conn-1');
      
      const getTotalConnectionsCount = db.prepare(`
        SELECT COUNT(*) as count FROM connections WHERE status = 'accepted'
      `);
      const result = getTotalConnectionsCount.get() as any;
      
      expect(result.count).toBe(1);
    });

    it('should maintain count after deletions', () => {
      const db = getTestDatabase();
      
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'accepted');
      insertConnection.run('conn-2', 'user-2', 'user-3', 'friend', 'accepted');
      insertConnection.run('conn-3', 'user-3', 'user-4', 'friend', 'accepted');
      
      // Delete one connection
      const deleteConnection = db.prepare('DELETE FROM connections WHERE id = ?');
      deleteConnection.run('conn-2');
      
      const getTotalConnectionsCount = db.prepare(`
        SELECT COUNT(*) as count FROM connections WHERE status = 'accepted'
      `);
      const result = getTotalConnectionsCount.get() as any;
      
      expect(result.count).toBe(2);
    });
  });

  describe('getTotalBookingsCount', () => {
    beforeEach(() => {
      const db = getTestDatabase();
      
      // Create users and host for booking tests
      const insertUser = db.prepare(`INSERT INTO users (id, email, name) VALUES (?, ?, ?)`);
      insertUser.run('host-user', 'host@example.com', 'Host User');
      insertUser.run('guest-user-1', 'guest1@example.com', 'Guest User 1');
      insertUser.run('guest-user-2', 'guest2@example.com', 'Guest User 2');
      insertUser.run('guest-user-3', 'guest3@example.com', 'Guest User 3');
      
      const insertHost = db.prepare(`
        INSERT INTO hosts (id, user_id, name, email) VALUES (?, ?, ?, ?)
      `);
      insertHost.run('host-1', 'host-user', 'Test Host', 'host@example.com');
    });

    it('should return 0 for empty database', () => {
      const db = getTestDatabase();
      
      const getTotalBookingsCount = db.prepare(`
        SELECT COUNT(*) as count FROM booking_requests WHERE status = 'approved'
      `);
      const result = getTotalBookingsCount.get() as any;
      
      expect(result.count).toBe(0);
    });

    it('should count only approved bookings', () => {
      const db = getTestDatabase();
      
      // Create bookings with different statuses
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertBooking.run('booking-1', 'host-1', 'guest-user-1', '2025-12-01', '2025-12-05', 2, 'approved');
      insertBooking.run('booking-2', 'host-1', 'guest-user-2', '2025-12-10', '2025-12-15', 3, 'pending');
      insertBooking.run('booking-3', 'host-1', 'guest-user-3', '2025-12-20', '2025-12-25', 4, 'declined');
      insertBooking.run('booking-4', 'host-1', 'guest-user-1', '2025-12-26', '2025-12-30', 2, 'approved');
      
      const getTotalBookingsCount = db.prepare(`
        SELECT COUNT(*) as count FROM booking_requests WHERE status = 'approved'
      `);
      const result = getTotalBookingsCount.get() as any;
      
      // Should only count booking-1 and booking-4
      expect(result.count).toBe(2);
    });

    it('should return 0 when only pending bookings exist', () => {
      const db = getTestDatabase();
      
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertBooking.run('booking-1', 'host-1', 'guest-user-1', '2025-12-01', '2025-12-05', 2, 'pending');
      insertBooking.run('booking-2', 'host-1', 'guest-user-2', '2025-12-10', '2025-12-15', 3, 'pending');
      
      const getTotalBookingsCount = db.prepare(`
        SELECT COUNT(*) as count FROM booking_requests WHERE status = 'approved'
      `);
      const result = getTotalBookingsCount.get() as any;
      
      expect(result.count).toBe(0);
    });

    it('should return 0 when only declined bookings exist', () => {
      const db = getTestDatabase();
      
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertBooking.run('booking-1', 'host-1', 'guest-user-1', '2025-12-01', '2025-12-05', 2, 'declined');
      insertBooking.run('booking-2', 'host-1', 'guest-user-2', '2025-12-10', '2025-12-15', 3, 'declined');
      
      const getTotalBookingsCount = db.prepare(`
        SELECT COUNT(*) as count FROM booking_requests WHERE status = 'approved'
      `);
      const result = getTotalBookingsCount.get() as any;
      
      expect(result.count).toBe(0);
    });

    it('should return 0 when only cancelled bookings exist', () => {
      const db = getTestDatabase();
      
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertBooking.run('booking-1', 'host-1', 'guest-user-1', '2025-12-01', '2025-12-05', 2, 'cancelled');
      
      const getTotalBookingsCount = db.prepare(`
        SELECT COUNT(*) as count FROM booking_requests WHERE status = 'approved'
      `);
      const result = getTotalBookingsCount.get() as any;
      
      expect(result.count).toBe(0);
    });

    it('should count single approved booking', () => {
      const db = getTestDatabase();
      
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertBooking.run('booking-1', 'host-1', 'guest-user-1', '2025-12-01', '2025-12-05', 2, 'approved');
      
      const getTotalBookingsCount = db.prepare(`
        SELECT COUNT(*) as count FROM booking_requests WHERE status = 'approved'
      `);
      const result = getTotalBookingsCount.get() as any;
      
      expect(result.count).toBe(1);
    });

    it('should count multiple approved bookings correctly', () => {
      const db = getTestDatabase();
      
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertBooking.run('booking-1', 'host-1', 'guest-user-1', '2025-11-01', '2025-11-05', 2, 'approved');
      insertBooking.run('booking-2', 'host-1', 'guest-user-2', '2025-11-10', '2025-11-15', 3, 'approved');
      insertBooking.run('booking-3', 'host-1', 'guest-user-3', '2025-11-20', '2025-11-25', 4, 'approved');
      insertBooking.run('booking-4', 'host-1', 'guest-user-1', '2025-12-01', '2025-12-05', 2, 'approved');
      
      const getTotalBookingsCount = db.prepare(`
        SELECT COUNT(*) as count FROM booking_requests WHERE status = 'approved'
      `);
      const result = getTotalBookingsCount.get() as any;
      
      expect(result.count).toBe(4);
    });

    it('should maintain count after status updates', () => {
      const db = getTestDatabase();
      
      // Create pending bookings
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertBooking.run('booking-1', 'host-1', 'guest-user-1', '2025-12-01', '2025-12-05', 2, 'pending');
      insertBooking.run('booking-2', 'host-1', 'guest-user-2', '2025-12-10', '2025-12-15', 3, 'pending');
      
      // Approve one booking
      const updateBooking = db.prepare('UPDATE booking_requests SET status = ? WHERE id = ?');
      updateBooking.run('approved', 'booking-1');
      
      const getTotalBookingsCount = db.prepare(`
        SELECT COUNT(*) as count FROM booking_requests WHERE status = 'approved'
      `);
      const result = getTotalBookingsCount.get() as any;
      
      expect(result.count).toBe(1);
    });

    it('should maintain count after deletions', () => {
      const db = getTestDatabase();
      
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertBooking.run('booking-1', 'host-1', 'guest-user-1', '2025-11-01', '2025-11-05', 2, 'approved');
      insertBooking.run('booking-2', 'host-1', 'guest-user-2', '2025-11-10', '2025-11-15', 3, 'approved');
      insertBooking.run('booking-3', 'host-1', 'guest-user-3', '2025-11-20', '2025-11-25', 4, 'approved');
      
      // Delete one booking
      const deleteBooking = db.prepare('DELETE FROM booking_requests WHERE id = ?');
      deleteBooking.run('booking-2');
      
      const getTotalBookingsCount = db.prepare(`
        SELECT COUNT(*) as count FROM booking_requests WHERE status = 'approved'
      `);
      const result = getTotalBookingsCount.get() as any;
      
      expect(result.count).toBe(2);
    });

    it('should handle mixed statuses including cancelled', () => {
      const db = getTestDatabase();
      
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertBooking.run('booking-1', 'host-1', 'guest-user-1', '2025-11-01', '2025-11-05', 2, 'approved');
      insertBooking.run('booking-2', 'host-1', 'guest-user-2', '2025-11-10', '2025-11-15', 3, 'cancelled');
      insertBooking.run('booking-3', 'host-1', 'guest-user-3', '2025-11-20', '2025-11-25', 4, 'approved');
      insertBooking.run('booking-4', 'host-1', 'guest-user-1', '2025-12-01', '2025-12-05', 2, 'pending');
      insertBooking.run('booking-5', 'host-1', 'guest-user-2', '2025-12-10', '2025-12-15', 3, 'declined');
      
      const getTotalBookingsCount = db.prepare(`
        SELECT COUNT(*) as count FROM booking_requests WHERE status = 'approved'
      `);
      const result = getTotalBookingsCount.get() as any;
      
      // Should only count booking-1 and booking-3
      expect(result.count).toBe(2);
    });
  });

  describe('Cross-Statistics Scenarios', () => {
    it('should report consistent metrics across all statistics', () => {
      const db = getTestDatabase();
      
      // Create comprehensive test scenario
      const insertUser = db.prepare(`INSERT INTO users (id, email, name) VALUES (?, ?, ?)`);
      insertUser.run('user-1', 'user1@example.com', 'User 1');
      insertUser.run('user-2', 'user2@example.com', 'User 2');
      insertUser.run('user-3', 'user3@example.com', 'User 3');
      
      const insertHost = db.prepare(`
        INSERT INTO hosts (id, user_id, name, email) VALUES (?, ?, ?, ?)
      `);
      insertHost.run('host-1', 'user-1', 'Host 1', 'host1@example.com');
      insertHost.run('host-2', 'user-2', 'Host 2', 'host2@example.com');
      
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'accepted');
      insertConnection.run('conn-2', 'user-2', 'user-3', 'friend', 'accepted');
      
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertBooking.run('booking-1', 'host-1', 'user-2', '2025-12-01', '2025-12-05', 2, 'approved');
      insertBooking.run('booking-2', 'host-2', 'user-1', '2025-12-10', '2025-12-15', 3, 'approved');
      
      // Check all statistics
      const getTotalHostsCount = db.prepare(`SELECT COUNT(*) as count FROM hosts`);
      const hostsResult = getTotalHostsCount.get() as any;
      expect(hostsResult.count).toBe(2);
      
      const getTotalConnectionsCount = db.prepare(`
        SELECT COUNT(*) as count FROM connections WHERE status = 'accepted'
      `);
      const connectionsResult = getTotalConnectionsCount.get() as any;
      expect(connectionsResult.count).toBe(2);
      
      const getTotalBookingsCount = db.prepare(`
        SELECT COUNT(*) as count FROM booking_requests WHERE status = 'approved'
      `);
      const bookingsResult = getTotalBookingsCount.get() as any;
      expect(bookingsResult.count).toBe(2);
    });
  });
});
