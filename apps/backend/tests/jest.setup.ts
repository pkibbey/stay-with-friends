import { setupTestDatabase, teardownTestDatabase } from './setup';

beforeEach(() => {
  setupTestDatabase();
});

afterEach(() => {
  teardownTestDatabase();
});