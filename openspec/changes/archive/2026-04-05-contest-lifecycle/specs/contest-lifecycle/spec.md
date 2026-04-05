## ADDED Requirements

### Requirement: Contest can be started
The system SHALL provide a method to start the contest when it is not running.

#### Scenario: Start contest successfully
- **WHEN** `startContest` is called and `is_running` is `false`
- **THEN** system sets `is_running` to `true`, resets `current_tick` to `0`, resets `current_round` to `0`, and starts the tick scheduler

#### Scenario: Start contest when already running
- **WHEN** `startContest` is called and `is_running` is `true`
- **THEN** system returns an error indicating contest is already running

### Requirement: Contest can be stopped
The system SHALL provide a method to stop the contest when it is running.

#### Scenario: Stop contest successfully
- **WHEN** `stopContest` is called and `is_running` is `true`
- **THEN** system sets `is_running` to `false`, stops the tick scheduler, and preserves current tick/round values

#### Scenario: Stop contest when not running
- **WHEN** `stopContest` is called and `is_running` is `false`
- **THEN** system returns an error indicating contest is not running

### Requirement: Tick advances automatically
The system SHALL increment `current_tick` at intervals defined by `tick_duration` config value.

#### Scenario: Tick increments on schedule
- **WHEN** contest is running and `tick_duration` seconds elapse
- **THEN** system increments `current_tick` by `1`

#### Scenario: Round advances when tick limit reached
- **WHEN** `current_tick` reaches `tick_per_round` value
- **THEN** system increments `current_round` by `1` and resets `current_tick` to `0`

#### Scenario: Contest stops at total rounds
- **WHEN** `current_round` reaches `total_rounds` value
- **THEN** system stops the contest automatically

### Requirement: Tick/round values respect config constraints
The system SHALL enforce that tick and round values are bounded by config constraints.

#### Scenario: Tick bounded by tick_per_round
- **WHEN** `current_tick` would exceed `tick_per_round`
- **THEN** system advances to next round instead

#### Scenario: Round bounded by total_rounds
- **WHEN** `current_round` would exceed `total_rounds`
- **THEN** system stops the contest
