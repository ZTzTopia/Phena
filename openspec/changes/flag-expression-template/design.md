## Context

Phena is a CTF platform where flags are injected into services each tick. Currently flags use a hardcoded format (`PHENA{uuid}`) in `seed.ts:171`. The config enum has `FlagLength` and `FlagPrefix` keys but they are unused. Contest organizers need configurable flag formats without code changes.

Key files:
- `apps/api/src/db/seed.ts` — hardcoded flag generation
- `packages/schema/src/enums.ts` — `ConfigKey` enum
- `apps/api/src/db/schema/flags.ts` — flags table (value is `text`)
- `apps/api/src/db/schema/services.ts` — services have `teamId` + `challengeId`
- `apps/web/app/(admin)/admin/config/mock-data.ts` — frontend mock config

## Goals / Non-Goals

**Goals:**
- Provide a template syntax (`{{expression}}`) for flag generation
- Support context-aware variables (challengeId, teamId, serviceId, round, tick)
- Support random/hash generators (random[N], uuid, md5, sha256)
- Single config key `FlagTemplate` replacing `FlagLength` + `FlagPrefix`
- Validate template syntax before storing

**Non-Goals:**
- Regex-based flag validation on submission (exact match is sufficient)
- Per-challenge flag templates (global template only for now)
- Flag rotation or expiration logic
- Expression nesting or arithmetic

## Decisions

### 1. `{{expression}}` syntax over `${}` or `{}`

**Choice**: Double-curly `{{variable}}` inside a string template.

**Rationale**: Familiar from Handlebars/Jinja. Avoids collision with literal braces in flag prefixes (e.g., `PHENA{...}`). Single braces are common in CTF flag formats as delimiters.

### 2. Replace `FlagLength`/`FlagPrefix` with `FlagTemplate`

**Choice**: Single string config value like `"PHENA{{random[32]}}"`.

**Rationale**: Two separate keys don't compose well. A template string is self-contained and replaces both. The old keys are unused, so no migration concern.

### 3. Pure function parser, no runtime dependency

**Choice**: Hand-written parser in `flag-expression.ts` using string operations and `crypto` (Bun built-in).

**Rationale**: The expression grammar is simple (no nesting, no operators). A parser generator is overkill. Bun provides `crypto.randomUUID()`, `crypto.createHash()`. No new dependencies needed.

### 4. Context object for variable resolution

**Choice**: `FlagContext { challengeId, teamId, serviceId, round, tick, index }` passed to the evaluator.

**Rationale**: Keeps the function pure and testable. The caller (seed script, game engine) knows the context. The expression evaluator just maps variables to values.

### 5. Template stored in config table, not per-challenge

**Choice**: Global template via `ConfigKey.FlagTemplate`.

**Rationale**: Matches existing config pattern. Per-challenge templates can be added later if needed (would require a `flagTemplate` column on `challenges`).

## Risks / Trade-offs

- **Invalid template at runtime** → Validate syntax on config save; fall back to default `PHENA{{uuid}}` if parsing fails
- **Hash collision for random/md5/sha256** → UUID v7 is time-ordered and globally unique; random[N] uses `crypto.randomBytes` with sufficient entropy for N≥16
- **Breaking existing seed data** → Seed is idempotent (deletes + reinserts). No production data migration needed.
- **No per-challenge override** → Accept for v1. Can add `flagTemplate` column later.

## Migration Plan

1. Add `FlagTemplate = "flag_template"` to `ConfigKey` enum
2. Remove `FlagLength` and `FlagPrefix` from enum (unused)
3. Create `flag-expression.ts` with parser + evaluator
4. Update `seed.ts` to use template evaluator
5. Update frontend mock data
6. No DB migration needed (config table is key-value)

## Open Questions

- Default template if none configured? → `PHENA{{uuid}}` (preserves current behavior)
- Should `random[N]` have a max N? → Cap at 128 to prevent abuse
