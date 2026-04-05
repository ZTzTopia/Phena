## Purpose

Provides REST API endpoints for reading and updating contest configuration with default values.

## Requirements

### Requirement: Config API provides default values
The system SHALL provide default values for all config keys defined in the `ConfigKey` enum when no value is stored in the database.

#### Scenario: Get all config with defaults
- **WHEN** client requests `GET /config` and no values are stored
- **THEN** system returns all config keys with their default values

#### Scenario: Get all config with mixed values
- **WHEN** client requests `GET /config` and some values are stored
- **THEN** system returns stored values merged with defaults for missing keys

### Requirement: Config API validates value types
The system SHALL validate config values against their expected types before storing.

#### Scenario: Valid string value
- **WHEN** client sends `PUT /config/contest_name` with `"My Contest"`
- **THEN** system stores the value successfully

#### Scenario: Valid number value
- **WHEN** client sends `PUT /config/tick_duration` with `120`
- **THEN** system stores the value successfully

#### Scenario: Invalid type rejected
- **WHEN** client sends `PUT /config/tick_duration` with `"not a number"`
- **THEN** system returns 400 error with validation message

### Requirement: Config API provides CRUD operations
The system SHALL provide endpoints to read and update config values.

#### Scenario: Get single config value
- **WHEN** client requests `GET /config/contest_name`
- **THEN** system returns the stored value or default if not set

#### Scenario: Update config value
- **WHEN** client sends `PUT /config/is_running` with `true`
- **THEN** system stores the value and returns success

#### Scenario: Get non-existent key
- **WHEN** client requests `GET /config/invalid_key`
- **THEN** system returns 404 error

### Requirement: Config API uses ConfigKey enum
The system SHALL only accept config keys defined in the `ConfigKey` enum.

#### Scenario: Valid enum key
- **WHEN** client sends request with key `contest_name`
- **THEN** system processes the request

#### Scenario: Invalid enum key
- **WHEN** client sends request with key `unknown_key`
- **THEN** system returns 400 error indicating invalid key

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
