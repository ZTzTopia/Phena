## Why

Phena currently has no mechanism to start or stop a contest, nor to automatically advance ticks and rounds. The `is_running` config flag exists but has no logic to toggle it or drive the game loop. Without contest lifecycle management, the platform cannot run timed CTF competitions with automatic tick/round progression.

## What Changes

- Add `startContest` and `stopContest` service methods using Effect TS
- Implement tick scheduler that increments `current_tick` based on `tick_duration` config
- Implement round advancement when `current_tick` reaches `tick_per_round` limit
- Enforce config constraints: `tick_duration > 0`, `tick_per_round > 0`, `total_rounds > 0`
- Contest can only start when `is_running` is `false`; can only stop when `is_running` is `true`
- Tick/round values are bounded by `total_rounds` and `tick_per_round` from config

## Capabilities

### New Capabilities

- `contest-lifecycle`: Start/stop contest, tick scheduling, round advancement with Effect TS

### Modified Capabilities

- `config`: Add validation constraints for tick_duration, tick_per_round, total_rounds values

## Impact

- New service: `apps/api/src/services/contest.ts`
- Modified service: `apps/api/src/services/config.ts` (validation)
- Modified routes: `apps/api/src/routes/config.ts` (start/stop endpoints)
- Runtime: Scheduler/timer mechanism for tick advancement
- Database: `config` table updates for `is_running`, `current_tick`, `current_round`
