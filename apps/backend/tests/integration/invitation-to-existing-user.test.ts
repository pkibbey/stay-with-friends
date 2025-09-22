/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, describe, test, beforeEach, afterEach } from '@jest/globals';
import { getUserByEmail, getConnectionBetweenUsers } from '../../src/db';
import { resolvers } from '../../src/schema';
import BetterSqlite3 from 'better-sqlite3';
import path from 'path';

describe('Invitation to existing user flow', () => {
  let inviterId: string;
  let existingUserId: string;
  let db: BetterSqlite3.Database;
  let userContext: any;

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
    
    // No sqlite_sequence reset needed for TEXT primary keys

    // Create an inviter user
    inviterId = 'test-inviter-1';
    const insertUserWithId = db.prepare('INSERT INTO users (id, email, name, email_verified, image) VALUES (?, ?, ?, ?, ?)');
    insertUserWithId.run(inviterId, 'inviter@example.com', 'Inviter User', null, null);

    // Create an existing user that will be invited
    existingUserId = 'test-existing-1';
    insertUserWithId.run(existingUserId, 'existing@example.com', 'Existing User', null, null);

    // Set user context for resolvers
    userContext = { user: { id: inviterId } };
  });


  afterEach(() => {
    if (db) {
      db.close();
    }
  });

  test('should create a connection request when inviting an existing user', async () => {
    // Attempt to create an invitation for an existing user
    const result = resolvers.Mutation.createInvitation(null, {
      inviterId: inviterId,
      inviteeEmail: 'existing@example.com',
      message: 'Want to connect!'
    }, userContext);

    // Should return an invitation-like object but with connection-sent status
    expect(result.status).toBe('connection-sent');
    expect(result.token).toBe('connection-request');
    expect(result.invitee_email).toBe('existing@example.com');
    // The message should be the provided message since one was given
    expect(result.message).toBe('Want to connect!');

    // Verify that a connection request was created in the database
    const connection = getConnectionBetweenUsers.get(
      inviterId,
      existingUserId,
      existingUserId,
      inviterId
    );

    expect(connection).toBeDefined();
    expect((connection as any).status).toBe('pending');
    expect((connection as any).user_id).toBe(inviterId);
    expect((connection as any).connected_user_id).toBe(existingUserId);
  });

  test('should create a connection request with default message when no message provided', async () => {
    // Attempt to create an invitation for an existing user without message
    const result = resolvers.Mutation.createInvitation(null, {
      inviterId: inviterId,
      inviteeEmail: 'existing@example.com'
    }, userContext);

    // Should return an invitation-like object but with connection-sent status
    expect(result.status).toBe('connection-sent');
    expect(result.token).toBe('connection-request');
    expect(result.invitee_email).toBe('existing@example.com');
    // Should have default message since none was provided
    expect(result.message).toContain('Connection request sent to');
  });

  test('should throw error when trying to invite user with existing connection', async () => {
    // First create a connection
    await resolvers.Mutation.createInvitation(null, {
      inviterId: inviterId,
      inviteeEmail: 'existing@example.com',
      message: 'Want to connect!'
    }, userContext);

    // Try to create another invitation - should fail
    expect(() => {
      resolvers.Mutation.createInvitation(null, {
        inviterId: inviterId,
        inviteeEmail: 'existing@example.com',
        message: 'Another connection attempt!'
      }, userContext);
    }).toThrow('Users are already connected or have a pending connection');
  });

  test('should create regular invitation for non-existing user', async () => {
    const result = resolvers.Mutation.createInvitation(null, {
      inviterId: inviterId,
      inviteeEmail: 'new-user@example.com',
      message: 'Join our platform!'
    }, userContext);

    // Should return a normal invitation
    expect(result.status).toBe('pending');
    expect(result.token).not.toBe('connection-request');
    expect(result.invitee_email).toBe('new-user@example.com');
    expect(result.message).toBe('Join our platform!');

    // Verify that no connection was created yet
    const newUser = getUserByEmail.get('new-user@example.com');
    expect(newUser).toBeUndefined();

    const connection = getConnectionBetweenUsers.get(
      inviterId,
      'non-existent-user-id',
      'non-existent-user-id',
      inviterId
    );
    expect(connection).toBeUndefined();
  });
});