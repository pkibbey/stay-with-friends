# Testing Strategy for Stay With Friends

This document outlines a comprehensive testing strategy that guarantees functionality according to the entity specifications defined in `ENTITY_SPECIFICATION.md`.

## Overview

Our testing strategy follows a three-tier approach:
1. **Unit Tests** - Test individual functions and components in isolation
2. **Integration Tests** - Test interactions between components and systems
3. **End-to-End (E2E) Tests** - Test complete user workflows

## Backend Testing Strategy

### 1. Test Structure

```
apps/backend/
├── tests/
│   ├── setup.ts                    # Database setup and test utilities
│   ├── jest.setup.ts               # Jest configuration
│   ├── unit/
│   │   ├── validation.test.ts      # Input validation tests
│   │   ├── db-operations.test.ts   # Database operation tests
│   │   └── business-logic.test.ts  # Business rule tests
│   ├── integration/
│   │   ├── api-endpoints.test.ts   # REST endpoint tests
│   │   └── database.test.ts        # Database integration tests
│   └── fixtures/
│       ├── users.json              # Test data fixtures
│       ├── hosts.json
│       └── bookings.json
```

### 2. Testing Dependencies

```bash
# Install testing dependencies
cd apps/backend
npm install --save-dev \
  jest \
  @types/jest \
  ts-jest \
  supertest \
  @types/supertest
```

### 3. Test Categories

#### Unit Tests - Validation Functions
**Purpose**: Ensure all validation functions comply with entity specifications

**Coverage**:
- Email validation (unique, format, length)
- Name validation (required, length)
- Date range validation (start ≤ end, no past dates)
- Coordinate validation (-90 ≤ lat ≤ 90, -180 ≤ lng ≤ 180)
- Guest count validation (positive integer, within limits)
- Status validation (allowed values only)

**Example Test**:
```typescript
describe('Email Validation', () => {
  it('should accept valid email formats', () => {
    expect(() => validateEmail('user@example.com')).not.toThrow();
  });
  
  it('should reject emails longer than 255 characters', () => {
    const longEmail = 'a'.repeat(250) + '@example.com';
    expect(() => validateEmail(longEmail)).toThrow('Email must be between 5 and 255 characters');
  });
});
```

### 4. Database Testing Strategy

**Test Database**: Each test uses an in-memory SQLite database for isolation

**Setup**:
- Create fresh database for each test
- Clean up after each test

**Constraints Testing**:
- Foreign key relationships
- Unique constraints
- Check constraints
- Cascade deletions

## Frontend Testing Strategy

### 1. Test Structure

```
apps/frontend/
├── tests/
│   ├── setup.ts                    # Testing environment setup
│   ├── components/
│   │   ├── SearchFilters.test.tsx  # Component unit tests
│   │   ├── HostCard.test.tsx
│   │   ├── BookingForm.test.tsx
│   │   └── AvailabilityCalendar.test.tsx
│   ├── pages/
│   │   ├── HomePage.test.tsx       # Page integration tests
│   │   ├── HostingPage.test.tsx
│   │   └── SearchPage.test.tsx
│   ├── utils/
│   │   ├── date-utils.test.ts      # Utility function tests
│   │   └── validation.test.ts
│   └── e2e/
│       ├── user-journey.spec.ts    # End-to-end workflow tests
│       ├── accessibility.spec.ts   # Accessibility compliance tests
│       └── mobile.spec.ts          # Mobile responsiveness tests
├── playwright.config.ts            # Playwright configuration
```

### 2. Testing Dependencies

```bash
# Install testing dependencies
cd apps/frontend
npm install --save-dev \
  jest \
  @types/jest \
  jest-environment-jsdom \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @playwright/test
```

### 3. Test Categories

#### Component Tests
**Purpose**: Test React components in isolation

**Coverage**:
- Rendering with different props
- User interactions (clicks, form inputs)
- State changes
- Accessibility features
- Error boundaries

