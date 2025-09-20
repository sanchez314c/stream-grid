# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StreamGRID is a professional-grade Electron desktop application for monitoring and displaying multiple RTMP streams simultaneously in customizable grid layouts. Built with Electron 28.x, React 18.x, TypeScript, and Tailwind CSS.

## Development Commands

### Core Development
```bash
npm run dev              # Start development with hot reload (Vite + Electron)
npm run electron:dev     # Alternative development command
npm run dev:vite         # Vite dev server only (localhost:5173)
npm run electron         # Start Electron only
npm run start            # Start Electron in production mode
```

### Building and Distribution
```bash
npm run build           # Build both main and renderer processes
npm run build:main      # Build main process (TypeScript compilation)
npm run build:renderer  # Build renderer process (Vite build)

npm run package         # Package app using electron-builder
npm run dist            # Package for all platforms
npm run dist:current    # Package for current platform only
npm run dist:mac        # macOS DMG and ZIP packages
npm run dist:win        # Windows NSIS installer and ZIP
npm run dist:linux      # Linux AppImage, deb, rpm, snap
```

### Quality Assurance
```bash
npm run type-check      # TypeScript type checking without emit
npm run lint           # ESLint with TypeScript and React support
npm run test           # Vitest test runner with jsdom environment
```

### Native Dependencies
```bash
npm run rebuild         # Rebuild native modules (sqlite3) for Electron
npm run postinstall     # Auto-install app dependencies after npm install
```

## Architecture Overview

StreamGRID follows Electron's multi-process architecture with clear separation:

### Main Process (`src/main/`)
- **index.ts**: Application lifecycle and initialization
- **window.ts**: BrowserWindow management with settings integration
  - Handles window modes (windowed, frameless, fullscreen)
  - Manages always-on-top and minimize-to-tray features
  - Dynamically loads from localhost:5173 in dev, dist/renderer in production
- **database/database.ts**: SQLite operations for stream library persistence
- **ipc/handlers.ts**: IPC communication handlers between processes
- **ipc/stream-validator.ts**: RTMP stream validation logic
- **settings.ts**: Electron Store configuration management
- **logger.ts**: Winston logging setup

### Renderer Process (`src/renderer/`)
- **App.tsx**: Root React component with global state
- **components/**: React UI components
  - `StreamGrid.tsx`: Main grid layout manager
  - `StreamTile.tsx`: Individual stream display with controls
  - `VideoPlayer.tsx`: HLS.js video player wrapper
  - `HeaderBar.tsx`: Top navigation and layout controls
  - `StatusBar.tsx`: Bottom status bar with metrics
  - `modals/`: Modal dialogs (AddStreamModal, SettingsModal)
- **store/index.ts**: Zustand state management with immer
  - Uses Map/Set for performance with many streams
  - Immer middleware for immutable updates
  - DevTools integration in development
- **hooks/**: Custom React hooks for stream management
- **main.tsx**: React app entry point with providers

### Shared (`src/shared/`)
- **types/**: TypeScript definitions shared between processes
  - `stream.ts`: Stream interfaces, enums, and validation types
  - `layout.ts`: Grid layout definitions (1x1, 2x2, 3x3, etc.)
  - `settings.ts`: Application settings structure

### Preload (`src/preload/`)
- **index.ts**: Context bridge for secure IPC communication

## Code Style and Conventions

### TypeScript Configuration
- **Target**: ES2022 with DOM support
- **Strict mode**: Enabled with comprehensive type checking
- **Path aliases**: `@/*`, `@shared/*`, `@renderer/*`, `@main/*`
- **JSX**: React JSX transform (no React imports needed)

### ESLint Rules
- Uses recommended TypeScript and React configurations
- Disabled: `react/react-in-jsx-scope`, `react/prop-types`
- Warns on: explicit `any` types, unused variables (unless prefixed `_`)
- Console logs limited to `warn` and `error` only

### Naming Conventions
- **Files**: kebab-case (e.g., `AddStreamModal.tsx`)
- **Components**: PascalCase React components
- **Types/Interfaces**: PascalCase
- **Constants/Enums**: UPPER_SNAKE_CASE
- **Variables/Functions**: camelCase
- **IPC Channels**: Descriptive with colons (e.g., `'stream:add'`, `'settings:load'`)

## Key Technologies and Patterns

### State Management
- **Zustand**: Global state with immer for immutability
- **React Query**: Server state management (future feature)
- **Electron Store**: Settings persistence

### Video Streaming
- **HLS.js**: HTTP Live Streaming for video playback
- **RTMP Validation**: Server-side stream validation before adding
- **Hardware Acceleration**: GPU-accelerated video rendering

### Database
- **SQLite**: Stream library persistence via `sqlite3` module
- **Electron Rebuild**: Required after Electron version changes (`npm run rebuild`)

## Development Workflow

### Task Completion Checklist
Always run before considering a task complete:
1. `npm run type-check` - Verify TypeScript compilation
2. `npm run lint` - Check code style and best practices  
3. `npm run test` - Run test suite
4. `npm run build` - Verify production build

### Testing Strategy
- **Unit Tests**: Vitest with jsdom environment
- **Stream Validation**: Comprehensive RTMP URL validation tests
- **Component Testing**: React Testing Library integration
- **Run single test**: `npm run test -- path/to/test.spec.ts`
- **Watch mode**: `npm run test -- --watch`
- **Coverage**: `npm run test -- --coverage`

### Performance Considerations
- Target: 9+ simultaneous 1080p streams with <100ms latency
- CPU usage <60% with 4 active streams
- Memory usage <2GB with 9 active streams
- Hardware acceleration enabled by default

## Build Output Structure
```
dist/
├── main/           # Main process build output
├── renderer/       # Renderer process build output
└── (packaged apps) # electron-builder output
```

## IPC Communication Patterns

All inter-process communication uses typed interfaces:
- **Stream Management**: `stream:add`, `stream:remove`, `stream:update`
- **Settings**: `settings:load`, `settings:save`
- **Database**: `db:getStreams`, `db:saveStream`
- **Validation**: `rtmp:validate` for stream URL checking

## Native Dependencies

- **sqlite3**: Requires rebuilding after Electron updates (`npm run rebuild`)
- **Electron**: Version 28.x with security best practices
- **Platform Scripts**: Dedicated run scripts for each OS

## Security Considerations

- **Context Isolation**: Enabled for renderer security
- **Node Integration**: Disabled in renderer process
- **Preload Scripts**: Secure IPC bridge implementation
- **Content Security Policy**: Strict CSP for renderer process