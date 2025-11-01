# StreamGRID Frequently Asked Questions

## General Questions

### What is StreamGRID?
StreamGRID is a professional-grade desktop application for monitoring and displaying multiple RTMP streams simultaneously in customizable grid layouts. It's designed for broadcast professionals, content creators, and streaming operations.

### What platforms does StreamGRID support?
StreamGRID supports:
- **Windows**: Windows 10 and later (x64)
- **macOS**: macOS 10.14 and later (Intel and Apple Silicon)
- **Linux**: Most modern distributions (x64)

### Is StreamGRID free?
Yes, StreamGRID is open-source software released under the MIT License. You can use it freely for personal and commercial purposes.

### What are the system requirements?
**Minimum Requirements:**
- RAM: 4GB (8GB recommended)
- CPU: Dual-core processor (Quad-core recommended)
- Storage: 2GB free space
- Network: Broadband internet connection

**Recommended for optimal performance:**
- RAM: 8GB+ for 9+ concurrent streams
- CPU: Multi-core processor (Intel i5/AMD Ryzen 5 or better)
- GPU: Dedicated graphics card with hardware acceleration
- Network: 100+ Mbps for multiple HD streams

## Installation & Setup

### How do I install StreamGRID?
1. **Download** the latest release for your platform from GitHub
2. **Run the installer**:
   - Windows: Double-click the `.exe` file
   - macOS: Open the `.dmg` and drag to Applications
   - Linux: Install the `.deb`/`.rpm` package or run `.AppImage`
3. **Launch** StreamGRID from your applications menu

### Can I run StreamGRID from source?
Yes! See the [Development Guide](DEVELOPMENT.md) for detailed instructions:
```bash
git clone https://github.com/spacewelder314/streamgrid.git
cd streamgrid
npm install
npm run dev
```

### Does StreamGRID require administrator privileges?
No, StreamGRID runs fine with standard user permissions. Admin rights are only needed during installation on some systems.

## Stream Management

### How many streams can I monitor simultaneously?
StreamGRID can handle:
- **9+ simultaneous 1080p streams** on recommended hardware
- **4+ streams** on minimum requirements
- **16+ streams** on high-performance systems with dedicated GPU

The actual number depends on your hardware, network bandwidth, and stream quality.

### What stream formats are supported?
Currently supported:
- **RTMP**: Real-Time Messaging Protocol (primary)
- **RTMPS**: Secure RTMP
- **HLS**: HTTP Live Streaming (via conversion)

Planned support for future versions:
- WebRTC
- SRT (Secure Reliable Transport)
- RTSP (Real Time Streaming Protocol)

### How do I add a stream?
1. Click the **"Add Stream"** button (+) in the header
2. Enter the **RTMP URL** (e.g., `rtmp://server.com/live/streamkey`)
3. Add a **label** for easy identification
4. Configure optional settings (volume, auto-reconnect)
5. Click **"Add"** to place in grid

### Can I save frequently used streams?
Yes! StreamGRID includes a stream library:
1. Right-click a stream and select **"Save to Library"**
2. Organize with categories and tags
3. Quick-add saved streams from the **Add Stream** dialog

### How do grid layouts work?
StreamGRID offers pre-defined layouts:
- **1x1**: Single large view
- **2x1**: Side-by-side view
- **3x1**: Triple horizontal view
- **2x2**: Four-stream grid
- **3x3**: Nine-stream grid
- **4x4**: Sixteen-stream grid

Switch layouts using the layout selector in the header bar.

## Performance & Optimization

### Why are my streams lagging?
Common causes and solutions:

**Network Issues:**
- Check internet connection speed
- Ensure sufficient bandwidth (5 Mbps per 1080p stream)
- Try reducing stream quality
- Check for network congestion

**Hardware Limitations:**
- Close other applications
- Enable hardware acceleration
- Reduce number of concurrent streams
- Check CPU/GPU usage

**Stream Source Issues:**
- Test with different streams
- Contact stream provider
- Check stream server status

### How can I improve performance?
**Hardware Acceleration:**
1. Go to **Settings → Performance**
2. Ensure **"Hardware Acceleration"** is enabled
3. Update graphics drivers

**Quality Settings:**
1. **Settings → Performance**
2. Enable **"Adaptive Quality"**
3. Adjust **buffer size** (3000-5000ms)

**System Optimization:**
- Use SSD for better I/O
- Close unnecessary background apps
- Ensure adequate RAM (8GB+ recommended)

### What hardware acceleration is supported?
**Windows:**
- DirectX Video Acceleration (DXVA2)
- NVIDIA NVDEC
- AMD VCE

**macOS:**
- VideoToolbox (Intel and Apple Silicon)
- Metal API acceleration

**Linux:**
- VAAPI (Intel/AMD)
- VDPAU (NVIDIA)
- NVDEC (NVIDIA)

## Troubleshooting

### Stream won't connect
1. **Verify URL**: Ensure RTMP URL is correct
2. **Network Test**: `ping stream-server.com`
3. **Firewall**: Allow outbound connections on port 1935
4. **Authentication**: Check if stream requires credentials
5. **Test Alternative**: Try a different stream URL

