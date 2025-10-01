# Test Coverage TODOs

## Scope & approach

- Treat backend REST endpoints and frontend pages as first-class contracts: every public route and user-facing flow should have at least one automated test (unit + integration/e2e where sensible).
- Prefer realistic fixtures via the existing factories in `apps/backend/tests/setup.ts` and add matching MSW handlers/factories on the frontend so contracts stay in sync.
- Target green coverage reports on both workspaces with thresholds enforced in Jest configs; Playwright flows should cover the critical cross-app journeys end to end.

## Backend coverage

### Unit-level gaps (\`apps/backend/tests/unit\`)

- [x] Refactor `validation.test.ts` to import validators from `@stay-with-friends/shared-types` instead of duplicating logic, and add edge-case coverage (very long names, mixed whitespace, invalid email domains, out-of-range coordinates, negative guest counts).
- [x] Create `db-derived-data.test.ts` exercising read-only statements such as `getAvailabilityDates`, `searchHostsAvailableOnDate`, and `getPendingBookingRequestsCountByHostUser` (cover empty ranges, overlapping availability windows, and hosts with mixed booking statuses).
- [ ] Add focused tests for connection helpers (`getConnectionBetweenUsers`, `deleteConnectionsBetweenUsers`) to ensure bi-directional lookups and cleanup are correct.
- [ ] Cover statistics statements (`getTotalHostsCount`, `getTotalConnectionsCount`, `getTotalBookingsCount`) for zero, single, and multiple record scenarios to prevent regressions in dashboard metrics.
- [ ] Extract the duplicated `validateDateRange` helper from `routes/availabilities.ts` and `routes/booking-requests.ts` into a shared module and add unit tests for invalid formats, reversed ranges, and missing values.
- [ ] Add regression tests for invitation uniqueness logic by asserting the partial unique index (`idx_invitations_pending_unique`) rejects duplicate pending invitations for the same email.

### Integration-level gaps (\`apps/backend/tests/integration\`)

- [ ] Build a `hosts.routes.test.ts` suite covering `GET /hosts`, `GET /hosts/:id`, `GET /hosts/:id/availabilities`, `GET /hosts/search/:query`, and `POST /hosts` (success + validation failures + query paging). Include a TODO that highlights the missing `DELETE /hosts/:id` route currently assumed by the frontend.
- [ ] Expand availability coverage with tests for `GET /availabilities/by-date`, `GET /availabilities/by-date-range`, and `POST /availabilities`, asserting that non-`available` statuses are filtered out and invalid date inputs yield `400`.
- [ ] Add booking request route tests (`POST /booking-requests`, `GET /booking-requests/host/:hostId`, `GET /booking-requests/requester/:requesterId`, `GET /booking-requests/:id`, `PUT /booking-requests/:id/status`) ensuring `responded_at` is set and invalid statuses or IDs return the correct error.
- [ ] Cover connection lifecycle endpoints (`GET /connections/:userId`, `GET /connection-requests/:userId`, `POST /connections`, `PUT /connections/:id/status`) including duplicate prevention (unique index violation) and invalid status payload handling.
- [ ] Add user route tests verifying `POST /users` enforces email/name validation, `GET /users/email/:email` returns `404` for unknown emails, and `PATCH /users/:id` correctly performs partial updates.
- [ ] Extend invitation route tests to assert token lookups (`GET /invitations/token/:token`), collection listing, `POST /invitations` payload validation, status updates requiring `status`, and `DELETE /invitations/:id` behaviour when the row is missing.
- [ ] Add statistics route coverage for `/stats/hosts`, `/stats/connections`, `/stats/bookings` using seeded data to guarantee consistent counts.
- [ ] Broaden the existing `upload.test.ts` to assert failures for unsupported MIME types, over-limit file sizes, and cleanup of temporary files, alongside the happy-path upload.

### End-to-end API scenarios

- [ ] Create a supertest-driven "booking happy path" test creating a user, host, availability, booking request, approving it, and verifying downstream counts (`getPendingBookingRequestsCountByHostUser`, stats endpoints).
- [ ] Create a connection scenario test: user A sends request to user B, B accepts, verify both `/connections/:userId` and `/connection-requests/:userId` reflect the state transitions, and duplicates are rejected.
- [ ] Add a regression test ensuring accepting an invitation optionally auto-creates a connection once that feature ships (mark as pending/skipped until implemented).

### Tooling & reporting

- [ ] Enable `collectCoverage` in `apps/backend/package.json` Jest config with per-file thresholds (e.g., 80% statements/branches) and surface coverage summary in CI.
- [ ] Add npm scripts for targeted runs (`test:routes`, `test:scenarios`) to make the new suites easy to invoke locally and in automation.
- [ ] Publish a coverage HTML artifact (via `jest --coverage`) in the future GitHub Actions workflow for quick inspection.

## Frontend coverage

### Unit & component gaps (\`apps/frontend/tests/components\`)

