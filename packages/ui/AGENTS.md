# Agent Guidelines for packages/ui

This directory contains application-specific components. **DO NOT** modify the `src/components/` directory directly, as it contains `shadcn/ui` components. If you need to customize a UI component, create a wrapper component or extend it in a separate file.

## shadcn/ui Components

Use the latest version of Shadcn to install new components, like this command to add a shadcn component:

```bash
bunx --bun shadcn@latest add <component>   # Add a shadcn component
```
