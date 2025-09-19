import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import { typeDefs } from '../../src/schema';
import { setupTestDatabase, teardownTestDatabase, getTestDatabase } from '../setup';
import request from 'supertest';

// Create resolvers that use the test database
const createTestResolvers = () => {
  const db = getTestDatabase();
  
  return {
    Query: {
      user: (_: any, { email }: { email: string }) => {
        const getUserByEmail = db.prepare('SELECT * FROM users WHERE email = ?');
        return getUserByEmail.get(email);
      },
      hosts: () => {
        const getAllHosts = db.prepare('SELECT * FROM hosts');
        return getAllHosts.all();
      },
    },
    Mutation: {
      createUser: (_: any, { email, name, image }: { email: string, name?: string, image?: string }) => {
        const insertUser = db.prepare('INSERT INTO users (email, name, email_verified, image) VALUES (?, ?, ?, ?)');
        const result = insertUser.run(email, name, null, image);
        return {
          id: result.lastInsertRowid.toString(),
          email,
          name,
          image,
          createdAt: new Date().toISOString(),
        };
      },
    }
  };
};

describe('GraphQL Integration Tests', () => {
  let app: express.Application;
  let server: ApolloServer;

  beforeAll(async () => {
    setupTestDatabase();
    
    // Create Apollo Server with test resolvers
    server = new ApolloServer({
      typeDefs,
      resolvers: createTestResolvers(),
    });

    await server.start();

    // Create Express app
    app = express();
    app.use(cors());
    app.use('/graphql', express.json(), expressMiddleware(server));
  });

  afterAll(async () => {
    await server?.stop();
    teardownTestDatabase();
  });

  beforeEach(() => {
    // Reset database before each test
    setupTestDatabase();
  });

  describe('User Operations', () => {
    it('should create a user', async () => {
      const mutation = `
        mutation CreateUser($email: String!, $name: String) {
          createUser(email: $email, name: $name) {
            id
            email
            name
            createdAt
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({
          query: mutation,
          variables: {
            email: 'test@example.com',
            name: 'Test User'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.data.createUser).toMatchObject({
        email: 'test@example.com',
        name: 'Test User'
      });
      expect(response.body.data.createUser.id).toBeDefined();
      expect(response.body.data.createUser.createdAt).toBeDefined();
    });
  });
});