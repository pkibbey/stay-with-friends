import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS hosts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    location TEXT,
    relationship TEXT,
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
    photos TEXT
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
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT DEFAULT 'available',
    notes TEXT,
    FOREIGN KEY (host_id) REFERENCES hosts (id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS booking_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    host_id INTEGER NOT NULL,
    requester_name TEXT NOT NULL,
    requester_email TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    guests INTEGER NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES hosts (id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    email_verified DATETIME,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    connected_user_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, accepted, blocked
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (connected_user_id) REFERENCES users (id),
    UNIQUE(user_id, connected_user_id)
  )
`);



// Prepare statements
export const getAllHosts = db.prepare('SELECT * FROM hosts');
export const getHostById = db.prepare('SELECT * FROM hosts WHERE id = ?');
export const getHostByEmail = db.prepare('SELECT * FROM hosts WHERE email = ?');
export const searchHosts = db.prepare(`
  SELECT * FROM hosts
  WHERE name LIKE ? OR location LIKE ? OR relationship LIKE ?
`);
export const insertHost = db.prepare(`
  INSERT INTO hosts (name, email, location, relationship, availability, description, address, city, state, zip_code, country, latitude, longitude, amenities, house_rules, check_in_time, check_out_time, max_guests, bedrooms, bathrooms, photos)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

export const getHostAvailabilities = db.prepare(`
  SELECT * FROM availabilities
  WHERE host_id = ?
  ORDER BY start_date
`);

export const getAvailabilitiesByDateRange = db.prepare(`
  SELECT a.*, h.name, h.location, h.relationship, h.description
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
  INSERT INTO booking_requests (host_id, requester_name, requester_email, start_date, end_date, guests, message, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
  INSERT INTO connections (user_id, connected_user_id, status)
  VALUES (?, ?, ?)
`);
export const updateConnectionStatus = db.prepare(`
  UPDATE connections SET status = ? WHERE id = ?
`);