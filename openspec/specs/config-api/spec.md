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
