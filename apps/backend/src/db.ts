import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new Database(dbPath);

// Create tables first to ensure migrations that inspect/alter tables won't fail when the file is new
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    email_verified DATETIME,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS hosts (
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
    latitude TEXT,
    longitude TEXT,
    amenities TEXT,
    house_rules TEXT,
    check_in_time TEXT,
    check_out_time TEXT,
    max_guests INTEGER,
    bedrooms INTEGER,
    bathrooms INTEGER,
    photos TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS availabilities (
    id TEXT PRIMARY KEY,
    host_id TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT DEFAULT 'available',
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS booking_requests (
    id TEXT PRIMARY KEY,
    host_id TEXT NOT NULL,
    requester_id TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    guests INTEGER NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    response_message TEXT,
    responded_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS connections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    connected_user_id TEXT NOT NULL,
    relationship TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS invitations (
    id TEXT PRIMARY KEY,
    inviter_id TEXT NOT NULL,
    invitee_email TEXT NOT NULL,
    message TEXT,
    token TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'pending',
    expires_at DATETIME NOT NULL,
    accepted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Legacy runtime migrations removed - DB will be recreated from scratch when needed.
// This file now only ensures schema creation and prepares statements.

// Users table constraints and indexes
try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)`);
} catch (error) {
  console.log('Users indexes already exist or error:', error);
}

// Hosts table constraints and indexes
try {
  // Performance indexes - user_id index is created in migration logic above if needed
  db.exec(`CREATE INDEX IF NOT EXISTS idx_hosts_location ON hosts(location)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_hosts_city_state ON hosts(city, state)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_hosts_created_at ON hosts(created_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_hosts_coordinates ON hosts(latitude, longitude)`);
  
  // Create user_id index only if migration didn't already handle it
  db.exec(`CREATE INDEX IF NOT EXISTS idx_hosts_user_id ON hosts(user_id)`);
  
  // Email constraint (if not already unique)
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_hosts_email_unique ON hosts(email) WHERE email IS NOT NULL`);
  
  // Invitations table partial unique constraint
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_pending_unique ON invitations(inviter_id, invitee_email) WHERE status = 'pending'`);
} catch (error) {
  console.log('Hosts indexes already exist or error:', error);
}

// Availabilities table constraints and indexes
try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_availabilities_host_id ON availabilities(host_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_availabilities_dates ON availabilities(start_date, end_date)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_availabilities_status ON availabilities(status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_availabilities_host_status ON availabilities(host_id, status)`);
} catch (error) {
  console.log('Availabilities indexes already exist or error:', error);
}

// Booking requests table constraints and indexes
try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_booking_requests_host_id ON booking_requests(host_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_booking_requests_requester_id ON booking_requests(requester_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_booking_requests_dates ON booking_requests(start_date, end_date)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_booking_requests_created_at ON booking_requests(created_at)`);
} catch (error) {
  console.log('Booking requests indexes already exist or error:', error);
}

// Connections table constraints and indexes  
try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_connections_connected_user_id ON connections(connected_user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_connections_relationship ON connections(relationship)`);
} catch (error) {
  console.log('Connections indexes already exist or error:', error);
}

// Invitations table constraints and indexes
try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_invitations_inviter_id ON invitations(inviter_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_invitations_invitee_email ON invitations(invitee_email)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON invitations(expires_at)`);
} catch (error) {
  console.log('Invitations indexes already exist or error:', error);
}

// Prepare statements
export const getAllHosts = db.prepare('SELECT * FROM hosts');
export const getHostById = db.prepare('SELECT * FROM hosts WHERE id = ?');
export const searchHosts = db.prepare(`
  SELECT * FROM hosts
  WHERE name LIKE ? OR location LIKE ?
`);
export const insertHost = db.prepare(`
  INSERT INTO hosts (id, user_id, name, location, description, address, city, state, zip_code, country, latitude, longitude, amenities, house_rules, check_in_time, check_out_time, max_guests, bedrooms, bathrooms, photos)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

export const getHostAvailabilities = db.prepare(`
  SELECT * FROM availabilities
  WHERE host_id = ?
  ORDER BY start_date
`);

export const getAvailabilitiesByDateRange = db.prepare(`
  SELECT a.*, h.name, h.location, h.description
  FROM availabilities a
  JOIN hosts h ON a.host_id = h.id
  WHERE a.start_date <= ? AND a.end_date >= ? AND a.status = 'available'
  ORDER BY a.start_date
`);

export const insertAvailability = db.prepare(`
  INSERT INTO availabilities (id, host_id, start_date, end_date, status, notes)
  VALUES (?, ?, ?, ?, ?, ?)
`);

export const insertBookingRequest = db.prepare(`
  INSERT INTO booking_requests (id, host_id, requester_id, start_date, end_date, guests, message, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

export const getBookingRequestsByHost = db.prepare(`
  SELECT br.*, u.email as requester_email, u.name as requester_name, u.image as requester_image
  FROM booking_requests br
  JOIN users u ON br.requester_id = u.id
  WHERE br.host_id = ?
  ORDER BY br.created_at DESC
`);

export const getBookingRequestsByRequester = db.prepare(`
  SELECT br.*, h.name as host_name, h.location as host_location, h.email as host_email
  FROM booking_requests br
  JOIN hosts h ON br.host_id = h.id
  WHERE br.requester_id = ?
  ORDER BY br.created_at DESC
`);

export const updateBookingRequestStatus = db.prepare(`
  UPDATE booking_requests 
  SET status = ?, response_message = ?, responded_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

export const getBookingRequestById = db.prepare(`
  SELECT br.*, 
         h.name as host_name, h.location as host_location, h.email as host_email, h.user_id as host_user_id,
         u.email as requester_email, u.name as requester_name, u.image as requester_image
  FROM booking_requests br
  JOIN hosts h ON br.host_id = h.id
  JOIN users u ON br.requester_id = u.id
  WHERE br.id = ?
`);

export const getPendingBookingRequestsCountByHostUser = db.prepare(`
  SELECT COUNT(*) as count
  FROM booking_requests br
  JOIN hosts h ON br.host_id = h.id
  WHERE h.user_id = ? AND br.status = 'pending'
`);

export const getAvailabilityDates = db.prepare(`
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

export const getUserByEmail = db.prepare('SELECT * FROM users WHERE email = ?');
export const getUserById = db.prepare('SELECT * FROM users WHERE id = ?');
export const insertUser = db.prepare(`
  INSERT INTO users (id, email, name, email_verified, image)
  VALUES (?, ?, ?, ?, ?)
`);
export const updateUser = db.prepare(`
  UPDATE users SET name = ?, image = ? WHERE id = ?
`);

export const getConnections = db.prepare(`
  SELECT c.*, u.email, u.name, u.image
  FROM connections c
  JOIN users u ON (
    CASE 
      WHEN c.user_id = ? THEN c.connected_user_id = u.id
      ELSE c.user_id = u.id
    END
  )
  WHERE (c.user_id = ? OR c.connected_user_id = ?) AND c.status = 'accepted'
`);
export const getConnectionById = db.prepare(`
  SELECT * FROM connections WHERE id = ?
`);
export const getConnectionRequests = db.prepare(`
  SELECT c.*, u.email, u.name, u.image
  FROM connections c
  JOIN users u ON c.user_id = u.id
  WHERE c.connected_user_id = ? AND c.status = 'pending'
`);
export const insertConnection = db.prepare(`
  INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
  VALUES (?, ?, ?, ?, ?)
`);
export const updateConnectionStatus = db.prepare(`
  UPDATE connections SET status = ? WHERE id = ?
`);

export const deleteConnectionById = db.prepare(`
  DELETE FROM connections WHERE id = ?
`);

export const deleteConnectionsBetweenUsers = db.prepare(`
  DELETE FROM connections WHERE (user_id = ? AND connected_user_id = ?) OR (user_id = ? AND connected_user_id = ?)
`);

// Invitation prepared statements
export const insertInvitation = db.prepare(`
  INSERT INTO invitations (id, inviter_id, invitee_email, message, token, expires_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

export const getInvitationByToken = db.prepare(`
  SELECT * FROM invitations WHERE token = ?
`);

export const getInvitationById = db.prepare(`
  SELECT * FROM invitations WHERE id = ?
`);

export const getInvitationsByInviter = db.prepare(`
  SELECT * FROM invitations WHERE inviter_id = ? ORDER BY created_at DESC
`);

export const getPendingInvitationsByInviter = db.prepare(`
  SELECT * FROM invitations WHERE inviter_id = ? AND status != 'accepted' ORDER BY created_at DESC
`);

export const updateInvitationStatus = db.prepare(`
  UPDATE invitations SET status = ?, accepted_at = ? WHERE id = ?
`);

export const getInvitationByEmail = db.prepare(`
  SELECT * FROM invitations WHERE invitee_email = ? AND status = 'pending'
`);

export const deleteInvitation = db.prepare(`
  DELETE FROM invitations WHERE id = ?
`);

// Check if connection exists between two users (in either direction)
export const getConnectionBetweenUsers = db.prepare(`
  SELECT * FROM connections 
  WHERE (user_id = ? AND connected_user_id = ?) 
     OR (user_id = ? AND connected_user_id = ?)
  LIMIT 1
`);