- [ ] Add `lib/api.test.ts` verifying header injection (mock `getSession`), happy/error cases for `apiGet/apiPost/apiPut/apiDelete/apiPatch`, and consistent error propagation across methods.
- [ ] Expand `SearchFilters.test.tsx` to cover start-date selection, clearing filters, max guest dropdown behaviour with keyboard interactions, and emitting the correct callback payload.
- [ ] Create tests for `SearchResults` covering empty states, cards with partial data (missing photos/coordinates), and verifying that availability badges render correctly.
- [ ] Test `SearchCalendarView` to ensure host availability ranges are converted into calendar cells without off-by-one errors.
- [ ] Add coverage for `MapComponent` by mocking the map library and asserting markers render only when latitude/longitude exist; include a test that warns when zero mappable hosts are supplied.
- [ ] Add tests for `BookingForm` validating required fields, date ordering, guest limits, API submission success/error toast handling, and loading state toggling.
- [ ] Cover `BookingRequestsManager` and `BookingRequestCard` to ensure status filters, approve/decline actions, and empty-state messaging work.
- [ ] Add `HostingDisplay` tests for the zero-state card, delete confirmation flow (including API error toast), and rendering of amenities/availabilities.
- [ ] Test `HostingEditForm` for default value hydration, validation messaging, and successful form submission (mock API calls).
- [ ] Add `ProfileForm` tests verifying optimistic UI updates, validation (empty name/image), and error handling when the API rejects updates.
- [ ] Cover `ProfileAvatar` for initial avatar letter fallback, image upload preview handling, and error toasts on failure.
- [ ] Add tests for homepage sections (`HeroSection`, `FeaturedHostsSection`, `CommunityStatsSection`, `HowItWorksSection`) to ensure they render supplied props and handle loading/error states when data is fetched.
- [ ] Verify `SignInButton` triggers the NextAuth sign-in flow (mock `signIn`) and renders correctly in loading/disabled states.
- [ ] Add smoke tests for layout components (`PageLayout`, `Header`) to ensure slots render and optional props (subtitle, actions) behave.

### Page-level integration tests (React Testing Library + MSW)

- [ ] Add a test for `app/search/page.tsx` that exercises view toggling (list/map/calendar), URL synching with `useSearchParams`, error recovery (`Try Again` button), and initial fetch behaviour.
- [ ] Cover `app/hosting/page.tsx` ensuring unauthenticated users are redirected and authenticated users see a list of hostings (mock NextAuth session + API data).
- [ ] Test `app/invite/page.tsx` for invitation creation (form validation, success toast, error handling) and ensure existing invites load via MSW.
- [ ] Add coverage for `app/settings/page.tsx` (or equivalent) verifying profile update flows and passwordless sign-in hints.
- [ ] Cover `app/stays/page.tsx` and `app/host/[id]/page.tsx` for data loading, skeletons, and fallback UI when the backend returns 404/500.
- [ ] Introduce shared MSW handlers in `tests/setup.ts` mirroring backend endpoints so page-level tests stay aligned with API contracts.

### Playwright end-to-end scenarios (\`apps/frontend/tests/e2e\`)

- [ ] Implement a sign-in journey using the minimal NextAuth adapter test credentials, persisting the token for subsequent flows.
- [ ] Script a "host manages property" flow: create host, add availability, verify it appears in hosting dashboard, and confirm via backend API.
- [ ] Script a "friend books stay" flow: search, submit booking request, host approves, requester sees status update.
- [ ] Script an invitation lifecycle: send invite, visit magic link, accept, verify connection appears in dashboard.
- [ ] Add negative-path tests (invalid search query, booking rejection, invitation expired) to capture error handling.
- [ ] Run key flows on mobile viewport and capture screenshots to guard responsive layouts.
- [ ] Integrate Playwright accessibility checks (e.g., `axe-core` or `@playwright/test`'s `expect().toPassAxe()` helper) on critical pages.

### Tooling & reporting

- [ ] Enable Jest coverage thresholds in `apps/frontend/jest.config.js` and export lcov reports for CI ingestion.
- [ ] Add scripts for component vs page vs e2e test subsets (e.g., `test:components`, `test:pages`, `test:e2e:ci`).
- [ ] Configure Playwright to upload HTML reports and screenshots as CI artifacts, and automatically retry flaky specs once.
- [ ] Introduce MSW-powered storybook stories or visual regression tests as a stretch goal (documented but optional).

## Shared packages (`packages/shared-types`, `packages/shared-utils`)

- [ ] Add unit tests validating `toDbRow`/`fromDbRow` transformations for each entity (Host, Availability, BookingRequest, Connection, Invitation, User) to ensure default values and array serialization match backend expectations.
- [ ] Cover `shared-utils/date.ts` helpers (e.g., range formatting, timezone handling) with edge cases (DST boundaries, invalid input) so frontend and backend share consistent behaviour.
- [ ] Verify Zod validators (if present in `validators.ts`) enforce all constraints referenced in `ENTITY_SPECIFICATION.md`, adding regression tests for any gaps discovered by backend failures.

## Cross-cutting initiatives

- [ ] Add a root-level `test:all` script (leveraging Turborepo) that runs backend unit + integration suites, frontend component/page tests, and Playwright in sequence.
- [ ] Stand up a GitHub Actions workflow that installs once at the repo root, caches dependencies, runs `test:all`, collects coverage artifacts, and posts status badges.
- [ ] Publish combined coverage reports (e.g., via Codecov or Coveralls) and add quality gates failing the build when coverage regresses below agreed thresholds.
- [ ] Document shared testing fixtures and data factories in `docs/TESTING_STRATEGY.md`, linking to new helpers so contributors know how to extend suites.
- [ ] Schedule a periodic (nightly/weekly) Playwright run with a fresh database to catch integration drift between backend and frontend environments.
