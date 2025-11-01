# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StreamGRID is a professional RTMP multi-stream viewer application for monitoring multiple video streams simultaneously in customizable grid layouts. Built with modern technologies including Electron 39.x, React 18.x, TypeScript, Vite, and Tailwind CSS. The application targets professional streaming use cases with hardware acceleration, performance optimization, and comprehensive stream management features.

## Development Commands

### Core Development
- `npm run dev` - Start development with hot reload (Vite dev server + Electron)
- `npm run dev:vite` - Start Vite dev server only on localhost:5173
- `npm run start` - Start Electron in production mode
- `npm run electron` - Start Electron only

### Building and Distribution
- `npm run build` - Build both main (TypeScript) and renderer (Vite) processes
- `npm run build:main` - Build main process with TypeScript compilation
- `npm run build:renderer` - Build renderer process with Vite
- `npm run package` - Package application using electron-builder
- `npm run dist` - Build and package for current platform
- `npm run dist:mac` - Build for macOS (DMG with x64/arm64 support)
- `npm run dist:win` - Build for Windows (NSIS installer, MSI, ZIP)
- `npm run dist:linux` - Build for Linux (AppImage, DEB, RPM, SNAP)

### Advanced Build & Development
- `npm run compile-build-dist` - Execute comprehensive build script
- `npm run rebuild` - Rebuild native dependencies (sqlite3) for Electron
- `npm run preview` - Preview built renderer application

### Quality Assurance
- `npm run type-check` - TypeScript type checking without emitting files
- `npm run lint` - ESLint with TypeScript and React rules
- `npm run test` - Run Vitest test suite with jsdom environment

### Platform-Specific Scripts
- `npm run run:macos` - Run macOS application from built package
- `npm run run:macos-source` - Run macOS from source
- `npm run run:windows` - Run Windows application (BAT script)
- `npm run run:linux` - Run Linux application

## Architecture Overview

StreamGRID follows Electron's multi-process architecture with clear separation:

### Main Process (`src/main/`)
- **index.ts**: Application lifecycle initialization with extensive GPU acceleration flags
  - Hardware acceleration setup for AMD Radeon RX 580 and similar GPUs
  - Metal API optimizations for macOS
  - Single instance management and error handling
