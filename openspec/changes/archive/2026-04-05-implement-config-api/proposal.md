## Why

The application needs a centralized config API to manage contest settings (contest name, tick duration, running state, etc.). Currently, config values are either hardcoded or scattered across the codebase. A proper config API with default values ensures consistent behavior and enables runtime configuration changes.

## What Changes

- Create config repository following existing pattern (`ConfigRepository`)
- Create config service with business logic and default values (`ConfigService`)
- Create REST API routes for CRUD operations on config
- Register config routes in the API server

## Capabilities

### New Capabilities

- `config-api`: REST API for managing contest configuration with default values

### Modified Capabilities

(None - this is a new capability)

## Impact

- New files: `apps/api/src/repositories/config.ts`, `apps/api/src/services/config.ts`, `apps/api/src/routes/config.ts`
- Modified files: `apps/api/src/index.ts` (route registration)
- Database: Uses existing `config` table schema
- Dependencies: None new required
