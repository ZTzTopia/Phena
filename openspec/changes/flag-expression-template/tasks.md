## 1. Schema Updates

- [x] 1.1 Add `FlagTemplate = "flag_template"` to `ConfigKey` enum in `packages/schema/src/enums.ts`
- [x] 1.2 Remove `FlagLength` and `FlagPrefix` from `ConfigKey` enum
- [x] 1.3 Update `MockConfig` interface and `mockConfig` in `apps/web/app/(admin)/admin/config/mock-data.ts` — replace `flagLength`/`flagPrefix` with `flagTemplate: string`

## 2. Flag Expression Engine

- [x] 2.1 Create `apps/api/src/services/flag-expression.ts` with:
  - `FlagContext` type: `{ challengeId, teamId, serviceId, round, tick, index }`
  - `parseTemplate(template: string)` — extracts `{{expression}}` tokens, returns `ParsedExpression[]` or validation errors
  - `evaluateExpression(expr: string, ctx: FlagContext)` — resolves a single expression to string
  - `evaluateTemplate(template: string, ctx: FlagContext)` — full template evaluation
  - `validateTemplate(template: string)` — syntax check, returns `{ valid, errors }`
  - Default template constant: `DEFAULT_FLAG_TEMPLATE = "PHENA{{uuid}}"`

- [x] 2.2 Implement variable expressions: `challengeId`, `teamId`, `serviceId`, `round`, `tick`, `index`
- [x] 2.3 Implement `random[N]` — crypto random alphanumeric, length 1-128, error if out of bounds
- [x] 2.4 Implement `uuid` — `crypto.randomUUID()` (Bun built-in)
- [x] 2.5 Implement `md5` and `sha256` — `crypto.createHash()` on random bytes
- [x] 2.6 Implement `date` — `YYYY-MM-DD` from `new Date()`
- [x] 2.7 Implement `timestamp` — Unix epoch seconds as string

## 3. Tests

- [x] 3.1 Create `apps/api/src/services/flag-expression.test.ts` with Vitest tests covering:
  - Parse valid templates (single expr, multiple expr, no expr)
  - Parse invalid templates (unknown expr, malformed syntax)
  - Variable interpolation with context
  - `random[N]` length and uniqueness
  - `uuid` format
  - `md5`/`sha256` output length
  - `date`/`timestamp` format
  - Full template evaluation
  - Default template fallback
  - Template validation errors

## 4. Integration

- [x] 4.1 Update `apps/api/src/db/seed.ts` to import and use `evaluateTemplate` instead of hardcoded `PHENA{${Bun.randomUUIDv7()}}`
- [x] 4.2 Default to `DEFAULT_FLAG_TEMPLATE` if no config value found