- **window.ts**: BrowserWindow management with settings integration
- **database/database.ts**: SQLite operations for stream library and settings persistence
- **ipc/handlers.ts**: Core IPC communication handlers between processes
- **ipc/advanced-controls-handlers.ts**: Advanced controls and window management IPC
- **ipc/stream-validator.ts**: RTMP stream validation logic
- **ipc/rtmp-validator.ts**: Specialized RTMP URL validation
- **discovery/**: Network camera discovery system
  - `discovery-service.ts`: Main discovery orchestration
  - `network-scanner.ts`: Network scanning capabilities
  - `onvif-scanner.ts`: ONVIF camera discovery
  - `manufacturer-patterns.ts`: Hardware manufacturer identification
- **monitoring/**: Performance and hardware monitoring
  - `bandwidth-monitor.ts`: Network usage tracking
  - `gpu-monitor.ts`: Graphics performance monitoring
  - `hardware-verifier.ts`: System capability verification
- **settings.ts**: Electron Store configuration management
- **logger.ts**: Winston logging setup

### Renderer Process (`src/renderer/`)
- **App.tsx**: Root React component with React Query integration and modal management
- **components/**: React UI components with TypeScript
  - `StreamGrid.tsx`: Main grid layout manager
  - `StreamTile.tsx`: Individual stream display with controls
  - `VideoPlayer.tsx`: Video player component
  - `StreamManager.tsx`: Stream management interface
  - `HeaderBar.tsx`: Top navigation and layout controls
  - `StatusBar.tsx`: Bottom status bar with metrics
  - `PerformanceVerifier.tsx`: Performance monitoring component
  - `modals/`: Modal dialogs (AddStreamModal, SettingsModal, CameraDiscoveryModal)
  - `advanced-controls/`: Advanced features including:
    - `WindowManagementPanel.tsx`: Window controls
    - `RecordingSettingsPanel.tsx`: Recording configuration
    - `KeyboardHandler.tsx`: Global keyboard shortcuts
    - `VFXOverlay.tsx`: Video effects overlay
    - `StorageMonitor.tsx`: Disk usage monitoring
- **store/index.ts**: Zustand state management with immer middleware
- **main.tsx**: React app entry point

### Shared (`src/shared/`)
- **types/**: Comprehensive TypeScript definitions
  - `stream.ts`: Stream interfaces, enums, and validation types
  - `layout.ts`: Grid layout definitions (1x1, 2x2, 3x3, 4x4, etc.)
  - `settings.ts`: Application settings structure
  - `ipc.ts`: IPC channel type definitions
  - `discovery.ts`: Camera discovery type definitions

### Preload (`src/preload/`)
- **index.ts**: Context bridge for secure IPC communication with typed APIs

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

### Video Streaming & Processing
- **HLS.js**: HTTP Live Streaming for video playback
- **RTMP Validation**: Server-side stream validation before adding
- **Hardware Acceleration**: Comprehensive GPU acceleration with platform-specific optimizations
- **AMD Radeon Support**: Specialized optimizations for AMD RX 580 and similar GPUs
- **Metal API**: macOS-specific hardware acceleration using Metal
- **ONVIF Support**: IP camera discovery and integration

### Database & Persistence
- **SQLite**: Stream library persistence via `sqlite3` module
- **Electron Store**: Settings and configuration persistence
- **Electron Rebuild**: Required after Electron version changes (`npm run rebuild`)

### Network & Discovery
- **Network Scanner**: Automated camera and stream discovery
- **ONVIF Protocol**: Professional IP camera discovery
- **Manufacturer Patterns**: Hardware-specific identification
- **Bandwidth Monitoring**: Real-time network usage tracking

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
- Hardware acceleration enabled by default with platform-specific optimizations
- AMD Radeon RX 580 optimized settings with 8GB VRAM allocation
- Metal API usage on macOS for optimal GPU performance

## Build Output Structure
```
dist/
├── main/           # Main process build output
├── renderer/       # Renderer process build output
└── (packaged apps) # electron-builder output
```

## IPC Communication Patterns

All inter-process communication uses typed interfaces with comprehensive coverage:
- **Stream Management**: `stream:add`, `stream:remove`, `stream:update`, `stream:validate`
- **Settings**: `settings:load`, `settings:save`, `settings:reset`
- **Database**: `db:getStreams`, `db:saveStream`, `db:getLibrary`
- **Discovery**: `discovery:scan`, `discovery:onvif`, `discovery:network`
- **Advanced Controls**: `window:management`, `recording:settings`, `performance:monitor`
- **Validation**: `rtmp:validate`, `stream:validate` for comprehensive URL checking

## Hardware & Platform Optimizations

### GPU Acceleration Configuration
The application includes extensive GPU optimization flags:
- **General**: GPU rasterization, hardware overlays, accelerated video decode
- **macOS**: Metal API, AMD Radeon optimizations, VRAM allocation
- **Cross-platform**: Zero-copy rendering, native GPU memory buffers

### Native Dependencies
- **sqlite3**: Requires rebuilding after Electron updates (`npm run rebuild`)
- **Electron**: Version 39.x with comprehensive security and performance features
- **Platform Scripts**: Dedicated run scripts for each OS (Windows BAT, macOS/Linux shell)

## Development Environment Setup

### Vite Configuration
- **Port**: 5173 (strictly enforced)
- **Base**: './' for Electron compatibility
- **Aliases**: `@/`, `@shared/`, `@renderer/`, `@main/` for clean imports
- **Build Output**: `dist/renderer` for production builds

### Testing Environment
- **Framework**: Vitest with jsdom for DOM testing
- **Libraries**: React Testing Library for component testing
- **Coverage**: Built-in coverage reporting available

## Security Considerations

- **Context Isolation**: Enabled for renderer security
- **Node Integration**: Disabled in renderer process
- **Preload Scripts**: Secure IPC bridge implementation with type safety
- **Content Security Policy**: Strict CSP for renderer process
- **Stream Validation**: Server-side validation prevents malicious stream URLs
- **Database Security**: Parameterized queries prevent SQL injection