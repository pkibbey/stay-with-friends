"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailabilityDates = exports.insertBookingRequest = exports.insertAvailability = exports.getAvailabilitiesByDateRange = exports.getPersonAvailabilities = exports.insertPerson = exports.searchPeople = exports.getPersonByEmail = exports.getPersonById = exports.getAllPeople = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(__dirname, '..', 'database.db');
const db = new better_sqlite3_1.default(dbPath);
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
}
catch (error) {
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
exports.getAllPeople = db.prepare('SELECT * FROM people');
exports.getPersonById = db.prepare('SELECT * FROM people WHERE id = ?');
exports.getPersonByEmail = db.prepare('SELECT * FROM people WHERE email = ?');
exports.searchPeople = db.prepare(`
  SELECT * FROM people
  WHERE name LIKE ? OR location LIKE ? OR relationship LIKE ?
`);
exports.insertPerson = db.prepare(`
  INSERT INTO people (name, email, location, relationship, availability, description, address, city, state, zip_code, country, latitude, longitude, amenities, house_rules, check_in_time, check_out_time, max_guests, bedrooms, bathrooms, photos)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
exports.getPersonAvailabilities = db.prepare(`
  SELECT * FROM availabilities
  WHERE person_id = ?
  ORDER BY start_date
`);
exports.getAvailabilitiesByDateRange = db.prepare(`
  SELECT a.*, p.name, p.location, p.relationship, p.description
  FROM availabilities a
  JOIN people p ON a.person_id = p.id
  WHERE a.start_date <= ? AND a.end_date >= ? AND a.status = 'available'
  ORDER BY a.start_date
`);
exports.insertAvailability = db.prepare(`
  INSERT INTO availabilities (person_id, start_date, end_date, status, notes)
  VALUES (?, ?, ?, ?, ?)
`);
exports.insertBookingRequest = db.prepare(`
  INSERT INTO booking_requests (person_id, requester_name, requester_email, start_date, end_date, guests, message, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
exports.getAvailabilityDates = db.prepare(`
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
