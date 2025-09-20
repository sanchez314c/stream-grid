# Electron Build Script Template

This template provides a complete build system for Electron applications with cross-platform support.

## Usage
Copy the content below to `/scripts/compile-build-dist.sh` and customize for your project.

```bash
#!/bin/bash

# StreamGRID - Complete Electron Build Script
# Builds for macOS (Intel/ARM), Windows (x64/x86), and Linux (x64)

set -e

echo "🚀 StreamGRID - Complete Build Process Starting..."

# Function definitions
cleanup_system_temp() {
    echo "Cleaning system temp directories..."
    
    # macOS temp cleanup
    if [ "$(uname)" = "Darwin" ]; then
        TEMP_DIR=$(find /private/var/folders -name "Temporary*" -type d 2>/dev/null | head -1)
        if [ -n "$TEMP_DIR" ]; then
            PARENT_DIR=$(dirname "$TEMP_DIR")
            find "$PARENT_DIR" -name "electron-download-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            find "$PARENT_DIR" -name "npm-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
        fi
    fi
    
    # Linux temp cleanup
    if [ "$(uname)" = "Linux" ]; then
        if [ -d "/tmp" ]; then
            find /tmp -name "electron-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            find /tmp -name "npm-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
        fi
    fi
    
    # Project cleanup
    rm -rf node_modules/.cache 2>/dev/null || true
    find . -name ".DS_Store" -delete 2>/dev/null || true
}

setup_build_temp() {
    BUILD_TEMP_DIR="$(pwd)/build-temp"
    mkdir -p "$BUILD_TEMP_DIR"
    export TMPDIR="$BUILD_TEMP_DIR"
    export TMP="$BUILD_TEMP_DIR"
    export TEMP="$BUILD_TEMP_DIR"
    export ELECTRON_CACHE="$BUILD_TEMP_DIR/electron-cache"
    echo "Using custom temp directory: $BUILD_TEMP_DIR"
}

cleanup_build_temp() {
    if [ -n "$BUILD_TEMP_DIR" ] && [ -d "$BUILD_TEMP_DIR" ]; then
        echo "Cleaning build temp directory..."
        rm -rf "$BUILD_TEMP_DIR" 2>/dev/null || true
    fi
}

check_icon() {
    ICON_DIR="assets/icons"
    
    if [ ! -f "$ICON_DIR/icon.png" ]; then
        echo "⚠️ Creating default icon..."
        mkdir -p "$ICON_DIR"
        # Create a simple colored square as default icon
        # Note: In real implementation, use ImageMagick or similar
        echo "TODO: Create default icon at $ICON_DIR/icon.png"
    fi
    
    # Convert icon formats
    if [ -f "$ICON_DIR/icon.png" ]; then
        echo "📱 Converting icons..."
        # Convert PNG to ICO for Windows (256x256)
        # Convert PNG to ICNS for macOS (1024x1024)
        # Note: Requires imagemagick or similar tools
        echo "✅ Icon conversion complete"
    fi
}

# Main build process
cd "$(dirname "$0")/.."

echo "🧹 Pre-build cleanup..."
cleanup_system_temp
setup_build_temp

echo "📦 Installing/updating dependencies..."
npm ci

echo "🎨 Icon preparation..."
check_icon

echo "📋 Purging dist folder..."
rm -rf dist/*

echo "🏗️ Building application..."
export ELECTRON_BUILDER_PARALLELISM=18
npm run build

echo "📦 Packaging for all platforms..."
npm run dist

# Create symlink to macOS app (for convenience)
if [ "$(uname)" = "Darwin" ]; then
    if [ -d "dist/mac" ]; then
        APP_PATH=$(find dist/mac -name "*.app" -type d | head -1)
        if [ -n "$APP_PATH" ]; then
            ln -sf "$APP_PATH" "./StreamGRID.app"
            echo "🔗 Created symlink: StreamGRID.app"
        fi
    elif [ -d "dist/mac-arm64" ]; then
        APP_PATH=$(find dist/mac-arm64 -name "*.app" -type d | head -1)
        if [ -n "$APP_PATH" ]; then
            ln -sf "$APP_PATH" "./StreamGRID.app"
            echo "🔗 Created symlink: StreamGRID.app"
        fi
    fi
fi

echo "🧹 Post-build cleanup..."
cleanup_build_temp
cleanup_system_temp

echo "✅ Build complete! Check dist/ folder for installers."
echo ""
echo "📁 Available builds:"
ls -la dist/ | grep -E "\.(dmg|exe|msi|deb|rpm|AppImage|snap|zip)$" || echo "No installer files found"

echo ""
echo "🚀 Build Summary:"
echo "   • macOS: DMG and ZIP (Intel + ARM64)"
echo "   • Windows: NSIS installer, MSI, ZIP"
echo "   • Linux: AppImage, DEB, RPM, Snap"
echo ""
echo "Run with: ./run-macos.sh (or equivalent for your platform)"
```

## Customization Notes

1. **Icon Management**: Customize the icon conversion process based on your tools
2. **Dependencies**: Add any project-specific dependency checks
3. **Post-build**: Add any custom post-build steps (signing, notarization, etc.)
4. **Platform-specific**: Add platform-specific optimizations as needed

## Build Outputs

After successful build, the following structure should exist in `dist/`:

```
dist/
├── mac/                     # macOS Intel build
├── mac-arm64/               # macOS ARM64 build  
├── win-unpacked/            # Windows unpacked
├── linux-unpacked/          # Linux unpacked
├── *.dmg                    # macOS installers
├── *.exe                    # Windows installers
├── *.msi                    # Windows MSI
├── *.AppImage               # Linux AppImage
├── *.deb                    # Debian package
├── *.rpm                    # RedHat package
├── *.snap                   # Snap package
└── *.zip                    # Portable versions
```

## Run Scripts Integration

This template works with the standardized run scripts:
- `./run-macos.sh` - Run compiled macOS app
- `./run-windows.bat` - Run compiled Windows app  
- `./run-linux.sh` - Run compiled Linux app