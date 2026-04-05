## ADDED Requirements

### Requirement: Config validates tick_duration as positive integer
The system SHALL validate that `tick_duration` config value is a positive integer.

#### Scenario: Valid tick_duration
- **WHEN** client sends `PUT /config/tick_duration` with `60`
- **THEN** system stores the value successfully

#### Scenario: Invalid tick_duration zero
- **WHEN** client sends `PUT /config/tick_duration` with `0`
- **THEN** system returns 400 error indicating value must be positive

#### Scenario: Invalid tick_duration negative
- **WHEN** client sends `PUT /config/tick_duration` with `-10`
- **THEN** system returns 400 error indicating value must be positive

### Requirement: Config validates tick_per_round as positive integer
The system SHALL validate that `tick_per_round` config value is a positive integer.

#### Scenario: Valid tick_per_round
- **WHEN** client sends `PUT /config/tick_per_round` with `10`
- **THEN** system stores the value successfully

#### Scenario: Invalid tick_per_round zero
- **WHEN** client sends `PUT /config/tick_per_round` with `0`
- **THEN** system returns 400 error indicating value must be positive

### Requirement: Config validates total_rounds as positive integer
The system SHALL validate that `total_rounds` config value is a positive integer.

#### Scenario: Valid total_rounds
- **WHEN** client sends `PUT /config/total_rounds` with `5`
- **THEN** system stores the value successfully

#### Scenario: Invalid total_rounds zero
- **WHEN** client sends `PUT /config/total_rounds` with `0`
- **THEN** system returns 400 error indicating value must be positive
