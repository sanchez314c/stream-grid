import { EventEmitter } from 'events';
import { NetworkScanner } from './network-scanner';
import { 
  DiscoveryOptions, 
  DiscoveryProgress, 
  DiscoveryResult,
  CameraProtocol
} from '../../shared/types/discovery';

interface DiscoverySession {
  id: string;
  scanner: NetworkScanner;
  startTime: number;
  options: DiscoveryOptions;
}

export class DiscoveryService extends EventEmitter {
  private activeSessions = new Map<string, DiscoverySession>();

  constructor() {
    super();
  }

  async startDiscovery(sessionId: string, options: Partial<DiscoveryOptions> = {}): Promise<void> {
    if (this.activeSessions.has(sessionId)) {
      throw new Error(`Discovery session ${sessionId} already exists`);
    }

    const fullOptions: DiscoveryOptions = {
      portScanTimeout: 2000,
      maxConcurrentScans: 20,
      skipPingTest: false,
      protocols: [
        CameraProtocol.RTSP,
        CameraProtocol.HTTP,
        CameraProtocol.ONVIF,
        CameraProtocol.MJPEG
      ],
      deepScan: false,
      ...options
    };

    const scanner = new NetworkScanner(fullOptions);
    const session: DiscoverySession = {
      id: sessionId,
      scanner,
      startTime: Date.now(),
      options: fullOptions
    };

    this.activeSessions.set(sessionId, session);

    // Forward scanner events
    scanner.on('progress', (progress: DiscoveryProgress) => {
      this.emit('discovery:progress', sessionId, progress);
    });

    try {
      await scanner.startDiscovery();
      this.emit('discovery:completed', sessionId, scanner.getResults());
    } catch (error) {
      this.emit('discovery:error', sessionId, error);
      throw error;
    }
  }

  async stopDiscovery(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Discovery session ${sessionId} not found`);
    }

    session.scanner.stopDiscovery();
    this.activeSessions.delete(sessionId);
    this.emit('discovery:stopped', sessionId);
  }

  getProgress(sessionId: string): DiscoveryProgress {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Discovery session ${sessionId} not found`);
    }

    return session.scanner.getProgress();
  }

  getResults(sessionId: string): DiscoveryResult {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Discovery session ${sessionId} not found`);
    }

    return session.scanner.getResults();
  }

  getAllSessions(): string[] {
    return Array.from(this.activeSessions.keys());
  }

  cleanup(): void {
    // Stop all active sessions
    for (const [sessionId] of this.activeSessions) {
      this.stopDiscovery(sessionId).catch(console.error);
    }
    this.activeSessions.clear();
  }
}

// Singleton instance
export const discoveryService = new DiscoveryService();