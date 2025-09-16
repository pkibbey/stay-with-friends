import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS people (
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

// Add unique constraint to email if it doesn't exist (migration for existing databases)
try {
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_people_email ON people(email)`);
} catch (error) {
  console.log('Email unique index already exists or could not be created:', error);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS availabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT DEFAULT 'available',
    notes TEXT,
    FOREIGN KEY (person_id) REFERENCES people (id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS booking_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER NOT NULL,
    requester_name TEXT NOT NULL,
    requester_email TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    guests INTEGER NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES people (id)
  )
`);

// Prepare statements
export const getAllPeople = db.prepare('SELECT * FROM people');
export const getPersonById = db.prepare('SELECT * FROM people WHERE id = ?');
export const getPersonByEmail = db.prepare('SELECT * FROM people WHERE email = ?');
export const searchPeople = db.prepare(`
  SELECT * FROM people
  WHERE name LIKE ? OR location LIKE ? OR relationship LIKE ?
`);
export const insertPerson = db.prepare(`
  INSERT INTO people (name, email, location, relationship, availability, description, address, city, state, zip_code, country, latitude, longitude, amenities, house_rules, check_in_time, check_out_time, max_guests, bedrooms, bathrooms, photos)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

export const getPersonAvailabilities = db.prepare(`
  SELECT * FROM availabilities
  WHERE person_id = ?
  ORDER BY start_date
`);

export const getAvailabilitiesByDateRange = db.prepare(`
  SELECT a.*, p.name, p.location, p.relationship, p.description
  FROM availabilities a
  JOIN people p ON a.person_id = p.id
  WHERE a.start_date <= ? AND a.end_date >= ? AND a.status = 'available'
  ORDER BY a.start_date
`);

export const insertAvailability = db.prepare(`
  INSERT INTO availabilities (person_id, start_date, end_date, status, notes)
  VALUES (?, ?, ?, ?, ?)
`);

export const insertBookingRequest = db.prepare(`
  INSERT INTO booking_requests (person_id, requester_name, requester_email, start_date, end_date, guests, message, status)
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