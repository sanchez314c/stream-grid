# StreamGRID 📺

> Professional RTMP Multi-Stream Viewer - Monitor multiple streams in customizable grids

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-28.0.0-47848F?logo=electron)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/Platform-macOS%20|%20Windows%20|%20Linux-lightgrey)](https://github.com/sanchez314c/stream-grid/releases)

## 📸 Main Interface

![StreamGRID Screenshot](build_resources/screenshots/stream-grid-interface-00.png)

> The Ultimate Professional Streaming Tool - Monitor Multiple RTMP Streams in Real-Time

StreamGRID is a professional-grade desktop application for monitoring and displaying multiple RTMP streams simultaneously in customizable grid layouts. Built with Electron, React, and TypeScript, it provides a powerful dark UI for streaming professionals, content creators, and broadcasters who need to monitor multiple streams at once.

## ✨ Features

- 🎥 **Multi-Stream Viewing** - Monitor multiple RTMP streams simultaneously in customizable grids
- 📐 **Flexible Layouts** - Pre-defined layouts (1x1, 2x1, 3x1, 2x2, 3x3, 4x4, custom arrangements)
- 🎛️ **Individual Stream Controls** - Mute/unmute, volume control, quality settings, refresh, and remove
- ⚡ **Performance Optimization** - Hardware acceleration, adaptive quality, resource monitoring
- 🎨 **Professional Dark UI** - Modern, responsive interface optimized for extended viewing sessions
- 🖥️ **Cross-Platform Support** - Works seamlessly on macOS, Windows, and Linux
- 📂 **Stream Library** - Save, organize, and quickly access frequently used streams
- 🔄 **Auto-Reconnection** - Automatic reconnection on stream failure with configurable retry logic
- ⌨️ **Keyboard Shortcuts** - Full keyboard navigation and quick actions for power users
- 🌐 **Network Monitoring** - Real-time bandwidth usage and connection status indicators
- 📊 **Performance Metrics** - CPU, memory, and network usage monitoring
- 🎯 **Focus Mode** - Isolate individual streams for detailed monitoring

## 📸 Grid Layout in Action

![Multi-Stream Grid Layout](build_resources/screenshots/stream-grid-interface-01.png)
*Monitor multiple streams simultaneously in customizable grid layouts*

## 🚀 Quick Start - One-Command Build & Run

### Option 1: One-Command Solution (Recommended)

```bash
# Clone and build
git clone https://github.com/sanchez314c/stream-grid.git
cd stream-grid

# Build and run with a single command!
./scripts/build-compile-dist.sh
```

### Option 2: Development Mode

```bash
# Run in development mode with hot reload
npm run dev
```

### Build Options

```bash
# Build only (don't launch)
npm run build

# Build for specific platform
npm run dist:mac        # Build for macOS (Intel + ARM)
npm run dist:win        # Build for Windows
npm run dist:linux      # Build for Linux

# Build for all platforms
npm run dist:all

# Build with specific configuration
npm run build:debug     # Debug build
npm run build:release   # Release build
```

## 📋 Prerequisites

For running from source:
- **Node.js** 18+ and npm
- **Git** (for cloning the repository)
- **FFmpeg** (for stream processing - optional, bundled in releases)

The application includes all necessary dependencies for basic functionality.

## 🛠️ Installation

### Detailed Installation

```bash
# Clone the repository
git clone https://github.com/sanchez314c/stream-grid.git
cd stream-grid

# Install dependencies
npm install

# Start the application
npm start

# Or run in development mode
npm run dev
```

### Building from Source

```bash
# One-command build for current platform
npm run dist

# Build for all platforms
npm run dist:all

# Build for specific platforms
npm run dist:mac
npm run dist:win
npm run dist:linux
```

### Build Output Locations

After building, find your executables in:
- **macOS**: `dist/StreamGRID-*.dmg` and `dist/mac*/StreamGRID.app`
- **Windows**: `dist/StreamGRID Setup *.exe`
- **Linux**: `dist/StreamGRID-*.AppImage` and `dist/*.deb`

## 📖 Usage

### 1. Starting the Application

- **Pre-built Binary**: Just double-click the application
- **From Source**: Run `npm start` or `npm run dev`

### 2. Adding Streams

**Multiple ways to add streams:**
- **Drag & Drop**: Drag RTMP URLs directly onto the grid
- **Add Button**: Click the "+" button and enter stream URL
- **Stream Library**: Select from saved streams in the library
- **Import**: Import stream lists from files

### 3. Grid Management

**Layout options:**
- **Pre-defined Layouts**: Choose from 1x1, 2x1, 3x1, 2x2, 3x3, 4x4
- **Custom Layouts**: Create your own grid arrangements
- **Dynamic Resizing**: Drag grid borders to adjust cell sizes
- **Fullscreen Mode**: Maximize individual streams or entire grid

### 4. Stream Controls

**Individual stream controls:**
- **Play/Pause**: Start and stop stream playback
- **Volume**: Adjust audio volume per stream
- **Mute**: Mute individual streams
- **Quality**: Select stream quality (when available)
- **Refresh**: Reconnect to stream
- **Remove**: Remove stream from grid

## 📸 Stream Controls Interface

![Stream Controls Panel](build_resources/screenshots/stream-grid-interface-02.png)
*Individual controls for each stream including volume, quality, and playback options*

### 5. Stream Library

**Organize your streams:**
- **Save Streams**: Add current streams to library
- **Categories**: Organize streams by category or project
- **Quick Access**: One-click load saved stream configurations
- **Import/Export**: Share stream lists with team members

## 📸 Stream Library Management

![Stream Library Management](build_resources/screenshots/stream-grid-interface-03.png)
*Save, organize, and quickly access frequently used streams*

## 🔧 Configuration

### Directory Structure

```
~/Library/Application Support/StreamGRID/    # macOS
%APPDATA%/StreamGRID/                        # Windows
~/.config/StreamGRID/                        # Linux
├── stream-library.json                      # Saved streams
├── preferences.json                         # User settings
├── layouts/                                 # Custom layouts
└── logs/                                   # Application logs
```

### Environment Variables

```bash
# Set custom configuration directory
export STREAMGRID_CONFIG_DIR=/path/to/config

# Enable debug mode
export STREAMGRID_DEBUG=1

# Set hardware acceleration preference
export STREAMGRID_HW_ACCEL=auto  # auto, enabled, disabled
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Play/Pause selected stream |
| `M` | Mute/Unmute selected stream |
| `F` | Toggle fullscreen for selected stream |
| `R` | Refresh selected stream |
| `Delete` | Remove selected stream |
| `Ctrl+N` | Add new stream |
| `Ctrl+S` | Save current layout |
| `Ctrl+L` | Open stream library |
| `Escape` | Exit fullscreen |
| `1-9` | Select grid cell |
| `Ctrl+1-9` | Quick load layout |

## 📸 Performance Monitoring Dashboard

![Performance Monitoring](build_resources/screenshots/stream-grid-interface-04.png)
*Real-time system metrics and network performance indicators*

## 🐛 Troubleshooting

### Common Issues

<details>
<summary>Streams won't load</summary>

- **Network Connection**: Check internet connectivity
- **RTMP URL**: Verify stream URLs are correct and accessible
- **Firewall**: Ensure RTMP ports (1935, 80, 443) are open
- **Stream Status**: Check if streams are online and accessible
- **Codecs**: Verify supported codecs (H.264, AAC recommended)
</details>

<details>
<summary>Performance issues</summary>

- **GPU Acceleration**: Enable hardware acceleration in settings
- **Stream Count**: Reduce number of simultaneous streams
- **Network Bandwidth**: Check available bandwidth
- **System Resources**: Monitor CPU and memory usage
- **Stream Quality**: Lower stream quality settings
</details>

<details>
<summary>Audio not working</summary>

- **Volume Levels**: Check both system and app volume settings
- **Mute State**: Ensure streams aren't muted
- **Audio Codecs**: Verify stream uses supported audio codec
- **System Audio**: Check system audio output device
</details>

<details>
<summary>Application crashes</summary>

1. Check system logs for error details
2. Update graphics drivers
3. Disable hardware acceleration if needed
4. Clear application cache
5. Restart application
</details>

## 📁 Project Structure

```
stream-grid/
├── src/                      # Source code
│   ├── main/                # Electron main process
│   │   ├── index.js         # Main entry point
│   │   ├── menu.js          # Application menu
│   │   ├── windows/         # Window management
│   │   └── services/        # Backend services
│   ├── renderer/            # React frontend
│   │   ├── components/      # React components
│   │   ├── pages/           # Application pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # State management
│   │   └── styles/          # CSS/Tailwind styles
│   ├── preload/             # Preload scripts
│   └── shared/              # Shared utilities
├── build_resources/         # Build resources
│   ├── icons/              # Application icons
│   └── screenshots/        # App screenshots
├── scripts/                # Build and utility scripts
├── docs/                   # Documentation
├── tests/                  # Test files
├── dist/                   # Build outputs
└── archive/                # Archived files
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 📦 Build Configuration

The application uses standard Electron build configuration:

### Build Settings
- **Electron Version**: 28.x
- **Node.js Target**: 18.x
- **Platforms**: macOS (Intel + ARM), Windows, Linux
- **Compression**: Maximum compression for smaller downloads

### Supported Platforms
- **macOS**: 10.15+ (Catalina and later)
- **Windows**: Windows 10+ (x64)
- **Linux**: Ubuntu 18.04+, Debian 10+, Fedora 32+

## 🔧 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development mode with hot reload |
| `npm run build` | Build application for production |
| `npm run dist` | Build distributables for current platform |
| `npm run dist:all` | Build for all platforms |
| `npm run test` | Run test suite |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |

## 🎨 Design

### UI Components

- **Stream Grid**: Resizable grid layout for stream display
- **Stream Controls**: Individual controls for each stream
- **Stream Library**: Organized collection of saved streams
- **Settings Panel**: Comprehensive application settings
- **Performance Monitor**: Real-time system metrics

### Design Principles

- **Professional**: Optimized for streaming professionals
- **Dark Theme**: Easy on the eyes during extended monitoring sessions
- **Responsive**: Adapts to different screen sizes and resolutions
- **Keyboard Accessible**: Full keyboard navigation support
- **Performance First**: Optimized for smooth streaming performance

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or create issues for bug reports and feature requests.

### Development Setup

```bash
# Clone the repo
git clone https://github.com/sanchez314c/stream-grid.git
cd stream-grid

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

### Code Style

- **TypeScript**: Strict typing for all code
- **ESLint**: Consistent code formatting and linting
- **Prettier**: Code formatting
- **Conventional Commits**: Follow conventional commit message format

## 📸 Settings & Configuration

![Settings & Configuration](build_resources/screenshots/stream-grid-interface-05.png)
*Comprehensive settings panel for customization and preferences*

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Electron** - For making cross-platform development possible
- **React** - For the powerful and flexible UI framework
- **Video.js** - For excellent video playback capabilities
- **FFmpeg** - For media processing capabilities
- **Streaming Community** - For inspiration and feedback

## 🔗 Links

- [Report Issues](https://github.com/sanchez314c/stream-grid/issues)
- [Request Features](https://github.com/sanchez314c/stream-grid/issues/new?labels=enhancement)
- [Discussions](https://github.com/sanchez314c/stream-grid/discussions)
- [Releases](https://github.com/sanchez314c/stream-grid/releases)

---

**StreamGRID v1.0** - Professional RTMP Multi-Stream Viewer
Made with AI!