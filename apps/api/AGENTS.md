# Agent Guidelines for apps/api

## Development Guidelines

### Effect

- Use Effect for all side-effectful logic (DB, HTTP, filesystem).
- APIs return `Effect<A, E, R>`; callers compose, don't run. Only entry points run effects.
- Write services as `Layer` with `Context.Tag`. Inject via `R` param, never import service directly.
- Use `Effect.gen(function* () { ... })` for sequential flows with `yield*`.
- Use `Effect.tryPromise(() => db.query.xxx.findMany({ ... }))` to wrap async deps.
- Errors: use `Effect.fail()` / `Data.tagged` errors, resolve with `Effect.catchAll()`.

### Code Organization

- No barrel exports (`index.ts` re-export all). Import directly from source for tree-shaking + faster builds.

### Database & Migrations

- One file per DB table. File name = table name (e.g., `users.ts` for `users`, `team-members` for `team_members`).
- Migration name: keep random, no `--name` arg.
- **DO NOT** manually create/modify files in `apps/api/drizzle/**`. Use Drizzle CLI. Manual edits cause sync issues.

### Drizzle Query v2

- Use Drizzle Query v2 (`db.query`) for nested relational data. Needs drizzle-orm v1.0.0-beta.1+.
- Init with relations: `drizzle({ relations })`
- `.findMany()` = multiple records, `.findFirst()` = single (adds `limit 1`)
- Include relations: `with: { posts: true }` — supports nested
- Partial fields: `columns: { id: true, content: false }`
- Filter `where` operators: `eq`, `gt`, `lt`, `like`, `in`, `OR`, `AND`, `NOT`, `RAW`
- Paginate/sort: `limit`, `offset`, `orderBy`
- Computed fields: `extras: { loweredName: (table, { sql }) => sql\`lower(${table.name})\` }`
- Prepared statements: `sql.placeholder()` for perf
