# Technology Stack

## Core Technologies
- **Language**: JavaScript/TypeScript
- **Framework**: Electron 28.x + React 18.x
- **Runtime**: Node.js 20.x
- **Package Manager**: npm

## Key Dependencies
### Frontend
- **React 18.x** - UI framework
- **Tailwind CSS 3.4.x** - Utility-first CSS framework
- **PostCSS** - CSS processing

### State Management & Data
- **Zustand 5.0.x** - Lightweight state management
- **React Query 5.84.x** - Server state management
- **Immer 10.x** - Immutable state updates
- **SQLite 5.1.x** - Local database for stream library
- **Electron Store 10.x** - Settings persistence

### Video & Streaming
- **HLS.js 1.6.x** - HTTP Live Streaming support
- **RTMP Protocol** - Real-time streaming protocol support

### Development Tools
- **TypeScript 5.9.x** - Type safety
- **Vite 7.x** - Fast build tool and dev server
- **ESLint 9.x** - Code linting
- **Vitest 3.2.x** - Testing framework

### Build & Distribution
- **Electron Builder 26.x** - Application packaging
- **electron-rebuild 3.2.x** - Native module rebuilding

### Utilities
- **UUID 11.x** - Unique ID generation
- **Winston 3.17.x** - Structured logging
- **Concurrently** - Run multiple commands
- **Wait-on** - Wait for resources

## Project Type
**Desktop Application** - Cross-platform RTMP streaming viewer

## Architecture
- **Multi-process**: Electron main + renderer processes
- **Component-based**: React functional components
- **Type-safe**: Full TypeScript coverage
- **State-driven**: Zustand + React Query pattern
- **Database-backed**: SQLite for persistence

## Development Workflow
- **Hot Reload**: Vite dev server with fast refresh
- **Type Checking**: Real-time TypeScript validation
- **Code Quality**: ESLint + automated formatting
- **Testing**: Vitest with jsdom environment
- **Building**: Multi-platform Electron packaging