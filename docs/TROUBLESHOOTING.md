# StreamGRID Troubleshooting Guide

## Overview

This guide helps resolve common issues with StreamGRID. Find your problem below and follow the step-by-step solutions.

## Installation Issues

### Windows: "App can't run on this PC"

**Symptoms:**
- Installation fails with compatibility error
- App won't launch after installation

**Solutions:**
1. **Check System Requirements**:
   - Windows 10 or later required
   - 64-bit system required
   - Verify with `winver` command

2. **Download Correct Version**:
   - Ensure x64 version for 64-bit Windows
   - Avoid ARM versions on Intel systems

3. **Run as Administrator**:
   - Right-click installer → "Run as administrator"
   - Disable antivirus temporarily during installation

4. **Install Visual C++ Redistributable**:
   - Download from Microsoft website
   - Install both x86 and x64 versions

### macOS: "StreamGRID is damaged and can't be opened"

**Symptoms:**
- Security warning on first launch
- App won't open from Applications folder

**Solutions:**
1. **Remove Quarantine Attribute**:
   ```bash
   sudo xattr -rd com.apple.quarantine /Applications/StreamGRID.app
   ```

2. **Allow from Security Settings**:
   - Open System Preferences → Security & Privacy
   - Click "Open Anyway" for StreamGRID

3. **Install via Homebrew** (if available):
   ```bash
   brew install --cask streamgrid
   ```

### Linux: "Permission denied" or missing dependencies

**Symptoms:**
- AppImage won't execute
- Missing library errors
- GUI fails to start

**Solutions:**
1. **Make AppImage Executable**:
   ```bash
   chmod +x StreamGRID-*.AppImage
   ```

2. **Install Missing Dependencies** (Ubuntu/Debian):
   ```bash
   sudo apt-get install libgtk-3-0 libnotify4 libnss3 libatspi2.0-0 libsecret-1-0
   ```

3. **Install Dependencies** (Fedora/CentOS):
   ```bash
   sudo dnf install gtk3 libXScrnSaver nss atk cups-libs
   ```

4. **Try Different Distribution**:
   - Use .deb package for Debian-based systems
   - Use .rpm package for RedHat-based systems
   - AppImage works on most systems

## Stream Connection Issues

### Stream Won't Connect

**Symptoms:**
- "Connecting..." status indefinitely
- "Connection failed" error
- Stream shows offline

**Solutions:**
1. **Verify Stream URL**:
   - Check for typos in URL
   - Ensure proper format: `rtmp://server/app/stream`
   - Test with known working stream first

2. **Test Network Connectivity**:
   ```bash
   ping stream-server.com
   traceroute stream-server.com
   ```

3. **Check Firewall Settings**:
   - Allow outbound connections on port 1935
   - Disable VPN temporarily for testing
   - Check corporate firewall restrictions

4. **Verify Stream Source**:
   - Test stream in VLC or other player
   - Contact stream provider if service is down
   - Check authentication requirements

5. **Try Alternative Stream**:
   ```
   Test URL: rtmp://live.twitch.tv/app/live_123456789_abcd1234
   Label: Connection Test
   ```

### Intermittent Connection Issues

**Symptoms:**
- Stream connects then disconnects repeatedly
- Quality fluctuates wildly
- Buffering every few seconds

**Solutions:**
1. **Network Optimization**:
   - Use wired Ethernet instead of WiFi
   - Check network stability with continuous ping
   - Contact ISP about connection quality

2. **Increase Buffer Size**:
   - Settings → Performance → Buffer Size
   - Try values: 3000ms, 5000ms, 8000ms

3. **Enable Auto-Reconnect**:
   - Settings → Streams → Auto-Reconnect
   - Set retry attempts: 3-5
   - Set retry delay: 5-10 seconds

4. **Reduce Stream Count**:
   - Start with 1-2 streams
   - Add more gradually
   - Monitor performance as you add

### Authentication Issues

**Symptoms:**
- "Authentication failed" error
- Stream requires password but nowhere to enter
- 403 Forbidden errors

**Solutions:**
1. **Check Stream Format**:
   ```
   Correct: rtmp://user:pass@server/app/stream
   Wrong:   rtmp://server/app/stream (missing auth)
   ```

2. **Verify Credentials**:
   - Check for typos in username/password
   - Ensure stream key is current and valid
   - Contact stream provider about account status

3. **Use Stream Library**:
   - Save credentials in stream library
   - StreamGRID will handle authentication automatically
   - Credentials are encrypted in storage

