# Friends BNB

A monorepo web app built with Turborepo, featuring a NextJS frontend and a TypeScript backend.

## Apps

- `apps/frontend`: NextJS app with TypeScript, Tailwind 4, and Shadcn UI components
- `apps/backend`: TypeScript backend with GraphQL and REST API using Apollo Server

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
4. Backend GraphQL at [http://localhost:4000/graphql](http://localhost:4000/graphql)
5. Backend REST at [http://localhost:4000/api/hello](http://localhost:4000/api/hello)

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```