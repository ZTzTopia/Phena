## Context

Phena is a CTF platform that uses a tick/round system for scoring. The database schema already supports ticks and rounds (scores, flags, submissions all have `tick` and `round` columns), and config keys like `is_running`, `current_tick`, `current_round`, `tick_duration`, `tick_per_round`, and `total_rounds` exist. However, no service logic currently manages contest lifecycle or advances ticks/rounds automatically.

The codebase uses Effect TS throughout with the `Effect.Service` pattern for services, `Effect.gen` for async flows, and `ManagedRuntime` for execution. Repositories use `Effect.tryPromise` for database operations.

## Goals / Non-Goals

**Goals:**
- Start/stop contest with proper state validation
- Automatic tick advancement on a timer based on `tick_duration` config
- Round advancement when `tick_per_round` ticks complete
- Enforce config value constraints (positive integers, bounded by `total_rounds`)
- Clean shutdown of tick scheduler on contest stop

**Non-Goals:**
- Flag generation during tick advancement (separate concern)
- Score calculation during tick advancement (separate concern)
- Pause/resume functionality (only start/stop)
- Multiple concurrent contests

## Decisions

**1. Use `Effect.repeat` with `Schedule.spaced` for tick scheduling**
- Rationale: Idiomatic Effect pattern, leverages built-in scheduling, supports interruption via `Fiber.interrupt`
- Pattern: `Effect.repeat(tickEffect, Schedule.spaced("60 seconds"))` where `tick_duration` comes from config
- Alternative considered: Plain `setInterval` - not interruptible in Effect's concurrency model
- Alternative considered: Redis-based distributed scheduler - unnecessary complexity for current scale

**2. ContestService as new Effect.Service**
- Rationale: Consistent with existing service patterns (`ConfigService`, `TeamService`)
- Encapsulates all contest lifecycle logic in one place
- Stores `Fiber` reference for scheduler to enable clean shutdown via `Fiber.interrupt`

**3. Config validation via Zod schemas**
- Rationale: Leverages existing schema infrastructure in `packages/schema`
- Validates on config set, not on contest start

**4. Tick/round stored in config table**
- Rationale: Already defined as config keys, no schema migration needed
- Alternative considered: Separate state table - adds unnecessary complexity

**5. Use `Effect.fork` to run scheduler in background fiber**
- Rationale: Allows `startContest` to return immediately while scheduler runs concurrently
- Enables clean stop via `Fiber.interrupt` on the stored fiber reference

## Risks / Trade-offs

- **Single-server scheduler**: Fiber runs in-process; server restart loses scheduler state. Mitigation: On startup, check `is_running` and resume scheduler if needed.
- **Config race conditions**: Concurrent updates to `current_tick`. Mitigation: Use database transactions for atomic updates.
- **No persistence of fiber**: If server crashes mid-tick, tick advancement is lost. Mitigation: Store last tick timestamp in config, calculate missed ticks on restart.
- **Schedule duration from config**: `Schedule.spaced` requires `DurationInput`; convert `tick_duration` (seconds) to `"${seconds} seconds"` string format.

## Migration Plan

1. Deploy new `ContestService` - no schema changes required
2. Add start/stop endpoints to routes
3. On startup, check if `is_running` is true and resume scheduler if needed
4. Rollback: Remove service and routes, config state remains unchanged
