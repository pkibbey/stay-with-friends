<p align="center">
  <img src="./logo.png" alt="Stay With Friends logo" width="220" />
</p>

<h1 align="center">Stay With Friends</h1>

A trust-based accommodation platform that enables friends to connect, share their homes, and coordinate stays with each other. Stay With Friends simplifies the process of hosting friends and managing property availability through a social network-focused interface.

<!-- [Live Demo](https://stay-with-friends.vercel.app) -->

## Features

- **Friend Network Management** — Connect with friends and build a trusted network of users on the platform
- **Property Hosting** — Add properties to your profile, set amenities, manage photos, and become a host
- **Availability Calendar** — Control when your property is available with an intuitive date range system
- **Booking Requests** — Friends can request to book your available dates; you review and approve requests
- **Invitation System** — Invite friends to join the platform via email
- **User Profiles** — View host details, property information, amenities, and availability before booking

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v11 or higher (or compatible package manager)
- Git

### Installation & Development

1. Clone the repository:
   ```bash
   git clone https://github.com/pkibbey/stay-with-friends.git
   cd stay-with-friends
   ```

2. Install dependencies from the monorepo root:
   ```bash
   npm install
   ```

3. Start development servers for both frontend and backend:
   ```bash
   npm run dev
   ```
   - Frontend (Next.js) runs on `http://localhost:3000`
   - Backend (Express) runs on `http://localhost:4000`
   - Database (SQLite) is created automatically at `apps/backend/database.db`

### Running Tests

```bash
# Run all tests across the monorepo
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# For backend only:
npm run test:unit           # Unit tests
npm run test:integration    # Integration tests
```

## Project Structure

This is a **Turborepo monorepo** with a clear separation of concerns:

### `apps/frontend` — Next.js Client
- **Purpose**: User-facing web application for browsing hosts, managing bookings, and user profiles
- **Key Directories**:
  - `src/app/` — Next.js pages and routes (layout, authentication, hosting, search, settings, stays)
  - `src/components/` — Reusable React components (calendar, booking forms, host cards, etc.)
  - `src/lib/api.ts` — API client for backend communication
- **Features**: Server-side rendering, authentication with NextAuth, responsive design with Tailwind CSS, form handling with React Hook Form

### `apps/backend` — Express REST API
- **Purpose**: REST API server managing users, hosts, availability, bookings, and connections
- **Key Files**:
  - `src/index.ts` — Express app initialization and middleware
  - `src/db.ts` — SQLite database setup, migrations, and prepared statements
  - `src/routes.ts` — Route aggregation and API definitions
  - `src/routes/` — Organized route handlers (users, hosts, availabilities, booking-requests, connections, invitations, stats)
- **Features**: JWT authentication, image upload handling (avatars, photos), SQLite persistence, CORS support

### `packages/shared-*` — Shared Code
- **shared-types**: TypeScript types and validators used across frontend and backend
- **shared-config**: ESLint and Jest configuration shared by all workspaces
- **shared-utils**: Utility functions for validation, date handling, etc.

### Data Flow
1. **Frontend** makes REST API calls to Backend at `http://localhost:4000`
2. **Backend** reads/writes data to SQLite database (`database.db`)
3. **Shared Types** keep frontend and backend type definitions in sync
4. **Migrations** in `db.ts` run automatically on backend startup

## Tech Stack

- **Frontend**:
  - [Next.js](https://nextjs.org) 15.5 — React framework with App Router and server-side rendering
  - [React](https://react.dev) 19 — UI library with hooks
  - [React Hook Form](https://react-hook-form.com) — Efficient form state management
  - [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS framework
  - [Radix UI](https://www.radix-ui.com) — Unstyled, accessible component primitives
  - [NextAuth](https://next-auth.js.org) 4.24 — Authentication with magic link support
  - [Zod](https://zod.dev) 4.1 — TypeScript-first schema validation

- **Backend**:
  - [Express](https://expressjs.com) 5.1 — Lightweight HTTP server
  - [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) 12.4 — Fast synchronous SQLite wrapper
  - [JWT](https://www.npmjs.com/package/jsonwebtoken) 9.0 — Token-based authentication
  - [Multer](https://github.com/expressjs/multer) 2.0 — Middleware for file uploads
  - [Sharp](https://sharp.pixelplumbing.com) 0.34 — Image processing and optimization

- **Build & Development**:
  - [Turbo](https://turbo.build) 2.5 — Monorepo task orchestration
  - [TypeScript](https://www.typescriptlang.org) 5.9 — Type-safe JavaScript
  - [Jest](https://jestjs.io) 30 — Testing framework
  - [ESLint](https://eslint.org) 9.36 — Code linting and quality
  - [tsx](https://tsx.is) 4.20 — TypeScript execution for Node.js
