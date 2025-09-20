# StreamGRID Tech Stack and Architecture

## Technology Stack
- **Runtime**: Electron 28.x (Cross-platform desktop app)
- **Frontend**: React 18.x with TypeScript
- **Styling**: Tailwind CSS with PostCSS
- **State Management**: Zustand for client state
- **Data Fetching**: React Query (@tanstack/react-query)
- **Database**: SQLite for stream library persistence
- **Settings**: Electron Store for app configuration
- **Build System**: Vite for fast development and bundling
- **Testing**: Vitest with jsdom environment
- **Video**: HLS.js for video streaming
- **Logging**: Winston for structured logging

## Architecture Overview
StreamGRID follows Electron's multi-process architecture:

### Main Process (`src/main/`)
- **index.ts**: Application entry point and lifecycle management
- **window.ts**: BrowserWindow creation and management
- **database/**: SQLite database operations for stream library
- **ipc/**: Inter-Process Communication handlers
- **settings.ts**: Application settings persistence
- **logger.ts**: Winston logging configuration

### Renderer Process (`src/renderer/`)
- **App.tsx**: Root React component
- **components/**: React UI components
  - StreamGrid.tsx: Main grid layout component
  - StreamTile.tsx: Individual stream display
  - VideoPlayer.tsx: HLS video player wrapper
  - HeaderBar.tsx: Top navigation and controls
  - modals/: Modal dialogs (AddStream, Settings)
- **store/**: Zustand state management
- **hooks/**: Custom React hooks
- **utils/**: Utility functions

### Preload (`src/preload/`)
- **index.ts**: Context bridge for secure IPC communication

### Shared (`src/shared/`)
- **types/**: TypeScript type definitions shared between processes
  - stream.ts: Stream interfaces and enums
  - layout.ts: Grid layout definitions
  - settings.ts: Application settings types

## Key Design Patterns
- **Path Aliases**: Extensive use of TypeScript path mapping (@/, @shared/, @renderer/, @main/)
- **Type Safety**: Comprehensive TypeScript types for all data structures
- **Process Isolation**: Clear separation between main and renderer processes
- **Context Bridge**: Secure IPC communication via preload scripts