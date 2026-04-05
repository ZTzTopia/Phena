# Agent Guidelines for apps/web

## shadcn/ui Components

Use the latest version of Shadcn to install new components, like this command to add a shadcn component:

```bash
bunx --bun shadcn@latest add <component>   # Add a shadcn component
```

## Development Guidelines

### Styling

- Leverage shadcn/ui components for consistent UI
- Avoid custom CSS when Tailwind utilities suffice

### Folder Structure

The app uses Next.js 14 App Router with route groups:

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

Components, hooks, and types should be colocated with their routes using underscore prefixes:

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

- **Hooks**: Use `use-*.ts` pattern (e.g., `use-challenge-detail.ts`, not `hooks.ts`)
- **Components**: Use kebab-case for files (e.g., `challenge-form.tsx`)
- **Private folders**: Prefix with underscore (e.g., `_components`, `_hooks`, `_types`)
- **Error boundaries**: Root `app/global-error.tsx` applies to all routes
- **404 pages**: Separate `not-found.tsx` per route group for different UX
