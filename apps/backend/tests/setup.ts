import Database from 'better-sqlite3';
// Path/fs imports intentionally omitted in test helpers

// Global test database instance
let testDb: Database.Database;

export const setupTestDatabase = (): Database.Database => {
  // Create a new in-memory database for each test
  testDb = new Database(':memory:');
  
  // Create tables manually with current schema
  testDb.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        email_verified DATETIME,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE hosts (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        location TEXT,
        description TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        country TEXT,
        latitude REAL,
        longitude REAL,
        amenities TEXT,
        house_rules TEXT,
        check_in_time TEXT,
        check_out_time TEXT,
        max_guests INTEGER,
        bedrooms INTEGER,
        bathrooms INTEGER,
        photos TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE TABLE availabilities (
        id TEXT PRIMARY KEY,
        host_id TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        status TEXT DEFAULT 'available',
        notes TEXT,
        FOREIGN KEY (host_id) REFERENCES hosts (id)
      );

      CREATE TABLE booking_requests (
        id TEXT PRIMARY KEY,
        host_id TEXT NOT NULL,
        requester_id TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        guests INTEGER NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (host_id) REFERENCES hosts (id),
        FOREIGN KEY (requester_id) REFERENCES users (id)
      );

      CREATE TABLE connections (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        connected_user_id TEXT NOT NULL,
        relationship TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (connected_user_id) REFERENCES users (id),
        UNIQUE(user_id, connected_user_id)
      );

      CREATE TABLE invitations (
        id TEXT PRIMARY KEY,
        inviter_id TEXT NOT NULL,
        invitee_email TEXT NOT NULL,
        message TEXT,
        token TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'pending',
        expires_at DATETIME NOT NULL,
        accepted_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inviter_id) REFERENCES users (id)
      );
    `);

  // Create indexes to match production database
  testDb.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_pending_unique ON invitations(inviter_id, invitee_email) WHERE status = 'pending';
  `);

  return testDb;
};

export const teardownTestDatabase = (): void => {
  if (testDb) {
    testDb.close();
  }
};

export const getTestDatabase = (): Database.Database => {
  return testDb;
};

// Test data factories
export const createTestUser = (overrides: Record<string, unknown> = {}) => {
  const defaultUser = {
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
    email_verified: new Date().toISOString(),
    image: null,
  };
  return { ...defaultUser, ...overrides };
};

export const createTestHost = (overrides: Record<string, unknown> = {}) => {
  const defaultHost = {
    id: 'test-host-1',
    user_id: 'test-user-1',
    name: 'Test Host',
    email: 'host@example.com',
    location: 'Test City',
    description: 'A test host property',
    address: '123 Test St',
    city: 'Test City',
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
  return { ...defaultHost, ...overrides };
};

export const createTestAvailability = (overrides: Record<string, unknown> = {}) => {
  const defaultAvailability = {
    id: 'test-availability-1',
    host_id: 'test-host-1',
    start_date: '2025-12-01',
    end_date: '2025-12-07',
    status: 'available',
    notes: 'Test availability',
  };
  return { ...defaultAvailability, ...overrides };
};

export const createTestBookingRequest = (overrides: Record<string, unknown> = {}) => {
  const defaultBooking = {
    id: 'test-booking-1',
    host_id: 'test-host-1',
    requester_id: 'test-user-2',
    start_date: '2025-12-01',
    end_date: '2025-12-03',
    guests: 2,
    message: 'Test booking request',
    status: 'pending',
  };
  return { ...defaultBooking, ...overrides };
};

export const createTestConnection = (overrides: Record<string, unknown> = {}) => {
  const defaultConnection = {
    id: 'test-connection-1',
    user_id: 'test-user-1',
    connected_user_id: 'test-user-2',
    relationship: 'friend',
    status: 'accepted',
  };
  return { ...defaultConnection, ...overrides };
};

export const createTestInvitation = (overrides: Record<string, unknown> = {}) => {
  const defaultInvitation = {
    id: 'test-invitation-1',
    inviter_id: 'test-user-1',
    invitee_email: 'invitee@example.com',
    message: 'Join our platform!',
    token: 'test-token-123',
    status: 'pending',
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  };
  return { ...defaultInvitation, ...overrides };
};