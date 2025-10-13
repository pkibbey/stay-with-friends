/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  setupTestDatabase, 
  teardownTestDatabase, 
  getTestDatabase
} from '../setup';

describe('Database Connection Helpers', () => {
  beforeEach(() => {
    setupTestDatabase();
  });

  afterEach(() => {
    teardownTestDatabase();
  });

  describe('getConnectionBetweenUsers', () => {
    beforeEach(() => {
      const db = getTestDatabase();
      
      // Create users
      const insertUser = db.prepare(`INSERT INTO users (id, email, name) VALUES (?, ?, ?)`);
      insertUser.run('user-1', 'user1@example.com', 'User 1');
      insertUser.run('user-2', 'user2@example.com', 'User 2');
      insertUser.run('user-3', 'user3@example.com', 'User 3');
    });

    it('should return connection when user-1 connected to user-2', () => {
      const db = getTestDatabase();
      
      // Create connection from user-1 to user-2
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'accepted');
      
      // Query bi-directionally
      const getConnectionBetweenUsers = db.prepare(`
        SELECT * FROM connections 
        WHERE (user_id = ? AND connected_user_id = ?) 
           OR (user_id = ? AND connected_user_id = ?)
        LIMIT 1
      `);
      
      const result = getConnectionBetweenUsers.get('user-1', 'user-2', 'user-2', 'user-1');
      
      expect(result).toBeDefined();
      expect((result as any).id).toBe('conn-1');
      expect((result as any).user_id).toBe('user-1');
      expect((result as any).connected_user_id).toBe('user-2');
    });

    it('should return connection when user-2 connected to user-1 (bi-directional)', () => {
      const db = getTestDatabase();
      
      // Create connection from user-2 to user-1 (reverse direction)
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-2', 'user-1', 'friend', 'accepted');
      
      // Query from user-1's perspective
      const getConnectionBetweenUsers = db.prepare(`
        SELECT * FROM connections 
        WHERE (user_id = ? AND connected_user_id = ?) 
           OR (user_id = ? AND connected_user_id = ?)
        LIMIT 1
      `);
      
      const result = getConnectionBetweenUsers.get('user-1', 'user-2', 'user-2', 'user-1');
      
      expect(result).toBeDefined();
      expect((result as any).id).toBe('conn-1');
      expect((result as any).user_id).toBe('user-2');
      expect((result as any).connected_user_id).toBe('user-1');
    });

    it('should return null when no connection exists', () => {
      const db = getTestDatabase();
      
      const getConnectionBetweenUsers = db.prepare(`
        SELECT * FROM connections 
        WHERE (user_id = ? AND connected_user_id = ?) 
           OR (user_id = ? AND connected_user_id = ?)
        LIMIT 1
      `);
      
      const result = getConnectionBetweenUsers.get('user-1', 'user-2', 'user-2', 'user-1');
      
      expect(result).toBeUndefined();
    });

    it('should return pending connections', () => {
      const db = getTestDatabase();
      
      // Create pending connection
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'pending');
      
      const getConnectionBetweenUsers = db.prepare(`
        SELECT * FROM connections 
        WHERE (user_id = ? AND connected_user_id = ?) 
           OR (user_id = ? AND connected_user_id = ?)
        LIMIT 1
      `);
      
      const result = getConnectionBetweenUsers.get('user-1', 'user-2', 'user-2', 'user-1');
      
      expect(result).toBeDefined();
      expect((result as any).status).toBe('pending');
    });

    it('should return declined connections', () => {
      const db = getTestDatabase();
      
      // Create declined connection
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'declined');
      
      const getConnectionBetweenUsers = db.prepare(`
        SELECT * FROM connections 
        WHERE (user_id = ? AND connected_user_id = ?) 
           OR (user_id = ? AND connected_user_id = ?)
        LIMIT 1
      `);
      
      const result = getConnectionBetweenUsers.get('user-1', 'user-2', 'user-2', 'user-1');
      
      expect(result).toBeDefined();
      expect((result as any).status).toBe('declined');
    });

    it('should not return connection between different user pairs', () => {
      const db = getTestDatabase();
      
      // Create connection between user-1 and user-2
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'accepted');
      
      const getConnectionBetweenUsers = db.prepare(`
        SELECT * FROM connections 
        WHERE (user_id = ? AND connected_user_id = ?) 
           OR (user_id = ? AND connected_user_id = ?)
        LIMIT 1
      `);
      
      // Query for user-1 and user-3 (no connection)
      const result = getConnectionBetweenUsers.get('user-1', 'user-3', 'user-3', 'user-1');
      
      expect(result).toBeUndefined();
    });

    it('should return only one connection when LIMIT 1 is used', () => {
      const db = getTestDatabase();
      
      // This shouldn't happen due to unique constraint, but test the query logic
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'accepted');
      
      const getConnectionBetweenUsers = db.prepare(`
        SELECT * FROM connections 
        WHERE (user_id = ? AND connected_user_id = ?) 
           OR (user_id = ? AND connected_user_id = ?)
        LIMIT 1
      `);
      
      const result = getConnectionBetweenUsers.get('user-1', 'user-2', 'user-2', 'user-1');
      
      expect(result).toBeDefined();
      expect((result as any).id).toBe('conn-1');
    });

    it('should handle relationship types correctly', () => {
      const db = getTestDatabase();
      
      // Create connection with specific relationship
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-1', 'user-2', 'family', 'accepted');
      
      const getConnectionBetweenUsers = db.prepare(`
        SELECT * FROM connections 
        WHERE (user_id = ? AND connected_user_id = ?) 
           OR (user_id = ? AND connected_user_id = ?)
        LIMIT 1
      `);
      
      const result = getConnectionBetweenUsers.get('user-1', 'user-2', 'user-2', 'user-1');
      
      expect(result).toBeDefined();
      expect((result as any).relationship).toBe('family');
    });
  });

  describe('deleteConnectionsBetweenUsers', () => {
    beforeEach(() => {
      const db = getTestDatabase();
      
      // Create users
      const insertUser = db.prepare(`INSERT INTO users (id, email, name) VALUES (?, ?, ?)`);
      insertUser.run('user-1', 'user1@example.com', 'User 1');
      insertUser.run('user-2', 'user2@example.com', 'User 2');
      insertUser.run('user-3', 'user3@example.com', 'User 3');
    });

    it('should delete connection from user-1 to user-2', () => {
      const db = getTestDatabase();
      
      // Create connection
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'accepted');
      
      // Delete connection
      const deleteConnectionsBetweenUsers = db.prepare(`
        DELETE FROM connections WHERE (user_id = ? AND connected_user_id = ?) OR (user_id = ? AND connected_user_id = ?)
      `);
      const result = deleteConnectionsBetweenUsers.run('user-1', 'user-2', 'user-2', 'user-1');
      
      expect(result.changes).toBe(1);
      
      // Verify deletion
      const getConnection = db.prepare('SELECT * FROM connections WHERE id = ?');
      const connection = getConnection.get('conn-1');
      expect(connection).toBeUndefined();
    });

    it('should delete connection from user-2 to user-1 (bi-directional)', () => {
      const db = getTestDatabase();
      
      // Create connection in reverse direction
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-2', 'user-1', 'friend', 'accepted');
      
      // Delete connection using user-1, user-2 order
      const deleteConnectionsBetweenUsers = db.prepare(`
        DELETE FROM connections WHERE (user_id = ? AND connected_user_id = ?) OR (user_id = ? AND connected_user_id = ?)
      `);
      const result = deleteConnectionsBetweenUsers.run('user-1', 'user-2', 'user-2', 'user-1');
      
      expect(result.changes).toBe(1);
      
      // Verify deletion
      const getConnection = db.prepare('SELECT * FROM connections WHERE id = ?');
      const connection = getConnection.get('conn-1');
      expect(connection).toBeUndefined();
    });

    it('should delete both connections if they exist in both directions (edge case)', () => {
      const db = getTestDatabase();
      
      // In practice this shouldn't happen due to unique constraint, but test the deletion logic
      // First, drop the unique constraint for this test
      db.exec('DROP TABLE connections');
      db.exec(`
        CREATE TABLE connections (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          connected_user_id TEXT NOT NULL,
          relationship TEXT,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create connections in both directions
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'accepted');
      insertConnection.run('conn-2', 'user-2', 'user-1', 'friend', 'accepted');
      
      // Delete both
      const deleteConnectionsBetweenUsers = db.prepare(`
        DELETE FROM connections WHERE (user_id = ? AND connected_user_id = ?) OR (user_id = ? AND connected_user_id = ?)
      `);
      const result = deleteConnectionsBetweenUsers.run('user-1', 'user-2', 'user-2', 'user-1');
      
      expect(result.changes).toBe(2);
      
      // Verify both deleted
      const getConnections = db.prepare('SELECT * FROM connections WHERE id IN (?, ?)');
      const connections = getConnections.all('conn-1', 'conn-2');
      expect(connections).toHaveLength(0);
    });

    it('should return 0 changes when no connection exists', () => {
      const db = getTestDatabase();
      
      // Try to delete non-existent connection
      const deleteConnectionsBetweenUsers = db.prepare(`
        DELETE FROM connections WHERE (user_id = ? AND connected_user_id = ?) OR (user_id = ? AND connected_user_id = ?)
      `);
      const result = deleteConnectionsBetweenUsers.run('user-1', 'user-2', 'user-2', 'user-1');
      
      expect(result.changes).toBe(0);
    });

    it('should not delete connections involving other users', () => {
      const db = getTestDatabase();
      
      // Create multiple connections
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'accepted');
      insertConnection.run('conn-2', 'user-1', 'user-3', 'friend', 'accepted');
      insertConnection.run('conn-3', 'user-2', 'user-3', 'friend', 'accepted');
      
      // Delete connection between user-1 and user-2
      const deleteConnectionsBetweenUsers = db.prepare(`
        DELETE FROM connections WHERE (user_id = ? AND connected_user_id = ?) OR (user_id = ? AND connected_user_id = ?)
      `);
      const result = deleteConnectionsBetweenUsers.run('user-1', 'user-2', 'user-2', 'user-1');
      
      expect(result.changes).toBe(1);
      
      // Verify other connections still exist
      const getConnection2 = db.prepare('SELECT * FROM connections WHERE id = ?');
      const conn2 = getConnection2.get('conn-2');
      expect(conn2).toBeDefined();
      
      const getConnection3 = db.prepare('SELECT * FROM connections WHERE id = ?');
      const conn3 = getConnection3.get('conn-3');
      expect(conn3).toBeDefined();
    });

    it('should delete pending connections', () => {
      const db = getTestDatabase();
      
      // Create pending connection
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'pending');
      
      // Delete connection
      const deleteConnectionsBetweenUsers = db.prepare(`
        DELETE FROM connections WHERE (user_id = ? AND connected_user_id = ?) OR (user_id = ? AND connected_user_id = ?)
      `);
      const result = deleteConnectionsBetweenUsers.run('user-1', 'user-2', 'user-2', 'user-1');
      
      expect(result.changes).toBe(1);
    });

    it('should delete declined connections', () => {
      const db = getTestDatabase();
      
      // Create declined connection
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-1', 'user-2', 'friend', 'declined');
      
      // Delete connection
      const deleteConnectionsBetweenUsers = db.prepare(`
        DELETE FROM connections WHERE (user_id = ? AND connected_user_id = ?) OR (user_id = ? AND connected_user_id = ?)
      `);
      const result = deleteConnectionsBetweenUsers.run('user-1', 'user-2', 'user-2', 'user-1');
      
      expect(result.changes).toBe(1);
    });

    it('should handle cleanup correctly with different relationship types', () => {
      const db = getTestDatabase();
      
      // Create connection with specific relationship
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertConnection.run('conn-1', 'user-1', 'user-2', 'family', 'accepted');
      
      // Delete connection
      const deleteConnectionsBetweenUsers = db.prepare(`
        DELETE FROM connections WHERE (user_id = ? AND connected_user_id = ?) OR (user_id = ? AND connected_user_id = ?)
      `);
      const result = deleteConnectionsBetweenUsers.run('user-1', 'user-2', 'user-2', 'user-1');
      
      expect(result.changes).toBe(1);
    });
  });
});
