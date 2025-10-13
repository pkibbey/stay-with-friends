process.env.NODE_ENV = 'test';

import { setupTestDatabase, teardownTestDatabase } from './setup';

// Only set up in-memory database for unit tests, not integration tests
if (!process.argv.some(arg => arg.includes('integration'))) {
  beforeEach(() => {
    setupTestDatabase();
  });

  afterEach(() => {
    teardownTestDatabase();
  });
}