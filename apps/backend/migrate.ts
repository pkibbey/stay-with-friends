import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

console.log('Starting database migration...');

// Check if migration is needed by looking for old column names
const checkOldSchema = () => {
  try {
    // Try to find tables with old column names
    const availabilitiesInfo = db.pragma('table_info(availabilities)') as Array<{name: string}>;
    const bookingRequestsInfo = db.pragma('table_info(booking_requests)') as Array<{name: string}>;
    
    const hasPersonId = availabilitiesInfo.some(col => col.name === 'person_id') || 
                       bookingRequestsInfo.some(col => col.name === 'person_id');
    
    return hasPersonId;
  } catch (error) {
    console.log('Tables may not exist yet, proceeding with normal setup...');
    return false;
  }
};

const runMigration = () => {
  console.log('Running migration to rename person_id to host_id...');
  
  try {
    db.exec('BEGIN TRANSACTION');
    
    // 1. Rename availabilities table and update column
    db.exec(`
      CREATE TABLE availabilities_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        host_id INTEGER NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        status TEXT DEFAULT 'available',
        notes TEXT,
        FOREIGN KEY (host_id) REFERENCES hosts (id)
      )
    `);
    
    // Copy data from old table (handling both person_id and host_id cases)
    db.exec(`
      INSERT INTO availabilities_new (id, host_id, start_date, end_date, status, notes)
      SELECT id, person_id, start_date, end_date, status, notes
      FROM availabilities
    `);
    
    db.exec('DROP TABLE availabilities');
    db.exec('ALTER TABLE availabilities_new RENAME TO availabilities');
    
    // 2. Rename booking_requests table and update column
    db.exec(`
      CREATE TABLE booking_requests_new (
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
    
    // Copy data from old table (handling both person_id and host_id cases)
    db.exec(`
      INSERT INTO booking_requests_new (id, host_id, requester_name, requester_email, start_date, end_date, guests, message, status, created_at)
      SELECT id, person_id, requester_name, requester_email, start_date, end_date, guests, message, status, created_at
      FROM booking_requests
    `);
    
    db.exec('DROP TABLE booking_requests');
    db.exec('ALTER TABLE booking_requests_new RENAME TO booking_requests');
    
    // 3. Make sure hosts table exists with correct name (rename people to hosts if needed)
    try {
      // Check if people table exists
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='people'").all();
      if (tables.length > 0) {
        console.log('Renaming people table to hosts...');
        db.exec('ALTER TABLE people RENAME TO hosts');
      }
    } catch (error) {
      console.log('People table does not exist or already renamed');
    }
    
    db.exec('COMMIT');
    console.log('Migration completed successfully!');
    
  } catch (error) {
    db.exec('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  }
};

// Force migration since we know the columns need to be updated
console.log('Forcing migration to update person_id to host_id...');
runMigration();

db.close();
console.log('Migration script completed');