## Performance Issues

### High CPU Usage

**Symptoms:**
- CPU usage >80% with few streams
- System becomes sluggish
- Fans running constantly

**Solutions:**
1. **Enable Hardware Acceleration**:
   - Settings → Performance → Hardware Acceleration
   - Restart StreamGRID after enabling
   - Update graphics drivers if issues persist

2. **Reduce Stream Quality**:
   - Ask stream provider to lower bitrate
   - Use lower resolution streams when possible
   - Enable adaptive quality in settings

3. **Optimize Stream Count**:
   - Start with maximum 4 streams
   - Monitor CPU usage as you add
   - Find your system's sweet spot

4. **Close Other Applications**:
   - Close browser tabs with video
   - Close other streaming software
   - Check Task Manager for resource hogs

### Memory Usage Increases Over Time

**Symptoms:**
- Memory usage climbs continuously
- Application becomes sluggish after hours
- Eventually crashes or freezes

**Solutions:**
1. **Restart StreamGRID Periodically**:
   - Every 4-6 hours for heavy use
   - Quick restart: File → Restart

2. **Check for Memory Leaks**:
   - Open Task Manager/Activity Monitor
   - Watch memory usage over time
   - Note which streams cause increases

3. **Adjust Memory Settings**:
   - Settings → Performance → Maximum Memory
   - Set reasonable limit (2048-4096MB)
   - Enable memory monitoring

4. **Update Graphics Drivers**:
   - Outdated drivers can cause leaks
   - NVIDIA: GeForce Experience
   - AMD: Radeon Software
   - Intel: Intel Driver & Support Assistant

### Video Playback Issues

**Symptoms:**
- Video appears frozen or corrupted
- Audio plays but video is black
- Stuttering or frame drops

**Solutions:**
1. **Switch Video Decoder**:
   - Settings → Performance → Video Decoder
   - Try: Hardware → Software → Hardware
   - Restart after each change

2. **Adjust Video Settings**:
   - Disable hardware acceleration if issues persist
   - Reduce video quality in stream settings
   - Try different rendering mode

3. **Update Video Codecs**:
   - Install K-Lite Codec Pack (Windows)
   - Update system codecs
   - Try VLC codec pack as alternative

4. **Test Different Streams**:
   - Some encoders aren't compatible
   - Try H.264 vs H.265 streams
   - Test different resolutions/bitrates

## Audio Issues

### No Audio

**Symptoms:**
- Video plays but no sound
- Volume controls have no effect
- Audio meters show no activity

**Solutions:**
1. **Check Stream Audio**:
   - Verify source stream has audio
   - Test in VLC or other player
   - Contact stream provider about audio configuration

2. **Check System Audio**:
   - Verify system volume isn't muted
   - Check audio output device
   - Test audio with other applications

3. **Adjust Stream Audio Settings**:
   - Click speaker icon on stream
   - Ensure volume is at 100%
   - Check if stream is muted

4. **Restart Audio System**:
   - Windows: Restart Windows Audio service
   - macOS: Restart Core Audio
   - Linux: Restart PulseAudio/ALSA

### Audio/Video Sync Issues

**Symptoms:**
- Audio and video are out of sync
- Audio leads or lags behind video
- Sync gets worse over time

**Solutions:**
1. **Adjust Buffer Settings**:
   - Settings → Performance → Audio Buffer
   - Try values: 1000ms, 2000ms, 3000ms
   - Lower values reduce delay

2. **Enable Audio Sync**:
   - Settings → Performance → Audio/Video Sync
   - Enable automatic sync correction
   - Adjust sync offset if needed

3. **Check Stream Source**:
   - Some encoders have sync issues
   - Try different stream from same source
   - Report sync issues to provider

## UI and Interface Issues

### Window Display Problems

**Symptoms:**
- Window appears blank or white
- UI elements are missing or misaligned
- Window won't open or crashes

**Solutions:**
1. **Restart StreamGRID**:
   - Close completely from Task Manager
   - Wait 10 seconds
   - Launch again

2. **Reset Settings**:
   - Settings → Advanced → Reset to Defaults
   - Restart after reset
   - Reconfigure as needed

3. **Check Display Scaling**:
   - Windows: Display settings → Scale (try 100%)
   - macOS: System Preferences → Displays
   - Linux: Display settings → Scale

