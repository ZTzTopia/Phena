# Agent Guidelines for apps/web

## shadcn/ui Components

Use latest Shadcn to install components:

```bash
bunx --bun shadcn@latest add <component>   # Add a shadcn component
```

## Development Guidelines

### Styling

- Use shadcn/ui components for consistent UI
- Prefer Tailwind utilities over custom CSS

### Folder Structure

Next.js 14 App Router with route groups:

```text
app/
├── (admin)/           # Admin route group
│   ├── admin/         # Admin pages
│   ├── not-found.tsx  # Admin 404 page
│   ├── global-error.tsx (consolidated to root)
│   └── [...not-found]/page.tsx
├── (participant)/     # Participant route group
│   ├── contest/       # Contest pages
│   ├── not-found.tsx  # Participant 404 page
│   ├── global-error.tsx (consolidated to root)
│   └── [...not-found]/page.tsx
├── global-error.tsx   # Root global error boundary (applies to all routes)
└── ...
```

### Colocation Patterns

Colocate components, hooks, types with routes. Use underscore prefixes:

```text
app/(participant)/contest/map/
├── _components/       # Route-specific components
│   ├── network-map.tsx
│   ├── hex-map.tsx
│   └── ...
├── _types.ts          # Route-specific types
└── page.tsx

app/(participant)/contest/challenges/[id]/
├── _hooks/            # Route-specific hooks
│   ├── use-challenge-detail.ts
│   ├── use-service-reset.ts
│   ├── use-service-restart.ts
│   └── index.ts
├── _components/       # Route-specific components
└── page.tsx
```

### Naming Conventions

- **Hooks**: `use-*.ts` pattern (e.g., `use-challenge-detail.ts`, not `hooks.ts`)
- **Components**: kebab-case files (e.g., `challenge-form.tsx`)
- **Private folders**: underscore prefix (`_components`, `_hooks`, `_types`)
- **Error boundaries**: Root `app/global-error.tsx` applies to all routes
- **404 pages**: Separate `not-found.tsx` per route group for different UX
