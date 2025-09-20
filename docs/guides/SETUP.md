# StreamGRID Setup Guide

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10, macOS 10.14, or Linux (64-bit)
- **RAM**: 4GB (8GB recommended for optimal performance)
- **Storage**: 2GB free space
- **Network**: Broadband internet connection
- **CPU**: Dual-core processor (Quad-core recommended)

### Recommended Requirements
- **RAM**: 8GB+ for handling 9+ concurrent streams
- **CPU**: Multi-core processor (Intel i5/AMD Ryzen 5 or better)
- **GPU**: Dedicated graphics card with hardware acceleration support
- **Storage**: SSD for better I/O performance
- **Network**: High-bandwidth connection (100+ Mbps for multiple streams)

### Hardware Acceleration Support
- **Windows**: DirectX Video Acceleration (DXVA2), NVIDIA NVDEC, AMD VCE
- **macOS**: VideoToolbox (Intel/Apple Silicon)
- **Linux**: VAAPI, VDPAU, NVIDIA NVDEC

## Installation

### Option 1: Download Prebuilt Binaries (Recommended)

1. **Download the latest release** for your platform:
   - Windows: `StreamGRID-Setup-1.0.0.exe`
   - macOS: `StreamGRID-1.0.0.dmg`
   - Linux: `StreamGRID-1.0.0.AppImage` or `StreamGRID-1.0.0.deb`

2. **Install the application**:

   **Windows:**
   ```batch
   # Run the installer
   StreamGRID-Setup-1.0.0.exe
   # Follow the installation wizard
   ```

   **macOS:**
   ```bash
   # Open the DMG file
   open StreamGRID-1.0.0.dmg
   # Drag StreamGRID.app to Applications folder
   ```

   **Linux (AppImage):**
   ```bash
   # Make executable
   chmod +x StreamGRID-1.0.0.AppImage
   # Run directly
   ./StreamGRID-1.0.0.AppImage
   ```

   **Linux (Debian/Ubuntu):**
   ```bash
   # Install DEB package
   sudo dpkg -i StreamGRID-1.0.0.deb
   # Install dependencies if needed
   sudo apt-get install -f
   ```

### Option 2: Build from Source

#### Prerequisites

1. **Install Node.js** (version 20.x or higher)
   ```bash
   # Windows (using chocolatey)
   choco install nodejs
   
   # macOS (using homebrew)
   brew install node
   
   # Linux (Ubuntu/Debian)
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install Git**
   ```bash
   # Windows (using chocolatey)
   choco install git
   
   # macOS (using homebrew)
   brew install git
   
   # Linux (Ubuntu/Debian)
   sudo apt-get install git
   ```

3. **Install Python** (required for native module compilation)
   ```bash
   # Windows (using chocolatey)
   choco install python
   
   # macOS (usually pre-installed)
   python3 --version
   
   # Linux (Ubuntu/Debian)
   sudo apt-get install python3 python3-pip
   ```

#### Build Process

1. **Clone the repository**
   ```bash
   git clone https://github.com/StreamGRID/streamgrid.git
   cd streamgrid
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the application**
   ```bash
   # Development build
   npm run build
   
   # Production build for all platforms
   ./compile-build-dist.sh
   
   # Platform-specific builds
   npm run dist:mac    # macOS
   npm run dist:win    # Windows
   npm run dist:linux  # Linux
   ```

4. **Run from source** (development)
   ```bash
   npm run dev
   # or
   npm run electron:dev
   ```

## Configuration

### First Launch Setup

1. **Launch StreamGRID**
   - The application will create default configuration files
   - Initial setup wizard will guide you through basic settings

2. **Hardware Acceleration Check**
   - StreamGRID will automatically detect and enable hardware acceleration
   - Check Settings → Performance to verify acceleration status

3. **Network Configuration**
   - No special network configuration is typically required
   - Ensure firewall allows outbound RTMP connections (port 1935)

### Configuration Files

StreamGRID stores configuration in platform-specific locations:

**Windows:**
```
%APPDATA%/StreamGRID/
├── config.json          # Application settings
├── streams.db           # Stream library database
└── logs/               # Application logs
    └── streamgrid.log
```

**macOS:**
```
~/Library/Application Support/StreamGRID/
├── config.json          # Application settings
├── streams.db           # Stream library database
└── logs/               # Application logs
    └── streamgrid.log
```

**Linux:**
```
~/.config/StreamGRID/
├── config.json          # Application settings
├── streams.db           # Stream library database
└── logs/               # Application logs
    └── streamgrid.log
```

### Environment Variables

Optional environment variables for advanced configuration:

```bash
# Enable debug logging
export DEBUG=streamgrid:*

# Custom configuration directory
export STREAMGRID_CONFIG_DIR=/path/to/config

# Disable hardware acceleration (troubleshooting)
export STREAMGRID_NO_HW_ACCEL=true

# Custom log level
export STREAMGRID_LOG_LEVEL=debug

# Maximum memory usage (MB)
export STREAMGRID_MAX_MEMORY=4096
```

## Network Configuration

### Firewall Settings

Ensure the following network access:

**Outbound Connections:**
- RTMP: TCP port 1935
- HTTP: TCP port 80
- HTTPS: TCP port 443
- Custom ports: As specified in stream URLs

**Corporate Networks:**
- StreamGRID may require proxy configuration for RTMP streams
- Contact your network administrator for corporate proxy settings

### Proxy Configuration

For networks requiring HTTP proxy:

1. Open Settings → Network
2. Configure proxy settings:
   ```json
   {
     "proxy": {
       "enabled": true,
       "host": "proxy.company.com",
       "port": 8080,
       "auth": {
         "username": "user",
         "password": "pass"
       }
     }
   }
   ```

## Performance Optimization

