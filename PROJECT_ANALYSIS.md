# Project Analysis

## Summary
Stay With Friends is a web platform that helps people host and find short-term stays within a trusted network of friends and community members. It targets individuals and small community groups who want local, low-friction hosting and temporary accommodations with social trust baked in.

## Key Features
- User accounts, invitations, and connection management to build a trusted network.
- Host listings with availability windows, searchable by date and location.
- Booking request flow with request/response and status tracking (pending, approved, declined).
- Simple statistics endpoints and admin-facing counts for hosts, connections, and bookings.
- File upload support for avatars and host photos.

## Technical Stack
- Node.js + Express (backend API)
- Next.js + React (frontend)
- TypeScript across frontend, backend, and shared packages
- SQLite (better-sqlite3) for persistent storage
- Zod for runtime validation; Jest + Supertest + Playwright for tests
- Turborepo monorepo layout with shared packages (`shared-types`, `shared-utils`)

## Potential Improvements
- Add OAuth or passwordless production-ready authentication and email delivery instead of console-logged magic links.
- Harden data validation and migrations (add formal migration scripts and increase test isolation for CI).
- Improve UX and commercial features: pricing/availability calendar sync, reviews, and payment integration.

## Commercial Viability
The idea targets a niche between traditional short-term rentals and informal guest hosting—there is commercial potential for a community-focused hosting marketplace, especially if trust, verification, and simple payments are added.
