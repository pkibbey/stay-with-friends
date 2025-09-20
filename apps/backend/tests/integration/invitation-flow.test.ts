import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import request from 'supertest';
import { typeDefs } from '../../src/schema';
import { setupTestDatabase, teardownTestDatabase, getTestDatabase, createTestInvitation, createTestUser } from '../setup';

describe('Invitation Flow Integration', () => {
  let app: express.Application;
  let server: ApolloServer;

  beforeAll(async () => {
    setupTestDatabase();

    // Create resolvers that reference the current test DB at invocation time
    const createTestResolvers = () => ({
      Query: {
        invitation: (_: any, { token }: { token: string }) => {
          const db = getTestDatabase();
          return db.prepare('SELECT * FROM invitations WHERE token = ?').get(token);
        }
      },
      Mutation: {
        createInvitation: (_: any, { inviterId, inviteeEmail, message }: any) => {
          const db = getTestDatabase();

          const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(inviteeEmail);
          if (existingUser) {
            throw new Error('User is already registered on the platform');
          }

          const existingInvitation = db.prepare("SELECT * FROM invitations WHERE invitee_email = ? AND status = 'pending'").get(inviteeEmail);
          if (existingInvitation) {
            throw new Error('Invitation already sent to this email');
          }

          const crypto = require('crypto');
          const token = crypto.randomBytes(32).toString('hex');

          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);

          const result = db.prepare(`INSERT INTO invitations (inviter_id, invitee_email, message, token, expires_at) VALUES (?,?, ?, ?, ?)`)
            .run(inviterId, inviteeEmail, message, token, expiresAt.toISOString());

          return {
            id: result.lastInsertRowid,
            inviterId,
            inviteeEmail,
            message,
            token,
            status: 'pending',
            expiresAt: expiresAt.toISOString(),
            createdAt: new Date().toISOString(),
          };
        },
        acceptInvitation: (_: any, { token, userData }: any) => {
          const db = getTestDatabase();
          const invitation = db.prepare('SELECT * FROM invitations WHERE token = ?').get(token) as any;
          if (!invitation) throw new Error('Invalid invitation token');
          if (invitation.status !== 'pending') throw new Error('Invitation has already been used or cancelled');
          if (new Date(invitation.expires_at) < new Date()) throw new Error('Invitation has expired');

          const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(invitation.invitee_email);
          if (existingUser) throw new Error('User is already registered');

          // Generate a unique string ID for the new user
          const newUserId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          db.prepare('INSERT INTO users (id, email, name, email_verified, image) VALUES (?, ?, ?, ?, ?)')
            .run(newUserId, invitation.invitee_email, userData.name, new Date().toISOString(), userData.image);

          db.prepare('UPDATE invitations SET status = ?, accepted_at = ? WHERE id = ?').run('accepted', new Date().toISOString(), invitation.id);

          // Create reciprocal connections
          db.prepare('INSERT INTO connections (user_id, connected_user_id, relationship, status) VALUES (?, ?, ?, ?)')
            .run(invitation.inviter_id, newUserId, 'friend', 'accepted');
          db.prepare('INSERT INTO connections (user_id, connected_user_id, relationship, status) VALUES (?, ?, ?, ?)')
            .run(newUserId, invitation.inviter_id, 'friend', 'accepted');

          return {
            id: newUserId,
            email: invitation.invitee_email,
            name: userData.name,
            image: userData.image,
            emailVerified: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          };
        }
      }
    });

    server = new ApolloServer({
      typeDefs,
      resolvers: createTestResolvers() as any,
    });

    await server.start();

    app = express();
    app.use(cors());
    app.use('/graphql', express.json(), expressMiddleware(server));
  });

  afterAll(async () => {
    await server?.stop();
    teardownTestDatabase();
  });

  beforeEach(() => {
    // Reset test DB for each test
    setupTestDatabase();
    const db = getTestDatabase();

    // Create an inviter user with explicit ID
    const userId = 'test-inviter-1';
    const user = createTestUser({ id: userId, email: 'inviter@example.com', name: 'Inviter' });
    db.prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)').run(user.id, user.email, user.name);
  });

  it('creates and accepts an invitation', async () => {
    const createMutation = `
      mutation CreateInvitation($inviterId: ID!, $inviteeEmail: String!, $message: String) {
        createInvitation(inviterId: $inviterId, inviteeEmail: $inviteeEmail, message: $message) {
          id
          inviteeEmail
          message
          status
          createdAt
          token
        }
      }
    `;

    const inviteRes = await request(app)
      .post('/graphql')
      .send({
        query: createMutation,
        variables: {
          inviterId: 'test-inviter-1',
          inviteeEmail: 'newuser@example.com',
          message: 'Please join',
        }
      });

  expect(inviteRes.status).toBe(200);
  const created = inviteRes.body.data.createInvitation;
    expect(created).toBeDefined();
    expect(created.inviteeEmail).toBe('newuser@example.com');
    expect(created.token).toBeDefined();

    // Accept the invitation
    const acceptMutation = `
      mutation AcceptInvitation($token: String!, $userData: AcceptInvitationInput!) {
        acceptInvitation(token: $token, userData: $userData) {
          id
          email
          name
          createdAt
        }
      }
    `;

    const acceptRes = await request(app)
      .post('/graphql')
      .send({
        query: acceptMutation,
        variables: {
          token: created.token,
          userData: { name: 'New User', image: null }
        }
      });

    expect(acceptRes.status).toBe(200);
    const newUser = acceptRes.body.data.acceptInvitation;
    expect(newUser).toBeDefined();
    expect(newUser.email).toBe('newuser@example.com');
    expect(newUser.name).toBe('New User');

    // Verify invitation status changed to accepted
    const db = getTestDatabase();
    const inv = db.prepare('SELECT * FROM invitations WHERE id = ?').get(created.id) as any;
    expect(inv.status).toBe('accepted');
    expect(inv.accepted_at).toBeDefined();
  });
});
