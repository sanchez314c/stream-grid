# StreamGRID Deployment Guide

## Overview

This guide covers deployment strategies for StreamGRID in various environments, from single-user installations to enterprise deployments.

## Deployment Options

### Option 1: Standalone Desktop Deployment

#### Individual User Installation
1. **Download pre-built binaries** from GitHub releases
2. **Install per platform**:
   - Windows: Run `.exe` installer
   - macOS: Mount `.dmg` and drag to Applications
   - Linux: Install `.deb`/`.rpm` or run `.AppImage`

#### Silent Installation (Windows)
```batch
# Silent install with default settings
StreamGRID-Setup-1.0.0.exe /S

# Custom installation directory
StreamGRID-Setup-1.0.0.exe /S /D=C:\StreamGRID
```

#### Mass Deployment (macOS)
```bash
# Deploy to multiple machines via SSH
for host in host1 host2 host3; do
    scp StreamGRID-1.0.0.dmg $host:/tmp/
    ssh $host "sudo hdiutil attach /tmp/StreamGRID-1.0.0.dmg && \
               sudo cp -R '/Volumes/StreamGRID/StreamGRID.app' /Applications/ && \
               sudo hdiutil detach '/Volumes/StreamGRID'"
done
```

### Option 2: Enterprise Deployment

#### Configuration Management
Create standardized configuration for deployment:

```json
{
  "deployment": {
    "mode": "enterprise",
    "configSource": "network",
    "configUrl": "https://config.company.com/streamgrid.json",
    "autoUpdate": false,
    "telemetry": false
  },
  "security": {
    "restrictedMode": true,
    "allowedStreams": ["*.company.com", "rtmp://internal.*"],
    "blockExternalUrls": true
  },
  "performance": {
    "maxStreams": 16,
    "hardwareAcceleration": true,
    "adaptiveQuality": true
  }
}
```

#### Network Deployment
1. **Centralized Configuration**:
   - Host configuration file on internal web server
   - StreamGRID pulls config on startup
   - Updates pushed automatically

2. **Package Distribution**:
   ```bash
   # Create custom installer with embedded config
   npm run dist:custom -- --config.company=CompanyInc
   ```

3. **License Management**:
   - Enterprise licenses via configuration
   - Seat-based activation
   - Centralized license server

### Option 3: Containerized Deployment

#### Docker Deployment
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runtime
RUN apk add --no-cache \
    xvfb \
    gtk+3.0 \
    libxss1 \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libc6 \
    libcairo-gobject2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    xdg-utils

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build

EXPOSE 5173
CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  streamgrid:
    build: .
    ports:
      - "5173:5173"
    environment:
      - DISPLAY=unix:0
      - STREAMGRID_CONFIG_URL=https://config.company.com/streamgrid.json
    volumes:
      - ./config:/app/config
      - /tmp/.X11-unix:/tmp/.X11-unix
    restart: unless-stopped
```

## Environment Configuration

### Development Environment
```bash
# Development deployment
export NODE_ENV=development
export STREAMGRID_CONFIG_URL=http://localhost:3000/config
export DEBUG=streamgrid:*

npm run dev
```

### Staging Environment
```bash
# Staging deployment
export NODE_ENV=staging
export STREAMGRID_CONFIG_URL=https://staging-config.company.com/streamgrid.json
export STREAMGRID_TELEMETRY=true

npm run build
npm run dist:staging
```

### Production Environment
```bash
# Production deployment
export NODE_ENV=production
export STREAMGRID_CONFIG_URL=https://config.company.com/streamgrid.json
export STREAMGRID_TELEMETRY=false
export STREAMGRID_AUTO_UPDATE=false

npm run build
npm run dist:production
```

## Configuration Management

### Environment Variables
| Variable | Description | Default |
|----------|-------------|----------|
| `STREAMGRID_CONFIG_DIR` | Custom config directory | Platform-specific |
| `STREAMGRID_LOG_LEVEL` | Logging level (debug/info/warn/error) | `info` |
| `STREAMGRID_MAX_MEMORY` | Maximum memory usage (MB) | `2048` |
| `STREAMGRID_NO_HW_ACCEL` | Disable hardware acceleration | `false` |
| `STREAMGRID_CONFIG_URL` | Network configuration URL | None |
| `STREAMGRID_LICENSE_SERVER` | License server URL | None |

### Configuration Files
#### Network Configuration
```json
{
  "network": {
    "proxy": {
      "enabled": true,
      "host": "proxy.company.com",
      "port": 8080,
      "auth": {
        "username": "${PROXY_USER}",
        "password": "${PROXY_PASS}"
      }
    },
    "allowedHosts": ["*.company.com", "rtmp://internal.*"],
    "blockedHosts": ["*.social-media.com"]
  }
}
```

#### Security Configuration
```json
{
  "security": {
    "restrictedMode": true,
    "allowExternalStreams": false,
    "requireAuthentication": true,
    "encryptCredentials": true,
    "auditLogging": true,
    "sessionTimeout": 3600
  }
}
```

## Monitoring and Logging

### Application Monitoring
```javascript
// Custom monitoring endpoint
const monitoring = {
  endpoint: "https://monitoring.company.com/webhooks/streamgrid",
  apiKey: process.env.MONITORING_API_KEY,
  events: ["stream:connected", "stream:error", "performance:alert"]
};
```

### Log Aggregation
```bash
# Centralized log collection
rsync -avz /var/log/streamgrid/ logserver.company.com:/logs/streamgrid/