### Audio/Video out of sync
1. **Adjust Buffer**: Increase buffer size in settings
2. **Network Check**: Ensure stable connection
3. **Stream Quality**: Try lower quality setting
4. **Restart Stream**: Refresh the problematic stream

### Application crashes
1. **Update Graphics Drivers**: Outdated drivers often cause crashes
2. **Disable Hardware Acceleration**: If crashes persist
3. **Check Logs**: Look for error patterns in log files
4. **Reinstall**: Fresh installation can resolve corruption

### High CPU/Memory usage
1. **Reduce Streams**: Fewer concurrent streams
2. **Lower Quality**: Reduce stream resolution/bitrate
3. **Enable Hardware Acceleration**: Offload to GPU
4. **Restart Application**: Clear memory leaks

## Configuration

### Where are configuration files stored?
**Windows:**
```
%APPDATA%/StreamGRID/
├── config.json
├── streams.db
└── logs/
```

**macOS:**
```
~/Library/Application Support/StreamGRID/
├── config.json
├── streams.db
└── logs/
```

**Linux:**
```
~/.config/StreamGRID/
├── config.json
├── streams.db
└── logs/
```

### How do I backup my settings?
1. **Close StreamGRID**
2. **Copy configuration directory** (see above)
3. **Save to safe location**
4. **Restore** by copying back before launching

### Can I use StreamGRID behind a proxy?
Yes! Configure proxy settings:
1. **Settings → Network**
2. **Enable Proxy**
3. **Enter proxy details**:
   - Host: proxy.company.com
   - Port: 8080
   - Authentication if required

## Security

### Is StreamGRID secure?
Yes, StreamGRID includes multiple security features:
- **Sandboxed renderer process**
- **Context isolation** for IPC
- **No telemetry** (opt-in only)
- **Secure credential storage**
- **Content Security Policy**

### Are my streams private?
Yes, StreamGRID:
- Does not store stream content
- Only saves configuration and metadata
- Uses secure credential storage
- Supports encrypted connections (RTMPS)

### How do I report a security issue?
Please report security vulnerabilities privately:
- **Email**: security@streamgrid.com
- **GitHub Security Advisory**: Use GitHub's private reporting
- **Do NOT** use public issues for security reports

## Development

### How can I contribute to StreamGRID?
We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for details:
1. Fork the repository
2. Create feature branch
3. Make your changes
4. Add tests
5. Submit pull request

### What technologies are used?
- **Frontend**: React 18.x with TypeScript
- **Desktop**: Electron 28.x
- **Styling**: Tailwind CSS
- **Database**: SQLite3
- **Video**: HLS.js with hardware acceleration
- **Build**: Vite + electron-builder

### Can I build StreamGRID myself?
Yes! See [BUILD_COMPILE.md](BUILD_COMPILE.md) for complete build instructions.

## Licensing

### Can I use StreamGRID commercially?
Yes, StreamGRID is released under the MIT License, which permits:
- Commercial use
- Modification
- Distribution
- Private use

### Do I need to provide attribution?
The MIT License requires including the copyright notice and license text with distributions, but you don't need to display attribution in your application.

## Support

### Where can I get help?
- **Documentation**: Check all docs in the `/docs` folder
- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and share tips
- **Community**: Join our Discord/Slack (links in README)

### How do I report bugs?
Please include:
1. **StreamGRID version**
2. **Operating system and version**
3. **Hardware specifications**
4. **Steps to reproduce**
5. **Expected vs actual behavior**
6. **Log files** (if applicable)

### What information should I include in support requests?
For faster resolution, provide:
- StreamGRID version (Help → About)
- OS version and build
- CPU/GPU details
- Network speed
- Stream URLs (redacted if sensitive)
- Screenshots of error messages
- Relevant log entries

## Advanced

### Can I automate StreamGRID?
Yes, StreamGRID supports:
- **Command-line arguments** for basic operations
- **Configuration files** for preset setups
- **IPC API** for integration (see [API.md](API.md))
- **Keyboard shortcuts** for all major functions

### Does StreamGRID support plugins?
Not yet, but plugin architecture is planned for v2.0. See the [Plugin API section](API.md#plugin-api-future) in the API documentation.

### Can I use StreamGRID in enterprise environments?
Yes! See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Mass deployment strategies
- Centralized configuration
- Enterprise security features
- Monitoring and logging

## Common Misconceptions

### "StreamGRID records my streams"
**False**: StreamGRID only displays streams, it does not record or store content.

### "StreamGRID requires expensive hardware"
**Partially true**: While better hardware improves performance, StreamGRID works on modest systems with fewer streams.

### "StreamGRID only works with specific streaming services"
**False**: StreamGRID works with any standard RTMP stream, regardless of provider.

### "StreamGRID is difficult to set up"
**False**: StreamGRID is designed for easy setup. Most users are running within minutes.

## Still Have Questions?

If your question isn't answered here:
1. **Check the full documentation** in the `/docs` folder
2. **Search GitHub issues** - your question may have been answered
3. **Ask in GitHub Discussions** - our community is helpful
4. **Create an issue** if you think you've found a bug
5. **Contact us** at support@streamgrid.com for enterprise inquiries

We're always working to improve StreamGRID and appreciate your feedback!