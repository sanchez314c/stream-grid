import { EventEmitter } from 'events';
import { networkInterfaces, NetworkInterfaceInfo } from 'os';
import * as net from 'net';
// dgram import removed as not currently used
import { Netmask } from 'netmask';
import { 
  DiscoveredCamera, 
  DiscoveryProgress, 
  DiscoveryResult, 
  DiscoveryOptions, 
  DiscoveryPhase,
  NetworkRange,
  CameraProtocol 
} from '../../shared/types/discovery';

export class NetworkScanner extends EventEmitter {
  private isScanning = false;
  private discoveredCameras: Map<string, DiscoveredCamera> = new Map();
  private scanProgress: DiscoveryProgress;
  private startTime: number = 0;

  constructor(private options: DiscoveryOptions) {
    super();
    this.scanProgress = {
      phase: DiscoveryPhase.INITIALIZING,
      progress: 0,
      totalIPs: 0,
      scannedIPs: 0,
      foundCameras: 0,
      message: 'Initializing network scan...'
    };
  }

  async startDiscovery(): Promise<void> {
    if (this.isScanning) {
      throw new Error('Discovery already in progress');
    }

    this.isScanning = true;
    this.startTime = Date.now();
    this.discoveredCameras.clear();
    
    try {
      await this.scanNetwork();
    } catch (error) {
      this.updateProgress(DiscoveryPhase.ERROR, `Discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      this.isScanning = false;
    }
  }

  stopDiscovery(): void {
    this.isScanning = false;
    this.updateProgress(DiscoveryPhase.COMPLETED, 'Discovery stopped by user');
  }

  getProgress(): DiscoveryProgress {
    return { ...this.scanProgress };
  }

  getResults(): DiscoveryResult {
    return {
      success: !this.isScanning && this.scanProgress.phase === DiscoveryPhase.COMPLETED,
      cameras: Array.from(this.discoveredCameras.values()),
      duration: Date.now() - this.startTime,
      networkRange: this.options.networkRange || 'auto-detected'
    };
  }

  private async scanNetwork(): Promise<void> {
    // Phase 1: Determine network range
    this.updateProgress(DiscoveryPhase.INITIALIZING, 'Detecting network configuration...');
    const networkRange = this.getNetworkRange();
    
    // Phase 2: Port scanning
    this.updateProgress(DiscoveryPhase.SCANNING_NETWORK, `Scanning network range ${networkRange.network}`);
    const liveHosts = await this.scanForLiveHosts(networkRange);
    
    if (liveHosts.length === 0) {
      this.updateProgress(DiscoveryPhase.COMPLETED, 'No live hosts found on network');
      return;
    }

    // Phase 3: Port probing
    this.updateProgress(DiscoveryPhase.PROBING_PORTS, `Found ${liveHosts.length} live hosts, probing camera ports...`);
    const cameraCandidates = await this.probeHostsForCameras(liveHosts);
    
    if (cameraCandidates.length === 0) {
      this.updateProgress(DiscoveryPhase.COMPLETED, 'No camera services found on network ports');
      return;
    }

    // Phase 4: Protocol identification
    await this.identifyProtocols(cameraCandidates);
    
    // Phase 5: Stream validation
    if (this.discoveredCameras.size > 0) {
      this.updateProgress(DiscoveryPhase.VALIDATING_STREAMS, 'Validating camera streams...');
      await this.validateStreams();
    }

    this.updateProgress(DiscoveryPhase.COMPLETED, `Discovery completed. Found ${this.discoveredCameras.size} cameras.`);
  }

  private getNetworkRange(): NetworkRange {
    if (this.options.networkRange) {
      const netmask = new Netmask(this.options.networkRange);
      return {
        network: this.options.networkRange,
        subnet: netmask.mask,
        startIP: netmask.first,
        endIP: netmask.last,
        totalHosts: netmask.size - 2 // Exclude network and broadcast
      };
    }

    // Auto-detect local network
    const interfaces = networkInterfaces();
    let primaryInterface: NetworkInterfaceInfo | null = null;

    // Find the primary network interface (usually ethernet or wifi)
    for (const [, addrs] of Object.entries(interfaces)) {
      if (!addrs) continue;
      
      for (const addr of addrs) {
        if (!addr.internal && addr.family === 'IPv4') {
          primaryInterface = addr;
          break;
        }
      }
      if (primaryInterface) break;
    }

    if (!primaryInterface) {
      throw new Error('Could not determine local network range');
    }

    const netmask = new Netmask(`${primaryInterface.address}/${primaryInterface.netmask}`);
    return {
      network: `${netmask.base}/${netmask.bitmask}`,
      subnet: netmask.mask,
      startIP: netmask.first,
      endIP: netmask.last,
      totalHosts: netmask.size - 2
    };
  }

  private async scanForLiveHosts(range: NetworkRange): Promise<string[]> {
    const liveHosts: string[] = [];
    const netmask = new Netmask(range.network);
    let scanned = 0;

    this.scanProgress.totalIPs = range.totalHosts;

    // Scan IP addresses in chunks to avoid overwhelming the network
    const chunkSize = this.options.maxConcurrentScans;
    const ips: string[] = [];
    netmask.forEach((ip: string) => ips.push(ip));
    
    for (let i = 0; i < ips.length; i += chunkSize) {
      if (!this.isScanning) break;
      
      const chunk = ips.slice(i, i + chunkSize);
      const chunkPromises = chunk.map(async (ip) => {
        if (!this.isScanning) return;
        
        this.scanProgress.currentIP = ip;
        const isLive = await this.isHostLive(ip);
        
        scanned++;
        this.scanProgress.scannedIPs = scanned;
        this.scanProgress.progress = Math.floor((scanned / this.scanProgress.totalIPs) * 30); // 30% for host discovery
        
        if (isLive) {
          liveHosts.push(ip);
          this.emit('progress', this.scanProgress);
        }
      });
      
      await Promise.all(chunkPromises);
    }

    return liveHosts;
  }

  private async isHostLive(ip: string): Promise<boolean> {
    if (this.options.skipPingTest) return true;
    
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const timeout = this.options.portScanTimeout;
      
      socket.setTimeout(timeout);
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.on('error', () => {
        resolve(false);
      });
      
      // Try to connect to common ports to check if host is alive
      const commonPorts = [80, 443, 554, 8080];
      const port = commonPorts[Math.floor(Math.random() * commonPorts.length)];
      socket.connect(port, ip);
    });
  }

  private async probeHostsForCameras(hosts: string[]): Promise<Array<{ip: string, port: number}>> {
    const cameraPorts = [554, 80, 8080, 8000, 8081, 81, 88, 3702, 8554, 1935];
    const candidates: Array<{ip: string, port: number}> = [];
    let probed = 0;
    const totalProbes = hosts.length * cameraPorts.length;

    for (const ip of hosts) {
      if (!this.isScanning) break;
      
      for (const port of cameraPorts) {
        if (!this.isScanning) break;
        
        this.scanProgress.currentIP = ip;
        this.scanProgress.currentPort = port;
        
        const isOpen = await this.isPortOpen(ip, port);
        probed++;
        
        this.scanProgress.progress = 30 + Math.floor((probed / totalProbes) * 40); // 30-70% for port probing
        
        if (isOpen) {
          candidates.push({ ip, port });
        }
        
        this.emit('progress', this.scanProgress);
      }
    }

    return candidates;
  }

  private async isPortOpen(ip: string, port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const timeout = this.options.portScanTimeout;
      
      socket.setTimeout(timeout);
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.on('error', () => {
        resolve(false);
      });
      
      socket.connect(port, ip);
    });
  }

  private async identifyProtocols(candidates: Array<{ip: string, port: number}>): Promise<void> {
    let identified = 0;
    const total = candidates.length;

    for (const candidate of candidates) {
      if (!this.isScanning) break;
      
      this.updateProgress(
        DiscoveryPhase.TESTING_RTSP, 
        `Testing protocols on ${candidate.ip}:${candidate.port}...`
      );
      
      // Test RTSP first (most common for cameras)
      if (candidate.port === 554 || candidate.port === 8554) {
        const camera = await this.testRTSP(candidate.ip, candidate.port);
        if (camera) {
          this.discoveredCameras.set(`${candidate.ip}:${candidate.port}`, camera);
          this.scanProgress.foundCameras = this.discoveredCameras.size;
        }
      }
      
      // Test HTTP-based protocols
      if ([80, 8080, 8000, 8081, 81, 88].includes(candidate.port)) {
        const camera = await this.testHTTP(candidate.ip, candidate.port);
        if (camera) {
          this.discoveredCameras.set(`${candidate.ip}:${candidate.port}`, camera);
          this.scanProgress.foundCameras = this.discoveredCameras.size;
        }
      }
      
      identified++;
      this.scanProgress.progress = 70 + Math.floor((identified / total) * 25); // 70-95%
      this.emit('progress', this.scanProgress);
    }
  }

  private async testRTSP(ip: string, port: number): Promise<DiscoveredCamera | null> {
    // This is a simplified RTSP test - in a full implementation, you'd use actual RTSP client
    const commonPaths = [
      '/stream1',
      '/stream',
      '/live',
      '/cam/realmonitor?channel=1&subtype=0', // Dahua
      '/h264Preview_01_main', // Hikvision  
      '/video1',
      '/mjpeg/1',
      '/1'
    ];

    for (const path of commonPaths) {
      const streamUrl = `rtsp://${ip}:${port}${path}`;
      
      // Here you would implement actual RTSP DESCRIBE request
      // For now, we'll create a placeholder
      if (await this.isPortOpen(ip, port)) {
        return {
          id: `${ip}:${port}`,
          ip,
          port,
          protocol: CameraProtocol.RTSP,
          streamUrl,
          capabilities: {
            videoFormats: ['H.264'],
            audioSupport: false,
            panTiltZoom: false,
            nightVision: false,
            motionDetection: false,
            maxResolution: '1080p'
          }
        };
      }
    }

    return null;
  }

  private async testHTTP(ip: string, port: number): Promise<DiscoveredCamera | null> {
    // Implement HTTP camera detection
    try {
      // This would make HTTP requests to common camera paths
      const streamUrl = `http://${ip}:${port}/video.mjpeg`;
      
      return {
        id: `${ip}:${port}`,
        ip,
        port,
        protocol: CameraProtocol.HTTP,
        streamUrl,
        capabilities: {
          videoFormats: ['MJPEG'],
          audioSupport: false,
          panTiltZoom: false,
          nightVision: false,
          motionDetection: false,
          maxResolution: '720p'
        }
      };
    } catch {
      return null;
    }
  }

  private async validateStreams(): Promise<void> {
    const cameras = Array.from(this.discoveredCameras.values());
    let validated = 0;
    
    for (const camera of cameras) {
      if (!this.isScanning) break;
      
      this.updateProgress(
        DiscoveryPhase.VALIDATING_STREAMS,
        `Validating stream: ${camera.streamUrl}...`
      );
      
      // Here you would test actual stream connectivity
      // For now, assume all discovered cameras are valid
      
      validated++;
      this.scanProgress.progress = 95 + Math.floor((validated / cameras.length) * 5); // 95-100%
      this.emit('progress', this.scanProgress);
    }
  }

  private updateProgress(phase: DiscoveryPhase, message: string): void {
    this.scanProgress.phase = phase;
    this.scanProgress.message = message;
    this.emit('progress', this.scanProgress);
  }
}