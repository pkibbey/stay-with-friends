module.exports = {
  // Base Jest configuration for TypeScript projects
  base: {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    testMatch: [
      '**/__tests__/**/*.ts',
      '**/?(*.)+(spec|test).ts'
    ],
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.d.ts',
      '!src/index.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: [
      'text',
      'lcov',
      'html'
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
    testEnvironmentOptions: {
      NODE_ENV: 'test'
    },
    verbose: true,
    clearMocks: true,
    restoreMocks: true,
  },

  // Configuration for backend projects
  backend: {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    testMatch: [
      '**/__tests__/**/*.ts',
      '**/?(*.)+(spec|test).ts'
    ],
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.d.ts',
      '!src/index.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: [
      'text',
      'lcov',
      'html'
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
    testEnvironmentOptions: {
      NODE_ENV: 'test'
    },
    moduleNameMapper: {
      '^uuid$': '<rootDir>/tests/__mocks__/uuid.ts'
    },
  },

  // Configuration for frontend projects
  frontend: {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    testMatch: [
      '**/__tests__/**/*.{ts,tsx}',
      '**/?(*.)+(spec|test).{ts,tsx}'
    ],
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.d.ts',
      '!src/app/**', // Exclude Next.js app directory
    ],
    coverageDirectory: 'coverage',
    coverageReporters: [
      'text',
      'lcov',
      'html'
    ],
    setupFilesAfterEnv: [
      '@testing-library/jest-dom',
      '<rootDir>/tests/setup.ts'
    ],
    testEnvironmentOptions: {
      NODE_ENV: 'test'
    },
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
    },
  },
};