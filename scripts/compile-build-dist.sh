#!/bin/bash

# Complete Multi-Platform Build Script for StreamGRID
# Builds for macOS, Windows, and Linux with all installer types

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the script directory and navigate to project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✔${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ✗${NC} $1"
}

print_info() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')] ℹ${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to display help
show_help() {
    echo "Complete Multi-Platform Build Script for StreamGRID (SAFE VERSION)"
    echo ""
    echo "Usage: ./scripts/compile-build-dist.sh [options]"
    echo ""
    echo "Options:"
    echo "  --clean-all        Clean ALL build artifacts INCLUDING main/renderer (DANGEROUS)"
    echo "  --clean-packages   Clean only electron-builder packages (SAFE - default)"
    echo "  --no-clean         Skip cleaning build artifacts"
    echo "  --platform PLAT    Build for specific platform (mac, win, linux, all)"
    echo "  --arch ARCH        Build for specific architecture (x64, ia32, arm64, all)"
    echo "  --quick            Quick build (single platform only)"
    echo "  --test-first       Test application from source before building"
    echo "  --help             Display this help message"
    echo ""
    echo "SAFETY:"
    echo "  By default, preserves dist/main/ and dist/renderer/ (compiled TypeScript)"
    echo "  Only removes electron-builder packages (*.dmg, *.exe, *.deb, etc.)"
    echo ""
    echo "Examples:"
    echo "  ./scripts/compile-build-dist.sh                    # Safe build for all platforms"
    echo "  ./scripts/compile-build-dist.sh --platform win     # Windows only (safe)"
    echo "  ./scripts/compile-build-dist.sh --quick            # Quick build (safe)"
    echo "  ./scripts/compile-build-dist.sh --clean-all        # DANGER: Full clean + build"
}

# Parse command line arguments
CLEAN_MODE="packages"  # Default to safe cleaning
PLATFORM="all"
ARCH="all"
QUICK=false
TEST_FIRST=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --clean-all)
            CLEAN_MODE="all"
            shift
            ;;
        --clean-packages)
            CLEAN_MODE="packages"
            shift
            ;;
        --no-clean)
            CLEAN_MODE="none"
            shift
            ;;
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        --arch)
            ARCH="$2"
            shift 2
            ;;
        --quick)
            QUICK=true
            shift
            ;;
        --test-first)
            TEST_FIRST=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

print_status "🚀 Starting StreamGRID Complete Build Process"
print_info "Building from: $PROJECT_ROOT"

# Check for required tools
print_status "Checking requirements..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_warning "Node.js version $NODE_VERSION detected. Version 20+ recommended."
fi

# Check for optional tools for better builds
if command_exists wine; then
    print_info "Wine detected - Windows builds will include better signatures"
fi

if command_exists docker; then
    print_info "Docker detected - Linux builds will be more compatible"
fi

print_success "All requirements met"

