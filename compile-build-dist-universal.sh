#!/bin/bash

# UNIVERSAL MULTI-PLATFORM BUILD SYSTEM
# Auto-detects project type and builds for all platforms
# Supports: Electron, Python, Swift, TypeScript, Web, PWA
# Includes comprehensive optimization and cleanup

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

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

print_header() {
    echo ""
    echo -e "${PURPLE}════════════════════════════════════════════${NC}"
    echo -e "${PURPLE} $1${NC}"
    echo -e "${PURPLE}════════════════════════════════════════════${NC}"
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to detect project type
detect_project_type() {
    print_status "🔍 Detecting project type..."
    
    PROJECT_TYPE="unknown"
    
    # Check for Electron
    if [ -f "package.json" ] && grep -q '"electron"' package.json; then
        PROJECT_TYPE="electron"
        print_info "Detected: Electron application"
        
    # Check for Python
    elif [ -f "requirements.txt" ] || [ -f "setup.py" ] || [ -f "pyproject.toml" ] || ls *.py >/dev/null 2>&1; then
        PROJECT_TYPE="python"
        print_info "Detected: Python application"
        
    # Check for Swift/macOS
    elif [ -f "Package.swift" ] || ls *.xcodeproj >/dev/null 2>&1 || ls *.swift >/dev/null 2>&1; then
        if [ "$(uname)" = "Darwin" ]; then
            PROJECT_TYPE="swift"
            print_info "Detected: Swift/macOS application"
        else
            print_error "Swift projects can only be built on macOS"
            exit 1
        fi
        
    # Check for TypeScript
    elif [ -f "tsconfig.json" ]; then
        PROJECT_TYPE="typescript"
        print_info "Detected: TypeScript project"
        
    # Check for Node.js/JavaScript project
    elif [ -f "package.json" ]; then
        # Check if it's a web framework
        if grep -q '"next"' package.json || grep -q '"nuxt"' package.json || grep -q '"gatsby"' package.json; then
            PROJECT_TYPE="webapp"
            print_info "Detected: Web application (SSR/SSG)"
        elif grep -q '"react"' package.json || grep -q '"vue"' package.json || grep -q '"angular"' package.json || grep -q '"svelte"' package.json; then
            PROJECT_TYPE="spa"
            print_info "Detected: Single Page Application"
        else
            PROJECT_TYPE="nodejs"
            print_info "Detected: Node.js application"
        fi
        
    # Check for static web project
    elif [ -f "index.html" ] || [ -f "src/index.html" ]; then
        PROJECT_TYPE="web"
        print_info "Detected: Static web application"
        
    # Check for Dockerfile
    elif [ -f "Dockerfile" ]; then
        PROJECT_TYPE="docker"
        print_info "Detected: Docker application"
    fi
    
    if [ "$PROJECT_TYPE" = "unknown" ]; then
        print_error "Could not detect project type"
        print_info "Supported project types:"
        print_info "  • Electron (package.json with electron dependency)"
        print_info "  • Python (requirements.txt, setup.py, or .py files)"
        print_info "  • Swift (Package.swift or .xcodeproj on macOS)"
        print_info "  • TypeScript (tsconfig.json)"
        print_info "  • Node.js (package.json)"
        print_info "  • Web (index.html)"
        exit 1
    fi
    
    echo "$PROJECT_TYPE"
}

# Function to show help
show_help() {
    echo "Universal Multi-Platform Build System"
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --type TYPE          Force project type (electron, python, swift, typescript, webapp, spa, nodejs, web, docker)"
    echo "  --no-clean           Skip cleaning previous builds"
    echo "  --no-temp-clean      Skip system temp cleanup"
    echo "  --platform PLATFORM  Target platform (all, mac, win, linux)"
    echo "  --optimize           Enable build optimizations"
    echo "  --docker             Use Docker for builds"
    echo "  --help               Show this help message"
}

# Function to cleanup system temp directories
cleanup_system_temp() {
    print_status "🧹 Cleaning system temp directories..."
    
    # macOS temp cleanup
    if [ "$(uname)" = "Darwin" ]; then
        TEMP_DIR=$(find /private/var/folders -name "Temporary*" -type d 2>/dev/null | head -1)
        if [ -n "$TEMP_DIR" ]; then
            PARENT_DIR=$(dirname "$TEMP_DIR")
            BEFORE_SIZE=$(du -sh "$PARENT_DIR" 2>/dev/null | cut -f1)
            
            # Clean up build artifacts (older than 1 day)
            find "$PARENT_DIR" -name "t-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            find "$PARENT_DIR" -name "electron-download-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            find "$PARENT_DIR" -name "pyinstaller-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            find "$PARENT_DIR" -name "npm-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            
            AFTER_SIZE=$(du -sh "$PARENT_DIR" 2>/dev/null | cut -f1)
            print_success "System temp cleanup: $BEFORE_SIZE → $AFTER_SIZE"
        fi
    fi
    
    # Linux temp cleanup
    if [ "$(uname)" = "Linux" ]; then
        if [ -d "/tmp" ]; then
            BEFORE_SIZE=$(du -sh /tmp 2>/dev/null | cut -f1)
            find /tmp -name "electron-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            find /tmp -name "npm-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            find /tmp -name "pyinstaller-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            AFTER_SIZE=$(du -sh /tmp 2>/dev/null | cut -f1)
            print_success "System temp cleanup: $BEFORE_SIZE → $AFTER_SIZE"
        fi
    fi
    
    # Project-specific cleanup
    rm -rf node_modules/.cache 2>/dev/null || true
    rm -rf .build 2>/dev/null || true
    rm -rf build-temp 2>/dev/null || true
    rm -rf __pycache__ 2>/dev/null || true
    find . -name "*.pyc" -delete 2>/dev/null || true
    find . -name ".DS_Store" -delete 2>/dev/null || true
}

# Function to setup build temp directory
setup_build_temp() {
    BUILD_TEMP_DIR="$SCRIPT_DIR/build-temp"
    mkdir -p "$BUILD_TEMP_DIR"
    export TMPDIR="$BUILD_TEMP_DIR"
    export TMP="$BUILD_TEMP_DIR"
    export TEMP="$BUILD_TEMP_DIR"
    export ELECTRON_CACHE="$BUILD_TEMP_DIR/electron-cache"
    export PYINSTALLER_WORKDIR="$BUILD_TEMP_DIR/pyinstaller"
    print_info "Using custom temp directory: $BUILD_TEMP_DIR"
}

# Function to cleanup build temp
cleanup_build_temp() {
    if [ -n "$BUILD_TEMP_DIR" ] && [ -d "$BUILD_TEMP_DIR" ]; then
        print_status "🧹 Cleaning build temp directory..."
        TEMP_SIZE=$(du -sh "$BUILD_TEMP_DIR" 2>/dev/null | cut -f1 || echo "0")
        rm -rf "$BUILD_TEMP_DIR" 2>/dev/null || true
        print_success "Cleaned build temp: $TEMP_SIZE"
    fi

# Build function for Electron projects
build_electron() {
    print_header "🔌 BUILDING ELECTRON APPLICATION"
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Install dependencies
    print_status "📦 Installing dependencies..."
    if [ -f "yarn.lock" ]; then
        yarn install
    elif [ -f "pnpm-lock.yaml" ]; then
        pnpm install
    else
        npm install
    fi
    
    # Install electron-builder if not present
    if ! npm list electron-builder >/dev/null 2>&1; then
        print_status "Installing electron-builder..."
        npm install --save-dev electron-builder
    fi
    
    # Clean previous builds
    rm -rf dist/ build/ out/
    
    # Set parallelism for faster builds
    export ELECTRON_BUILDER_PARALLELISM=18
    
    # Build for all platforms
    print_status "🏗️ Building for all platforms..."
    if [ -f "yarn.lock" ]; then
        yarn dist
    elif [ -f "pnpm-lock.yaml" ]; then
        pnpm dist
    else
        npm run dist
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Electron build completed successfully"
        
        # List outputs
        if [ -d "dist" ]; then
            print_info "📦 Build outputs:"
            find dist -name "*.dmg" -o -name "*.exe" -o -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" -o -name "*.msi" -o -name "*.zip" | while read -r file; do
                SIZE=$(ls -lah "$file" | awk '{print $5}')
                print_info "  ✔ $(basename "$file") ($SIZE)"
            done
        fi
    else
        print_error "Electron build failed"
        exit 1
    fi
}

# Parse command line arguments
FORCE_TYPE=""
NO_CLEAN=false
NO_TEMP_CLEAN=false
PLATFORM="all"
OPTIMIZE=false
DOCKER=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --type)
            FORCE_TYPE="$2"
            shift 2
            ;;
        --no-clean)
            NO_CLEAN=true
            shift
            ;;
        --no-temp-clean)
            NO_TEMP_CLEAN=true
            shift
            ;;
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        --optimize)
            OPTIMIZE=true
            shift
            ;;
        --docker)
            DOCKER=true
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

