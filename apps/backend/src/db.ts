import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new Database(dbPath);

// Migrate hosts table to add missing fields
try {
  const tableInfo = db.prepare("PRAGMA table_info(hosts)").all() as any[];
  const hasUserId = tableInfo.some((col: any) => col.name === 'user_id');
  const hasCreatedAt = tableInfo.some((col: any) => col.name === 'created_at');
  const hasUpdatedAt = tableInfo.some((col: any) => col.name === 'updated_at');

  if (!hasUserId) {
    console.log('Adding user_id field to hosts table...');
    db.exec('ALTER TABLE hosts ADD COLUMN user_id INTEGER');
    db.exec('ALTER TABLE hosts ADD FOREIGN KEY (user_id) REFERENCES users (id)');
  }
  if (!hasCreatedAt) {
    console.log('Adding created_at field to hosts table...');
    db.exec('ALTER TABLE hosts ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  }
  if (!hasUpdatedAt) {
    console.log('Adding updated_at field to hosts table...');
    db.exec('ALTER TABLE hosts ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  }
} catch (error) {
  console.log('Hosts table migration not needed or completed.');
}

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS hosts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL CHECK(length(name) >= 1 AND length(name) <= 255),
    email TEXT UNIQUE CHECK(email IS NULL OR (email LIKE '%@%' AND length(email) >= 5)),
    location TEXT CHECK(location IS NULL OR length(location) <= 255),
    availability TEXT CHECK(availability IS NULL OR length(availability) <= 500),
    description TEXT CHECK(description IS NULL OR length(description) <= 2000),
    address TEXT CHECK(address IS NULL OR length(address) <= 255),
    city TEXT CHECK(city IS NULL OR length(city) <= 100),
    state TEXT CHECK(state IS NULL OR length(state) <= 100),
    zip_code TEXT CHECK(zip_code IS NULL OR length(zip_code) <= 20),
    country TEXT CHECK(country IS NULL OR length(country) <= 100),
    latitude REAL CHECK(latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
    longitude REAL CHECK(longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),
    amenities TEXT CHECK(amenities IS NULL OR json_valid(amenities)),
    house_rules TEXT CHECK(house_rules IS NULL OR length(house_rules) <= 2000),
    check_in_time TEXT,
    check_out_time TEXT,
    max_guests INTEGER CHECK(max_guests IS NULL OR (max_guests > 0 AND max_guests <= 50)),
    bedrooms INTEGER CHECK(bedrooms IS NULL OR (bedrooms >= 0 AND bedrooms <= 20)),
    bathrooms INTEGER CHECK(bathrooms IS NULL OR (bathrooms >= 0 AND bathrooms <= 20)),
    photos TEXT CHECK(photos IS NULL OR json_valid(photos)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

// // Add unique constraint to email if it doesn't exist (migration for existing databases)
// try {
//   db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_hosts_email ON hosts(email)`);
// } catch (error) {
//   console.log('Email unique index already exists or could not be created:', error);
// }

db.exec(`
  CREATE TABLE IF NOT EXISTS availabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    host_id INTEGER NOT NULL,
    start_date TEXT NOT NULL CHECK(start_date != ''),
    end_date TEXT NOT NULL CHECK(end_date != '' AND end_date >= start_date),
    status TEXT DEFAULT 'available' CHECK(status IN ('available', 'booked', 'blocked')),
    notes TEXT CHECK(notes IS NULL OR length(notes) <= 500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (host_id) REFERENCES hosts (id) ON DELETE CASCADE
  )
`);

// Migrate booking_requests table to use requester_id instead of requester_name/email
// Check if the table has the old structure and migrate if needed
try {
  const tableInfo = db.prepare("PRAGMA table_info(booking_requests)").all() as any[];
  const hasRequesterName = tableInfo.some((col: any) => col.name === 'requester_name');
  
  if (hasRequesterName) {
    console.log('Migrating booking_requests table to use requester_id...');
    
    // Create new table with correct structure
    db.exec(`
      CREATE TABLE booking_requests_new (
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
      )
    `);
    
    // For existing data, we'll need to find users by email and update
    // This is a manual migration - in production you'd want better data preservation
    db.exec(`
      INSERT INTO booking_requests_new (host_id, requester_id, start_date, end_date, guests, message, status, created_at)
      SELECT br.host_id, 
             COALESCE(u.id, 1) as requester_id,  -- Default to user ID 1 if not found
             br.start_date, 
             br.end_date, 
             br.guests, 
             br.message, 
             br.status, 
             br.created_at
      FROM booking_requests br
      LEFT JOIN users u ON u.email = br.requester_email
    `);
    
    // Drop old table and rename new one
    db.exec('DROP TABLE booking_requests');
    db.exec('ALTER TABLE booking_requests_new RENAME TO booking_requests');
    
    console.log('Migration completed successfully.');
  }
} catch (error) {
  console.log('Booking requests table migration not needed or completed.');
}

// Migrate booking_requests table to add response fields
try {
  const tableInfo = db.prepare("PRAGMA table_info(booking_requests)").all() as any[];
  const hasResponseMessage = tableInfo.some((col: any) => col.name === 'response_message');
  const hasRespondedAt = tableInfo.some((col: any) => col.name === 'responded_at');
  
  if (!hasResponseMessage) {
    console.log('Adding response_message field to booking_requests table...');
    db.exec('ALTER TABLE booking_requests ADD COLUMN response_message TEXT');
  }
  if (!hasRespondedAt) {
    console.log('Adding responded_at field to booking_requests table...');
    db.exec('ALTER TABLE booking_requests ADD COLUMN responded_at DATETIME');
  }
} catch (error) {
  console.log('Booking requests response fields migration not needed or completed.');
}

db.exec(`
  CREATE TABLE IF NOT EXISTS booking_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    host_id INTEGER NOT NULL,
    requester_id INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    guests INTEGER NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    response_message TEXT,
    responded_at DATETIME,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES hosts (id),
    FOREIGN KEY (requester_id) REFERENCES users (id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL CHECK(email LIKE '%@%' AND length(email) >= 5 AND length(email) <= 255),
    name TEXT CHECK(name IS NULL OR (length(name) >= 1 AND length(name) <= 255)),
    email_verified DATETIME,
    image TEXT CHECK(image IS NULL OR length(image) <= 500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
  )
`);

// Migrate connections table to add relationship field
try {
  const tableInfo = db.prepare("PRAGMA table_info(connections)").all() as any[];
  const hasRelationship = tableInfo.some((col: any) => col.name === 'relationship');
  
  if (!hasRelationship) {
    console.log('Adding relationship field to connections table...');
    db.exec('ALTER TABLE connections ADD COLUMN relationship TEXT');
    console.log('Relationship field added successfully.');
  }
} catch (error) {
  console.log('Connections table relationship field migration not needed or completed.');
}

db.exec(`
  CREATE TABLE IF NOT EXISTS connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    connected_user_id INTEGER NOT NULL,
    relationship TEXT CHECK(relationship IS NULL OR relationship IN ('friend', 'family', 'colleague', 'roommate', 'acquaintance')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'blocked')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (connected_user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(user_id, connected_user_id),
    CHECK(user_id != connected_user_id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS invitations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inviter_id INTEGER NOT NULL,
    invitee_email TEXT NOT NULL CHECK(invitee_email LIKE '%@%' AND length(invitee_email) >= 5 AND length(invitee_email) <= 255),
    invitee_name TEXT CHECK(invitee_name IS NULL OR (length(invitee_name) >= 1 AND length(invitee_name) <= 255)),
    message TEXT CHECK(message IS NULL OR length(message) <= 1000),
    token TEXT UNIQUE NOT NULL CHECK(length(token) >= 32),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'expired', 'cancelled')),
    expires_at DATETIME NOT NULL CHECK(expires_at > created_at),
    accepted_at DATETIME CHECK(accepted_at IS NULL OR accepted_at >= created_at),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (inviter_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

// Add database constraints and indexes for data integrity and performance
console.log('Adding database constraints and indexes...');

// Users table constraints and indexes
try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)`);
} catch (error) {
  console.log('Users indexes already exist or error:', error);
}

// Hosts table constraints and indexes
try {
  // Performance indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_hosts_user_id ON hosts(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_hosts_location ON hosts(location)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_hosts_city_state ON hosts(city, state)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_hosts_created_at ON hosts(created_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_hosts_coordinates ON hosts(latitude, longitude)`);
  
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

console.log('Database constraints and indexes setup completed.');

// Prepare statements
export const getAllHosts = db.prepare('SELECT * FROM hosts');
export const getHostById = db.prepare('SELECT * FROM hosts WHERE id = ?');
export const getHostByEmail = db.prepare('SELECT * FROM hosts WHERE email = ?');
export const searchHosts = db.prepare(`
  SELECT * FROM hosts
  WHERE name LIKE ? OR location LIKE ?
`);
export const insertHost = db.prepare(`
  INSERT INTO hosts (user_id, name, email, location, availability, description, address, city, state, zip_code, country, latitude, longitude, amenities, house_rules, check_in_time, check_out_time, max_guests, bedrooms, bathrooms, photos)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
  INSERT INTO availabilities (host_id, start_date, end_date, status, notes)
  VALUES (?, ?, ?, ?, ?)
`);

export const insertBookingRequest = db.prepare(`
  INSERT INTO booking_requests (host_id, requester_id, start_date, end_date, guests, message, status)
  VALUES (?, ?, ?, ?, ?, ?, ?)
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
  INSERT INTO users (email, name, email_verified, image)
  VALUES (?, ?, ?, ?)
`);
export const updateUser = db.prepare(`
  UPDATE users SET name = ?, image = ? WHERE id = ?
`);

export const getConnections = db.prepare(`
  SELECT c.*, u.email, u.name, u.image
  FROM connections c
  JOIN users u ON c.connected_user_id = u.id
  WHERE c.user_id = ? AND c.status = 'accepted'
`);
export const getConnectionRequests = db.prepare(`
  SELECT c.*, u.email, u.name, u.image
  FROM connections c
  JOIN users u ON c.connected_user_id = u.id
  WHERE c.user_id = ? AND c.status = 'pending'
`);
export const insertConnection = db.prepare(`
  INSERT INTO connections (user_id, connected_user_id, relationship, status)
  VALUES (?, ?, ?, ?)
`);
export const updateConnectionStatus = db.prepare(`
  UPDATE connections SET status = ? WHERE id = ?
`);

// Invitation prepared statements
export const insertInvitation = db.prepare(`
  INSERT INTO invitations (inviter_id, invitee_email, invitee_name, message, token, expires_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

export const getInvitationByToken = db.prepare(`
  SELECT * FROM invitations WHERE token = ?
`);

export const getInvitationsByInviter = db.prepare(`
  SELECT * FROM invitations WHERE inviter_id = ? ORDER BY created_at DESC
`);

export const updateInvitationStatus = db.prepare(`
  UPDATE invitations SET status = ?, accepted_at = ? WHERE id = ?
`);

export const getInvitationByEmail = db.prepare(`
  SELECT * FROM invitations WHERE invitee_email = ? AND status = 'pending'
`);