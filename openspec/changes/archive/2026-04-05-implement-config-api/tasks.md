## 1. Repository Layer

- [x] 1.1 Create `apps/api/src/repositories/config.ts` with `ConfigRepository` class
- [x] 1.2 Implement `get(key)` method returning Effect with stored value or null
- [x] 1.3 Implement `getAll()` method returning Effect with all stored values
- [x] 1.4 Implement `set(key, value, type)` method with upsert logic

## 2. Service Layer

- [x] 2.1 Create `apps/api/src/services/config.ts` with `ConfigService` class
- [x] 2.2 Define default values for all `ConfigKey` enum entries
- [x] 2.3 Implement `getConfig(key)` that returns default when repository returns null
- [x] 2.4 Implement `getAllConfig()` that merges stored values with defaults
- [x] 2.5 Implement `setConfig(key, value)` that delegates to repository

## 3. Route Layer

- [x] 3.1 Create `apps/api/src/routes/config.ts` with GET and PUT endpoints
- [x] 3.2 Add OpenAPI documentation using hono-openapi decorators
- [x] 3.3 Register config routes in `apps/api/src/index.ts`

## 4. Validation & Testing

- [x] 4.1 Verify all ConfigKey entries have default values
- [x] 4.2 Test GET /config returns merged defaults
- [x] 4.3 Test PUT /config/:key sets values correctly
- [x] 4.4 Test invalid keys return appropriate errors
- [x] 4.5 Test using ConfigService directly in code