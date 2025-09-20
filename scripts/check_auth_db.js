const path = require('path');
const Database = require('better-sqlite3');
const dbPath = path.join(__dirname, '..', 'apps', 'frontend', 'auth.db');
console.log('Checking DB at', dbPath);
let db;
try {
  db = new Database(dbPath, { readonly: true });
} catch (err) {
  console.error('Failed to open DB:', err.message);
  process.exit(2);
}
try {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  console.log('Tables:', tables.map(r => r.name).join(', ') || '(none)');
  const userInfo = db.prepare("PRAGMA table_info('user')").all();
  if (userInfo.length === 0) {
    console.log("No 'user' table found (PRAGMA empty)");
  } else {
    console.log("'user' table columns:", userInfo.map(c => c.name + ':' + c.type).join(', '));
  }
  // Try a safe select
  try {
    const row = db.prepare('SELECT COUNT(*) as cnt FROM user').get();
    console.log('User row count:', row ? row.cnt : 'unknown');
  } catch (err) {
    console.error('Query error (user table):', err.message);
  }
} finally {
  db.close();
}
