## Context

The Phena CTF platform needs a config API to manage contest settings. The database schema already exists (`config` table with key-value pairs and type information), but there's no API layer to access or modify these values. Config keys are defined in `ConfigKey` enum but lack default values or validation schemas.

## Goals / Non-Goals

**Goals:**
- Provide REST API endpoints for reading and updating config values
- Define default values for all `ConfigKey` enum entries
- Validate config values based on their expected types
- Follow existing codebase patterns (Effect, Drizzle, Hono)

**Non-Goals:**
- Real-time config synchronization across services
- Config versioning or audit logging
- Complex config hierarchies or nested configurations

## Decisions

### 1. Repository Layer (`apps/api/src/repositories/config.ts`)

Abstract class with static methods following existing pattern:

```typescript
import { config, type ConfigType } from "@api/db/schema/config";
import { ConfigKey } from "@phena/schema";
import { Effect } from "effect";
import { Db } from "../db";

export abstract class ConfigRepository {
  static get(key: ConfigKey) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const row = await env.db.query.config.findFirst({
            where: { key },
          });
          return row?.value ?? null;
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static getAll() {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const rows = await env.db.query.config.findMany();
          return Object.fromEntries(rows.map((r) => [r.key, r.value]));
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static set(key: ConfigKey, value: string, type: ConfigType = "string") {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          await env.db
            .insert(config)
            .values({ key, value, type })
            .onConflictDoUpdate({
              target: config.key,
              set: { value, updatedAt: new Date() },
            });
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }
}
```

### 2. Service Layer (`apps/api/src/services/config.ts`)

Business logic with defaults and validation:

```typescript
import { ConfigKey } from "@phena/schema";
import { Effect } from "effect";
import { ConfigRepository } from "../repositories/config";

const configDefaults: Record<ConfigKey, unknown> = {
  [ConfigKey.ContestName]: "Phena CTF",
  [ConfigKey.TickDuration]: 60,
  [ConfigKey.IsRunning]: false,
  [ConfigKey.CurrentTick]: 0,
  [ConfigKey.CurrentRound]: 0,
  [ConfigKey.StartDate]: new Date().toISOString(),
  [ConfigKey.TickPerRound]: 10,
  [ConfigKey.TotalRounds]: 5,
  [ConfigKey.FlagTemplate]: "flag{...}",
};

export abstract class ConfigService {
  static getConfig(key: ConfigKey) {
    return Effect.map(ConfigRepository.get(key), (value) =>
      value ?? configDefaults[key],
    );
  }

  static getAllConfig() {
    return Effect.map(ConfigRepository.getAll(), (stored) => ({
      ...configDefaults,
      ...stored,
    }));
  }

  static setConfig(key: ConfigKey, value: unknown) {
    return ConfigRepository.set(key, String(value), "string");
  }
}
```

**Usage in code:**
```typescript
import { ConfigService } from "../services/config";

// Anywhere in the app
const contestName = await runPromise(ConfigService.getConfig(ConfigKey.ContestName));
await runPromise(ConfigService.setConfig(ConfigKey.IsRunning, true));
```

### 3. Route Layer (`apps/api/src/routes/config.ts`)

RESTful endpoints using the service:
- `GET /config` - Get all config (merged with defaults)
- `GET /config/:key` - Get single config value
- `PUT /config/:key` - Update config value

**Rationale:** Routes call ConfigService, same service used by any code in the app.

## Risks / Trade-offs

- **Type coercion**: String storage requires parsing for non-string types → Mitigation: Validate and parse in service layer
- **Default values on startup**: Missing DB entries show defaults → Mitigation: Service merges defaults with stored values
- **Concurrent updates**: No optimistic locking → Mitigation: Accept last-write-wins for contest config
