# Agent Guidelines for Phena

Phena is Attack & Defense Capture The Flag Platform. The repository uses Bun as the package manager, Turbo for orchestration, and Oxlint/Oxfmt for code quality.

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

- Avoid type assertions (`as T`, `!`) whenever possible. Prefer type guards, Zod validation, or properly typed interfaces.
- Strictly forbid `any`. Use `unknown` with type narrowing (guards/predicates) for untyped data.

## Monorepo Command Execution

When running commands in specific workspace directories (e.g., `drizzle generate` , `drizzle migrate`), **always use the `workdir` parameter** in the Bash tool fallback to `cd` commands if `workdir` parameter failed. This ensures commands run in the correct directory context.
