#!/bin/bash

# Run StreamGRID from Compiled Binary on Linux
# Launches the pre-built application from dist/ directory

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_status "🚀 Starting StreamGRID from compiled binary (Linux)..."

# Check if we're on Linux
if [ "$(uname)" != "Linux" ]; then
    print_error "This script is designed for Linux only"
    print_status "Use run-macos.sh for macOS or run-windows.bat for Windows"
    exit 1
fi

# Check for display server
print_status "Checking display server..."
if [ -n "$WAYLAND_DISPLAY" ]; then
    print_success "Wayland display server detected"
elif [ -n "$DISPLAY" ]; then
    print_success "X11 display server detected"
else
    print_error "No display server detected. Cannot launch GUI application."
    print_error "Please ensure you're running in a desktop environment"
    exit 1
fi

# Look for built applications in common locations
EXECUTABLE_PATHS=(
    "dist/linux-unpacked/StreamGRID"
    "dist/StreamGRID"
    "build/linux-unpacked/StreamGRID"
    "out/StreamGRID-linux-x64/StreamGRID"
    "out/linux-unpacked/StreamGRID"
)

APPIMAGE_PATHS=(
    "dist/StreamGRID-*.AppImage"
    "dist/*.AppImage"
    "build/StreamGRID-*.AppImage"
    "out/StreamGRID-*.AppImage"
)

# Function to find executable
find_executable() {
    for path in "${EXECUTABLE_PATHS[@]}"; do
        if [ -f "$path" ] && [ -x "$path" ]; then
            echo "$path"
            return 0
        fi
    done
    
    # Check for AppImage files
    for pattern in "${APPIMAGE_PATHS[@]}"; do
        for file in $pattern 2>/dev/null; do
            if [ -f "$file" ] && [ -x "$file" ]; then
                echo "$file"
                return 0
            fi
        done
    done
    
    return 1
}

APP_PATH=$(find_executable)

if [ -z "$APP_PATH" ]; then
    print_error "StreamGRID executable not found in any expected location"
    print_error "Expected locations checked:"
    for path in "${EXECUTABLE_PATHS[@]}"; do
        echo "  - $path"
    done
    echo ""
    print_error "AppImage patterns checked:"
    for pattern in "${APPIMAGE_PATHS[@]}"; do
        echo "  - $pattern"
    done
    echo ""
    print_error "Please build the application first using:"
    print_error "  ./compile-build-dist.sh"
    print_error "Or run from source using:"
    print_error "  ./scripts/run-linux-source.sh"
    exit 1
fi

print_success "Found application at: $APP_PATH"

# Get application info
APP_TYPE="executable"
if [[ "$APP_PATH" == *.AppImage ]]; then
    APP_TYPE="AppImage"
fi

print_status "📱 Application Details:"
echo "  Path: $APP_PATH"
echo "  Type: $APP_TYPE"
echo "  Architecture: $(file "$APP_PATH" | grep -o 'x86-64\|aarch64' | head -1 || echo 'unknown')"

# Check for required system libraries
print_status "Checking system dependencies..."
MISSING_LIBS=()

# Check for common Electron dependencies on Linux
REQUIRED_LIBS=(
    "libgtk-3.so.0"
    "libxss1"
    "libasound.so.2"
    "libgconf-2.so.4"
    "libxtst6"
    "libxrandr2"
    "libasound2"
    "libpangocairo-1.0"
    "libatk1.0"
    "libcairo-gobject2"
    "libgtk-3"
    "libgdk-3"
)

# Simple check - try to run ldd if available
if command_exists ldd && [ "$APP_TYPE" = "executable" ]; then
    print_status "Checking library dependencies..."
    if ! ldd "$APP_PATH" >/dev/null 2>&1; then
        print_warning "Could not check library dependencies"
    fi
fi

# Set up environment
export ELECTRON_DISABLE_SECURITY_WARNINGS=1

# AppImage specific setup
if [ "$APP_TYPE" = "AppImage" ]; then
    # Make sure AppImage is executable
    chmod +x "$APP_PATH" 2>/dev/null
    
    # Check if FUSE is available for AppImage
    if ! command_exists fusermount && ! command_exists fusermount3; then
        print_warning "FUSE not available - AppImage may not work"
        print_warning "Install FUSE with: sudo apt install fuse (Ubuntu/Debian) or equivalent"
    fi
fi

# Enable hardware acceleration if available
if [ "$1" != "--no-gpu" ]; then
    # Check for GPU acceleration support
    if command_exists glxinfo && glxinfo | grep -q "direct rendering: Yes" 2>/dev/null; then
        print_success "Hardware acceleration available"
    elif command_exists nvidia-smi && nvidia-smi >/dev/null 2>&1; then
        print_success "NVIDIA GPU detected"
    else
        print_warning "Hardware acceleration may not be available"
        print_warning "Use --no-gpu flag if the app fails to start"
    fi
else
    export ELECTRON_ARGS="--disable-gpu"
    print_status "GPU acceleration disabled by --no-gpu flag"
fi

# Launch the application
print_status "🎬 Launching StreamGRID..."
print_status "Press Ctrl+C or close the application window to quit"
echo ""

# Launch command based on type
if [ "$APP_TYPE" = "AppImage" ]; then
    "$APP_PATH" $ELECTRON_ARGS "$@"
else
    "$APP_PATH" $ELECTRON_ARGS "$@"
fi

LAUNCH_RESULT=$?

echo ""
if [ $LAUNCH_RESULT -eq 0 ]; then
    print_success "StreamGRID exited successfully"
else
    print_error "StreamGRID exited with error code $LAUNCH_RESULT"
    
    if [ $LAUNCH_RESULT -eq 127 ]; then
        print_error "Command not found or missing dependencies"
        print_error "Try installing missing system libraries:"
        print_error "  Ubuntu/Debian: sudo apt install libgtk-3-0 libxss1 libasound2"
        print_error "  Fedora/RHEL:   sudo dnf install gtk3 libXScrnSaver alsa-lib"
        print_error "  Arch Linux:    sudo pacman -S gtk3 libxss alsa-lib"
    elif [ $LAUNCH_RESULT -eq 126 ]; then
        print_error "Permission denied or file not executable"
        print_error "Try: chmod +x '$APP_PATH'"
    fi
    
    echo ""
    print_error "For more detailed error information, try running from source:"
    print_error "  ./scripts/run-linux-source.sh"
    exit 1
fi

print_success "StreamGRID execution completed"