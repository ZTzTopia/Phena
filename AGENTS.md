# Agent Guidelines for Phena

Phena = Attack & Defense CTF Platform. Uses Bun, Turbo, Oxlint/Oxfmt.

## Tech Stack

- Package Manager & Runtime: Bun (v1.2.20)
- Frontend: Next.js 14 (App Router), React 18, Tailwind CSS 4, TanStack Query, D3.js
- Backend: Bun, Hono, Drizzle ORM, PostgreSQL, Effect, Redis, Vitest, Zod
- UI Components: shadcn/ui (exported via @phena/ui)

## Workspace Structure

- `apps/web`: Next.js frontend
- `apps/api`: Bun server backend
- `apps/checker`: Utility app
- `packages/ui`: Shared UI components
- `packages/schema`: Shared schemas

## Development Guidelines

### Type Safety

- Avoid type assertions (`as T`, `!`). Prefer type guards, Zod validation, or typed interfaces.
- Forbid `any`. Use `unknown` with type narrowing (guards/predicates) for untyped data.

## Monorepo Command Execution

Run commands in specific workspace dirs (e.g., `drizzle generate`, `drizzle migrate`) with `workdir` param. Fallback to `cd` if `workdir` fails.
