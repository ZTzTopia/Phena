## ADDED Requirements

### Requirement: Template expression parsing

The system SHALL parse flag template strings containing `{{expression}}` placeholders and extract named expressions from them.

#### Scenario: Simple variable extraction
- **WHEN** template `"PHENA{{uuid}}"` is parsed
- **THEN** system extracts one expression: `{ type: "uuid" }`

#### Scenario: Multiple expressions
- **WHEN** template `"PHENA{{challengeId}}_{{teamId}}_{{random[16]}}"` is parsed
- **THEN** system extracts three expressions in order: `challengeId`, `teamId`, `random[16]`

#### Scenario: No expressions
- **WHEN** template `"STATIC_FLAG"` is parsed
- **THEN** system returns an empty expression list

#### Scenario: Invalid expression syntax
- **WHEN** template contains `{{invalid[not-a-number]}}` or `{{}}`
- **THEN** system returns a validation error with the invalid expression

### Requirement: Variable interpolation

The system SHALL resolve context variables to their string values using a provided context object.

#### Scenario: Context variable resolution
- **WHEN** expression `challengeId` is evaluated with context `{ challengeId: 5, teamId: 3, serviceId: 12, round: 2, tick: 7, index: 0 }`
- **THEN** result is `"5"`

#### Scenario: All context variables
- **WHEN** template `"{{challengeId}}_{{teamId}}_{{serviceId}}_{{round}}_{{tick}}_{{index}}"` is evaluated
- **THEN** result is `"5_3_12_2_7_0"`

#### Scenario: Unknown variable
- **WHEN** expression references a variable not in the context
- **THEN** system returns an error identifying the unknown variable

### Requirement: Random string generation

The system SHALL generate cryptographically random alphanumeric strings of specified length.

#### Scenario: Random with valid length
- **WHEN** expression `random[32]` is evaluated
- **THEN** result is a 32-character alphanumeric string

#### Scenario: Random length bounds
- **WHEN** expression `random[0]` or `random[200]` is evaluated
- **THEN** system returns an error (length must be 1-128)

#### Scenario: Random uniqueness
- **WHEN** expression `random[32]` is evaluated 100 times
- **THEN** all 100 results are unique

### Requirement: Hash generation

The system SHALL generate MD5 and SHA-256 hex digests from random input.

#### Scenario: MD5 hash
- **WHEN** expression `md5` is evaluated
- **THEN** result is a 32-character lowercase hex string

#### Scenario: SHA-256 hash
- **WHEN** expression `sha256` is evaluated
- **THEN** result is a 64-character lowercase hex string

### Requirement: UUID generation

The system SHALL generate UUID v7 strings.

#### Scenario: UUID output
- **WHEN** expression `uuid` is evaluated
- **THEN** result matches UUID v7 format (time-ordered, 36 chars with dashes)

### Requirement: Date and timestamp expressions

The system SHALL resolve `date` to ISO date string and `timestamp` to Unix epoch seconds.

#### Scenario: Date expression
- **WHEN** expression `date` is evaluated
- **THEN** result is current date in `YYYY-MM-DD` format

#### Scenario: Timestamp expression
- **WHEN** expression `timestamp` is evaluated
- **THEN** result is a numeric string of Unix epoch seconds

### Requirement: Full template evaluation

The system SHALL evaluate a complete template string by parsing, resolving all expressions, and concatenating the results.

#### Scenario: Complete evaluation
- **WHEN** template `"PHENA{{challengeId}}_{{teamId}}_{{random[16]}}"` is evaluated with context `{ challengeId: 1, teamId: 3, serviceId: 7, round: 1, tick: 1, index: 0 }`
- **THEN** result is `"PHENA1_3_<16-char-random-string>"`

#### Scenario: Default template
- **WHEN** no template is configured
- **THEN** system uses default template `"PHENA{{uuid}}"`

### Requirement: Template validation

The system SHALL validate template syntax and return structured errors for invalid templates.

#### Scenario: Valid template
- **WHEN** template `"PHENA{{random[32]}}"` is validated
- **THEN** validation passes with no errors

#### Scenario: Invalid template
- **WHEN** template `"PHENA{{random}}"` is validated (missing length parameter)
- **THEN** validation fails with error identifying `random` requires `[N]` parameter

#### Scenario: Unknown expression
- **WHEN** template `"PHENA{{foobar}}"` is validated
- **THEN** validation fails with error identifying `foobar` as unknown expression
