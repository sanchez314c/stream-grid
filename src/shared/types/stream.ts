export interface Stream {
  id: string;
  url: string;
  label: string;
  status: StreamStatus;
  metadata: StreamMetadata;
  settings: StreamSettings;
  statistics: StreamStatistics;
  createdAt: Date;
  updatedAt: Date;
}

export enum StreamStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
  RECONNECTING = 'reconnecting'
}

export interface StreamMetadata {
  width?: number;
  height?: number;
  fps?: number;
  bitrate?: number;
  codec?: string;
  audioCodec?: string;
  audioChannels?: number;
  audioSampleRate?: number;
  protocol?: string;
}

export interface StreamSettings {
  volume: number;
  muted: boolean;
  priority: number;
  reconnectAttempts: number;
  reconnectDelay: number;
  hardwareAcceleration: boolean;
  audioOutput: string;
}

export interface StreamStatistics {
  packetsReceived: number;
  packetsLost: number;
  bytesReceived: number;
  currentBitrate: number;
  averageBitrate: number;
  currentFps: number;
  averageFps: number;
  droppedFrames: number;
  latency: number;
  connectionTime: number;
  lastError: string | null;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  metadata?: Partial<StreamMetadata>;
}