# Stay With Friends

A monorepo web app built with Turborepo, featuring a NextJS frontend and a TypeScript backend.

## Apps

- `apps/frontend`: NextJS app with TypeScript, Tailwind 4, and Shadcn UI components
- `apps/backend`: TypeScript backend with REST API

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development servers:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) for the frontend
4. Backend REST at [http://localhost:4000](http://localhost:4000/api/hello)

## Features

### Calendar Behavior
- **Date Selection**: Calendar dates can only be selected, not deselected. Once a date is chosen, users must select a different date to change their selection.
- **Availability Highlighting**: Available dates are highlighted in blue on the calendar for easy identification.
- **URL Persistence**: Selected dates are reflected in the URL query parameters for shareable links.

## Package Management

### Updating Dependencies

To check for and update packages to their latest versions:

```bash
# Check for outdated packages (safe)
npm run update-packages

# Update all packages to latest versions
npm run update-packages -- --update
```

This script uses `npm-check-updates` to check and update packages in both the frontend and backend apps.