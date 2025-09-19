## Quick orientation for AI coding agents

These notes are tuned to help an AI assistant be productive in the "Stay With Friends" monorepo.

1) Big picture
- This is a Turborepo monorepo with two main apps:
  - `apps/frontend` — Next.js  (port 3000 in dev). See `apps/frontend/package.json` and `apps/frontend/README.md`.
  - `apps/backend` — TypeScript Express + Apollo GraphQL server (port 4000 in dev). See `apps/backend/src/index.ts`, `apps/backend/src/schema.ts`, and `apps/backend/src/db.ts`.

2) How the pieces communicate
- Frontend fetches data from the backend GraphQL endpoint at http://localhost:4000/graphql. The backend also exposes a small REST surface at `/api/*` (example: `/api/hello`, `/api/seed`).
- Database is SQLite located at `apps/backend/database.db` (the backend code will create it on startup).

3) Common developer commands (from each app's `package.json`)
- Root: use the monorepo's package manager (project uses npm by default). Run `npm install` at repo root.
- Frontend:
  - npm run dev — start Next.js dev server (localhost:3000)
  - npm run build — build Next.js
  - npm run test — jest tests for frontend
- Backend:
  - npm run dev — start backend in watch mode (tsx) (localhost:4000)
  - npm run build — tsc
  - npm run test — jest
migration helper)

4) Project-specific conventions & patterns
- DB layer: low-level SQLite access via `better-sqlite3` is in `apps/backend/src/db.ts`. Prepared statements are exported (e.g., `insertHost`, `getAllHosts`) and consumed directly by resolvers in `schema.ts`.
- GraphQL schema & resolvers live together in `apps/backend/src/schema.ts`. Resolvers expect DB rows shaped with snake_case column names and map them to GraphQL types (e.g., `created_at` -> `createdAt`). Prefer using the exported prepared statements rather than writing raw SQL elsewhere.
- Validation: Input validation functions are in `schema.ts` (e.g., `validateEmail`, `validateDateRange`). Use these helpers when adding new mutations or endpoints.
- Seeding: `apps/backend/src/index.ts` contains a `seedDatabase()` function used at startup and via `POST /api/seed`.

5) Tests and test organisation
- Backend tests live under `apps/backend/tests/` with `unit/` and `integration/` subfolders. Jest config is in `apps/backend/package.json`.
- Frontend tests use Jest/Playwright and live under `apps/frontend/tests/` and `apps/frontend/test-results/`.
- Use `npm run test:unit` and `npm run test:integration` in the backend to scope runs.

6) Things to watch for when editing code
- Database migrations are ad-hoc: `db.ts` contains inline ALTER TABLE migrations and PRAGMA checks. Be careful when modifying schemas — migrations run on startup against `apps/backend/database.db`.
- Many database columns store JSON as TEXT (e.g., `amenities`, `photos`). Code expects JSON strings — update parsing/serialization consistently.
- GraphQL resolvers sometimes open a new `better-sqlite3` connection (see places in `schema.ts` where `require('better-sqlite3')` and `db.close()` are used). Prefer using the central DB exported in `db.ts` for predictable lifecycle.

7) Useful examples to copy/pattern-match
- Creating a host: `resolvers.Mutation.createHost` in `apps/backend/src/schema.ts` — shows validation, JSON serialization for arrays, and `insertHost.run(...)` usage.
- Booking flow: `updateBookingRequestStatus` demonstrates updating booking status and marking availability as `booked`.
- Availability queries: `getAvailabilitiesByDateRange` and `getAvailabilityDates` in `db.ts` show date range handling and a recursive date_series SQL pattern.

8) Integration points & external deps
- Key packages: `better-sqlite3`, `@apollo/server`, `express`, `next`, `next-auth` (frontend), `drizzle-orm` (frontend db tooling).
- Email sending is stubbed in `sendInvitationEmail` — it logs the URL instead of calling an external service. If adding real email integrations, follow the existing pattern and update tests accordingly.

9) Pragmatic editing rules for AI
- Prefer minimal, focused changes and run tests (`npm run test`) in the affected app. Edit only files necessary for a change; avoid wide refactors without the user's consent.
- When adding DB schema fields, also update `db.ts` migrations and any affected prepared statements and GraphQL types in `schema.ts`.
- Use existing validation helpers in `schema.ts` instead of adding new ad-hoc checks.

10) Where to look for more context
- Entity rules and business logic: `ENTITY_SPECIFICATION.md` at repo root.
- Testing strategy and CI hints: `TESTING_STRATEGY.md` and `README.md` in project root.

If anything above is unclear or you want more detail (for example, CI specifics, Playwright flows, or auth wiring), tell me which area to expand and I will update this file.
