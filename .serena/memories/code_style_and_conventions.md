# StreamGRID Code Style and Conventions

## TypeScript Configuration
- **Target**: ES2022 with DOM support
- **Strict Mode**: Enabled with additional strictness rules
- **JSX**: React JSX transform (no need to import React)
- **Module Resolution**: Bundler-style with path aliases
- **Path Aliases**: Extensive use of `@/*`, `@shared/*`, `@renderer/*`, `@main/*`

## ESLint Configuration
- **Base**: eslint:recommended + @typescript-eslint/recommended
- **React**: react/recommended + react-hooks/recommended
- **Key Rules**:
  - No explicit React imports in JSX scope
  - Prop-types disabled (using TypeScript)
  - Explicit any types show warnings
  - Unused variables show warnings (unless prefixed with `_`)
  - Console logs limited to warn/error only

## Naming Conventions
- **Files**: kebab-case for components (e.g., `AddStreamModal.tsx`)
- **Components**: PascalCase React components
- **Types**: PascalCase interfaces and types
- **Constants**: UPPER_SNAKE_CASE for enums
- **Variables**: camelCase
- **Functions**: camelCase

## File Organization
- **Component Structure**: One component per file with clear naming
- **Index Exports**: Barrel exports from store/index.ts
- **Type Definitions**: Organized by domain in shared/types/
- **Path Aliases**: Always use path aliases for imports across processes

## Code Patterns
- **React Hooks**: Custom hooks in dedicated hooks/ directory
- **State Management**: Zustand stores with immer for immutability
- **Error Handling**: Comprehensive error handling in IPC and async operations
- **Type Safety**: All IPC communication is typed with shared interfaces
- **Logging**: Structured logging with Winston in main process

## Component Standards
- **Props**: Always define explicit TypeScript interfaces for props
- **State**: Use Zustand for global state, useState for local component state
- **Effects**: Prefer useEffect cleanup for subscriptions and timers
- **Event Handlers**: Follow consistent naming (onHandleSomething)

## Database and IPC Conventions
- **IPC Channels**: Descriptive naming (e.g., 'stream:add', 'settings:load')
- **Database Operations**: Async/await with proper error handling
- **Validation**: Input validation on both main and renderer sides