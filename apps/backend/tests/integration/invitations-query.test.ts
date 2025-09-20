import { expect, describe, test, beforeEach, afterEach } from '@jest/globals';
import { insertInvitation, updateInvitationStatus } from '../../src/db';
import { resolvers } from '../../src/schema';
import BetterSqlite3 from 'better-sqlite3';
import path from 'path';

describe('Invitations query', () => {
  let inviterId: string;
  let db: BetterSqlite3.Database;

  beforeEach(() => {
    // Clean up any existing data
    const dbPath = path.join(__dirname, '../../database.db');
    db = new BetterSqlite3(dbPath);
    
    // Clear relevant tables in correct order (delete children first due to foreign keys)
    db.exec('DELETE FROM connections');
    db.exec('DELETE FROM invitations');
    db.exec('DELETE FROM booking_requests');
    db.exec('DELETE FROM availabilities');
    db.exec('DELETE FROM hosts');
    db.exec('DELETE FROM users');
    
    // Reset auto-increment
    db.exec('DELETE FROM sqlite_sequence WHERE name IN (\'users\', \'connections\', \'invitations\', \'hosts\', \'availabilities\', \'booking_requests\')');

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
    insertInvitation.run(
      inviterId,
      'pending@example.com',
      'Pending User',
      'Please join!',
      token1,
      expiresAt
    );

    // Create another invitation and mark it as accepted
    const token2 = 'b'.repeat(32); // Valid 32-character token
    const acceptedResult = insertInvitation.run(
      inviterId,
      'accepted@example.com',
      'Accepted User',
      'Welcome!',
      token2,
      expiresAt
    );
    
    // Mark the second invitation as accepted
    updateInvitationStatus.run('accepted', new Date().toISOString(), acceptedResult.lastInsertRowid);

    // Query invitations using the GraphQL resolver
    const result = resolvers.Query.invitations(null, { inviterId: inviterId });

    // Should return both invitations
    expect(result).toHaveLength(2);
    
    // Find pending and accepted invitations
    const pendingInvitation = result.find((inv: { invitee_email: string }) => inv.invitee_email === 'pending@example.com');
    const acceptedInvitation = result.find((inv: { invitee_email: string }) => inv.invitee_email === 'accepted@example.com');
    
    expect(pendingInvitation).toBeDefined();
    expect(pendingInvitation?.status).toBe('pending');
    
    expect(acceptedInvitation).toBeDefined();
    expect(acceptedInvitation?.status).toBe('accepted');
  });

  test('should return empty array when no invitations exist', async () => {
    const result = resolvers.Query.invitations(null, { inviterId: inviterId.toString() });
    expect(result).toHaveLength(0);
  });
});