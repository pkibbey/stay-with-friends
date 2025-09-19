import Database from 'better-sqlite3';
import { join } from 'path';
import { readFileSync } from 'fs';

// Global test database instance
let testDb: Database.Database;

export const setupTestDatabase = (): Database.Database => {
  // Create a new in-memory database for each test
  testDb = new Database(':memory:');
  
  // Read and execute the schema
  const schemaPath = join(__dirname, '..', 'src', 'db-schema.sql');
  try {
    const schema = readFileSync(schemaPath, 'utf8');
    testDb.exec(schema);
  } catch (error) {
    // If schema file doesn't exist, create tables manually
    testDb.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        email_verified DATETIME,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE hosts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        location TEXT,
        availability TEXT,
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
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        host_id INTEGER NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        status TEXT DEFAULT 'available',
        notes TEXT,
        FOREIGN KEY (host_id) REFERENCES hosts (id)
      );

      CREATE TABLE booking_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        host_id INTEGER NOT NULL,
        requester_id INTEGER NOT NULL,
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
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        connected_user_id INTEGER NOT NULL,
        relationship TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (connected_user_id) REFERENCES users (id),
        UNIQUE(user_id, connected_user_id)
      );

      CREATE TABLE invitations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        inviter_id INTEGER NOT NULL,
        invitee_email TEXT NOT NULL,
        invitee_name TEXT,
        message TEXT,
        token TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'pending',
        expires_at DATETIME NOT NULL,
        accepted_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inviter_id) REFERENCES users (id)
      );
    `);
  }
  
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
export const createTestUser = (overrides: any = {}) => {
  const defaultUser = {
    email: 'test@example.com',
    name: 'Test User',
    email_verified: new Date().toISOString(),
    image: null,
  };
  return { ...defaultUser, ...overrides };
};

export const createTestHost = (overrides: any = {}) => {
  const defaultHost = {
    user_id: 1,
    name: 'Test Host',
    email: 'host@example.com',
    location: 'Test City',
    availability: 'Always available',
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

export const createTestAvailability = (overrides: any = {}) => {
  const defaultAvailability = {
    host_id: 1,
    start_date: '2025-12-01',
    end_date: '2025-12-07',
    status: 'available',
    notes: 'Test availability',
  };
  return { ...defaultAvailability, ...overrides };
};

export const createTestBookingRequest = (overrides: any = {}) => {
  const defaultBooking = {
    host_id: 1,
    requester_id: 2,
    start_date: '2025-12-01',
    end_date: '2025-12-03',
    guests: 2,
    message: 'Test booking request',
    status: 'pending',
  };
  return { ...defaultBooking, ...overrides };
};

export const createTestConnection = (overrides: any = {}) => {
  const defaultConnection = {
    user_id: 1,
    connected_user_id: 2,
    relationship: 'friend',
    status: 'accepted',
  };
  return { ...defaultConnection, ...overrides };
};

export const createTestInvitation = (overrides: any = {}) => {
  const defaultInvitation = {
    inviter_id: 1,
    invitee_email: 'invitee@example.com',
    invitee_name: 'Test Invitee',
    message: 'Join our platform!',
    token: 'test-token-123',
    status: 'pending',
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  };
  return { ...defaultInvitation, ...overrides };
};