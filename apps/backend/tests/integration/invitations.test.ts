import request from 'supertest';
import express from 'express';
import invitationsRouter from '../../src/routes/invitations';
import { db } from '../../src/db';

const app = express();
app.use(express.json());
app.use('/api', invitationsRouter);

describe('Invitations Routes Integration Tests', () => {
  beforeEach(() => {
    // Clean up the test database before each test
    db.exec(`
      DELETE FROM invitations;
      DELETE FROM connections;
      DELETE FROM booking_requests;
      DELETE FROM availabilities;
      DELETE FROM hosts;
      DELETE FROM users;
    `);
    
    // Create test users that invitations can reference
    const insertUser = db.prepare(`INSERT INTO users (id, email, name) VALUES (?, ?, ?)`);
    insertUser.run('user-1', 'user1@example.com', 'User 1');
    insertUser.run('user-2', 'user2@example.com', 'User 2');
  });

  afterEach(() => {
    // Clean up after each test
    db.exec(`
      DELETE FROM invitations;
      DELETE FROM connections;
      DELETE FROM booking_requests;
      DELETE FROM availabilities;
      DELETE FROM hosts;
      DELETE FROM users;
    `);
  });

  describe('POST /api/invitations', () => {
    it('should create invitation successfully', async () => {
      const invitationData = {
        inviter_id: 'user-1',
        invitee_email: 'unique-test@example.com',
        message: 'Join our platform!',
        token: `unique-token-${Date.now()}`,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      };

      const response = await request(app)
        .post('/api/invitations')
        .send(invitationData);

      if (response.status !== 201) {
        console.log('Error response:', response.status, response.body);
      }

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should reject duplicate pending invitations for same inviter and email', async () => {
      const timestamp = Date.now();
      // First invitation
      const invitationData = {
        inviter_id: 'user-1',
        invitee_email: 'duplicate-test@example.com',
        message: 'Join our platform!',
        token: `token-1-${timestamp}`,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await request(app)
        .post('/api/invitations')
        .send(invitationData)
        .expect(201);

      // Second invitation with same inviter and email (should fail due to unique index)
      const duplicateInvitationData = {
        inviter_id: 'user-1',
        invitee_email: 'duplicate-test@example.com',
        message: 'Another invitation!',
        token: `token-2-${timestamp}`,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await request(app)
        .post('/api/invitations')
        .send(duplicateInvitationData)
        .expect(400);

      expect(response.body.error).toContain('A pending invitation already exists for this email');
    });

    it('should allow invitation to same email from different inviter', async () => {
      const timestamp = Date.now();
      // First invitation from user-1
      const invitationData1 = {
        inviter_id: 'user-1',
        invitee_email: 'same-email-test@example.com',
        message: 'Join from user 1!',
        token: `token-user1-${timestamp}`,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await request(app)
        .post('/api/invitations')
        .send(invitationData1)
        .expect(201);

      // Second invitation to same email from different user (should succeed)
      const invitationData2 = {
        inviter_id: 'user-2',
        invitee_email: 'same-email-test@example.com',
        message: 'Join from user 2!',
        token: `token-user2-${timestamp}`,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await request(app)
        .post('/api/invitations')
        .send(invitationData2)
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should allow new pending invitation after previous one is accepted', async () => {
      const timestamp = Date.now();
      // First invitation
      const invitationData1 = {
        inviter_id: 'user-1',
        invitee_email: `accept-test-${timestamp}@example.com`,
        message: 'First invitation',
        token: `token-accept-1-${timestamp}`,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const createResponse = await request(app)
        .post('/api/invitations')
        .send(invitationData1)
        .expect(201);

      const invitationId = createResponse.body.id;

      // Accept the first invitation
      await request(app)
        .put(`/api/invitations/${invitationId}/status`)
        .send({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .expect(200);

      // Second invitation should now be allowed since first is no longer pending
      const invitationData2 = {
        inviter_id: 'user-1',
        invitee_email: `accept-test-${timestamp}@example.com`,
        message: 'Second invitation after acceptance',
        token: `token-accept-2-${timestamp}`,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await request(app)
        .post('/api/invitations')
        .send(invitationData2)
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should allow new pending invitation after previous one is declined', async () => {
      const timestamp = Date.now();
      // First invitation
      const invitationData1 = {
        inviter_id: 'user-1',
        invitee_email: `decline-test-${timestamp}@example.com`,
        message: 'First invitation',
        token: `token-decline-1-${timestamp}`,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const createResponse = await request(app)
        .post('/api/invitations')
        .send(invitationData1)
        .expect(201);

      const invitationId = createResponse.body.id;

      // Decline the first invitation
      await request(app)
        .put(`/api/invitations/${invitationId}/status`)
        .send({
          status: 'declined',
          accepted_at: null,
        })
        .expect(200);

      // Second invitation should now be allowed since first is no longer pending
      const invitationData2 = {
        inviter_id: 'user-1',
        invitee_email: `decline-test-${timestamp}@example.com`,
        message: 'Second invitation after decline',
        token: `token-decline-2-${timestamp}`,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await request(app)
        .post('/api/invitations')
        .send(invitationData2)
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should allow new pending invitation after previous one expires', async () => {
      const timestamp = Date.now();
      // First invitation that expires immediately
      const invitationData1 = {
        inviter_id: 'user-1',
        invitee_email: `expire-test-${timestamp}@example.com`,
        message: 'First invitation',
        token: `token-expire-1-${timestamp}`,
        expires_at: new Date(Date.now() - 1000).toISOString(), // Already expired
      };

      await request(app)
        .post('/api/invitations')
        .send(invitationData1)
        .expect(201);

      // Second invitation should be allowed since first is expired (but still pending)
      // Note: In practice, expired invitations might be cleaned up, but the constraint
      // is only on pending status, so this should work
      const invitationData2 = {
        inviter_id: 'user-1',
        invitee_email: `expire-test-${timestamp}@example.com`,
        message: 'Second invitation',
        token: `token-expire-2-${timestamp}`,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await request(app)
        .post('/api/invitations')
        .send(invitationData2)
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should reject invitation with missing required fields', async () => {
      const incompleteData = {
        invitee_email: 'test@example.com',
        message: 'Join our platform!',
        // Missing inviter_id, token, expires_at
      };

      const response = await request(app)
        .post('/api/invitations')
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should reject invitation with invalid email format', async () => {
      const invalidData = {
        inviter_id: 'user-1',
        invitee_email: 'invalid-email',
        message: 'Join our platform!',
        token: 'unique-token-123',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await request(app)
        .post('/api/invitations')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/invitations/token/:token', () => {
    it('should return invitation by token', async () => {
      const timestamp = Date.now();
      // Create invitation
      const invitationData = {
        inviter_id: 'user-1',
        invitee_email: `token-test-${timestamp}@example.com`,
        message: 'Join our platform!',
        token: `token-lookup-${timestamp}`,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await request(app)
        .post('/api/invitations')
        .send(invitationData)
        .expect(201);

      // Retrieve by token
      const response = await request(app)
        .get(`/api/invitations/token/token-lookup-${timestamp}`)
        .expect(200);

      expect(response.body.invitee_email).toBe(`token-test-${timestamp}@example.com`);
      expect(response.body.token).toBe(`token-lookup-${timestamp}`);
    });

    it('should return 404 for non-existent token', async () => {
      const response = await request(app)
        .get('/api/invitations/token/non-existent-token')
        .expect(404);

      expect(response.body.error).toBe('Invitation not found');
    });
  });

  describe('GET /api/invitations', () => {
    it('should return all invitations', async () => {
      const timestamp = Date.now();
      // Create multiple invitations
      const invitationData1 = {
        inviter_id: 'user-1',
        invitee_email: `all-test-1-${timestamp}@example.com`,
        message: 'Join our platform!',
        token: `token-all-1-${timestamp}`,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const invitationData2 = {
        inviter_id: 'user-2',
        invitee_email: `all-test-2-${timestamp}@example.com`,
        message: 'Welcome!',
        token: `token-all-2-${timestamp}`,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await request(app)
        .post('/api/invitations')
        .send(invitationData1)
        .expect(201);

      await request(app)
        .post('/api/invitations')
        .send(invitationData2)
        .expect(201);

      // Retrieve all
      const response = await request(app)
        .get('/api/invitations')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should return empty array when no invitations exist', async () => {
      const response = await request(app)
        .get('/api/invitations')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('PUT /api/invitations/:id/status', () => {
    it('should update invitation status successfully', async () => {
      const timestamp = Date.now();
      // Create invitation
      const invitationData = {
        inviter_id: 'user-1',
        invitee_email: `status-test-${timestamp}@example.com`,
        message: 'Join our platform!',
        token: `token-status-${timestamp}`,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const createResponse = await request(app)
        .post('/api/invitations')
        .send(invitationData)
        .expect(201);

      const invitationId = createResponse.body.id;

      // Update status
      const updateResponse = await request(app)
        .put(`/api/invitations/${invitationId}/status`)
        .send({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .expect(200);

      expect(updateResponse.body.changes).toBe(1);
    });

    it('should reject status update without status field', async () => {
      const timestamp = Date.now();
      // Create invitation
      const invitationData = {
        inviter_id: 'user-1',
        invitee_email: `reject-test-${timestamp}@example.com`,
        message: 'Join our platform!',
        token: `token-reject-${timestamp}`,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const createResponse = await request(app)
        .post('/api/invitations')
        .send(invitationData)
        .expect(201);

      const invitationId = createResponse.body.id;

      // Try to update without status
      const response = await request(app)
        .put(`/api/invitations/${invitationId}/status`)
        .send({
          accepted_at: new Date().toISOString(),
        })
        .expect(400);

      expect(response.body.error).toBe('status required');
    });

    it('should return 0 changes for non-existent invitation', async () => {
      const response = await request(app)
        .put('/api/invitations/non-existent-id/status')
        .send({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .expect(200);

      expect(response.body.changes).toBe(0);
    });
  });

  describe('DELETE /api/invitations/:id', () => {
    it('should delete invitation successfully', async () => {
      const timestamp = Date.now();
      // Create invitation
      const invitationData = {
        inviter_id: 'user-1',
        invitee_email: `delete-test-${timestamp}@example.com`,
        message: 'Join our platform!',
        token: `token-delete-${timestamp}`,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const createResponse = await request(app)
        .post('/api/invitations')
        .send(invitationData)
        .expect(201);

      const invitationId = createResponse.body.id;

      // Delete invitation
      const deleteResponse = await request(app)
        .delete(`/api/invitations/${invitationId}`)
        .expect(200);

      expect(deleteResponse.body.changes).toBe(1);

      // Verify deletion
      await request(app)
        .get(`/api/invitations/token/token-delete-${timestamp}`)
        .expect(404);
    });

    it('should return 0 changes for non-existent invitation', async () => {
      const response = await request(app)
        .delete('/api/invitations/non-existent-id')
        .expect(200);

      expect(response.body.changes).toBe(0);
    });
  });
});