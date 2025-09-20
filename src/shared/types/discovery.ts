// Network Camera Discovery Types

export interface DiscoveredCamera {
  id: string;
  ip: string;
  port: number;
  protocol: CameraProtocol;
  manufacturer?: string;
  model?: string;
  name?: string;
  streamUrl: string;
  thumbnailUrl?: string;
  capabilities: CameraCapabilities;
  authentication?: AuthenticationInfo;
}

export enum CameraProtocol {
  RTSP = 'rtsp',
  HTTP = 'http',
  HTTPS = 'https',
  ONVIF = 'onvif',
  MJPEG = 'mjpeg'
}

export interface CameraCapabilities {
  videoFormats: string[];
  audioSupport: boolean;
  panTiltZoom: boolean;
  nightVision: boolean;
  motionDetection: boolean;
  maxResolution: string;
}

export interface AuthenticationInfo {
  required: boolean;
  methods: AuthMethod[];
}

export enum AuthMethod {
  BASIC = 'basic',
  DIGEST = 'digest',
  TOKEN = 'token'
}

export interface DiscoveryProgress {
  phase: DiscoveryPhase;
  currentIP?: string;
  currentPort?: number;
  progress: number; // 0-100
  totalIPs: number;
  scannedIPs: number;
  foundCameras: number;
  message: string;
}

export enum DiscoveryPhase {
  INITIALIZING = 'initializing',
  SCANNING_NETWORK = 'scanning_network',
  PROBING_PORTS = 'probing_ports',
  TESTING_RTSP = 'testing_rtsp',
  TESTING_HTTP = 'testing_http',
  ONVIF_DISCOVERY = 'onvif_discovery',
  VALIDATING_STREAMS = 'validating_streams',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export interface DiscoveryResult {
  success: boolean;
  cameras: DiscoveredCamera[];
  duration: number; // in milliseconds
  networkRange: string;
  error?: string;
}

export interface DiscoveryOptions {
  networkRange?: string;
  portScanTimeout: number;
  maxConcurrentScans: number;
  skipPingTest: boolean;
  protocols: CameraProtocol[];
  deepScan: boolean;
}

export interface NetworkRange {
  network: string;
  subnet: string;
  startIP: string;
  endIP: string;
  totalHosts: number;
}

export interface ManufacturerPattern {
  manufacturer: string;
  patterns: {
    userAgent?: string[];
    serverHeader?: string[];
    htmlKeywords?: string[];
    defaultPorts?: number[];
    rtspPaths?: string[];
    httpPaths?: string[];
  };
}

// Discovery API for IPC
export interface DiscoveryAPI {
  start: (options?: Partial<DiscoveryOptions>) => Promise<string>; // returns discovery session ID
  stop: (sessionId: string) => Promise<void>;
  getProgress: (sessionId: string) => Promise<DiscoveryProgress>;
  getResults: (sessionId: string) => Promise<DiscoveryResult>;
}