# Or use log shipping agent
streamgrid-log-shipper --endpoint https://logs.company.com --api-key $LOG_KEY
```

### Performance Monitoring
```json
{
  "monitoring": {
    "metrics": {
      "enabled": true,
      "endpoint": "https://metrics.company.com",
      "interval": 60,
      "includeSystemMetrics": true,
      "includeStreamMetrics": true
    },
    "alerts": {
      "cpuThreshold": 80,
      "memoryThreshold": 90,
      "streamFailureThreshold": 5
    }
  }
}
```

## Update Management

### Automatic Updates
```json
{
  "updates": {
    "autoCheck": true,
    "autoInstall": false,
    "channel": "stable",
    "schedule": "daily",
    "maintenanceWindow": {
      "start": "02:00",
      "end": "04:00",
      "timezone": "UTC"
    }
  }
}
```

### Manual Update Deployment
```bash
# Deploy updates to multiple machines
#!/bin/bash
VERSION="1.1.0"
HOSTS=("host1" "host2" "host3")

for host in "${HOSTS[@]}"; do
    echo "Updating $host to version $VERSION"
    ssh $host "sudo systemctl stop streamgrid"
    scp StreamGRID-$VERSION.dmg $host:/tmp/
    ssh $host "sudo hdiutil attach /tmp/StreamGRID-$VERSION.dmg && \
               sudo cp -R '/Volumes/StreamGRID/StreamGRID.app' /Applications/ && \
               sudo hdiutil detach '/Volumes/StreamGRID' && \
               sudo systemctl start streamgrid"
done
```

## Security Considerations

### Network Security
- **Firewall Rules**: Allow only necessary ports
- **VPN Integration**: Required for remote stream access
- **Certificate Pinning**: Prevent MITM attacks
- **Stream Encryption**: Use RTMPS when available

### Application Security
- **Code Signing**: All binaries must be signed
- **Sandboxing**: Restrict file system access
- **Memory Protection**: Enable ASLR and DEP
- **Input Validation**: Sanitize all stream URLs

### Data Protection
- **Configuration Encryption**: Encrypt sensitive settings
- **Credential Storage**: Use system keychain
- **Audit Logging**: Log all configuration changes
- **Data Retention**: Define retention policies

## Troubleshooting

### Deployment Issues
1. **Permission Denied**:
   - Check file permissions
   - Verify user has admin rights
   - Use sudo if necessary

2. **Network Configuration**:
   - Verify proxy settings
   - Check DNS resolution
   - Test connectivity to config server

3. **License Issues**:
   - Verify license server connectivity
   - Check license validity
   - Confirm seat availability

### Performance Issues
1. **High CPU Usage**:
   - Disable hardware acceleration if problematic
   - Reduce maximum concurrent streams
   - Check for malware/viruses

2. **Memory Leaks**:
   - Monitor memory usage over time
   - Restart application periodically
   - Check for memory-intensive streams

## Best Practices

### Pre-Deployment Checklist
- [ ] Test in staging environment
- [ ] Verify configuration compatibility
- [ ] Check system requirements
- [ ] Test rollback procedures
- [ ] Document deployment process
- [ ] Train support staff

### Post-Deployment
- [ ] Monitor application logs
- [ ] Verify all features working
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Update documentation

### Maintenance
- [ ] Regular security updates
- [ ] Performance monitoring
- [ ] Log rotation and cleanup
- [ ] Configuration backups
- [ ] User training and support

## Support

### Documentation
- Installation Guide: `docs/INSTALLATION.md`
- Configuration: `docs/DEVELOPMENT.md`
- Troubleshooting: `docs/TROUBLESHOOTING.md`

### Contact
- Technical Support: support@streamgrid.com
- Enterprise Sales: enterprise@streamgrid.com
- Security Issues: security@streamgrid.com

This deployment guide should help you successfully deploy StreamGRID in your environment. For additional assistance, consult the full documentation or contact support.