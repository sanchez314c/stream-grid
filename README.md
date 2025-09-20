####################################################################################
#                                                                                  #
#   ██████╗ ███████╗████████╗    ███████╗██╗    ██╗██╗███████╗████████╗██╗   ██╗    #
#  ██╔════╝ ██╔════╝╚══██╔══╝    ██╔════╝██║    ██║██║██╔════╝╚══██╔══╝╚██╗ ██╔╝    #
#  ██║  ███╗█████╗     ██║       ███████╗██║ █╗ ██║██║█████╗     ██║     ╚████╔╝     #
#  ██║   ██║██╔══╝     ██║       ╚════██║██║███╗██║██║██╔══╝     ██║      ╚██╔╝      #
#  ╚██████╔╝███████╗   ██║       ███████║╚███╔███╔╝██║██╗         ██║       ██║       #
#   ╚═════╝ ╚══════╝   ╚═╝       ╚══════╝ ╚══╝╚══╝ ╚═╝╚═╝         ╚═╝       ╚═╝       #
#                                                                                  #
####################################################################################
#
# Project Name: StreamGRID
#
# Author: @spacewelder314
#
# Date Created: 2024-06-01
#
# Last Modified: 2025-09-01
#
# Version: 1.0.0
#
# Description: Professional RTMP Multi-Stream Viewer - Monitor multiple streams in customizable grids
#
# Language/Framework: Electron + TypeScript + React + Vite
#
# Usage: npm run dev (development) or npm start (production)
#
# Dependencies: Electron 28.x, React 18.x, TypeScript, Tailwind CSS (see package.json)
#
# GitHub: https://github.com/spacewelder314/StreamGRID
#
# Notes: Professional-grade application for streaming professionals and content creators
#
####################################################################################

# StreamGRID - Professional RTMP Multi-Stream Viewer

StreamGRID is a professional-grade Electron desktop application for monitoring and displaying multiple RTMP streams simultaneously in customizable grid layouts.

## Features

### Phase A - Core Features (v1.0)
- **RTMP Stream Management**: Add, organize, and manage multiple RTMP streams
- **Flexible Grid Layouts**: Pre-defined layouts (1x1, 2x1, 3x1, 2x2, 3x3, 4x4)
- **Stream Controls**: Individual mute/unmute, volume control, refresh, and remove
- **Performance Optimization**: Hardware acceleration, adaptive quality, resource monitoring
- **Professional UI**: Dark theme, responsive design, keyboard shortcuts
- **Window Modes**: Windowed, frameless, and fullscreen support
- **Stream Library**: Save and organize frequently used streams
- **Auto-Reconnection**: Automatic reconnection on stream failure

## Technology Stack

- **Frontend**: Electron 28.x, React 18.x with TypeScript
- **Styling**: Tailwind CSS
- **Build**: Vite + electron-builder
- **Database**: SQLite3 for stream library
- **Video**: Video.js with HLS support

## Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run dist        # Build for all platforms
npm run dist:mac    # Build for macOS
npm run dist:win    # Build for Windows
npm run dist:linux  # Build for Linux
```

### Run Built Application
```bash
# macOS
./scripts/run-macos.sh

# Windows
scripts\run-windows.bat

# Linux
./scripts/run-linux.sh
```

## Project Structure

```
StreamGRID/
├── src/               # Source code
│   ├── main/         # Electron main process
│   ├── renderer/     # React frontend
│   ├── preload/      # Preload scripts
│   └── shared/       # Shared types and utilities
├── dist/             # Built applications
│   ├── mac-intel/    # macOS Intel builds
│   ├── mac-arm64/    # macOS ARM builds
│   ├── win-x64-unpacked/  # Windows builds
│   └── linux-unpacked/    # Linux builds
├── resources/        # Application resources
│   ├── icons/        # App icons
│   └── screenshots/  # Application screenshots
├── scripts/          # Build and run scripts
├── docs/             # Documentation
└── tests/            # Test files
```

## Requirements

- Node.js 18+ 
- npm or yarn
- For development: macOS, Windows, or Linux

## License

MIT License - See LICENSE file for details