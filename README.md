# Football Arcadia
A football-themed web app built on Next.js, with authenticated user accounts backed by Postgres and a Redis-cached edge layer.

## Stack
- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- NextAuth v5 + Drizzle ORM + Neon (serverless Postgres)
- Upstash Redis
- Tailwind CSS v4, Radix UI / shadcn, `class-variance-authority`
- Formik + Yup for form handling and validation
- Biome (lint/format), Husky + lint-staged, Commitizen

## Architecture
Client (React 19 / App Router) → API routes & Server Actions → Drizzle ORM → Neon Postgres
Session & rate-limit state → Upstash Redis

## Layers
- `src/app` — routes, layouts, and server components (App Router)
- `src/server/db` — Drizzle schema, client, and seed script
- `src/components` — shared UI built on Radix primitives / shadcn
- `src/lib` — auth config, validation schemas, utilities

## Key decisions
- NextAuth v5 (beta) with the Drizzle adapter for session/user persistence, rather than a JWT-only flow
- Neon's serverless Postgres driver used over a traditional connection pool to suit serverless/edge deployment
- Upstash Redis introduced for caching and rate limiting rather than in-memory state, since the app runs on serverless functions
- Biome replaces ESLint + Prettier for linting/formatting; `lint-staged` + Husky enforce checks on commit
- Commitizen (`cz-conventional-changelog`) standardizes commit messages across the project

## Setup
```bash
npm install
cp .env.example .env.local   # add DATABASE_URL, AUTH_SECRET, UPSTASH_REDIS_REST_URL/TOKEN, etc.
npm run db:seed              # optional: seed the database
npm run dev
```

## Project structure
```
├── src/
│   ├── app/
│   ├── components/
│   ├── server/
│   │   └── db/
│   │       ├── schema.ts
│   │       └── seed.ts
│   └── lib/
├── public/
├── drizzle.config.ts
├── biome.json
├── components.json
└── package.json
```

## Deployment
Deployed on Vercel: [football-arcadia.vercel.app](https://football-arcadia.vercel.app)