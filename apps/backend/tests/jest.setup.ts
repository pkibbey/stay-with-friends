process.env.NODE_ENV = 'test';

import { setupTestDatabase, teardownTestDatabase } from './setup';

beforeEach(() => {
  setupTestDatabase();
});

afterEach(() => {
  teardownTestDatabase();
});