### Hardware Acceleration

1. **Verify GPU acceleration**:
   - Settings → Performance → Hardware Acceleration: Enabled
   - Check system information for GPU details

2. **Graphics drivers**:
   - Ensure latest graphics drivers are installed
   - NVIDIA: GeForce Experience or direct download
   - AMD: Radeon Software
   - Intel: Intel Graphics Control Panel

### Memory Optimization

1. **Adjust buffer settings** (Settings → Performance):
   ```json
   {
     "bufferSize": 5000,      # milliseconds
     "maxActiveStreams": 9,   # concurrent streams
     "adaptiveQuality": true  # auto quality adjustment
   }
   ```

2. **Monitor resource usage**:
   - View → Performance Monitor
   - Watch CPU, memory, and GPU usage
   - Adjust settings based on system performance

### Network Optimization

1. **Bandwidth allocation**:
   - Reserve sufficient bandwidth for stream count
   - Example: 9 streams × 5 Mbps = 45+ Mbps required

2. **Quality settings**:
   - Reduce stream quality if network is limited
   - Enable adaptive quality for automatic adjustment

## Troubleshooting

### Common Installation Issues

#### Windows: "App can't run on this PC"
```bash
# Ensure you have the correct architecture
# Download x64 version for 64-bit Windows
# Contact support if issues persist
```

#### macOS: "StreamGRID is damaged and can't be opened"
```bash
# Remove quarantine attribute
sudo xattr -rd com.apple.quarantine /Applications/StreamGRID.app
# Or install via Homebrew if available
```

#### Linux: "Permission denied" or missing dependencies
```bash
# Make AppImage executable
chmod +x StreamGRID-*.AppImage

# Install missing dependencies (Ubuntu/Debian)
sudo apt-get install libgtk-3-0 libnotify4 libnss3 libatspi2.0-0 libsecret-1-0
```

### Runtime Issues

#### Stream Connection Failures
1. Verify RTMP URL is correct and accessible
2. Check network connectivity: `ping stream-server.com`
3. Verify firewall isn't blocking connections
4. Test with different stream URLs

#### Performance Issues
1. Check system resources in Task Manager/Activity Monitor
2. Reduce number of concurrent streams
3. Enable hardware acceleration
4. Close other resource-intensive applications

#### Audio/Video Sync Issues
1. Check stream source quality
2. Adjust buffer size in settings
3. Verify network stability
4. Test with different streams

### Log Analysis

Enable debug logging for troubleshooting:

1. **Start with debug mode**:
   ```bash
   # Windows
   set DEBUG=streamgrid:* && StreamGRID.exe
   
   # macOS/Linux
   DEBUG=streamgrid:* ./StreamGRID
   ```

2. **Check log files**:
   - Logs are stored in the configuration directory
   - Look for ERROR and WARN entries
   - Note timestamps around issue occurrence

3. **Common log patterns**:
   ```
   ERROR stream:connection Failed to connect to rtmp://...
   WARN performance:memory Memory usage above threshold
   ERROR video:decoder Hardware decoder initialization failed
   ```

## Advanced Configuration

### Custom Stream Protocols

Add support for additional protocols by configuring stream handlers:

```json
{
  "streamHandlers": {
    "rtsp": {
      "enabled": true,
      "timeout": 30000,
      "bufferSize": 5000
    },
    "webrtc": {
      "enabled": false,
      "iceServers": ["stun:stun.l.google.com:19302"]
    }
  }
}
```

### Performance Profiles

Create performance profiles for different scenarios:

```json
{
  "profiles": {
    "highPerformance": {
      "maxStreams": 16,
      "bufferSize": 3000,
      "hardwareAcceleration": true,
      "adaptiveQuality": false
    },
    "lowResource": {
      "maxStreams": 4,
      "bufferSize": 8000,
      "hardwareAcceleration": true,
      "adaptiveQuality": true
    }
  }
}
```

### Keyboard Shortcuts

Customize keyboard shortcuts in settings:

```json
{
  "shortcuts": {
    "addStream": "Ctrl+N",
    "removeStream": "Delete",
    "toggleFullscreen": "F11",
    "switchLayout": "Ctrl+L",
    "muteAll": "Ctrl+M"
  }
}
```

## Security Considerations

### Stream URL Security
- Use RTMPS (secure RTMP) when available
- Store authentication credentials securely
- Avoid embedding credentials in stream URLs

### Network Security
- Consider VPN for accessing internal streams
- Use strong authentication for stream sources
- Monitor for unauthorized stream access

### Data Privacy
- StreamGRID stores only configuration and metadata
- No stream content is permanently stored
- Configuration can be encrypted if required

## Getting Help

### Documentation
- User Guide: `docs/USER_GUIDE.md`
- API Reference: `docs/API.md`
- Architecture: `docs/ARCHITECTURE.md`

### Support Channels
- GitHub Issues: For bug reports and feature requests
- Community Forums: For usage questions and tips
- Documentation Wiki: For community-contributed guides

### Reporting Issues
When reporting issues, include:
- StreamGRID version
- Operating system and version
- Hardware specifications
- Stream URLs (redacted if sensitive)
- Log files from issue occurrence
- Steps to reproduce

## Updates

### Automatic Updates
- StreamGRID checks for updates on startup (if enabled)
- Updates are downloaded and verified before installation
- Automatic updates can be disabled in Settings → General

### Manual Updates
1. Download latest version from releases page
2. Close StreamGRID completely
3. Install new version (will preserve settings and data)
4. Restart application

### Configuration Migration
- Settings are automatically migrated between versions
- Backup configuration before major version updates
- Migration issues are logged for troubleshooting

This setup guide should help you get StreamGRID running optimally on your system. For additional help, consult the other documentation files or reach out to the community.