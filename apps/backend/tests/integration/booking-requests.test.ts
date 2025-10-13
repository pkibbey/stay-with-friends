import request from 'supertest';
import express from 'express';
import bookingRequestsRouter from '../../src/routes/booking-requests';
import { db } from '../../src/db';

const app = express();
app.use(express.json());
app.use('/api', bookingRequestsRouter);

describe('Booking Requests Routes Integration Tests', () => {
  beforeAll(() => {
    // Ensure clean database for the entire test suite
    db.exec(`
      DELETE FROM booking_requests;
      DELETE FROM availabilities;
      DELETE FROM hosts;
      DELETE FROM users;
    `);
  });

  beforeEach(() => {
    // Clean up the test database before each test
    db.exec(`
      DELETE FROM booking_requests;
      DELETE FROM availabilities;
      DELETE FROM hosts;
      DELETE FROM users;
    `);
    
    // Create test users and hosts that booking requests can reference
    const insertUser = db.prepare(`INSERT INTO users (id, email, name) VALUES (?, ?, ?)`);
    insertUser.run('user-1', 'requester@example.com', 'Requester User');
    insertUser.run('user-2', 'host-user@example.com', 'Host User');
    
    const insertHost = db.prepare(`
      INSERT INTO hosts (id, user_id, name, location, description, address, city, state, zip_code, country, latitude, longitude, amenities, house_rules, check_in_time, check_out_time, max_guests, bedrooms, bathrooms, photos)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertHost.run(
      'host-1', 'user-2', 'Test Host 1', 'Test City', 'Description', '123 Test St', 'Test City', 'TS', '12345', 'Test Country',
      40.7128, -74.0060, JSON.stringify(['WiFi']), 'No smoking', '3:00 PM', '11:00 AM', 4, 2, 1, JSON.stringify([])
    );
  });

  describe('GET /api/booking-requests/host/:hostId', () => {
    it('should return booking requests for a specific host', async () => {
      const timestamp = Date.now();
      
      // Create booking requests for host-1
      const insertBookingRequest = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, message, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertBookingRequest.run(`br-1-${timestamp}`, 'host-1', 'user-1', '2025-01-01', '2025-01-07', 2, 'Looking forward to staying', 'pending');
      insertBookingRequest.run(`br-2-${timestamp}`, 'host-1', 'user-1', '2025-01-15', '2025-01-21', 1, 'Business trip', 'approved');
      // Booking request for different host
      insertBookingRequest.run(`br-3-${timestamp}`, 'host-2', 'user-1', '2025-02-01', '2025-02-07', 3, 'Family vacation', 'pending');

      const response = await request(app)
        .get('/api/booking-requests/host/host-1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      
      // Check that booking requests have expected properties
      const br1 = response.body.find((br: Record<string, unknown>) => br.message === 'Looking forward to staying');
      const br2 = response.body.find((br: Record<string, unknown>) => br.message === 'Business trip');
      
      expect(br1).toBeDefined();
      expect(br1.start_date).toBe('2025-01-01');
      expect(br1.end_date).toBe('2025-01-07');
      expect(br1.guests).toBe(2);
      expect(br1.status).toBe('pending');
      
      expect(br2).toBeDefined();
      expect(br2.status).toBe('approved');
    });

    it('should return empty array when host has no booking requests', async () => {
      const response = await request(app)
        .get('/api/booking-requests/host/host-1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /api/booking-requests/requester/:requesterId', () => {
    it('should return booking requests for a specific requester', async () => {
      const timestamp = Date.now();
      
      // Create booking requests by user-1
      const insertBookingRequest = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, message, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertBookingRequest.run(`br-1-${timestamp}`, 'host-1', 'user-1', '2025-01-01', '2025-01-07', 2, 'My booking', 'pending');
      insertBookingRequest.run(`br-2-${timestamp}`, 'host-1', 'user-1', '2025-01-15', '2025-01-21', 1, 'Another booking', 'approved');
      // Booking request by different user
      insertBookingRequest.run(`br-3-${timestamp}`, 'host-1', 'user-2', '2025-02-01', '2025-02-07', 3, 'Other user booking', 'pending');

      const response = await request(app)
        .get('/api/booking-requests/requester/user-1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      
      const messages = response.body.map((br: Record<string, unknown>) => br.message);
      expect(messages).toContain('My booking');
      expect(messages).toContain('Another booking');
      expect(messages).not.toContain('Other user booking');
    });

    it('should return empty array when requester has no booking requests', async () => {
      const response = await request(app)
        .get('/api/booking-requests/requester/user-1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /api/booking-requests/:id', () => {
    it('should return specific booking request', async () => {
      const timestamp = Date.now();
      const brId = `br-${timestamp}`;
      
      // Create a booking request
      const insertBookingRequest = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, message, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertBookingRequest.run(brId, 'host-1', 'user-1', '2025-01-01', '2025-01-07', 2, 'Test booking', 'pending');

      const response = await request(app)
        .get(`/api/booking-requests/${brId}`)
        .expect(200);

      expect(response.body.id).toBe(brId);
      expect(response.body.host_id).toBe('host-1');
      expect(response.body.requester_id).toBe('user-1');
      expect(response.body.start_date).toBe('2025-01-01');
      expect(response.body.end_date).toBe('2025-01-07');
      expect(response.body.guests).toBe(2);
      expect(response.body.message).toBe('Test booking');
      expect(response.body.status).toBe('pending');
    });

    it('should return 404 for non-existent booking request', async () => {
      const response = await request(app)
        .get('/api/booking-requests/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('Booking request not found');
    });
  });

  describe('POST /api/booking-requests', () => {
    it('should create booking request successfully', async () => {
      const bookingData = {
        host_id: 'host-1',
        requester_id: 'user-1',
        start_date: '2025-03-01',
        end_date: '2025-03-07',
        guests: 2,
        message: 'Looking forward to my stay!',
      };

      const response = await request(app)
        .post('/api/booking-requests')
        .send(bookingData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      const brId = response.body.id;

      // Verify the booking request was created
      const getResponse = await request(app)
        .get(`/api/booking-requests/${brId}`)
        .expect(200);

      expect(getResponse.body.host_id).toBe('host-1');
      expect(getResponse.body.requester_id).toBe('user-1');
      expect(getResponse.body.start_date).toBe('2025-03-01');
      expect(getResponse.body.end_date).toBe('2025-03-07');
      expect(getResponse.body.guests).toBe(2);
      expect(getResponse.body.message).toBe('Looking forward to my stay!');
      expect(getResponse.body.status).toBe('pending'); // Default status
    });

    it('should create booking request with custom status', async () => {
      const bookingData = {
        host_id: 'host-1',
        requester_id: 'user-1',
        start_date: '2025-04-01',
        end_date: '2025-04-05',
        guests: 1,
        message: 'Quick visit',
        status: 'approved',
      };

      const response = await request(app)
        .post('/api/booking-requests')
        .send(bookingData)
        .expect(201);

      expect(response.body).toHaveProperty('id');

      // Verify custom status
      const getResponse = await request(app)
        .get(`/api/booking-requests/${response.body.id}`)
        .expect(200);

      expect(getResponse.body.status).toBe('approved');
    });

    it('should reject booking request with invalid date range', async () => {
      const invalidData = {
        host_id: 'host-1',
        requester_id: 'user-1',
        start_date: '2025-03-10',
        end_date: '2025-03-05', // End before start
        guests: 2,
        message: 'Invalid dates',
      };

      const response = await request(app)
        .post('/api/booking-requests')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('Start date must be before or equal to end date');
    });

    it('should reject booking request with missing required fields', async () => {
      const incompleteData = {
        host_id: 'host-1',
        requester_id: 'user-1',
        // Missing start_date, end_date
        guests: 2,
        message: 'Missing dates',
      };

      const response = await request(app)
        .post('/api/booking-requests')
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should reject booking request with invalid date format', async () => {
      const invalidData = {
        host_id: 'host-1',
        requester_id: 'user-1',
        start_date: 'invalid-date',
        end_date: '2025-03-07',
        guests: 2,
        message: 'Invalid date format',
      };

      const response = await request(app)
        .post('/api/booking-requests')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('Invalid date format');
    });
  });

  describe('PUT /api/booking-requests/:id/status', () => {
    it('should update booking request status successfully', async () => {
      const timestamp = Date.now();
      const brId = `br-status-${timestamp}`;
      
      // Create a booking request
      const insertBookingRequest = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, message, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertBookingRequest.run(brId, 'host-1', 'user-1', '2025-01-01', '2025-01-07', 2, 'Test booking', 'pending');

      const updateData = {
        status: 'approved',
        response_message: 'Welcome! Looking forward to hosting you.',
      };

      const response = await request(app)
        .put(`/api/booking-requests/${brId}/status`)
        .send(updateData)
        .expect(200);

      expect(response.body.changes).toBe(1);

      // Verify the status was updated
      const getResponse = await request(app)
        .get(`/api/booking-requests/${brId}`)
        .expect(200);

      expect(getResponse.body.status).toBe('approved');
      expect(getResponse.body.responded_at).toBeDefined(); // Should be set by the update
    });

    it('should update booking request to declined status', async () => {
      const timestamp = Date.now();
      const brId = `br-decline-${timestamp}`;
      
      // Create a booking request
      const insertBookingRequest = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, message, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertBookingRequest.run(brId, 'host-1', 'user-1', '2025-01-01', '2025-01-07', 2, 'Test booking', 'pending');

      const updateData = {
        status: 'declined',
        response_message: 'Sorry, not available at that time.',
      };

      const response = await request(app)
        .put(`/api/booking-requests/${brId}/status`)
        .send(updateData)
        .expect(200);

      expect(response.body.changes).toBe(1);

      // Verify the status was updated
      const getResponse = await request(app)
        .get(`/api/booking-requests/${brId}`)
        .expect(200);

      expect(getResponse.body.status).toBe('declined');
      expect(getResponse.body.responded_at).toBeDefined();
    });

    it('should reject status update without status field', async () => {
      const timestamp = Date.now();
      const brId = `br-no-status-${timestamp}`;
      
      // Create a booking request
      const insertBookingRequest = db.prepare(`
        INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, message, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertBookingRequest.run(brId, 'host-1', 'user-1', '2025-01-01', '2025-01-07', 2, 'Test booking', 'pending');

      const updateData = {
        response_message: 'Missing status field',
      };

      const response = await request(app)
        .put(`/api/booking-requests/${brId}/status`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('status required');
    });

    it('should handle update of non-existent booking request', async () => {
      const updateData = {
        status: 'approved',
        response_message: 'This should not work',
      };

      const response = await request(app)
        .put('/api/booking-requests/non-existent-id/status')
        .send(updateData)
        .expect(200);

      expect(response.body.changes).toBe(0); // No rows affected
    });
  });
});