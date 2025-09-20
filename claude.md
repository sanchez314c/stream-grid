# Claude Instructions for StreamGRID

## Project Overview
StreamGRID is a professional RTMP multi-stream viewer built with Electron, React, and TypeScript. It enables users to monitor multiple video streams in customizable grid layouts with hardware-accelerated performance and cross-platform support.

**Key Capabilities:**
- Multi-stream RTMP/HLS video viewing
- ONVIF camera integration and network discovery  
- Hardware-accelerated video decoding
- Cross-platform desktop application (macOS, Windows, Linux)
- Real-time stream management and grid layouts
- Professional-grade performance optimization

## Technology Stack
See [dev/tech-stack.md](dev/tech-stack.md) for complete details.

**Core Technologies:**
- **Language**: TypeScript
- **Framework**: Electron + React
- **Build System**: Vite + Electron Builder
- **State Management**: Zustand + React Query
- **Database**: SQLite3 for local storage
- **Streaming**: HLS.js + WebSocket
- **Styling**: TailwindCSS

## Key Conventions
- **File naming**: camelCase for TypeScript files, kebab-case for config files
- **Code style**: ESLint with TypeScript rules, Prettier formatting
- **Testing approach**: Vitest with React Testing Library
- **Git workflow**: Feature branches with PR reviews

## Important Paths
- **Source code**: `src/` (main/, renderer/, preload/, shared/)
- **Tests**: `tests/` (unit and integration tests)
- **Documentation**: `docs/` (api/, guides/, technical/, development/)
- **Configuration**: `config/` (build and app configurations)
- **Build scripts**: `scripts/` (comprehensive build system)
- **Build templates**: `dev/build-scripts/` (project-specific build documentation)
- **Assets**: `assets/` (icons/, screenshots/, images/)
- **Development**: `dev/` (notes/, specs/, PRDs/, research/)

## Common Tasks

### Development
```bash
# Run from source (development mode)
./run-source-macos.sh    # macOS
./run-source-linux.sh    # Linux  
./run-source-windows.bat # Windows

# Alternative: Direct npm commands
npm run dev              # Development with hot reload
npm run electron:dev     # Electron development mode
```

### Production
```bash
# Build for all platforms
./scripts/compile-build-dist.sh

# Run compiled application  
./run-macos.sh          # macOS
./run-linux.sh          # Linux
./run-windows.bat       # Windows
```

### Testing & Quality
```bash
npm test                # Run unit tests
npm run type-check      # TypeScript validation
npm run lint            # ESLint checking
npm run build           # Production build
```

## Architecture Notes

### Electron Structure
- **Main Process** (`src/main/`): Node.js backend, window management, IPC handlers
- **Renderer Process** (`src/renderer/`): React frontend, UI components
- **Preload Scripts** (`src/preload/`): Secure IPC bridge between main/renderer
- **Shared Types** (`src/shared/`): TypeScript interfaces used across processes

### Key Components
- **Streaming Engine**: HLS.js integration for video playback
- **Network Discovery**: ONVIF scanner for camera detection
- **Database Layer**: SQLite3 for stream configurations and settings
- **Settings Management**: Electron-store for user preferences
- **Logging System**: Winston for structured logging

### Performance Optimizations
- **GPU Acceleration**: Platform-specific command line switches
- **Memory Management**: Efficient stream handling and cleanup
- **Multi-threading**: Worker processes for intensive operations
- **Hardware Integration**: AMD Radeon RX 580 specific optimizations

## Development Workflow

### Getting Started
1. **Prerequisites**: Node.js 18+, npm
2. **Installation**: `npm install`
3. **Development**: `npm run dev`
4. **Building**: `./scripts/compile-build-dist.sh`

### Code Organization
- **Features**: Organize by domain (streaming, discovery, settings)
- **Components**: Reusable React components in `src/renderer/components/`
- **Services**: Business logic in `src/main/` and `src/renderer/services/`
- **Types**: Shared TypeScript definitions in `src/shared/types/`

### Testing Strategy
- **Unit Tests**: Component and service testing with Vitest
- **Integration Tests**: Full workflow testing
- **E2E Testing**: Stream functionality validation
- **Performance Testing**: Multi-stream load testing

## Build System

### Cross-Platform Builds
The build system (`scripts/compile-build-dist.sh`) creates:
- **macOS**: DMG and ZIP (Intel + ARM64)
- **Windows**: NSIS installer, MSI, ZIP  
- **Linux**: AppImage, DEB, RPM, Snap

### Build Outputs
All builds are generated in `dist/` with proper installers and portable versions.

### Development Builds
- **Hot Reload**: Vite development server on port 5173
- **Live Updates**: Automatic restart on main process changes
- **DevTools**: Available in development mode only

## Project-Specific Notes

### Critical Fix Applied
**Debug Console Issue**: Fixed DevTools opening in production builds
- **Location**: `src/main/window.ts` lines 35-41
- **Change**: DevTools now only open in development mode
- **Access**: Production users can still access via View → Developer Tools menu

### Streaming Protocols
- **RTMP**: Real-Time Messaging Protocol support
- **HLS**: HTTP Live Streaming with HLS.js
- **ONVIF**: Network camera discovery and integration
- **WebSocket**: Real-time communication and updates

### Hardware Acceleration
- **macOS**: Metal API integration for GPU acceleration
- **Windows**: DirectX and DXVA optimizations
- **Linux**: VAAPI support for hardware decoding

### Network Features
- **Auto-Discovery**: Automatic ONVIF camera detection
- **Stream Health**: Connection monitoring and recovery
- **Bandwidth Management**: Adaptive quality based on network conditions

## Security Considerations
- **Sandboxed Renderer**: Secure React frontend with context isolation
- **Secure IPC**: Validated communication between processes
- **Network Security**: Safe handling of streaming URLs and credentials
- **Local Storage**: Encrypted settings and sensitive data

## Recent Changes
Project standardized on September 13, 2025:
- Reorganized folder structure to industry standards
- Fixed debug console opening in production builds
- Added comprehensive documentation and GitHub integration
- Created standardized run scripts and build system
- Organized development resources and legacy documentation
- Implemented GitHub Actions CI/CD pipeline

## Troubleshooting

### Common Issues
- **Stream Loading**: Check network connectivity and stream URL validity
- **Performance**: Verify GPU acceleration is enabled
- **Build Errors**: Ensure Node.js version compatibility
- **Camera Discovery**: Verify network access and ONVIF support

### Debug Information
- **Logs**: Winston logs in application data directory
- **DevTools**: Access via menu in production, automatic in development
- **Network**: Monitor WebSocket connections for real-time features
- **Performance**: Use Electron performance monitoring tools

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and contribution process.

## Support Resources
- **Documentation**: [docs/](docs/) directory with comprehensive guides
- **API Reference**: [docs/api/API.md](docs/api/API.md)
- **Architecture**: [docs/technical/ARCHITECTURE.md](docs/technical/ARCHITECTURE.md)
- **Setup Guide**: [docs/guides/SETUP.md](docs/guides/SETUP.md)
- **Streaming Guide**: [docs/guides/STREAMING_GUIDE.md](docs/guides/STREAMING_GUIDE.md)

---

**StreamGRID is ready for professional streaming workflows with comprehensive development tools and documentation.**