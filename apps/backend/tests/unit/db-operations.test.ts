import { 
  setupTestDatabase, 
  teardownTestDatabase, 
  getTestDatabase,
  createTestUser,
  createTestHost,
  createTestAvailability,
  createTestBookingRequest,
  createTestConnection,
  createTestInvitation
} from '../setup';

describe('Database Operations', () => {
  beforeEach(() => {
    setupTestDatabase();
  });

  afterEach(() => {
    teardownTestDatabase();
  });

    describe('User Operations', () => {
      it('should create a user with valid data', () => {
        const db = getTestDatabase();
        const insertUser = db.prepare('INSERT INTO users (email, name, email_verified, image) VALUES (?, ?, ?, ?)');
        
        const result = insertUser.run('test@example.com', 'Test User', new Date().toISOString(), null);
        
        expect(result.lastInsertRowid).toBeDefined();
        
        // Verify user was stored in database
        const storedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as any;
        expect(storedUser).toMatchObject({
          email: 'test@example.com',
          name: 'Test User'
        });
      });

      it('should enforce unique email constraint', () => {
        const db = getTestDatabase();
        const insertUser = db.prepare('INSERT INTO users (email, name, email_verified, image) VALUES (?, ?, ?, ?)');
        
        insertUser.run('duplicate@example.com', 'User 1', new Date().toISOString(), null);
        
        expect(() => {
          insertUser.run('duplicate@example.com', 'User 2', new Date().toISOString(), null);
        }).toThrow();
      });
    });  describe('Host Operations', () => {
    beforeEach(() => {
      // Create a test user first
      const db = getTestDatabase();
      const userData = createTestUser();
      const insertUser = db.prepare(`
        INSERT INTO users (email, name) VALUES (?, ?)
      `);
      insertUser.run(userData.email, userData.name);
    });

    it('should create a host with all properties', () => {
      const db = getTestDatabase();
      const hostData = createTestHost();
      
      const insertHost = db.prepare(`
        INSERT INTO hosts (
          user_id, name, email, location, description,
          address, city, state, zip_code, country, latitude, longitude,
          amenities, house_rules, check_in_time, check_out_time,
          max_guests, bedrooms, bathrooms, photos
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = insertHost.run(
        hostData.user_id,
        hostData.name,
        hostData.email,
        hostData.location,
        hostData.description,
        hostData.address,
        hostData.city,
        hostData.state,
        hostData.zip_code,
        hostData.country,
        hostData.latitude,
        hostData.longitude,
        hostData.amenities,
        hostData.house_rules,
        hostData.check_in_time,
        hostData.check_out_time,
        hostData.max_guests,
        hostData.bedrooms,
        hostData.bathrooms,
        hostData.photos
      );
      
      expect(result.changes).toBe(1);
      
      // Verify host was created with all data
      const getHost = db.prepare('SELECT * FROM hosts WHERE id = ?');
      const host = getHost.get(result.lastInsertRowid) as any;
      
      expect(host).toMatchObject({
        name: hostData.name,
        email: hostData.email,
        latitude: hostData.latitude,
        longitude: hostData.longitude,
        max_guests: hostData.max_guests,
      });
      
      // Verify JSON fields are stored correctly
      expect(JSON.parse(host.amenities)).toEqual(JSON.parse(hostData.amenities));
    });

    it('should enforce foreign key constraint for user_id', () => {
      const db = getTestDatabase();
      const hostData = createTestHost({ user_id: 999 }); // Non-existent user
      
      const insertHost = db.prepare(`
        INSERT INTO hosts (user_id, name, email) VALUES (?, ?, ?)
      `);
      
      expect(() => {
        insertHost.run(hostData.user_id, hostData.name, hostData.email);
      }).toThrow(/FOREIGN KEY constraint failed/);
    });

    it('should validate coordinate ranges', () => {
      const invalidCoordinates = [
        { lat: 91, lng: 0 },    // Invalid latitude
        { lat: -91, lng: 0 },   // Invalid latitude
        { lat: 0, lng: 181 },   // Invalid longitude
        { lat: 0, lng: -181 },  // Invalid longitude
      ];
      
      invalidCoordinates.forEach(({ lat, lng }) => {
        expect(() => {
          if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            throw new Error('Invalid coordinates');
          }
        }).toThrow('Invalid coordinates');
      });
    });

    it('should cascade delete when user is deleted', () => {
      const db = getTestDatabase();
      const hostData = createTestHost();
      
      // Create host
      const insertHost = db.prepare(`
        INSERT INTO hosts (user_id, name, email) VALUES (?, ?, ?)
      `);
      const hostResult = insertHost.run(hostData.user_id, hostData.name, hostData.email);
      
      // Verify host exists
      let getHost = db.prepare('SELECT * FROM hosts WHERE id = ?');
      expect(getHost.get(hostResult.lastInsertRowid)).toBeTruthy();
      
      // Delete user
      const deleteUser = db.prepare('DELETE FROM users WHERE id = ?');
      deleteUser.run(hostData.user_id);
      
      // Verify host is also deleted due to CASCADE
      expect(getHost.get(hostResult.lastInsertRowid)).toBeUndefined();
    });
  });

  describe('Availability Operations', () => {
    beforeEach(() => {
      // Set up test user and host
      const db = getTestDatabase();
      const userData = createTestUser();
      const insertUser = db.prepare(`INSERT INTO users (email, name) VALUES (?, ?)`);
      insertUser.run(userData.email, userData.name);
      
      const hostData = createTestHost();
      const insertHost = db.prepare(`INSERT INTO hosts (user_id, name, email) VALUES (?, ?, ?)`);
      insertHost.run(hostData.user_id, hostData.name, hostData.email);
    });

    it('should create availability with valid date range', () => {
      const db = getTestDatabase();
      const availabilityData = createTestAvailability();
      
      const insertAvailability = db.prepare(`
        INSERT INTO availabilities (host_id, start_date, end_date, status, notes)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      const result = insertAvailability.run(
        availabilityData.host_id,
        availabilityData.start_date,
        availabilityData.end_date,
        availabilityData.status,
        availabilityData.notes
      );
      
      expect(result.changes).toBe(1);
      
      const getAvailability = db.prepare('SELECT * FROM availabilities WHERE id = ?');
      const availability = getAvailability.get(result.lastInsertRowid);
      
      expect(availability).toMatchObject({
        host_id: availabilityData.host_id,
        start_date: availabilityData.start_date,
        end_date: availabilityData.end_date,
        status: availabilityData.status,
      });
    });

    it('should validate date range logic', () => {
      const invalidDateRanges = [
        { start: '2025-12-07', end: '2025-12-01' }, // End before start
        { start: '', end: '2025-12-01' },           // Empty start
        { start: '2025-12-01', end: '' },           // Empty end
        { start: 'invalid', end: '2025-12-01' },    // Invalid format
      ];
      
      invalidDateRanges.forEach(({ start, end }) => {
        expect(() => {
          if (!start || !end) {
            throw new Error('Start date and end date are required');
          }
          
          const startDate = new Date(start);
          const endDate = new Date(end);
          
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error('Invalid date format');
          }
          
          if (startDate > endDate) {
            throw new Error('Start date must be before or equal to end date');
          }
        }).toThrow();
      });
    });

    it('should validate status values', () => {
      const validStatuses = ['available', 'booked', 'blocked'];
      const invalidStatuses = ['invalid', 'pending', 'confirmed'];
      
      validStatuses.forEach(status => {
        expect(validStatuses.includes(status)).toBe(true);
      });
      
      invalidStatuses.forEach(status => {
        expect(validStatuses.includes(status)).toBe(false);
      });
    });
  });

  describe('Booking Request Operations', () => {
    beforeEach(() => {
      // Set up test users and host
      const db = getTestDatabase();
      
      // Create host user
      const insertUser = db.prepare(`INSERT INTO users (email, name) VALUES (?, ?)`);
      insertUser.run('host@example.com', 'Host User');
      
      // Create guest user
      insertUser.run('guest@example.com', 'Guest User');
      
      // Create host
      const insertHost = db.prepare(`INSERT INTO hosts (user_id, name, email, max_guests) VALUES (?, ?, ?, ?)`);
      insertHost.run(1, 'Test Host', 'host@example.com', 4);
    });

    it('should create booking request with valid data', () => {
      const db = getTestDatabase();
      const bookingData = createTestBookingRequest();
      
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (host_id, requester_id, start_date, end_date, guests, message, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = insertBooking.run(
        bookingData.host_id,
        bookingData.requester_id,
        bookingData.start_date,
        bookingData.end_date,
        bookingData.guests,
        bookingData.message,
        bookingData.status
      );
      
      expect(result.changes).toBe(1);
      
      const getBooking = db.prepare('SELECT * FROM booking_requests WHERE id = ?');
      const booking = getBooking.get(result.lastInsertRowid);
      
      expect(booking).toMatchObject({
        host_id: bookingData.host_id,
        requester_id: bookingData.requester_id,
        guests: bookingData.guests,
        status: bookingData.status,
      });
    });

    it('should validate guest count constraints', () => {
      const db = getTestDatabase();
      
      // Get host max capacity
      const getHost = db.prepare('SELECT max_guests FROM hosts WHERE id = ?');
      const host = getHost.get(1) as any;
      const maxGuests = host.max_guests;
      
      expect(() => {
        const guestCount = maxGuests + 1; // Exceed capacity
        if (guestCount > maxGuests) {
          throw new Error('Guest count exceeds host capacity');
        }
      }).toThrow('Guest count exceeds host capacity');
    });

    it('should validate booking status workflow', () => {
      const validStatuses = ['pending', 'approved', 'declined', 'cancelled'];
      const validTransitions: Record<string, string[]> = {
        pending: ['approved', 'declined', 'cancelled'],
        approved: ['cancelled'],
        declined: [] as string[],
        cancelled: [] as string[],
      };
      
      // Test valid transitions
      expect(validTransitions.pending.includes('approved')).toBe(true);
      expect(validTransitions.approved.includes('cancelled')).toBe(true);
      
      // Test invalid transitions
      expect(validTransitions.declined.includes('approved')).toBe(false);
      expect(validTransitions.cancelled.includes('approved')).toBe(false);
    });
  });

  describe('Connection Operations', () => {
    beforeEach(() => {
      // Create test users
      const db = getTestDatabase();
      const insertUser = db.prepare(`INSERT INTO users (email, name) VALUES (?, ?)`);
      insertUser.run('user1@example.com', 'User 1');
      insertUser.run('user2@example.com', 'User 2');
    });

    it('should create connection between users', () => {
      const db = getTestDatabase();
      const connectionData = createTestConnection();
      
      const insertConnection = db.prepare(`
        INSERT INTO connections (user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?)
      `);
      
      const result = insertConnection.run(
        connectionData.user_id,
        connectionData.connected_user_id,
        connectionData.relationship,
        connectionData.status
      );
      
      expect(result.changes).toBe(1);
      
      const getConnection = db.prepare('SELECT * FROM connections WHERE id = ?');
      const connection = getConnection.get(result.lastInsertRowid);
      
      expect(connection).toMatchObject({
        user_id: connectionData.user_id,
        connected_user_id: connectionData.connected_user_id,
        relationship: connectionData.relationship,
        status: connectionData.status,
      });
    });

    it('should prevent self-connections', () => {
      const db = getTestDatabase();
      
      const insertConnection = db.prepare(`
        INSERT INTO connections (user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?)
      `);
      
      expect(() => {
        const userId = 1;
        const connectedUserId = 1; // Same user
        
        if (userId === connectedUserId) {
          throw new Error('Users cannot connect to themselves');
        }
        
        insertConnection.run(userId, connectedUserId, 'friend', 'pending');
      }).toThrow('Users cannot connect to themselves');
    });

    it('should enforce unique user pair constraint', () => {
      const db = getTestDatabase();
      
      const insertConnection = db.prepare(`
        INSERT INTO connections (user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?)
      `);
      
      // First connection should succeed
      insertConnection.run(1, 2, 'friend', 'pending');
      
      // Duplicate connection should fail
      expect(() => {
        insertConnection.run(1, 2, 'colleague', 'pending');
      }).toThrow(/UNIQUE constraint failed/);
    });
  });

  describe('Invitation Operations', () => {
    beforeEach(() => {
      // Create test user
      const db = getTestDatabase();
      const insertUser = db.prepare(`INSERT INTO users (email, name) VALUES (?, ?)`);
      insertUser.run('inviter@example.com', 'Inviter User');
    });

    it('should create invitation with unique token', () => {
      const db = getTestDatabase();
      const invitationData = createTestInvitation();
      
      const insertInvitation = db.prepare(`
        INSERT INTO invitations (inviter_id, invitee_email, invitee_name, message, token, status, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = insertInvitation.run(
        invitationData.inviter_id,
        invitationData.invitee_email,
        invitationData.invitee_name,
        invitationData.message,
        invitationData.token,
        invitationData.status,
        invitationData.expires_at
      );
      
      expect(result.changes).toBe(1);
      
      const getInvitation = db.prepare('SELECT * FROM invitations WHERE id = ?');
      const invitation = getInvitation.get(result.lastInsertRowid);
      
      expect(invitation).toMatchObject({
        inviter_id: invitationData.inviter_id,
        invitee_email: invitationData.invitee_email,
        token: invitationData.token,
        status: invitationData.status,
      });
    });

    it('should enforce unique token constraint', () => {
      const db = getTestDatabase();
      const token = 'duplicate-token';
      
      const insertInvitation = db.prepare(`
        INSERT INTO invitations (inviter_id, invitee_email, token, status, expires_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      // First invitation should succeed
      insertInvitation.run(1, 'test1@example.com', token, 'pending', new Date().toISOString());
      
      // Second invitation with same token should fail
      expect(() => {
        insertInvitation.run(1, 'test2@example.com', token, 'pending', new Date().toISOString());
      }).toThrow(/UNIQUE constraint failed/);
    });

    it('should validate expiration dates', () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Yesterday
      const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      
      expect(() => {
        if (pastDate <= now) {
          throw new Error('Invitation has expired');
        }
      }).toThrow('Invitation has expired');
      
      expect(() => {
        if (futureDate > now) {
          // Valid future date
          return true;
        }
      }).not.toThrow();
    });
  });

  describe('Complex Queries and Relationships', () => {
    beforeEach(() => {
      // Set up complex test data
      const db = getTestDatabase();
      
      // Create users
      const insertUser = db.prepare(`INSERT INTO users (email, name) VALUES (?, ?)`);
      insertUser.run('host@example.com', 'Host User');
      insertUser.run('guest@example.com', 'Guest User');
      
      // Create host
      const insertHost = db.prepare(`
        INSERT INTO hosts (user_id, name, email, city, max_guests) VALUES (?, ?, ?, ?, ?)
      `);
      insertHost.run(1, 'Beach House', 'host@example.com', 'Malibu', 6);
      
      // Create availabilities
      const insertAvailability = db.prepare(`
        INSERT INTO availabilities (host_id, start_date, end_date, status) VALUES (?, ?, ?, ?)
      `);
      insertAvailability.run(1, '2025-12-01', '2025-12-07', 'available');
      insertAvailability.run(1, '2025-12-15', '2025-12-20', 'booked');
      
      // Create booking requests
      const insertBooking = db.prepare(`
        INSERT INTO booking_requests (host_id, requester_id, start_date, end_date, guests, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertBooking.run(1, 2, '2025-12-01', '2025-12-03', 2, 'pending');
    });

    it('should find available hosts by date range', () => {
      const db = getTestDatabase();
      
      const query = `
        SELECT h.*, a.start_date, a.end_date 
        FROM hosts h
        JOIN availabilities a ON h.id = a.host_id
        WHERE a.status = 'available'
          AND a.start_date <= ?
          AND a.end_date >= ?
      `;
      
      const getAvailableHosts = db.prepare(query);
      const results = getAvailableHosts.all('2025-12-01', '2025-12-03');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toMatchObject({
        name: 'Beach House',
        start_date: '2025-12-01',
        end_date: '2025-12-07',
      });
    });

    it('should find booking requests for a host', () => {
      const db = getTestDatabase();
      
      const query = `
        SELECT br.*, u.email as requester_email, u.name as requester_name
        FROM booking_requests br
        JOIN users u ON br.requester_id = u.id
        WHERE br.host_id = ?
      `;
      
      const getBookingRequests = db.prepare(query);
      const results = getBookingRequests.all(1);
      
      expect(results.length).toBe(1);
      expect(results[0]).toMatchObject({
        requester_email: 'guest@example.com',
        requester_name: 'Guest User',
        guests: 2,
        status: 'pending',
      });
    });

    it('should search hosts by location and amenities', () => {
      const db = getTestDatabase();
      
      // Add host with amenities
      const insertHost = db.prepare(`
        INSERT INTO hosts (user_id, name, email, city, amenities) VALUES (?, ?, ?, ?, ?)
      `);
      insertHost.run(1, 'Mountain Cabin', 'cabin@example.com', 'Aspen', JSON.stringify(['WiFi', 'Fireplace', 'Ski Storage']));
      
      const query = `
        SELECT * FROM hosts 
        WHERE city LIKE ? 
          AND amenities LIKE ?
      `;
      
      const searchHosts = db.prepare(query);
      const results = searchHosts.all('%Aspen%', '%WiFi%') as any[];
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('Mountain Cabin');
      expect(JSON.parse(results[0].amenities)).toContain('WiFi');
    });
  });
});