**Example**:
```typescript
describe('SearchFilters', () => {
  it('validates guest count against host capacity', () => {
    render(<SearchFilters maxGuests={4} />);
    const guestsSelect = screen.getByRole('combobox', { name: /guests/i });
    
    // Should not allow more guests than host capacity
    expect(screen.queryByRole('option', { name: '5' })).not.toBeInTheDocument();
  });
});
```

#### Page Integration Tests
**Purpose**: Test complete page functionality

**Coverage**:
- Page routing
- Data fetching
- Form submissions
- Error handling
- Loading states

#### E2E Tests
**Purpose**: Test complete user workflows

**Coverage**:
- User registration/authentication
- Host creation and management
- Availability management
- Search and booking flow
- Invitation system
- Mobile responsiveness
- Accessibility compliance

## Test Organization and Commands

### Backend Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

### Frontend Commands

```bash
# Run all Jest tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Generate coverage report
npm run test:coverage
```

## Entity Specification Compliance Testing

### User Entity Tests
- [x] Email uniqueness and format validation
- [x] Name length validation (1-255 characters)
- [x] Email verification flow
- [x] User creation timestamps

### Host Entity Tests
- [x] Required name field validation
- [x] Email uniqueness (when provided)
- [x] Location and description text limits
- [x] Coordinate validation (-90 to 90 lat, -180 to 180 lng)
- [x] Positive integer validation (guests, bedrooms, bathrooms)
- [x] Array validation (amenities, photos)
- [x] Host-user relationship integrity

### Availability Entity Tests
- [x] Date range validation (start ≤ end)
- [x] Status validation (available, booked, blocked)
- [x] Host relationship integrity
- [x] Overlapping availability handling

### BookingRequest Entity Tests
- [x] Date range validation
- [x] Guest count validation (≤ host capacity)
- [x] Status workflow (pending → approved/declined)
- [x] Host and requester relationships

### Connection Entity Tests
- [x] No self-connections allowed
- [x] Unique user pair constraints
- [x] Status validation (pending, accepted, blocked)
- [x] Bidirectional relationship handling

### Invitation Entity Tests
- [x] Email format validation
- [x] Token uniqueness and security
- [x] Expiration date validation
- [x] Status workflow (pending → accepted/cancelled)
- [x] Auto-connection creation on acceptance

## Continuous Integration

### Pre-commit Hooks
```bash
# Install husky for git hooks
npm install --save-dev husky lint-staged

# Pre-commit: run tests and linting
npx husky add .husky/pre-commit "npm run test && npm run lint"
```

### CI Pipeline (GitHub Actions example)
```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd apps/backend && npm ci
      - run: cd apps/backend && npm test
      
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd apps/frontend && npm ci
      - run: cd apps/frontend && npm test
      - run: cd apps/frontend && npm run test:e2e
```

## Performance Testing

### Load Testing (Backend)
```bash
# Install artillery for load testing
npm install --save-dev artillery
```

### Performance Testing (Frontend)
```typescript
// Lighthouse performance testing in Playwright
test('should meet performance benchmarks', async ({ page }) => {
  await page.goto('/');
  
  const lighthouse = await new LighthouseCI().audit(page.url());
  expect(lighthouse.performance).toBeGreaterThan(90);
  expect(lighthouse.accessibility).toBeGreaterThan(95);
});
```

## Security Testing

### Input Sanitization Tests
- SQL injection prevention
- XSS prevention
- CSRF protection
- Rate limiting
- Authentication/authorization

### Data Privacy Tests
- User data encryption
- Access control validation
- Data retention compliance
- GDPR compliance features

## Monitoring and Alerts

### Test Metrics to Track
- Test coverage percentage (target: >80%)
- Test execution time
- Flaky test detection
- Performance regression detection

### Quality Gates
- All tests must pass before deployment
- Coverage cannot decrease below threshold
- Performance metrics must meet benchmarks
- Accessibility tests must pass

This comprehensive testing strategy ensures that all functionality meets the specifications while maintaining high code quality and user experience standards.