import request from 'supertest';
import express from 'express';
import availabilitiesRouter from '../../src/routes/availabilities';
import { db } from '../../src/db';

const app = express();
app.use(express.json());
app.use('/api', availabilitiesRouter);

describe('Availabilities Routes Integration Tests', () => {
  beforeAll(() => {
    // Ensure clean database for the entire test suite
    db.exec(`
      DELETE FROM availabilities;
      DELETE FROM hosts;
      DELETE FROM users;
    `);
  });

  beforeEach(() => {
    // Clean up the test database before each test
    db.exec(`
      DELETE FROM availabilities;
      DELETE FROM hosts;
      DELETE FROM users;
    `);
    
        // Create test users and hosts that availabilities can reference
    const insertUser = db.prepare(`INSERT INTO users (id, email, name) VALUES (?, ?, ?)`);
    insertUser.run('user-1', 'user1@example.com', 'User 1');
    insertUser.run('user-2', 'user2@example.com', 'User 2');
    
    const insertHost = db.prepare(`
      INSERT INTO hosts (id, user_id, name, location, description, address, city, state, zip_code, country, latitude, longitude, amenities, house_rules, check_in_time, check_out_time, max_guests, bedrooms, bathrooms, photos)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertHost.run(
      'host-1', 'user-1', 'Test Host 1', 'Test City 1', 'Description 1', '123 Test St', 'Test City 1', 'TS', '12345', 'Test Country',
      40.7128, -74.0060, JSON.stringify(['WiFi']), 'No smoking', '3:00 PM', '11:00 AM', 4, 2, 1, JSON.stringify([])
    );
    insertHost.run(
      'host-2', 'user-2', 'Test Host 2', 'Test City 2', 'Description 2', '456 Test Ave', 'Test City 2', 'TS', '67890', 'Test Country',
      34.0522, -118.2437, JSON.stringify(['Pool']), 'Quiet hours', '4:00 PM', '10:00 AM', 6, 3, 2, JSON.stringify([])
    );
  });

  describe('GET /api/availabilities/by-date', () => {
    it('should return availabilities for a specific date', async () => {
      const timestamp = Date.now();
      
      // Create availabilities
      const insertAvailability = db.prepare(`
        INSERT INTO availabilities (id, host_id, start_date, end_date, status, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      // Availability that includes 2025-01-15
      insertAvailability.run(`avail-1-${timestamp}`, 'host-1', '2025-01-10', '2025-01-20', 'available', 'Winter availability');
      // Availability that does not include 2025-01-15
      insertAvailability.run(`avail-2-${timestamp}`, 'host-2', '2025-02-01', '2025-02-10', 'available', 'February availability');

      const response = await request(app)
        .get('/api/availabilities/by-date?date=2025-01-15')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].notes).toBe('Winter availability');
      expect(response.body[0].start_date).toBe('2025-01-10');
      expect(response.body[0].end_date).toBe('2025-01-20');
      expect(response.body[0].status).toBe('available');
    });

    it('should return empty array when no availabilities exist for date', async () => {
      const response = await request(app)
        .get('/api/availabilities/by-date?date=2025-03-15')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return 400 when date parameter is missing', async () => {
      const response = await request(app)
        .get('/api/availabilities/by-date')
        .expect(400);

      expect(response.body.error).toBe('date required');
    });
  });

  describe('GET /api/availabilities/by-date-range', () => {
    it('should return availabilities within a date range', async () => {
      const timestamp = Date.now();
      
      // Create availabilities
      const insertAvailability = db.prepare(`
        INSERT INTO availabilities (id, host_id, start_date, end_date, status, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      // Availability that overlaps with range 2025-01-05 to 2025-01-25
      insertAvailability.run(`avail-1-${timestamp}`, 'host-1', '2025-01-01', '2025-01-15', 'available', 'Early January');
      // Availability completely within range
      insertAvailability.run(`avail-2-${timestamp}`, 'host-2', '2025-01-10', '2025-01-20', 'available', 'Mid January');
      // Availability that does not overlap with range
      insertAvailability.run(`avail-3-${timestamp}`, 'host-1', '2025-02-01', '2025-02-10', 'available', 'February');

      const response = await request(app)
        .get('/api/availabilities/by-date-range?startDate=2025-01-05&endDate=2025-01-25')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      
      const notes = response.body.map((a: Record<string, unknown>) => a.notes);
      expect(notes).toContain('Early January');
      expect(notes).toContain('Mid January');
      expect(notes).not.toContain('February');
    });

    it('should return empty array when no availabilities exist in range', async () => {
      const response = await request(app)
        .get('/api/availabilities/by-date-range?startDate=2025-03-01&endDate=2025-03-10')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return 400 when startDate parameter is missing', async () => {
      const response = await request(app)
        .get('/api/availabilities/by-date-range?endDate=2025-01-25')
        .expect(400);

      expect(response.body.error).toBe('startDate and endDate required');
    });

    it('should return 400 when endDate parameter is missing', async () => {
      const response = await request(app)
        .get('/api/availabilities/by-date-range?startDate=2025-01-05')
        .expect(400);

      expect(response.body.error).toBe('startDate and endDate required');
    });
  });

  describe('GET /api/hosts/:id/availabilities', () => {
    it('should return availabilities for a specific host', async () => {
      const timestamp = Date.now();
      
      // Create availabilities for host-1
      const insertAvailability = db.prepare(`
        INSERT INTO availabilities (id, host_id, start_date, end_date, status, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      insertAvailability.run(`avail-1-${timestamp}`, 'host-1', '2025-01-01', '2025-01-07', 'available', 'Week 1');
      insertAvailability.run(`avail-2-${timestamp}`, 'host-1', '2025-01-15', '2025-01-21', 'available', 'Week 3');
      // Availability for different host
      insertAvailability.run(`avail-3-${timestamp}`, 'host-2', '2025-01-08', '2025-01-14', 'available', 'Other host');

      const response = await request(app)
        .get('/api/hosts/host-1/availabilities')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      
      const notes = response.body.map((a: Record<string, unknown>) => a.notes);
      expect(notes).toContain('Week 1');
      expect(notes).toContain('Week 3');
      expect(notes).not.toContain('Other host');
    });

    it('should return empty array when host has no availabilities', async () => {
      const response = await request(app)
        .get('/api/hosts/host-1/availabilities')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('POST /api/availabilities', () => {
    it('should create availability successfully', async () => {
      const availabilityData = {
        host_id: 'host-1',
        start_date: '2025-03-01',
        end_date: '2025-03-07',
        status: 'available',
        notes: 'Spring break availability',
      };

      const response = await request(app)
        .post('/api/availabilities')
        .send(availabilityData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      const availabilityId = response.body.id;

      // Verify the availability was created by checking host availabilities
      const getResponse = await request(app)
        .get('/api/hosts/host-1/availabilities')
        .expect(200);

      const createdAvailability = getResponse.body.find((a: Record<string, unknown>) => a.id === availabilityId);
      expect(createdAvailability).toBeDefined();
      expect(createdAvailability.start_date).toBe('2025-03-01');
      expect(createdAvailability.end_date).toBe('2025-03-07');
      expect(createdAvailability.status).toBe('available');
      expect(createdAvailability.notes).toBe('Spring break availability');
    });

    it('should create availability with default status', async () => {
      const availabilityData = {
        host_id: 'host-2',
        start_date: '2025-04-01',
        end_date: '2025-04-05',
        // status not provided, should default to 'available'
        notes: 'Default status test',
      };

      const response = await request(app)
        .post('/api/availabilities')
        .send(availabilityData)
        .expect(201);

      expect(response.body).toHaveProperty('id');

      // Verify default status
      const getResponse = await request(app)
        .get('/api/hosts/host-2/availabilities')
        .expect(200);

      expect(getResponse.body.length).toBe(1);
      expect(getResponse.body[0].status).toBe('available');
    });

    it('should reject availability with invalid date range', async () => {
      const invalidData = {
        host_id: 'host-1',
        start_date: '2025-03-10',
        end_date: '2025-03-05', // End date before start date
        status: 'available',
        notes: 'Invalid range',
      };

      const response = await request(app)
        .post('/api/availabilities')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('Start date must be before or equal to end date');
    });

    it('should reject availability with missing required fields', async () => {
      const incompleteData = {
        host_id: 'host-1',
        // Missing start_date and end_date
        status: 'available',
      };

      const response = await request(app)
        .post('/api/availabilities')
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should reject availability with invalid date format', async () => {
      const invalidData = {
        host_id: 'host-1',
        start_date: 'invalid-date',
        end_date: '2025-03-07',
        status: 'available',
      };

      const response = await request(app)
        .post('/api/availabilities')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('Invalid date format');
    });
  });
});