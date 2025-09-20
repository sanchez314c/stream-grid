import { EventEmitter } from 'events';
// os import removed as not currently used
import * as fs from 'fs/promises';

interface NetworkStats {
  bytesReceived: number;
  bytesSent: number;
  packetsReceived: number;
  packetsSent: number;
  interface: string;
  timestamp: number;
}

interface BandwidthMetrics {
  downloadSpeedMbps: number;
  uploadSpeedMbps: number;
  totalDownloadMB: number;
  totalUploadMB: number;
  packetsPerSecond: number;
  timestamp: number;
  networkInterface: string;
}

export class BandwidthMonitor extends EventEmitter {
  private previousStats: Map<string, NetworkStats> = new Map();
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  private readonly updateInterval: number = 2000; // 2 seconds

  constructor() {
    super();
  }

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    
    // Get initial baseline
    await this.updateNetworkStats();
    
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.updateNetworkStats();
      } catch (error) {
        console.error('Error updating network stats:', error);
        this.emit('error', error);
      }
    }, this.updateInterval);

    this.emit('started');
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    this.emit('stopped');
  }

  private async updateNetworkStats(): Promise<void> {
    const currentStats = await this.getNetworkStats();
    const timestamp = Date.now();
    
    if (this.previousStats.size > 0) {
      // Calculate bandwidth for each interface
      for (const [interfaceName, currentStat] of currentStats.entries()) {
        const previousStat = this.previousStats.get(interfaceName);
        
        if (previousStat) {
          const timeDiffSeconds = (timestamp - previousStat.timestamp) / 1000;
          
          if (timeDiffSeconds > 0) {
            const downloadBytes = currentStat.bytesReceived - previousStat.bytesReceived;
            const uploadBytes = currentStat.bytesSent - previousStat.bytesSent;
            const downloadPackets = currentStat.packetsReceived - previousStat.packetsReceived;
            const uploadPackets = currentStat.packetsSent - previousStat.packetsSent;
            
            const metrics: BandwidthMetrics = {
              downloadSpeedMbps: (downloadBytes * 8) / (timeDiffSeconds * 1000000), // Convert to Mbps
              uploadSpeedMbps: (uploadBytes * 8) / (timeDiffSeconds * 1000000),
              totalDownloadMB: currentStat.bytesReceived / (1024 * 1024),
              totalUploadMB: currentStat.bytesSent / (1024 * 1024),
              packetsPerSecond: (downloadPackets + uploadPackets) / timeDiffSeconds,
              timestamp,
              networkInterface: interfaceName
            };
            
            this.emit('metrics', metrics);
          }
        }
      }
    }
    
    this.previousStats = currentStats;
  }

  private async getNetworkStats(): Promise<Map<string, NetworkStats>> {
    const platform = process.platform;
    const timestamp = Date.now();
    
    if (platform === 'linux') {
      return this.getLinuxNetworkStats(timestamp);
    } else if (platform === 'darwin') {
      return this.getMacNetworkStats(timestamp);
    } else if (platform === 'win32') {
      return this.getWindowsNetworkStats(timestamp);
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  private async getLinuxNetworkStats(timestamp: number): Promise<Map<string, NetworkStats>> {
    const stats = new Map<string, NetworkStats>();
    
    try {
      const data = await fs.readFile('/proc/net/dev', 'utf8');
      const lines = data.split('\n').slice(2); // Skip header lines
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 17) {
          const interfaceName = parts[0].replace(':', '');
          
          // Skip loopback and inactive interfaces
          if (interfaceName === 'lo' || parts[1] === '0') continue;
          
          stats.set(interfaceName, {
            bytesReceived: parseInt(parts[1]) || 0,
            packetsReceived: parseInt(parts[2]) || 0,
            bytesSent: parseInt(parts[9]) || 0,
            packetsSent: parseInt(parts[10]) || 0,
            interface: interfaceName,
            timestamp
          });
        }
      }
    } catch (error) {
      console.error('Error reading Linux network stats:', error);
    }
    
    return stats;
  }

  private async getMacNetworkStats(timestamp: number): Promise<Map<string, NetworkStats>> {
    const stats = new Map<string, NetworkStats>();
    
    try {
      const { spawn } = require('child_process');
      const netstat = spawn('netstat', ['-ib']);
      let output = '';
      
      await new Promise((resolve, reject) => {
        netstat.stdout.on('data', (data: Buffer) => {
          output += data.toString();
        });
        
        netstat.on('close', (code: number) => {
          if (code === 0) {
            resolve(output);
          } else {
            reject(new Error(`netstat exited with code ${code}`));
          }
        });
        
        netstat.on('error', reject);
      });
      
      const lines = output.split('\n');
      for (let i = 1; i < lines.length; i++) { // Skip header
        const parts = lines[i].trim().split(/\s+/);
        if (parts.length >= 8) {
          const interfaceName = parts[0];
          
          // Skip loopback and inactive interfaces
          if (interfaceName === 'lo0' || !parts[6] || parts[6] === '0') continue;
          
          stats.set(interfaceName, {
            bytesReceived: parseInt(parts[6]) || 0,
            packetsReceived: parseInt(parts[4]) || 0,
            bytesSent: parseInt(parts[9]) || 0,
            packetsSent: parseInt(parts[7]) || 0,
            interface: interfaceName,
            timestamp
          });
        }
      }
    } catch (error) {
      console.error('Error reading Mac network stats:', error);
    }
    
    return stats;
  }

  private async getWindowsNetworkStats(_timestamp: number): Promise<Map<string, NetworkStats>> {
    const stats = new Map<string, NetworkStats>();
    
    try {
      const { spawn } = require('child_process');
      const typeperf = spawn('typeperf', [
        '\\Network Interface(*)\\Bytes Received/sec',
        '\\Network Interface(*)\\Bytes Sent/sec',
        '\\Network Interface(*)\\Packets Received/sec',
        '\\Network Interface(*)\\Packets Sent/sec',
        '-sc', '1'
      ]);
      let output = '';
      
      await new Promise((resolve, reject) => {
        typeperf.stdout.on('data', (data: Buffer) => {
          output += data.toString();
        });
        
        typeperf.on('close', (code: number) => {
          if (code === 0) {
            resolve(output);
          } else {
            reject(new Error(`typeperf exited with code ${code}`));
          }
        });
        
        typeperf.on('error', reject);
      });
      
      // Parse typeperf output (implementation would be more complex)
      // This is a simplified version - parsing would go here
      // Currently returns empty stats as Windows implementation is placeholder
      
    } catch (error) {
      console.error('Error reading Windows network stats:', error);
    }
    
    return stats;
  }

  getCurrentMetrics(): Promise<BandwidthMetrics[]> {
    return new Promise((resolve) => {
      const metrics: BandwidthMetrics[] = [];
      
      const collectMetrics = (metric: BandwidthMetrics) => {
        metrics.push(metric);
      };
      
      this.once('metrics', collectMetrics);
      
      // Collect metrics for a short time
      setTimeout(() => {
        this.removeListener('metrics', collectMetrics);
        resolve(metrics);
      }, this.updateInterval + 500);
    });
  }
}

// Singleton instance
export const bandwidthMonitor = new BandwidthMonitor();