import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT,
    relationship TEXT,
    availability TEXT,
    description TEXT
  )
`);

// Prepare statements
export const getAllPeople = db.prepare('SELECT * FROM people');
export const getPersonById = db.prepare('SELECT * FROM people WHERE id = ?');
export const searchPeople = db.prepare(`
  SELECT * FROM people
  WHERE name LIKE ? OR location LIKE ? OR relationship LIKE ?
`);
export const insertPerson = db.prepare(`
  INSERT INTO people (name, location, relationship, availability, description)
  VALUES (?, ?, ?, ?, ?)
`);

export default db;