# Agent Guidelines for apps/api

## Development Guidelines

### Code Organization

- Avoid barrel exports (`index.ts` re-exporting everything). Import directly from the source module to enable better tree-shaking and faster builds.

### Database & Migrations

- Create a separate file for each database table. The ile name must match the table name (e.g., `users.ts` for the `users` table, `team-members` for the `team_members` table).
- When running the generate command, keep the migration name random without specifying any `--name` argument to the command.
- **DO NOT** ever modify files within the `apps/api/drizzle/**` migration folder. These files are managed by the Drizzle CLI and manual changes can cause synchronization issues.
