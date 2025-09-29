import { expect, describe, test, beforeEach, afterEach } from '@jest/globals';
import { insertInvitation, updateInvitationStatus } from '../../src/db';
import { invitationsResolvers } from '../../src/graphql/resolvers/invitations';
import { Invitation } from '@stay-with-friends/shared-types';
import BetterSqlite3 from 'better-sqlite3';
import path from 'path';

describe('Invitations query', () => {
  let inviterId: string;
  let db: BetterSqlite3.Database;

  beforeEach(() => {
    // Clean up any existing data
    const dbPath = path.join(__dirname, '../../database.test.db');
    db = new BetterSqlite3(dbPath);
    
    // Create tables if they don't exist
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
    
    // Clear relevant tables in correct order (delete children first due to foreign keys)
    db.exec('DELETE FROM connections');
    db.exec('DELETE FROM invitations');
    db.exec('DELETE FROM booking_requests');
    db.exec('DELETE FROM availabilities');
    db.exec('DELETE FROM hosts');
    db.exec('DELETE FROM users');
    
  // No sqlite_sequence reset needed for TEXT primary keys

    // Create an inviter user with explicit ID
    inviterId = 'test-inviter-1';
    const insertUserWithId = db.prepare('INSERT INTO users (id, email, name, email_verified, image) VALUES (?, ?, ?, ?, ?)');
    insertUserWithId.run(inviterId, 'inviter@example.com', 'Inviter User', null, null);
  });

  afterEach(() => {
    if (db) {
      db.close();
    }
  });

  test('should return all invitations including accepted ones', async () => {
    // Create a pending invitation
    const token1 = 'a'.repeat(32); // Valid 32-character token
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    insertInvitation.run('inv-1', inviterId, 'pending@example.com', 'Please join!', token1, expiresAt);

      // Create another invitation and mark it as accepted
      const token2 = 'b'.repeat(32); // Valid 32-character token
      const acceptedId = 'inv-2';
      insertInvitation.run(acceptedId, inviterId, 'accepted@example.com', 'Welcome!', token2, expiresAt);
    
    // Mark the second invitation as accepted
    updateInvitationStatus.run('accepted', new Date().toISOString(), acceptedId);

    // Query invitations using the GraphQL resolver
    const result = invitationsResolvers.Query.invitations(null, { inviterId: inviterId }, { user: { id: inviterId, email: 'test@example.com' } });

    // Should return both invitations
    expect(result).toHaveLength(2);
    
    // Find pending and accepted invitations
    const pendingInvitation = result.find((inv: Invitation) => inv.invitee_email === 'pending@example.com');
    const acceptedInvitation = result.find((inv: Invitation) => inv.invitee_email === 'accepted@example.com');
    
    expect(pendingInvitation).toBeDefined();
    expect(pendingInvitation?.status).toBe('pending');
    
    expect(acceptedInvitation).toBeDefined();
    expect(acceptedInvitation?.status).toBe('accepted');
  });

  test('should return empty array when no invitations exist', async () => {
    const result = invitationsResolvers.Query.invitations(null, { inviterId: inviterId.toString() }, { user: { id: inviterId, email: 'test@example.com' } });
    expect(result).toHaveLength(0);
  });
});