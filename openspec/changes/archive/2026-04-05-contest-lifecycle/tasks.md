## 1. Config Validation

- [x] 1.1 Add Zod validation schemas for `tick_duration`, `tick_per_round`, `total_rounds` in `packages/schema/src/config.ts`
- [x] 1.2 Update `ConfigService` to validate numeric config values before storing
- [x] 1.3 Add error handling for invalid config values in `ConfigService.setConfig`

## 2. ContestService Implementation

- [x] 2.1 Create `apps/api/src/services/contest.ts` with `Effect.Service` pattern
- [x] 2.2 Implement `startContest` method with `is_running` check
- [x] 2.3 Implement `stopContest` method with `is_running` check
- [x] 2.4 Implement tick scheduler using `Effect.repeat` with `Schedule.spaced` based on `tick_duration`
- [x] 2.5 Implement tick increment logic that updates `current_tick` in config
- [x] 2.6 Implement round advancement logic when `current_tick` reaches `tick_per_round`
- [x] 2.7 Implement automatic contest stop when `current_round` reaches `total_rounds`
- [x] 2.8 Use `Effect.fork` to run scheduler in background fiber and store fiber reference
- [x] 2.9 Implement clean shutdown via `Fiber.interrupt` on stored fiber reference
- [x] 2.10 Register `ContestService` in runtime layer

## 3. API Routes

- [x] 3.1 Add `POST /contest/start` route that calls `ContestService.startContest`
- [x] 3.2 Add `POST /contest/stop` route that calls `ContestService.stopContest`
- [x] 3.3 Add `GET /contest/status` route to check running state, current tick, and round

## 4. Startup Recovery

- [x] 4.1 Add startup check: if `is_running` is true, resume tick scheduler
- [x] 4.2 Calculate and advance any missed ticks based on stored timestamp

## 5. Testing

- [x] 5.1 Write unit tests for `ContestService.startContest` and `stopContest`
- [x] 5.2 Write unit tests for tick advancement and round progression
- [x] 5.3 Write unit tests for config validation constraints
- [x] 5.4 Write integration tests for contest start/stop API endpoints
