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
│   ├── setup.ts                    # In-memory SQLite schema + factory helpers
│   ├── jest.setup.ts               # Ts-jest bootstrap (mocks uuid)
│   ├── __mocks__/uuid.ts           # Deterministic UUID mock for Jest
│   ├── unit/
│   │   ├── validation.test.ts      # Shared validator coverage (email/name/date)
│   │   └── db-operations.test.ts   # Direct SQL interaction checks using factories
│   └── integration/
│       └── upload.test.ts          # Multer + image upload flow using Supertest
```

### 2. Testing Dependencies

> Testing dependencies (jest, ts-jest, supertest, etc.) are already declared in `apps/backend/package.json`. Run `npm install` at the repository root to hydrate them.

### 3. Current Coverage Snapshot

- `tests/unit/validation.test.ts` exercises the shared validation helpers (email, name, optional text, coordinates, positive integers, date ranges, and status whitelists). The tests currently duplicate the logic under test; migrating them to import from `@stay-with-friends/shared-types` would reduce drift.
- `tests/unit/db-operations.test.ts` verifies core SQL operations against an in-memory SQLite database using the factory helpers in `tests/setup.ts`. It covers availability insertions, booking request workflows, connection uniqueness expectations, and invitation uniqueness/expiry rules.
- `tests/integration/upload.test.ts` boots the Express app, runs image upload scenarios via Supertest, and checks that Multer/Sharp pipelines respond with the expected payload.

### 4. Database Testing Strategy

- Every backend test spins up an isolated in-memory SQLite database using `setupTestDatabase()`; schemas mirror the production tables but do include foreign keys that are not yet present in `apps/backend/src/db.ts`.
- `db-operations.test.ts` asserts behaviour such as unique invitation tokens, acceptable availability statuses, and booking status transitions. Failed assertions indicate gaps between the intended business rules and the live schema (e.g., the production `connections` table does **not** enforce the unique `(user_id, connected_user_id)` constraint yet).
- Factories in `tests/setup.ts` centralise seed data to keep scenarios realistic.

## Frontend Testing Strategy

### 1. Test Structure

```
apps/frontend/
├── tests/
│   ├── setup.ts                    # Jest setup (jsdom + testing-library defaults)
│   ├── components/
│   │   └── SearchFilters.test.tsx  # Exercises filter UI behaviour
│   └── e2e/
│       └── invite.spec.ts          # Playwright flow covering invite creation
├── playwright.config.ts            # Playwright configuration
```

### 2. Testing Dependencies

> Jest, @testing-library, and Playwright are already listed in `apps/frontend/package.json`. Use `npm install` from the repo root to provision them.

### 3. Current Coverage Snapshot

- `tests/components/SearchFilters.test.tsx` verifies that the guest selector honours the `maxGuests` cap and renders the expected options. It uses Testing Library with the shared `tests/setup.ts` helpers.
- `tests/e2e/invite.spec.ts` (Playwright) walks through sending an invitation from the settings area, exercising both the frontend UI and backend invitation routes.

### 4. Known Gaps

- There are currently no Jest tests covering complex pages, forms (e.g., host creation), or API utilities.
- No automated accessibility or mobile viewport checks exist yet.
- Playwright coverage is limited to the invitation happy path; sign-in flows rely on magic-link logging instead of automated email retrieval.

## Test Organization and Commands

### Backend Commands

```bash
# From the monorepo root
npm run test --workspace backend

# Watch mode
npm run test:watch --workspace backend

# Focus on unit or integration suites
npm run test:unit --workspace backend
npm run test:integration --workspace backend

# Coverage report
npm run test:coverage --workspace backend
```

### Frontend Commands

```bash
# From the monorepo root
npm run test --workspace frontend

# Watch mode
npm run test:watch --workspace frontend

# Playwright E2E (run after starting the dev servers)
npm run test:e2e --workspace frontend

# Coverage report
npm run test:coverage --workspace frontend
```

## Entity Specification Compliance Testing

| Area | Status | Notes |
| --- | --- | --- |
| **User validations** | ✅ | Email and name validators covered in `validation.test.ts`. Email verification flow is manual and untested. |
| **Host operations** | ⚠️ Partial | Validators for coordinates/positive integers are exercised, but there are no API or end-to-end tests ensuring host creation/update flows. |
| **Availability** | ⚠️ Partial | Date range & status enumeration covered in `db-operations.test.ts`. Overlap handling remains manual and untested. |
| **Booking requests** | ⚠️ Partial | Tests assert status transitions and guest count expectations, but no integration tests hit the `/booking-requests` routes. |
| **Connections** | ❌ Gap | Unit tests expect a unique constraint that the production schema does not enforce; there are no route-level tests for requests/updates. |
| **Invitations** | ✅ | Token uniqueness and expiry validated via factories and `db-operations.test.ts`. Auto-connection on acceptance is not implemented. |
| **Frontend components** | ⚠️ Partial | `SearchFilters` unit test verifies guest cap logic; most UI components lack coverage. |
| **Playwright flows** | ⚠️ Partial | `invite.spec.ts` covers the invitation happy path. Sign-in shortcuts rely on magic-link logs; other journeys are not scripted. |

## Continuous Integration

### Pre-commit Hooks
```bash
# Install husky for git hooks
npm install --save-dev husky lint-staged

# Pre-commit: run tests and linting
npx husky add .husky/pre-commit "npm run test && npm run lint"
```

> **Status:** no automated CI pipeline is configured yet. When we add one, mirror the commands above using Turborepo workspaces (e.g., `npm run test --workspace backend`). A minimal GitHub Actions workflow should install dependencies once at the root, cache `node_modules`, and run backend + frontend test suites plus Playwright (optionally with the experimental `--project=chromium` flag for speed).

## Performance Testing
No automated performance testing is in place yet. Baseline Lighthouse checks can be added to Playwright and backend load tests (Artillery or k6) can run against the Express server once the API surface stabilises.

## Security Testing
Security testing is manually performed during development. There are currently no automated suites for sanitisation, CSRF, or access-control audits. Adding supertest-based negative cases and Playwright smoke checks is a high-priority follow-up.

## Monitoring and Alerts
We do not yet aggregate test metrics or gate merges on coverage thresholds. Turborepo + GitHub Actions can surface coverage percentages and detect flaky tests once CI is enabled.

This comprehensive testing strategy ensures that all functionality meets the specifications while maintaining high code quality and user experience standards.