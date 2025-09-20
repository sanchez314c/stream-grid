# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an RTMP/HLS stream grid viewer system that uses FFmpeg to display multiple security camera streams simultaneously in grid layouts (2x2, 3x3, 6x6). The project focuses on performance optimization through hardware acceleration and smart resource management.

## Key Commands

### Running Stream Grids
```bash
# Test single stream
ffplay -loglevel warning "STREAM_URL"

# Run 2x2 grid (most stable)
./legacy/rtmp_2x2.sh stream1_url stream2_url stream3_url stream4_url

# Run 3x3 grid (optimized)
./legacy/rtmp_3x3_optimized.sh  # You'll need to add stream URLs

# Run 6x6 grid (resource intensive)
./legacy/rtmp_6x6.sh stream_url

# Run random stream switcher
./legacy/rtmp_random_switcher.sh

# Kill all FFmpeg/FFplay processes
pkill -f ffmpeg; pkill -f ffplay
```

### Python VideoWall Application
```bash
# Navigate to main package
cd legacy/main-package

# Install dependencies
./install.sh

# Run the VideoWall application
./run.sh
# Or manually:
source videowall_env/bin/activate
python -m videowall

# Build macOS app
./scripts/build_macos_app.sh

# Run tests
source videowall_env/bin/activate
pytest tests/
```

### Optimized FFmpeg Command Structure
The optimal command structure for multi-stream grids:
```bash
ffmpeg -hwaccel videotoolbox -threads 1 -fflags +genpts+igndts -avoid_negative_ts make_zero \
-i "STREAM_URL_1" -i "STREAM_URL_2" ... \
-filter_complex "[0:v]fps=8,scale=400:225:flags=fast_bilinear[v0];..." \
-map "[out]" -r 8 -f nut -c:v rawvideo - | \
ffplay -loglevel warning -window_title "Grid Title" -
```

## Architecture & Technical Details

### Project Structure
- **`legacy/`**: Main codebase directory
  - **Shell Scripts**: FFmpeg-based stream grid viewers (rtmp_2x2.sh, rtmp_6x6.sh, etc.)
  - **`main-package/`**: Python VideoWall application with PyQt5 GUI
  - **`archive/`**: Previous implementations and experiments
  - **`alt-implementation/`**: Alternative conda-based setup

### Core Components
1. **FFmpeg Processing Pipeline**: Handles stream ingestion, scaling, and grid composition
2. **Hardware Acceleration**: Uses VideoToolbox on macOS for hardware video decoding
3. **Filter Complex System**: Creates grids by horizontally stacking streams into rows, then vertically stacking rows
4. **Python VideoWall**: PyQt5-based application supporting M3U8 streams and local videos with multi-monitor support

### Performance Optimizations
- **Frame Rate Reduction**: 8-10 fps instead of 30 fps (70% resource savings)
- **Resolution Scaling**: 400x225 per stream for 3x3 grids (from 1080p/720p sources)
- **Thread Management**: 1-2 threads per stream to prevent CPU overload
- **Fast Bilinear Scaling**: Uses `flags=fast_bilinear` for efficient scaling

### Stream Processing Flow
1. Input multiple RTMP/HLS streams with `-i` flags
2. Apply fps reduction and scaling to each stream
3. Use `hstack` to combine streams horizontally into rows
4. Use `vstack` to combine rows vertically into final grid
5. Pipe raw video to ffplay for display

### System Requirements
- macOS with VideoToolbox support (tested on Apple Silicon)
- FFmpeg 7.1.1+ with hardware acceleration
- Python 3.7+ (for VideoWall application)
- PyQt5 (for GUI components)
- ~2-4GB RAM for 9 streams
- ~40-50 Mbps network bandwidth for 3x3 grid

### Grid Configurations
- **2x2**: Always stable, 960x540 per stream
- **3x3**: Optimal with optimizations, 400x225 per stream at 8-10fps
- **6x6**: Resource intensive, 320x180 per stream (often unstable)

## Development Commands

### Python VideoWall Testing
```bash
cd legacy/main-package
source videowall_env/bin/activate

# Run unit tests
pytest tests/unit/

# Run all tests
pytest

# Code formatting (if black/isort installed)
black videowall/
isort videowall/
```

## Important Notes

- This is a security camera monitoring system - all implementations should focus on defensive security purposes only
- Stream URLs may expire and return 403 errors - replacements needed periodically
- Always use hardware acceleration (`-hwaccel videotoolbox`) for acceptable performance
- Monitor CPU/memory usage with Activity Monitor during operation
- The VideoWall Python application supports both M3U8 streams and local video files
- Configuration dialog appears on startup for VideoWall to select video sources