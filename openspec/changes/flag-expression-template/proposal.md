## Why

Flags are currently hardcoded as `PHENA{${Bun.randomUUIDv7()}}` in the seed script. The config keys `FlagLength` and `FlagPrefix` exist but are unused. Contest organizers need flexible flag formats to match real-world CTF conventions (e.g., incorporating challenge IDs, team IDs, dates, or custom random patterns) without modifying code.

## What Changes

- Replace hardcoded flag format with a configurable template string using `{{expression}}` syntax
- Add expression parser supporting: `random[N]`, `uuid`, `date`, `timestamp`, `challengeId`, `teamId`, `serviceId`, `round`, `tick`, `index`, `md5`, `sha256`
- Replace unused `FlagLength`/`FlagPrefix` config keys with single `FlagTemplate` key
- Update seed script to use the template system
- Add flag template validation (syntax checking)

## Capabilities

### New Capabilities

- `flag-expression`: Template-based flag generation with expression parsing, variable interpolation, and format validation

### Modified Capabilities

(none - no existing specs)

## Impact

- **API**: New `flag-expression.ts` service module; updated `seed.ts`; config enum change (`FlagLength`/`FlagPrefix` → `FlagTemplate`)
- **Schema**: `ConfigKey` enum updated in `packages/schema`
- **Frontend**: Mock data updated to reflect new config structure
- **Database**: No migration needed (config table already supports arbitrary keys)
