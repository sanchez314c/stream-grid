# StreamGRID Development Commands

## Development Commands
```bash
# Start development server with hot reload
npm run dev
npm run electron:dev  # Alternative command for development

# Start individual services
npm run dev:vite      # Vite dev server only
npm run electron      # Start Electron only
```

## Build Commands
```bash
# Build all (main + renderer)
npm run build

# Build individual processes
npm run build:main      # Build main process (TypeScript)
npm run build:renderer  # Build renderer process (Vite)

# Build and preview
npm run preview         # Preview renderer build
```

## Distribution Commands
```bash
# Package for all platforms
npm run dist

# Platform-specific packaging
npm run dist:mac        # macOS DMG and ZIP
npm run dist:win        # Windows NSIS installer and ZIP
npm run dist:linux      # Linux AppImage

# Direct packaging (after build)
npm run package         # electron-builder package
```

## Quality Assurance Commands
```bash
# Type checking
npm run type-check      # TypeScript type checking without emit

# Linting
npm run lint           # ESLint with TypeScript support

# Testing
npm run test           # Vitest test runner
```

## Utility Commands
```bash
# Dependencies and rebuilding
npm install            # Install dependencies
npm run postinstall    # Install app dependencies (electron-builder)
npm run rebuild        # Rebuild native modules (sqlite3)
```

## Platform-Specific Run Scripts
```bash
# macOS
./run-macos.sh         # Run packaged app
./run-macos-source.sh  # Run from source (development)

# Windows
run-windows.bat        # Run packaged app
run-windows-source.bat # Run from source

# Linux
./run-linux.sh         # Run packaged app
./run-linux-source.sh  # Run from source
```

## Build Output Locations
- `dist/`: Build output directory
  - `dist/main/`: Main process build
  - `dist/renderer/`: Renderer process build
- `dist-electron/`: Packaged applications (electron-builder output)