import request from 'supertest';
import express from 'express';
import usersRouter from '../../src/routes/users';
import { db } from '../../src/db';

const app = express();
app.use(express.json());
app.use('/api', usersRouter);

describe('Users Routes Integration Tests', () => {
  beforeAll(() => {
    // Ensure clean database for the entire test suite
    db.exec(`
      DELETE FROM users;
    `);
  });

  beforeEach(() => {
    // Clean up the test database before each test
    db.exec(`
      DELETE FROM users;
    `);
  });

  describe('GET /api/users/email/:email', () => {
    it('should return user by email', async () => {
      const timestamp = Date.now();
      const userId = `user-${timestamp}`;
      const userEmail = `test${timestamp}@example.com`;

      // Create a test user
      const insertUser = db.prepare(`
        INSERT INTO users (id, email, name, email_verified, image)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertUser.run(userId, userEmail, 'Test User', new Date().toISOString(), 'avatar.jpg');

      const response = await request(app)
        .get(`/api/users/email/${userEmail}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.email).toBe(userEmail);
      expect(response.body.name).toBe('Test User');
      expect(response.body.email_verified).toBeDefined();
      expect(response.body.image).toBe('avatar.jpg');
    });

    it('should return 404 for non-existent email', async () => {
      const response = await request(app)
        .get('/api/users/email/nonexistent@example.com')
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });

  describe('POST /api/users', () => {
    it('should create user successfully', async () => {
      const timestamp = Date.now();
      const userData = {
        email: `newuser${timestamp}@example.com`,
        name: 'New User',
        email_verified: new Date().toISOString(),
        image: 'new-avatar.jpg',
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      const userId = response.body.id;

      // Verify the user was created
      const getResponse = await request(app)
        .get(`/api/users/email/${userData.email}`)
        .expect(200);

      expect(getResponse.body.id).toBe(userId);
      expect(getResponse.body.email).toBe(userData.email);
      expect(getResponse.body.name).toBe('New User');
      expect(getResponse.body.image).toBe('new-avatar.jpg');
    });

    it('should create user with minimal required fields', async () => {
      const timestamp = Date.now();
      const userData = {
        email: `minimal${timestamp}@example.com`,
        name: 'Minimal User',
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('id');

      // Verify the user was created with defaults
      const getResponse = await request(app)
        .get(`/api/users/email/${userData.email}`)
        .expect(200);

      expect(getResponse.body.name).toBe('Minimal User');
      expect(getResponse.body.email_verified).toBeUndefined();
      expect(getResponse.body.image).toBeUndefined();
    });

    it('should reject user creation with invalid email', async () => {
      const invalidData = {
        email: 'invalid-email',
        name: 'Invalid Email User',
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('Email must be a valid email address');
    });

    it('should reject user creation with invalid name', async () => {
      const invalidData = {
        email: 'valid@example.com',
        name: '', // Invalid empty name
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('Name is required');
    });

    it('should reject user creation with missing required fields', async () => {
      const incompleteData = {
        email: 'missing-name@example.com',
        // Missing name
      };

      const response = await request(app)
        .post('/api/users')
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should update user name successfully', async () => {
      const timestamp = Date.now();
      const userId = `user-patch-${timestamp}`;

      // Create a test user
      const insertUser = db.prepare(`
        INSERT INTO users (id, email, name, email_verified, image)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertUser.run(userId, `patch${timestamp}@example.com`, 'Original Name', new Date().toISOString(), 'original.jpg');

      const updateData = {
        name: 'Updated Name',
      };

      const response = await request(app)
        .patch(`/api/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.name).toBe('Updated Name');
      expect(response.body.image).toBe('original.jpg'); // Should remain unchanged

      // Verify the update persisted
      const getResponse = await request(app)
        .get(`/api/users/email/patch${timestamp}@example.com`)
        .expect(200);

      expect(getResponse.body.name).toBe('Updated Name');
    });

    it('should update user image successfully', async () => {
      const timestamp = Date.now();
      const userId = `user-image-${timestamp}`;

      // Create a test user
      const insertUser = db.prepare(`
        INSERT INTO users (id, email, name, email_verified, image)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertUser.run(userId, `image${timestamp}@example.com`, 'Image Test User', new Date().toISOString(), 'old.jpg');

      const updateData = {
        image: 'new-avatar.png',
      };

      const response = await request(app)
        .patch(`/api/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.name).toBe('Image Test User'); // Should remain unchanged
      expect(response.body.image).toBe('new-avatar.png');

      // Verify the update persisted
      const getResponse = await request(app)
        .get(`/api/users/email/image${timestamp}@example.com`)
        .expect(200);

      expect(getResponse.body.image).toBe('new-avatar.png');
    });

    it('should update both name and image', async () => {
      const timestamp = Date.now();
      const userId = `user-both-${timestamp}`;

      // Create a test user
      const insertUser = db.prepare(`
        INSERT INTO users (id, email, name, email_verified, image)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertUser.run(userId, `both${timestamp}@example.com`, 'Both Test User', new Date().toISOString(), 'both-old.jpg');

      const updateData = {
        name: 'Updated Both User',
        image: 'both-new.png',
      };

      const response = await request(app)
        .patch(`/api/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.name).toBe('Updated Both User');
      expect(response.body.image).toBe('both-new.png');

      // Verify the update persisted
      const getResponse = await request(app)
        .get(`/api/users/email/both${timestamp}@example.com`)
        .expect(200);

      expect(getResponse.body.name).toBe('Updated Both User');
      expect(getResponse.body.image).toBe('both-new.png');
    });

    it('should reject update with invalid name', async () => {
      const timestamp = Date.now();
      const userId = `user-invalid-${timestamp}`;

      // Create a test user
      const insertUser = db.prepare(`
        INSERT INTO users (id, email, name, email_verified, image)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertUser.run(userId, `invalid${timestamp}@example.com`, 'Valid Name', new Date().toISOString(), 'valid.jpg');

      const updateData = {
        name: '', // Invalid empty name
      };

      const response = await request(app)
        .patch(`/api/users/${userId}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toContain('Name is required');
    });

    it('should reject update with no fields provided', async () => {
      const timestamp = Date.now();
      const userId = `user-empty-${timestamp}`;

      // Create a test user
      const insertUser = db.prepare(`
        INSERT INTO users (id, email, name, email_verified, image)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertUser.run(userId, `empty${timestamp}@example.com`, 'Empty Update User', new Date().toISOString(), 'empty.jpg');

      const updateData = {
        // No fields provided
      };

      const response = await request(app)
        .patch(`/api/users/${userId}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('At least one of name or image must be provided');
    });

    it('should return 404 for non-existent user', async () => {
      const updateData = {
        name: 'Non-existent User',
      };

      const response = await request(app)
        .patch('/api/users/non-existent-id')
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });
});