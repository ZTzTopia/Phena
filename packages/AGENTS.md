# Agent Guidelines for packages/

Shared packages consumed by `apps/`. Always build before modifying dependent apps.

```bash
bun run build                           # Build all packages
bun run build --filter=@phena/schema    # Build one package
```

After changes, run `bun run typecheck` from repo root to verify cross-package type compatibility.
