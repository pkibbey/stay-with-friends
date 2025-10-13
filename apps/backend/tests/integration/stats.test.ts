import request from 'supertest';
import express from 'express';
import statsRouter from '../../src/routes/stats';
import { db } from '../../src/db';

const app = express();
app.use(express.json());
app.use('/api', statsRouter);

describe('Stats Routes Integration Tests', () => {
  beforeAll(() => {
    // Ensure clean database for the entire test suite
    db.exec(`
      DELETE FROM booking_requests;
      DELETE FROM connections;
      DELETE FROM hosts;
      DELETE FROM users;
    `);
  });

  beforeEach(() => {
    // Clean up the test database before each test
    db.exec(`
      DELETE FROM booking_requests;
      DELETE FROM connections;
      DELETE FROM hosts;
      DELETE FROM users;
    `);
    
    // Create test users that can be referenced
    const insertUser = db.prepare(`INSERT INTO users (id, email, name) VALUES (?, ?, ?)`);
    insertUser.run('user-1', 'user1@example.com', 'User 1');
    insertUser.run('user-2', 'user2@example.com', 'User 2');
    insertUser.run('user-3', 'user3@example.com', 'User 3');
  });

  describe('GET /api/stats/hosts', () => {
    it('should return total hosts count', async () => {
      // Initially should be 0
      const initialResponse = await request(app)
        .get('/api/stats/hosts')
        .expect(200);

      expect(initialResponse.body).toHaveProperty('count');
      expect(initialResponse.body.count).toBe(0);

      // Add some hosts
      const insertHost = db.prepare(`
        INSERT INTO hosts (id, user_id, name, location, description, address, city, state, zip_code, country, latitude, longitude, amenities, house_rules, check_in_time, check_out_time, max_guests, bedrooms, bathrooms, photos)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertHost.run(
        'host-1', 'user-1', 'Host 1', 'City 1', 'Desc 1', 'Addr 1', 'City 1', 'ST', '12345', 'Country', 40.7128, -74.0060, '[]', 'Rules 1', '3:00 PM', '11:00 AM', 4, 2, 1, '[]'
      );

      insertHost.run(
        'host-2', 'user-2', 'Host 2', 'City 2', 'Desc 2', 'Addr 2', 'City 2', 'ST', '67890', 'Country', 34.0522, -118.2437, '[]', 'Rules 2', '4:00 PM', '10:00 AM', 6, 3, 2, '[]'
      );

      const response = await request(app)
        .get('/api/stats/hosts')
        .expect(200);

      expect(response.body.count).toBe(2);
    });
  });

  describe('GET /api/stats/connections', () => {
    it('should return total accepted connections count', async () => {
      // Initially should be 0
      const initialResponse = await request(app)
        .get('/api/stats/connections')
        .expect(200);

      expect(initialResponse.body).toHaveProperty('count');
      expect(initialResponse.body.count).toBe(0);

      // Add some connections
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'accepted');
      insertConnection.run('conn-2', 'user-3', 'user-1', 'colleague', 'accepted');
      insertConnection.run('conn-3', 'user-1', 'user-3', 'acquaintance', 'pending'); // Not accepted

      const response = await request(app)
        .get('/api/stats/connections')
        .expect(200);

      expect(response.body.count).toBe(2); // Only accepted connections count
    });

    it('should not count declined or blocked connections', async () => {
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'accepted');
      insertConnection.run('conn-2', 'user-1', 'user-3', 'colleague', 'declined');
      insertConnection.run('conn-3', 'user-2', 'user-3', 'acquaintance', 'blocked');

      const response = await request(app)
        .get('/api/stats/connections')
        .expect(200);

      expect(response.body.count).toBe(1); // Only the accepted one
    });
  });

  describe('GET /api/stats/bookings', () => {
    it('should return total approved bookings count', async () => {
      // Initially should be 0
      const initialResponse = await request(app)
        .get('/api/stats/bookings')
        .expect(200);

      expect(initialResponse.body).toHaveProperty('count');
      expect(initialResponse.body.count).toBe(0);

      // First create a host for the booking
      const insertHost = db.prepare(`
        INSERT INTO hosts (id, user_id, name, location, description, address, city, state, zip_code, country, latitude, longitude, amenities, house_rules, check_in_time, check_out_time, max_guests, bedrooms, bathrooms, photos)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertHost.run(
        'host-1', 'user-1', 'Host 1', 'City 1', 'Desc 1', 'Addr 1', 'City 1', 'ST', '12345', 'Country', 40.7128, -74.0060, '[]', 'Rules 1', '3:00 PM', '11:00 AM', 4, 2, 1, '[]'
      );

      // Add some booking requests
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, message, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertBooking.run('booking-1', 'host-1', 'user-2', '2025-01-01', '2025-01-07', 2, 'Approved booking', 'approved');
      insertBooking.run('booking-2', 'host-1', 'user-3', '2025-01-15', '2025-01-21', 1, 'Pending booking', 'pending');
      insertBooking.run('booking-3', 'host-1', 'user-2', '2025-02-01', '2025-02-07', 3, 'Declined booking', 'declined');

      const response = await request(app)
        .get('/api/stats/bookings')
        .expect(200);

      expect(response.body.count).toBe(1); // Only approved bookings count
    });

    it('should not count pending or declined bookings', async () => {
      // Create host
      const insertHost = db.prepare(`
        INSERT INTO hosts (id, user_id, name, location, description, address, city, state, zip_code, country, latitude, longitude, amenities, house_rules, check_in_time, check_out_time, max_guests, bedrooms, bathrooms, photos)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertHost.run(
        'host-1', 'user-1', 'Host 1', 'City 1', 'Desc 1', 'Addr 1', 'City 1', 'ST', '12345', 'Country', 40.7128, -74.0060, '[]', 'Rules 1', '3:00 PM', '11:00 AM', 4, 2, 1, '[]'
      );

      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, message, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertBooking.run('booking-1', 'host-1', 'user-2', '2025-01-01', '2025-01-07', 2, 'Approved', 'approved');
      insertBooking.run('booking-2', 'host-1', 'user-3', '2025-01-15', '2025-01-21', 1, 'Pending', 'pending');
      insertBooking.run('booking-3', 'host-1', 'user-2', '2025-02-01', '2025-02-07', 3, 'Declined', 'declined');
      insertBooking.run('booking-4', 'host-1', 'user-3', '2025-02-15', '2025-02-21', 2, 'Another approved', 'approved');

      const response = await request(app)
        .get('/api/stats/bookings')
        .expect(200);

      expect(response.body.count).toBe(2); // Only approved bookings
    });
  });

  describe('Combined stats scenario', () => {
    it('should return correct counts for all stats with mixed data', async () => {
      // Create hosts
      const insertHost = db.prepare(`
        INSERT INTO hosts (id, user_id, name, location, description, address, city, state, zip_code, country, latitude, longitude, amenities, house_rules, check_in_time, check_out_time, max_guests, bedrooms, bathrooms, photos)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertHost.run('host-1', 'user-1', 'Host 1', 'City 1', 'Desc 1', 'Addr 1', 'City 1', 'ST', '12345', 'Country', 40.7128, -74.0060, '[]', 'Rules 1', '3:00 PM', '11:00 AM', 4, 2, 1, '[]');
      insertHost.run('host-2', 'user-2', 'Host 2', 'City 2', 'Desc 2', 'Addr 2', 'City 2', 'ST', '67890', 'Country', 34.0522, -118.2437, '[]', 'Rules 2', '4:00 PM', '10:00 AM', 6, 3, 2, '[]');
      insertHost.run('host-3', 'user-3', 'Host 3', 'City 3', 'Desc 3', 'Addr 3', 'City 3', 'ST', '11111', 'Country', 41.8781, -87.6298, '[]', 'Rules 3', '2:00 PM', '12:00 PM', 2, 1, 1, '[]');

      // Create connections
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'accepted');
      insertConnection.run('conn-2', 'user-3', 'user-1', 'colleague', 'accepted');
      insertConnection.run('conn-3', 'user-1', 'user-3', 'acquaintance', 'pending');
      insertConnection.run('conn-4', 'user-2', 'user-3', 'friend', 'accepted');

      // Create bookings
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, message, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertBooking.run('booking-1', 'host-1', 'user-2', '2025-01-01', '2025-01-07', 2, 'Approved 1', 'approved');
      insertBooking.run('booking-2', 'host-2', 'user-1', '2025-01-15', '2025-01-21', 1, 'Pending', 'pending');
      insertBooking.run('booking-3', 'host-3', 'user-2', '2025-02-01', '2025-02-07', 3, 'Approved 2', 'approved');
      insertBooking.run('booking-4', 'host-1', 'user-3', '2025-02-15', '2025-02-21', 2, 'Declined', 'declined');

      // Check all stats
      const hostsResponse = await request(app)
        .get('/api/stats/hosts')
        .expect(200);

      const connectionsResponse = await request(app)
        .get('/api/stats/connections')
        .expect(200);

      const bookingsResponse = await request(app)
        .get('/api/stats/bookings')
        .expect(200);

      expect(hostsResponse.body.count).toBe(3);
      expect(connectionsResponse.body.count).toBe(3); // 3 accepted connections
      expect(bookingsResponse.body.count).toBe(2); // 2 approved bookings
    });
  });
});