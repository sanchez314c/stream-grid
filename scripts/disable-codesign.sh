# Code Signing Disabled Configuration
# This file completely disables all code signing for StreamGRID builds

# Environment variables to disable code signing
export CSC_IDENTITY_AUTO_DISCOVERY=false
export CSC_LINK=
export CSC_KEY_PASSWORD=
export CSC_NAME=
export CSC_PROVIDER=

# macOS specific code signing overrides
export ELECTRON_BUILDER_CODE_SIGNING=false
export BUILD_CODE_SIGNING=false
export MAC_CODE_SIGNING=false

# Windows specific code signing overrides
export WINDOWS_CODE_SIGNING=false
export CSC_WINDOWS_SIGN=false

# Linux signing (not typically used but disabled for completeness)
export LINUX_CODE_SIGNING=false

# General electron-builder overrides
export ELECTRON_BUILDER_SIGN=false
export SIGN_APP=false
export SIGN_BUILD=false

# Additional signing flags
export BUILD_ARGS="--publish=never --mac.identity=null"
export ELECTRON_BUILDER_ARGS="--publish=never --mac.identity=null"

echo "🔓 Code signing has been completely disabled for all platforms"
echo "✅ Build will proceed without any code signing"