import request from 'supertest';
import express from 'express';
import hostsRouter from '../../src/routes/hosts';
import { db } from '../../src/db';

const app = express();
app.use(express.json());
app.use('/api', hostsRouter);

describe('Hosts Routes Integration Tests', () => {
  beforeEach(() => {
    // Clean up the test database before each test
    db.exec(`
      DELETE FROM hosts;
      DELETE FROM availabilities;
      DELETE FROM users;
    `);
    
    // Create test users that hosts can reference
    const insertUser = db.prepare(`INSERT INTO users (id, email, name) VALUES (?, ?, ?)`);
    insertUser.run('user-1', 'user1@example.com', 'User 1');
    insertUser.run('user-2', 'user2@example.com', 'User 2');
  });

  describe('GET /api/hosts', () => {
    it('should return all hosts', async () => {
      const timestamp = Date.now();
      // Create test hosts
      const hostData1 = {
        id: `host-1-${timestamp}`,
        user_id: 'user-1',
        name: 'Test Host 1',
        location: 'Test City 1',
        description: 'A beautiful place to stay',
        address: '123 Test St',
        city: 'Test City 1',
        state: 'TS',
        zip_code: '12345',
        country: 'Test Country',
        latitude: 40.7128,
        longitude: -74.0060,
        amenities: JSON.stringify(['WiFi', 'Kitchen']),
        house_rules: 'No smoking',
        check_in_time: '3:00 PM',
        check_out_time: '11:00 AM',
        max_guests: 4,
        bedrooms: 2,
        bathrooms: 1,
        photos: JSON.stringify([]),
      };

      const hostData2 = {
        id: `host-2-${timestamp}`,
        user_id: 'user-2',
        name: 'Test Host 2',
        location: 'Test City 2',
        description: 'Another great place',
        address: '456 Test Ave',
        city: 'Test City 2',
        state: 'TS',
        zip_code: '67890',
        country: 'Test Country',
        latitude: 34.0522,
        longitude: -118.2437,
        amenities: JSON.stringify(['Pool', 'Gym']),
        house_rules: 'Quiet hours after 10pm',
        check_in_time: '4:00 PM',
        check_out_time: '10:00 AM',
        max_guests: 6,
        bedrooms: 3,
        bathrooms: 2,
        photos: JSON.stringify([]),
      };

      // Insert hosts directly into database
      const insertHost = db.prepare(`
        INSERT INTO hosts (id, user_id, name, location, description, address, city, state, zip_code, country, latitude, longitude, amenities, house_rules, check_in_time, check_out_time, max_guests, bedrooms, bathrooms, photos)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertHost.run(...Object.values(hostData1));
      insertHost.run(...Object.values(hostData2));

      const response = await request(app)
        .get('/api/hosts')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      
      // Check that hosts have expected properties
      const host1 = response.body.find((h: Record<string, unknown>) => h.id === `host-1-${timestamp}`);
      const host2 = response.body.find((h: Record<string, unknown>) => h.id === `host-2-${timestamp}`);
      
      expect(host1).toBeDefined();
      expect(host1.name).toBe('Test Host 1');
      expect(host1.location).toBe('Test City 1');
      expect(host1.amenities).toEqual(['WiFi', 'Kitchen']);
      
      expect(host2).toBeDefined();
      expect(host2.name).toBe('Test Host 2');
      expect(host2.amenities).toEqual(['Pool', 'Gym']);
    });

    it('should return empty array when no hosts exist', async () => {
      const response = await request(app)
        .get('/api/hosts')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /api/hosts/:id', () => {
    it('should return specific host', async () => {
      const timestamp = Date.now();
      const hostId = `host-${timestamp}`;
      
      // Create test host
      const hostData = {
        id: hostId,
        user_id: 'user-1',
        name: 'Specific Test Host',
        location: 'Specific City',
        description: 'A specific place to stay',
        address: '789 Specific St',
        city: 'Specific City',
        state: 'TS',
        zip_code: '11111',
        country: 'Test Country',
        latitude: 41.8781,
        longitude: -87.6298,
        amenities: JSON.stringify(['WiFi', 'Parking']),
        house_rules: 'No pets',
        check_in_time: '2:00 PM',
        check_out_time: '12:00 PM',
        max_guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        photos: JSON.stringify([]),
      };

      const insertHost = db.prepare(`
        INSERT INTO hosts (id, user_id, name, location, description, address, city, state, zip_code, country, latitude, longitude, amenities, house_rules, check_in_time, check_out_time, max_guests, bedrooms, bathrooms, photos)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertHost.run(...Object.values(hostData));

      const response = await request(app)
        .get(`/api/hosts/${hostId}`)
        .expect(200);

      expect(response.body.id).toBe(hostId);
      expect(response.body.name).toBe('Specific Test Host');
      expect(response.body.location).toBe('Specific City');
      expect(response.body.amenities).toEqual(['WiFi', 'Parking']);
      expect(response.body.max_guests).toBe(2);
    });

    it('should return 404 for non-existent host', async () => {
      const response = await request(app)
        .get('/api/hosts/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('Host not found');
    });
  });

  describe('GET /api/hosts/:id/availabilities', () => {
    it('should return host availabilities', async () => {
      const timestamp = Date.now();
      const hostId = `host-avail-${timestamp}`;
      
      // Create test host
      const hostData = {
        id: hostId,
        user_id: 'user-1',
        name: 'Host with Availabilities',
        location: 'Availability City',
        description: 'Host with availability data',
        address: '123 Avail St',
        city: 'Availability City',
        state: 'TS',
        zip_code: '22222',
        country: 'Test Country',
        latitude: 40.7128,
        longitude: -74.0060,
        amenities: JSON.stringify(['WiFi']),
        house_rules: 'Clean up',
        check_in_time: '3:00 PM',
        check_out_time: '11:00 AM',
        max_guests: 4,
        bedrooms: 2,
        bathrooms: 1,
        photos: JSON.stringify([]),
      };

      const insertHost = db.prepare(`
        INSERT INTO hosts (id, user_id, name, location, description, address, city, state, zip_code, country, latitude, longitude, amenities, house_rules, check_in_time, check_out_time, max_guests, bedrooms, bathrooms, photos)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertHost.run(...Object.values(hostData));

      // Create availabilities for the host
      const insertAvailability = db.prepare(`
        INSERT INTO availabilities (id, host_id, start_date, end_date, status, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      insertAvailability.run(`avail-1-${timestamp}`, hostId, '2025-01-01', '2025-01-07', 'available', 'Week 1');
      insertAvailability.run(`avail-2-${timestamp}`, hostId, '2025-01-15', '2025-01-21', 'available', 'Week 3');

      const response = await request(app)
        .get(`/api/hosts/${hostId}/availabilities`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      
      // Check availability data
      const avail1 = response.body.find((a: Record<string, unknown>) => a.notes === 'Week 1');
      const avail2 = response.body.find((a: Record<string, unknown>) => a.notes === 'Week 3');
      
      expect(avail1).toBeDefined();
      expect(avail1.start_date).toBe('2025-01-01');
      expect(avail1.end_date).toBe('2025-01-07');
      expect(avail1.status).toBe('available');
      
      expect(avail2).toBeDefined();
      expect(avail2.start_date).toBe('2025-01-15');
      expect(avail2.end_date).toBe('2025-01-21');
    });

    it('should return empty array when host has no availabilities', async () => {
      const timestamp = Date.now();
      const hostId = `host-no-avail-${timestamp}`;
      
      // Create test host without availabilities
      const hostData = {
        id: hostId,
        user_id: 'user-1',
        name: 'Host without Availabilities',
        location: 'Empty City',
        description: 'Host with no availability data',
        address: '123 Empty St',
        city: 'Empty City',
        state: 'TS',
        zip_code: '33333',
        country: 'Test Country',
        latitude: 40.7128,
        longitude: -74.0060,
        amenities: JSON.stringify(['WiFi']),
        house_rules: 'Be nice',
        check_in_time: '3:00 PM',
        check_out_time: '11:00 AM',
        max_guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        photos: JSON.stringify([]),
      };

      const insertHost = db.prepare(`
        INSERT INTO hosts (id, user_id, name, location, description, address, city, state, zip_code, country, latitude, longitude, amenities, house_rules, check_in_time, check_out_time, max_guests, bedrooms, bathrooms, photos)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertHost.run(...Object.values(hostData));

      const response = await request(app)
        .get(`/api/hosts/${hostId}/availabilities`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /api/hosts/search/:query', () => {
    it('should search hosts by name', async () => {
      const timestamp = Date.now();
      
      // Create test hosts
      const hostData1 = {
        id: `host-search-1-${timestamp}`,
        user_id: 'user-1',
        name: 'Beach House',
        location: 'Beach City',
        description: 'A house by the beach',
        address: '123 Beach St',
        city: 'Beach City',
        state: 'CA',
        zip_code: '90210',
        country: 'USA',
        latitude: 34.0522,
        longitude: -118.2437,
        amenities: JSON.stringify(['WiFi', 'Ocean View']),
        house_rules: 'No shoes inside',
        check_in_time: '4:00 PM',
        check_out_time: '10:00 AM',
        max_guests: 6,
        bedrooms: 3,
        bathrooms: 2,
        photos: JSON.stringify([]),
      };

      const hostData2 = {
        id: `host-search-2-${timestamp}`,
        user_id: 'user-2',
        name: 'Mountain Cabin',
        location: 'Mountain Town',
        description: 'Cozy cabin in the mountains',
        address: '456 Mountain Rd',
        city: 'Mountain Town',
        state: 'CO',
        zip_code: '80401',
        country: 'USA',
        latitude: 39.7392,
        longitude: -104.9903,
        amenities: JSON.stringify(['Fireplace', 'Hiking Trails']),
        house_rules: 'Respect nature',
        check_in_time: '3:00 PM',
        check_out_time: '11:00 AM',
        max_guests: 4,
        bedrooms: 2,
        bathrooms: 1,
        photos: JSON.stringify([]),
      };

      const insertHost = db.prepare(`
        INSERT INTO hosts (id, user_id, name, location, description, address, city, state, zip_code, country, latitude, longitude, amenities, house_rules, check_in_time, check_out_time, max_guests, bedrooms, bathrooms, photos)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertHost.run(...Object.values(hostData1));
      insertHost.run(...Object.values(hostData2));

      const response = await request(app)
        .get('/api/hosts/search/Beach')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Beach House');
      expect(response.body[0].location).toBe('Beach City');
    });

    it('should search hosts by location', async () => {
      const timestamp = Date.now();
      
      // Create test hosts
      const hostData1 = {
        id: `host-loc-1-${timestamp}`,
        user_id: 'user-1',
        name: 'Downtown Apartment',
        location: 'Downtown District',
        description: 'City center apartment',
        address: '123 Downtown St',
        city: 'Metropolis',
        state: 'NY',
        zip_code: '10001',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.0060,
        amenities: JSON.stringify(['WiFi', 'City View']),
        house_rules: 'Quiet hours',
        check_in_time: '3:00 PM',
        check_out_time: '11:00 AM',
        max_guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        photos: JSON.stringify([]),
      };

      const hostData2 = {
        id: `host-loc-2-${timestamp}`,
        user_id: 'user-2',
        name: 'Suburban House',
        location: 'Quiet Suburb',
        description: 'Peaceful suburban home',
        address: '456 Suburban Ln',
        city: 'Suburbia',
        state: 'NJ',
        zip_code: '07001',
        country: 'USA',
        latitude: 40.0583,
        longitude: -74.4057,
        amenities: JSON.stringify(['Garden', 'Parking']),
        house_rules: 'Family friendly',
        check_in_time: '2:00 PM',
        check_out_time: '12:00 PM',
        max_guests: 5,
        bedrooms: 3,
        bathrooms: 2,
        photos: JSON.stringify([]),
      };

      const insertHost = db.prepare(`
        INSERT INTO hosts (id, user_id, name, location, description, address, city, state, zip_code, country, latitude, longitude, amenities, house_rules, check_in_time, check_out_time, max_guests, bedrooms, bathrooms, photos)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertHost.run(...Object.values(hostData1));
      insertHost.run(...Object.values(hostData2));

      const response = await request(app)
        .get('/api/hosts/search/Suburb')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Suburban House');
      expect(response.body[0].location).toBe('Quiet Suburb');
    });

    it('should return empty array when no hosts match search', async () => {
      // Create a test host
      const hostData = {
        id: `host-no-match-${Date.now()}`,
        user_id: 'user-1',
        name: 'Unique Name',
        location: 'Unique Location',
        description: 'Unique description',
        address: '123 Unique St',
        city: 'Unique City',
        state: 'UN',
        zip_code: '99999',
        country: 'Unique Country',
        latitude: 0,
        longitude: 0,
        amenities: JSON.stringify([]),
        house_rules: 'Be unique',
        check_in_time: '12:00 PM',
        check_out_time: '12:00 PM',
        max_guests: 1,
        bedrooms: 1,
        bathrooms: 1,
        photos: JSON.stringify([]),
      };

      const insertHost = db.prepare(`
        INSERT INTO hosts (id, user_id, name, location, description, address, city, state, zip_code, country, latitude, longitude, amenities, house_rules, check_in_time, check_out_time, max_guests, bedrooms, bathrooms, photos)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertHost.run(...Object.values(hostData));

      const response = await request(app)
        .get('/api/hosts/search/NonExistentQuery')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('POST /api/hosts', () => {
    it('should create host successfully', async () => {
      const hostData = {
        user_id: 'user-1',
        name: 'New Test Host',
        location: 'New City',
        description: 'A newly created host',
        address: '123 New St',
        city: 'New City',
        state: 'NC',
        zip_code: '12345',
        country: 'New Country',
        latitude: 35.2271,
        longitude: -80.8431,
        amenities: ['WiFi', 'Kitchen'],
        house_rules: 'No smoking allowed',
        check_in_time: '3:00 PM',
        check_out_time: '11:00 AM',
        max_guests: 4,
        bedrooms: 2,
        bathrooms: 1,
        photos: [],
      };

      const response = await request(app)
        .post('/api/hosts')
        .send(hostData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      const hostId = response.body.id;

      // Verify the host was created
      const getResponse = await request(app)
        .get(`/api/hosts/${hostId}`)
        .expect(200);

      expect(getResponse.body.name).toBe('New Test Host');
      expect(getResponse.body.location).toBe('New City');
      expect(getResponse.body.amenities).toEqual(['WiFi', 'Kitchen']);
      expect(getResponse.body.max_guests).toBe(4);
    });

    it('should reject host creation with invalid name', async () => {
      const invalidData = {
        user_id: 'user-1',
        name: '', // Invalid empty name
        location: 'Test City',
        description: 'Invalid host',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip_code: '12345',
        country: 'Test Country',
        latitude: 40.7128,
        longitude: -74.0060,
        amenities: ['WiFi'],
        house_rules: 'No rules',
        check_in_time: '3:00 PM',
        check_out_time: '11:00 AM',
        max_guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        photos: [],
      };

      const response = await request(app)
        .post('/api/hosts')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should reject host creation with missing required fields', async () => {
      const incompleteData = {
        user_id: 'user-1',
        // Missing name and other required fields
        location: 'Test City',
      };

      const response = await request(app)
        .post('/api/hosts')
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });
});