4. **Update Graphics Drivers**:
   - UI issues often caused by driver problems
   - Update to latest stable version
   - Try rollback if recent update caused issues

### Grid Layout Issues

**Symptoms:**
- Streams don't arrange properly in grid
- Overlapping or incorrect sizing
- Layout switching doesn't work

**Solutions:**
1. **Reset Layout**:
   - Layout selector → Reset Layout
   - Choose layout again
   - Restart StreamGRID

2. **Check Window Size**:
   - Make window large enough for selected layout
   - Try fullscreen mode
   - Minimize then maximize window

3. **Clear Stream Cache**:
   - Settings → Advanced → Clear Cache
   - Restart application
   - Re-add streams

## System-Specific Issues

### Windows-Specific

#### StreamGRID Won't Start
1. **Check .NET Framework**:
   - Ensure .NET 4.7.2+ installed
   - Download from Microsoft if missing

2. **Install Visual C++ Redistributable**:
   - Download both 2015-2022 and 2022 versions
   - Install both x86 and x64 variants

3. **Check Windows Defender**:
   - Add StreamGRID to exclusions
   - Disable real-time protection temporarily

#### Performance Issues
1. **Power Settings**:
   - Set power plan to "High Performance"
   - Disable CPU throttling
   - Check advanced power settings

2. **Game Mode**:
   - Disable Game Mode for streaming
   - Add StreamGRID to game mode exclusions

### macOS-Specific

#### Permission Issues
1. **Security Settings**:
   - System Preferences → Security & Privacy
   - Allow StreamGRID in Accessibility
   - Allow screen recording if needed

2. **Gatekeeper Issues**:
   - Right-click app → Open
   - Or use `sudo xattr` command (see above)

#### Performance Issues
1. **Spotlight Indexing**:
   - Add StreamGRID to Spotlight privacy
   - System Preferences → Spotlight → Privacy

2. **App Nap**:
   - Disable App Nap for StreamGRID
   - System Preferences → Energy Saver

### Linux-Specific

#### Display Issues
1. **Wayland vs X11**:
   - Try X11 if Wayland has issues
   - Set environment variable: `GDK_BACKEND=x11`

2. **Display Server**:
   - Install missing display libraries
   - Check for missing GTK components

#### Audio Issues
1. **PulseAudio Configuration**:
   - Check PulseAudio is running
   - Verify user is in audio group
   - Restart PulseAudio service

## Getting Help

### Collecting Information for Support

When reporting issues, please provide:

1. **System Information**:
   - Operating system and version
   - StreamGRID version
   - CPU, GPU, RAM specifications

2. **Issue Details**:
   - Exact error messages
   - Steps to reproduce
   - When issue started
   - Frequency of occurrence

3. **Stream Information**:
   - Stream URLs (redact sensitive parts)
   - Number of concurrent streams
   - Network connection type
   - Time of day (if relevant)

4. **Log Files**:
   - Location: Platform-specific (see INSTALLATION.md)
   - Include relevant log entries
   - Note timestamps around issue

### Debug Mode

Enable debug logging for troubleshooting:

**Windows:**
```batch
set DEBUG=streamgrid:*
StreamGRID.exe
```

**macOS/Linux:**
```bash
DEBUG=streamgrid:* ./StreamGRID
```

### Common Log Patterns

Look for these patterns in logs:

```
ERROR stream:connection Failed to connect to rtmp://...
WARN performance:memory Memory usage above threshold
ERROR video:decoder Hardware decoder initialization failed
INFO stream:reconnect Attempting to reconnect stream...
ERROR ipc:handler Stream validation failed
```

## Prevention Tips

### Regular Maintenance

1. **Keep Updated**:
   - Check for StreamGRID updates monthly
   - Update graphics drivers regularly
   - Keep system updated

2. **Monitor Performance**:
   - Watch CPU/memory usage
   - Address issues early
   - Don't ignore gradual degradation

3. **Backup Configuration**:
   - Export stream library regularly
   - Backup configuration files
   - Document custom settings

### Best Practices

1. **Start Simple**:
   - Begin with 1-2 streams
   - Add more gradually
   - Find your system's limits

2. **Use Quality Streams**:
   - Reliable sources prevent issues
   - Test new sources before important events
   - Have backup streams ready

3. **Network First**:
   - Wired connection better than WiFi
   - Check network speed before events
   - Have cellular backup if critical

This troubleshooting guide should resolve most common StreamGRID issues. For problems not covered here, check the full documentation or contact support.