# Function to safely clean packages only
clean_packages_only() {
    print_status "🧹 Safely cleaning electron-builder packages only..."
    print_info "PRESERVING: dist/main/ and dist/renderer/ (compiled TypeScript)"
    
    if [ -d "dist" ]; then
        # Remove electron-builder generated directories
        rm -rf dist/mac/ 2>/dev/null
        rm -rf dist/mac-arm64/ 2>/dev/null
        rm -rf dist/win-unpacked/ 2>/dev/null
        rm -rf dist/win-ia32-unpacked/ 2>/dev/null
        rm -rf dist/linux-unpacked/ 2>/dev/null
        
        # Remove electron-builder generated files
        rm -f dist/*.dmg* 2>/dev/null
        rm -f dist/*.exe* 2>/dev/null
        rm -f dist/*.msi* 2>/dev/null
        rm -f dist/*.deb 2>/dev/null
        rm -f dist/*.rpm 2>/dev/null
        rm -f dist/*.AppImage 2>/dev/null
        rm -f dist/*.snap 2>/dev/null
        rm -f dist/*.zip 2>/dev/null
        rm -f dist/*.yml 2>/dev/null
        rm -f dist/builder-* 2>/dev/null
        rm -f dist/latest* 2>/dev/null
        
        print_success "Electron-builder packages cleaned (main/renderer preserved)"
    else
        print_info "No dist/ directory found"
    fi
    
    # Clean other directories
    rm -rf build/ 2>/dev/null
    rm -rf out/ 2>/dev/null
    rm -rf dist-electron/ 2>/dev/null
    rm -rf release/ 2>/dev/null
    rm -rf node_modules/.cache/ 2>/dev/null
}

# Function to clean everything (DANGEROUS)
clean_all() {
    print_warning "🚨 DANGER: Cleaning ALL build artifacts INCLUDING main/renderer..."
    print_warning "This will remove compiled TypeScript outputs!"
    
    read -p "Are you sure? Type 'YES' to continue: " -r
    if [[ $REPLY != "YES" ]]; then
        print_info "Aborted by user"
        exit 1
    fi
    
    rm -rf dist/
    rm -rf build/
    rm -rf node_modules/.cache/
    rm -rf out/
    rm -rf dist-electron/
    rm -rf release/
    print_warning "All build artifacts purged (including main/renderer)"
}

# Step 1: Clean based on mode
case $CLEAN_MODE in
    "all")
        clean_all
        ;;
    "packages")
        clean_packages_only
        ;;
    "none")
        print_info "Skipping cleaning phase"
        ;;
esac

# Step 2: Install/update dependencies
print_status "📦 Installing/updating dependencies..."
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

# Install electron-builder if not present
if ! npm list electron-builder >/dev/null 2>&1; then
    print_status "Installing electron-builder..."
    npm install --save-dev electron-builder
fi

print_success "Dependencies ready"

# Step 3: Test from source if requested
if [ "$TEST_FIRST" = true ]; then
    print_status "🧪 Testing application from source..."
    print_info "Starting application test (will timeout after 30 seconds)..."
    
    # Start the app in background and test it
    timeout 30s npm run electron:dev > /dev/null 2>&1 &
    APP_PID=$!
    
    sleep 10  # Wait for app to start
    
    if ps -p $APP_PID > /dev/null; then
        print_success "Application started successfully from source"
        kill $APP_PID 2>/dev/null || true
    else
        print_error "Application failed to start from source"
        print_error "Please fix source issues before building"
        exit 1
    fi
fi

# Step 4: Type checking and linting
print_status "🔍 Running quality checks..."

# Type check
if npm run type-check >/dev/null 2>&1; then
    print_success "TypeScript type checking passed"
else
    print_warning "TypeScript type checking failed - continuing with build"
fi

# Linting
if npm run lint >/dev/null 2>&1; then
    print_success "ESLint checking passed"
else
    print_warning "ESLint checking failed - continuing with build"
fi

# Step 5: Determine build targets
print_status "🎯 Determining build targets..."
BUILD_CMD="npm run dist"

if [ "$QUICK" = true ]; then
    print_info "Quick build mode - building for current platform only"
    BUILD_CMD="npm run dist:current"
elif [ "$PLATFORM" != "all" ]; then
    case $PLATFORM in
        mac)
            BUILD_CMD="npm run dist:mac"
            print_info "Building for macOS only"
            ;;
        win)
            BUILD_CMD="npm run dist:win"
            print_info "Building for Windows only"
            ;;
        linux)
            BUILD_CMD="npm run dist:linux"
            print_info "Building for Linux only"
            ;;
        *)
            print_error "Invalid platform: $PLATFORM"
            exit 1
            ;;
    esac
else
    print_info "Building for all platforms"
fi

# Step 6: Ensure main and renderer are built
print_status "🔧 Ensuring main and renderer processes are built..."

# Check if main build exists
if [ ! -f "dist/main/index.js" ]; then
    print_warning "Main process not built, building now..."
    npm run build:main
    if [ $? -ne 0 ]; then
        print_error "Failed to build main process"
        exit 1
    fi
fi

# Check if renderer build exists
if [ ! -f "dist/renderer/index.html" ]; then
    print_warning "Renderer process not built, building now..."
    npm run build:renderer
    if [ $? -ne 0 ]; then
        print_error "Failed to build renderer process"
        exit 1
    fi
fi

print_success "Main and renderer processes ready"

# Step 7: Check for icons in /resources folder and prepare assets
print_status "🎨 Checking for icons in /resources folder..."

ICON_CONFIG=""
if [ -f "resources/icon.icns" ]; then
    print_success "Found macOS icon: resources/icon.icns"
    ICON_CONFIG="$ICON_CONFIG --config.mac.icon=resources/icon.icns"
fi

if [ -f "resources/icon.ico" ]; then
    print_success "Found Windows icon: resources/icon.ico"
    ICON_CONFIG="$ICON_CONFIG --config.win.icon=resources/icon.ico"
fi

if [ -d "resources/icons" ]; then
    print_success "Found Linux icons directory: resources/icons/"
    ICON_CONFIG="$ICON_CONFIG --config.linux.icon=resources/icons"
else
    # Check if there's a single PNG that can be used for Linux
    if [ -f "resources/icon.png" ]; then
        print_success "Found Linux icon: resources/icon.png"
        ICON_CONFIG="$ICON_CONFIG --config.linux.icon=resources/icon.png"
    fi
fi

if [ -z "$ICON_CONFIG" ]; then
    print_warning "No icons found in /resources folder"
    print_info "Expected:"
    print_info "  resources/icon.icns (macOS)"
    print_info "  resources/icon.ico (Windows)"
    print_info "  resources/icons/ (Linux - directory with multiple sizes)"
    print_info "  resources/icon.png (Linux - single PNG fallback)"
else
    print_success "Icons configured for electron-builder"
fi

# Step 8: Build all platform binaries and packages
print_status "🏗️ Building platform binaries and packages..."
print_status "Targets: macOS (Intel + ARM), Windows (x64 + x86), Linux (x64)"
print_status "Installers: .dmg, .exe, .msi, .deb, .rpm, .AppImage, .snap"
print_info "🚀 Using 18 CPU cores for maximum build performance"

# Set environment variable for electron-builder to use 18 CPU cores
export ELECTRON_BUILDER_CACHE_DIR="$HOME/.cache/electron-builder"
export ELECTRON_CACHE="$HOME/.cache/electron"
export ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true

# Run the build with icon configuration and CPU core optimization
print_info "Executing build command with 18 core optimization: $BUILD_CMD"
if [ -n "$ICON_CONFIG" ]; then
    ELECTRON_BUILDER_PARALLELISM=18 eval "$BUILD_CMD $ICON_CONFIG"
else
    ELECTRON_BUILDER_PARALLELISM=18 eval "$BUILD_CMD"
fi
BUILD_RESULT=$?

if [ $BUILD_RESULT -ne 0 ]; then
    print_error "Build failed with exit code $BUILD_RESULT"
    print_error "Check the output above for specific error messages"
    exit 1
fi

print_success "All platform builds completed successfully"

# Step 9: Generate additional installer types if needed
if [ "$PLATFORM" = "all" ] || [ "$PLATFORM" = "win" ]; then
    if [ -f dist/*.exe ] && [ ! -f dist/*.msi ]; then
        print_status "Generating additional Windows installers..."
        npm run dist:win:msi 2>/dev/null || print_warning "MSI generation requires additional setup"
    fi
fi

# Step 10: Create build metadata
print_status "📝 Creating build metadata..."
cat > dist/build-info.json << EOF
{
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "buildPlatform": "$(uname -s)",
  "nodeVersion": "$(node -v)",
  "npmVersion": "$(npm -v)",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
  "buildOptions": {
    "platform": "$PLATFORM",
    "arch": "$ARCH",
    "quick": $QUICK,
    "clean": $([ "$NO_CLEAN" = false ] && echo "true" || echo "false")
  }
}
EOF
print_success "Build metadata created"

# Step 11: Display build results
print_status "📋 Build Results Summary:"
echo ""
echo -e "${PURPLE}════════════════════════════════════════════════════════${NC}"

if [ -d "dist" ]; then
    # Count files by type
    MAC_COUNT=$(find dist -name "*.dmg" -o -name "*darwin*.zip" -o -name "*mac*.zip" 2>/dev/null | wc -l)
    WIN_COUNT=$(find dist -name "*.exe" -o -name "*.msi" -o -name "*win*.zip" 2>/dev/null | wc -l)
    LINUX_COUNT=$(find dist -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" -o -name "*.snap" 2>/dev/null | wc -l)
    
    print_info "📊 Build Statistics:"
    echo "   macOS packages: $MAC_COUNT"
    echo "   Windows packages: $WIN_COUNT"
    echo "   Linux packages: $LINUX_COUNT"
    echo ""
    
    # macOS builds
    if [ $MAC_COUNT -gt 0 ]; then
        print_success "🍎 macOS Builds:"
        [ -d "dist/mac" ] && echo "   ✓ Intel: dist/mac/*.app"
        [ -d "dist/mac-arm64" ] && echo "   ✓ ARM64: dist/mac-arm64/*.app"
        find dist -name "*.dmg" -type f 2>/dev/null | while read -r dmg; do
            if [ -f "$dmg" ]; then
                size=$(ls -lh "$dmg" 2>/dev/null | awk '{print $5}' || echo "unknown")
                echo "   ✓ DMG: $(basename "$dmg") ($size)"
            fi
        done
        echo ""
    fi
    
    # Windows builds
    if [ $WIN_COUNT -gt 0 ]; then
        print_success "🪟 Windows Builds:"
        [ -d "dist/win-unpacked" ] && echo "   ✓ x64 Unpacked: dist/win-unpacked/"
        [ -d "dist/win-ia32-unpacked" ] && echo "   ✓ x86 Unpacked: dist/win-ia32-unpacked/"
        find dist -name "*.exe" -type f 2>/dev/null | while read -r exe; do
            if [ -f "$exe" ]; then
                size=$(ls -lh "$exe" 2>/dev/null | awk '{print $5}' || echo "unknown")
                echo "   ✓ EXE: $(basename "$exe") ($size)"
            fi
        done
        find dist -name "*.msi" -type f 2>/dev/null | while read -r msi; do
            if [ -f "$msi" ]; then
                size=$(ls -lh "$msi" 2>/dev/null | awk '{print $5}' || echo "unknown")
                echo "   ✓ MSI: $(basename "$msi") ($size)"
            fi
        done
        echo ""
    fi
    
    # Linux builds
    if [ $LINUX_COUNT -gt 0 ]; then
        print_success "🐧 Linux Builds:"
        [ -d "dist/linux-unpacked" ] && echo "   ✓ Unpacked: dist/linux-unpacked/"
        find dist -name "*.AppImage" -type f 2>/dev/null | while read -r app; do
            if [ -f "$app" ]; then
                size=$(ls -lh "$app" 2>/dev/null | awk '{print $5}' || echo "unknown")
                echo "   ✓ AppImage: $(basename "$app") ($size)"
            fi
        done
        find dist -name "*.deb" -type f 2>/dev/null | while read -r deb; do
            if [ -f "$deb" ]; then
                size=$(ls -lh "$deb" 2>/dev/null | awk '{print $5}' || echo "unknown")
                echo "   ✓ DEB: $(basename "$deb") ($size)"
            fi
        done
        find dist -name "*.rpm" -type f 2>/dev/null | while read -r rpm; do
            if [ -f "$rpm" ]; then
                size=$(ls -lh "$rpm" 2>/dev/null | awk '{print $5}' || echo "unknown")
                echo "   ✓ RPM: $(basename "$rpm") ($size)"
            fi
        done
        echo ""
    fi
    
    # Show preserved builds
    print_info "🔧 Preserved Development Builds:"
    [ -d "dist/main" ] && echo "   ✓ Main Process: dist/main/ (TypeScript compiled)"
    [ -d "dist/renderer" ] && echo "   ✓ Renderer Process: dist/renderer/ (Vite compiled)"
    echo ""
    
    # Auto-update files
    if ls dist/*.yml dist/*.json >/dev/null 2>&1; then
        print_info "🔄 Auto-update files:"
        for yml in dist/*.yml dist/*.json; do
            if [ -f "$yml" ]; then
                echo "   ✓ $(basename "$yml")"
            fi
        done
    fi
    
    # Calculate total size
    TOTAL_SIZE=$(du -sh dist/ 2>/dev/null | cut -f1 || echo "unknown")
    print_info "📦 Total build size: $TOTAL_SIZE"
    
else
    print_warning "No dist directory found. Build may have failed."
fi

echo ""
echo -e "${PURPLE}════════════════════════════════════════════════════════${NC}"
print_success "🎉 Complete build process finished!"
print_status "📁 All binaries and packages are in: ./dist/"
print_status ""
print_info "To test the built application:"
print_info "  macOS:   ./scripts/run-macos.sh"
print_info "  Windows: ./scripts/run-windows.bat"
print_info "  Linux:   ./scripts/run-linux.sh"
print_info ""
print_info "To run from source (development):"
print_info "  All platforms: npm run dev"
print_info "  macOS:   ./scripts/run-macos-source.sh"
print_info "  Windows: ./scripts/run-windows-source.bat"
print_info "  Linux:   ./scripts/run-linux-source.sh"

# Step 12: Final verification
print_status "🔍 Final verification..."
if [ -d "dist" ] && [ "$(ls -A dist 2>/dev/null)" ]; then
    print_success "✅ Build verification passed - output files exist"
    
    # Quick integrity check
    CORRUPTED_FILES=0
    for file in dist/*.exe dist/*.dmg dist/*.deb dist/*.rpm dist/*.AppImage; do
        if [ -f "$file" ]; then
            if [ ! -s "$file" ]; then
                print_warning "Zero-byte file detected: $(basename "$file")"
                CORRUPTED_FILES=$((CORRUPTED_FILES + 1))
            fi
        fi
    done
    
    if [ $CORRUPTED_FILES -eq 0 ]; then
        print_success "✅ All build artifacts appear valid"
    else
        print_warning "⚠️  $CORRUPTED_FILES potentially corrupted files detected"
    fi
else
    print_error "❌ Build verification failed - no output files found"
    exit 1
fi

print_success "🏁 StreamGRID build process completed successfully!"
echo ""
print_success "✅ SAFE BUILD: Your main/renderer builds have been preserved!"
echo ""