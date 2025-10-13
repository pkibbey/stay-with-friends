import request from 'supertest';
import express from 'express';
import connectionsRouter from '../../src/routes/connections';
import { db } from '../../src/db';

const app = express();
app.use(express.json());
app.use('/api', connectionsRouter);

describe('Connections Routes Integration Tests', () => {
  beforeAll(() => {
    // Ensure clean database for the entire test suite
    db.exec(`
      DELETE FROM connections;
      DELETE FROM users;
    `);
  });

  beforeEach(() => {
    // Clean up the test database before each test
    db.exec(`
      DELETE FROM connections;
      DELETE FROM users;
    `);
    
    // Create test users that connections can reference
    const insertUser = db.prepare(`INSERT INTO users (id, email, name) VALUES (?, ?, ?)`);
    insertUser.run('user-1', 'user1@example.com', 'User 1');
    insertUser.run('user-2', 'user2@example.com', 'User 2');
    insertUser.run('user-3', 'user3@example.com', 'User 3');
  });

  describe('GET /api/connections', () => {
    it('should return accepted connections for a user', async () => {
      const timestamp = Date.now();

      // Create connections for user-1
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertConnection.run(`conn-1-${timestamp}`, 'user-1', 'user-2', 'friend', 'accepted');
      insertConnection.run(`conn-2-${timestamp}`, 'user-3', 'user-1', 'colleague', 'accepted'); // Reverse direction
      insertConnection.run(`conn-3-${timestamp}`, 'user-1', 'user-3', 'pending', 'pending'); // Not accepted

      const response = await request(app)
        .get('/api/connections?user_id=user-1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);

      // Check that connections include nested user details
      const connections = response.body;
      expect(connections.some((c: Record<string, unknown>) => (c.connectedUser as Record<string, unknown>)?.email === 'user2@example.com')).toBe(true);
      expect(connections.some((c: Record<string, unknown>) => (c.connectedUser as Record<string, unknown>)?.email === 'user3@example.com')).toBe(true);
      expect(connections.some((c: Record<string, unknown>) => c.relationship === 'friend')).toBe(true);
      expect(connections.some((c: Record<string, unknown>) => c.relationship === 'colleague')).toBe(true);
    });

    it('should return empty array when user has no accepted connections', async () => {
      const response = await request(app)
        .get('/api/connections?user_id=user-1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return 400 when user_id parameter is missing', async () => {
      const response = await request(app)
        .get('/api/connections')
        .expect(400);

      expect(response.body.error).toBe('user_id required');
    });
  });

  describe('GET /api/connection-requests/:userId', () => {
    it('should return pending connection requests for a user', async () => {
      const timestamp = Date.now();

      // Create connection requests to user-1
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertConnection.run(`req-1-${timestamp}`, 'user-2', 'user-1', 'friend', 'pending');
      insertConnection.run(`req-2-${timestamp}`, 'user-3', 'user-1', 'colleague', 'pending');
      insertConnection.run(`req-3-${timestamp}`, 'user-1', 'user-2', 'accepted', 'accepted'); // Not a request to user-1

      const response = await request(app)
        .get('/api/connection-requests/user-1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);

      // Check that requests include user details
      const requests = response.body;
      expect(requests.some((r: Record<string, unknown>) => (r.requesterUser as Record<string, unknown>)?.email === 'user2@example.com')).toBe(true);
      expect(requests.some((r: Record<string, unknown>) => (r.requesterUser as Record<string, unknown>)?.email === 'user3@example.com')).toBe(true);
      expect(requests.every((r: Record<string, unknown>) => r.status === 'pending')).toBe(true);
    });

    it('should return empty array when user has no pending requests', async () => {
      const response = await request(app)
        .get('/api/connection-requests/user-1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('POST /api/connections', () => {
    it('should create connection request successfully', async () => {
      const connectionData = {
        user_id: 'user-1',
        connected_user_id: 'user-2',
        relationship: 'friend',
      };

      const response = await request(app)
        .post('/api/connections')
        .send(connectionData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      const connId = response.body.id;

      // Verify the connection was created
      const getRequestsResponse = await request(app)
        .get('/api/connection-requests/user-2')
        .expect(200);

      const createdRequest = getRequestsResponse.body.find((r: Record<string, unknown>) => r.id === connId);
      expect(createdRequest).toBeDefined();
      expect(createdRequest.relationship).toBe('friend');
      expect(createdRequest.status).toBe('pending'); // Default status
    });

    it('should create connection with custom status', async () => {
      const connectionData = {
        user_id: 'user-1',
        connected_user_id: 'user-2',
        relationship: 'colleague',
        status: 'accepted',
      };

      const response = await request(app)
        .post('/api/connections')
        .send(connectionData)
        .expect(201);

      expect(response.body).toHaveProperty('id');

      // Verify custom status
      const getConnectionsResponse = await request(app)
        .get('/api/connections?user_id=user-1')
        .expect(200);

      expect(getConnectionsResponse.body.length).toBe(1);
      expect(getConnectionsResponse.body[0].status).toBe('accepted');
    });

    it('should reject duplicate connection creation', async () => {
      const timestamp = Date.now();

      // Create an existing connection
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertConnection.run(`existing-conn-${timestamp}`, 'user-1', 'user-2', 'friend', 'pending');

      // Try to create the same connection again
      const duplicateData = {
        user_id: 'user-1',
        connected_user_id: 'user-2',
        relationship: 'colleague', // Different relationship but same users
      };

      const response = await request(app)
        .post('/api/connections')
        .send(duplicateData)
        .expect(400);

      expect(response.body.error).toContain('UNIQUE constraint failed');
    });

    it('should reject connection with missing required fields', async () => {
      const incompleteData = {
        user_id: 'user-1',
        // Missing connected_user_id
        relationship: 'friend',
      };

      const response = await request(app)
        .post('/api/connections')
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/connections/:id/status', () => {
    it('should update connection status to accepted', async () => {
      const timestamp = Date.now();
      const connId = `conn-status-${timestamp}`;

      // Create a pending connection
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertConnection.run(connId, 'user-1', 'user-2', 'friend', 'pending');

      const updateData = {
        status: 'accepted',
      };

      const response = await request(app)
        .put(`/api/connections/${connId}/status`)
        .send(updateData)
        .expect(200);

      expect(response.body.changes).toBe(1);

      // Verify the status was updated
      const getConnectionsResponse = await request(app)
        .get('/api/connections?user_id=user-1')
        .expect(200);

      expect(getConnectionsResponse.body.length).toBe(1);
      expect(getConnectionsResponse.body[0].status).toBe('accepted');
    });

    it('should update connection status to declined', async () => {
      const timestamp = Date.now();
      const connId = `conn-decline-${timestamp}`;

      // Create a pending connection
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertConnection.run(connId, 'user-1', 'user-2', 'friend', 'pending');

      const updateData = {
        status: 'declined',
      };

      const response = await request(app)
        .put(`/api/connections/${connId}/status`)
        .send(updateData)
        .expect(200);

      expect(response.body.changes).toBe(1);

      // Verify the status was updated - declined connections shouldn't appear in accepted connections
      const getConnectionsResponse = await request(app)
        .get('/api/connections?user_id=user-1')
        .expect(200);

      expect(getConnectionsResponse.body.length).toBe(0);
    });

    it('should update connection status to blocked', async () => {
      const timestamp = Date.now();
      const connId = `conn-block-${timestamp}`;

      // Create a pending connection
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertConnection.run(connId, 'user-1', 'user-2', 'friend', 'pending');

      const updateData = {
        status: 'blocked',
      };

      const response = await request(app)
        .put(`/api/connections/${connId}/status`)
        .send(updateData)
        .expect(200);

      expect(response.body.changes).toBe(1);

      // Verify the status was updated - blocked connections shouldn't appear in accepted connections
      const getConnectionsResponse = await request(app)
        .get('/api/connections?user_id=user-1')
        .expect(200);

      expect(getConnectionsResponse.body.length).toBe(0);
    });

    it('should reject status update without status field', async () => {
      const timestamp = Date.now();
      const connId = `conn-no-status-${timestamp}`;

      // Create a pending connection
      const insertConnection = db.prepare(`
        INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertConnection.run(connId, 'user-1', 'user-2', 'friend', 'pending');

      const updateData = {
        // Missing status field
      };

      const response = await request(app)
        .put(`/api/connections/${connId}/status`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('status required');
    });

    it('should handle update of non-existent connection', async () => {
      const updateData = {
        status: 'accepted',
      };

      const response = await request(app)
        .put('/api/connections/non-existent-id/status')
        .send(updateData)
        .expect(200);

      expect(response.body.changes).toBe(0); // No rows affected
    });
  });
});