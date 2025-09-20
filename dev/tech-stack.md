# Technology Stack

## Core Technologies
- **Language**: TypeScript
- **Framework**: Electron + React  
- **Runtime**: Node.js
- **Package Manager**: npm
- **Build Tool**: Vite + TypeScript Compiler
- **UI Framework**: React 18.3.1 with React DOM

## Key Dependencies
### Frontend
- React 18.3.1 - UI framework
- @tanstack/react-query 5.84.1 - Data fetching and caching
- Zustand 5.0.7 - State management
- Immer 10.1.1 - Immutable state updates
- TailwindCSS 3.4.17 - Utility-first CSS framework

### Electron & Desktop
- Electron 28.3.3 - Cross-platform desktop app framework
- Electron Builder 26.0.12 - Application packaging and distribution
- Electron Store 10.1.0 - Persistent storage for Electron apps

### Media & Streaming
- HLS.js 1.6.10 - HTTP Live Streaming (HLS) video player
- WebSockets (ws 8.18.3) - Real-time communication
- node-onvif 0.1.7 - ONVIF camera integration

### Data & Persistence
- SQLite3 5.1.7 - Local database
- UUID 11.1.0 - Unique identifier generation
- xml2js 0.6.2 - XML parsing for ONVIF/streaming protocols

### Utilities
- Winston 3.17.0 - Logging framework
- Netmask 2.0.2 - Network utilities

## Development Tools
- **Linter**: ESLint with TypeScript support
- **Type Checking**: TypeScript 5.9.2
- **Testing**: Vitest 3.2.4 with React Testing Library
- **Build Tool**: Vite 7.0.6
- **Concurrency**: Concurrently 9.2.0 for parallel scripts

## Project Type
**Desktop Application** - Professional RTMP Multi-Stream Viewer
- Cross-platform (macOS, Windows, Linux)
- Electron-based with React frontend
- Real-time video streaming capabilities
- Multiple video stream grid layouts
- ONVIF camera integration
- Local SQLite data storage

## Build Targets
- **macOS**: DMG and ZIP (Intel x64 + Apple Silicon ARM64)
- **Windows**: NSIS installer, MSI installer, ZIP (x64)
- **Linux**: AppImage, DEB, RPM, Snap (x64)

## Architecture
- **Main Process**: Electron main thread (TypeScript)
- **Renderer Process**: React application (TypeScript)
- **Preload Scripts**: Secure IPC bridge
- **Shared Types**: Common type definitions across processes