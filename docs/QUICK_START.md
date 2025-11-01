# StreamGRID Quick Start Guide

## Overview

Get StreamGRID up and running in minutes with this quick start guide. Perfect for users who want to start monitoring streams immediately.

## Installation in 2 Minutes

### Step 1: Download StreamGRID

**Windows:**
1. Download `StreamGRID-Setup-1.0.0.exe` from [GitHub Releases](https://github.com/spacewelder314/streamgrid/releases)
2. Double-click the installer
3. Follow the installation wizard

**macOS:**
1. Download `StreamGRID-1.0.0.dmg` from [GitHub Releases](https://github.com/spacewelder314/streamgrid/releases)
2. Double-click the DMG file
3. Drag StreamGRID to Applications folder

**Linux:**
1. Download `StreamGRID-1.0.0.AppImage` from [GitHub Releases](https://github.com/spacewelder314/streamgrid/releases)
2. Make executable: `chmod +x StreamGRID-1.0.0.AppImage`
3. Run: `./StreamGRID-1.0.0.AppImage`

### Step 2: Launch StreamGRID

- **Windows**: Start Menu → StreamGRID
- **macOS**: Applications → StreamGRID
- **Linux**: Applications → StreamGRID or run AppImage directly

First launch will:
- Create default configuration
- Detect hardware capabilities
- Initialize stream library
- Set up performance optimizations

## Adding Your First Stream

### Method 1: Quick Add
1. Click the **+ button** in the header bar
2. Enter RTMP URL: `rtmp://your-stream.com/live/streamkey`
3. Add a label: `My First Stream`
4. Click **Add Stream**

### Method 2: Test Stream
Try this working test stream:
```
URL: rtmp://live.twitch.tv/app/live_123456789
Label: Twitch Test Stream
```

### Method 3: Use Stream Library
1. Click **+ button** → **From Library**
2. Browse pre-configured streams
3. Select and click **Add**

## Basic Usage

### Grid Layouts
Switch layouts using the layout selector in the header:
- **1x1**: Single large view
- **2x2**: Four-stream grid
- **3x3**: Nine-stream grid
- **4x4**: Sixteen-stream grid

### Stream Controls
Each stream tile provides:
- **Volume Control**: Click speaker icon, adjust slider
- **Mute/Unmute**: Click speaker to toggle
- **Refresh**: Click circular arrow icon
- **Remove**: Click X to remove from grid
- **Fullscreen**: Double-click stream tile

### Keyboard Shortcuts
Press these keys for quick actions:
- **Ctrl+N**: Add new stream
- **Delete**: Remove selected stream
- **F11**: Toggle fullscreen
- **Ctrl+M**: Mute all streams
- **Ctrl+L**: Switch layout

## Common Stream Sources

### Streaming Platforms
**Twitch:**
```
rtmp://live.twitch.tv/app/your_stream_key
```

**YouTube Live:**
```
rtmp://a.rtmp.youtube.com/live2/your_stream_key
```

**Facebook Live:**
```
rtmp://live-api-s.facebook.com:443/rtmp/your_stream_key
```

**OBS Studio:**
```
rtmp://localhost:1935/live
```

### IP Cameras
**Generic RTSP (via converter):**
```
rtmp://converter.local/stream?url=rtsp://camera-ip:554/stream
```

**ONVIF Cameras:**
1. Click **Discover Cameras** in Add Stream dialog
2. Select camera from discovered list
3. Configure credentials if required

## Performance Tips

### For Best Performance
1. **Hardware Acceleration**: Ensure enabled in Settings → Performance
2. **Network**: Use wired connection for multiple streams
3. **Stream Count**: Start with 4 streams, add more as needed
4. **Quality**: Reduce stream quality if performance issues

### If Streams Lag
1. Check internet speed (need 5 Mbps per 1080p stream)
2. Close other applications
3. Enable hardware acceleration
4. Reduce number of concurrent streams

### If Audio Issues
1. Check individual stream volume controls
2. Verify system audio output
3. Test with different streams
4. Check stream source audio

## Troubleshooting

### Stream Won't Connect
1. **Verify URL**: Copy-paste to ensure accuracy
2. **Test Network**: Try a different stream
3. **Check Firewall**: Allow port 1935 outbound
4. **Authentication**: Ensure correct credentials if required

### Application Issues
1. **Restart**: Close and reopen StreamGRID
2. **Update**: Check for newer version
3. **Reinstall**: Download fresh installer if issues persist

### Performance Issues
1. **System Requirements**: Verify minimum requirements met
2. **Graphics Drivers**: Update to latest version
3. **Background Apps**: Close resource-heavy applications
4. **Hardware Acceleration**: Enable in settings

## Next Steps

### Explore Features
- **Stream Library**: Save frequently used streams
- **Settings**: Customize performance and appearance
- **Advanced Controls**: Access professional features
- **Status Bar**: Monitor system performance

### Configuration
- **Performance**: Adjust stream quality and limits
- **Network**: Configure proxy if needed
- **UI**: Customize theme and layout preferences
- **Shortcuts**: Customize keyboard shortcuts

### Getting Help
- **Documentation**: Access full documentation in Help menu
- **GitHub Issues**: Report bugs and request features
- **Community**: Join discussions for tips and support

## Quick Reference

### Essential Controls
| Action | Method |
|---------|---------|
| Add Stream | Click + button or Ctrl+N |
| Remove Stream | Click X on stream or Delete key |
| Mute Stream | Click speaker icon |
| Fullscreen | Double-click stream or F11 |
| Change Layout | Layout selector in header |

### Common URLs
| Platform | URL Format |
|----------|------------|
| Twitch | `rtmp://live.twitch.tv/app/key` |
| YouTube | `rtmp://a.rtmp.youtube.com/live2/key` |
| Facebook | `rtmp://live-api-s.facebook.com:443/rtmp/key` |
| Custom | `rtmp://your-server.com/app/stream` |

### Performance Targets
| Metric | Target |
|---------|--------|
| Stream Latency | <100ms |
| CPU Usage (4 streams) | <60% |
| Memory Usage (9 streams) | <2GB |
| Stream Reconnect Time | <5 seconds |

## Need More Help?

- **Full Documentation**: See `docs/` folder for comprehensive guides
- **Installation Guide**: `docs/INSTALLATION.md` for detailed setup
- **API Reference**: `docs/API.md` for technical details
- **Troubleshooting**: `docs/TROUBLESHOOTING.md` for common issues
- **Community**: [GitHub Discussions](https://github.com/spacewelder314/streamgrid/discussions)

You're now ready to monitor multiple streams with StreamGRID! The intuitive interface makes it easy to add streams, switch layouts, and monitor all your feeds in one place.