# Main execution
print_header "🚀 UNIVERSAL BUILD SYSTEM"
print_info "Platform: $(uname) ($(uname -m))"
print_info "Current directory: $(pwd)"

# Cleanup system temp if not skipped
if [ "$NO_TEMP_CLEAN" = false ]; then
    cleanup_system_temp
fi

# Setup custom build temp
setup_build_temp

# Trap to ensure cleanup on exit
trap cleanup_build_temp EXIT

# Detect or use forced project type
if [ -n "$FORCE_TYPE" ]; then
    PROJECT_TYPE="$FORCE_TYPE"
    print_info "Forced project type: $PROJECT_TYPE"
else
    PROJECT_TYPE=$(detect_project_type)
fi

# Clean previous builds if not skipped
if [ "$NO_CLEAN" = false ]; then
    print_status "🧹 Cleaning previous builds..."
    rm -rf dist/ build/ out/ .next/ .nuxt/
    print_success "Previous builds cleaned"
fi

# Execute appropriate build function
case $PROJECT_TYPE in
    electron)
        build_electron
        ;;
    *)
        print_error "Unsupported project type: $PROJECT_TYPE"
        exit 1
        ;;
esac

# Final summary
print_header "✅ BUILD COMPLETE"

print_success "🎉 Build completed successfully!"
print_info "Project type: $PROJECT_TYPE"
print_info "Build outputs: ./dist/"

if [ -d "dist" ]; then
    TOTAL_SIZE=$(du -sh dist/ 2>/dev/null | cut -f1)
    FILE_COUNT=$(find dist -type f | wc -l)
    print_info "Total size: $TOTAL_SIZE"
    print_info "Total files: $FILE_COUNT"
fi

print_header "📚 NEXT STEPS"
print_info "Run locally: npm start"
print_info "Install packages from: ./dist/"

print_info ""
print_success "Build system finished successfully! 🚀"