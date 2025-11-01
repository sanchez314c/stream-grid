# StreamGRID API Reference

## Overview

StreamGRID exposes APIs through several interfaces:
- **Electron IPC API**: Communication between main and renderer processes
- **React Component API**: Public interfaces for UI components
- **Database API**: Stream library and settings persistence
- **Plugin API**: Extension points for future plugins

## Electron IPC API

### Stream Management

#### `validateStream(url: string): Promise<ValidationResult>`

Validates an RTMP stream URL and retrieves metadata.

**Parameters:**
- `url` (string): RTMP stream URL to validate

**Returns:**
```typescript
interface ValidationResult {
  valid: boolean;
  error?: string;
  metadata?: {
    width?: number;
    height?: number;
    fps?: number;
    bitrate?: number;
    codec?: string;
    audioCodec?: string;
    protocol?: string;
  };
}
```

**Example:**
```typescript
const result = await window.electronAPI.validateStream('rtmp://example.com/live/stream1');
if (result.valid) {
  console.log('Stream metadata:', result.metadata);
} else {
  console.error('Validation failed:', result.error);
}
```

#### `addStream(config: StreamConfig): Promise<string>`

Adds a new stream to the active grid.

**Parameters:**
```typescript
interface StreamConfig {
  url: string;
  label: string;
  position?: number;
  settings?: {
    volume?: number;
    muted?: boolean;
    priority?: number;
    autoReconnect?: boolean;
  };
}
```

**Returns:** Promise resolving to the stream ID

**Example:**
```typescript
const streamId = await window.electronAPI.addStream({
  url: 'rtmp://example.com/live/stream1',
  label: 'Camera 1',
  settings: {
    volume: 75,
    muted: false,
    autoReconnect: true
  }
});
```

#### `removeStream(id: string): Promise<void>`

Removes a stream from the grid.

**Parameters:**
- `id` (string): Stream ID to remove

#### `updateStream(id: string, updates: Partial<StreamConfig>): Promise<void>`

Updates stream configuration.

**Parameters:**
- `id` (string): Stream ID to update
- `updates` (Partial<StreamConfig>): Properties to update

#### `getStreamStatus(id: string): Promise<StreamStatus>`

Gets current stream status and statistics.

**Returns:**
```typescript
interface StreamStatus {
  id: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting';
  statistics: {
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
    lastError?: string;
  };
}
```

### Settings Management

#### `getSettings(): Promise<AppSettings>`

Retrieves current application settings.

**Returns:**
```typescript
interface AppSettings {
  general: {
    theme: 'dark' | 'light';
    language: string;
    checkUpdates: boolean;
    minimizeToTray: boolean;
  };
  performance: {
    hardwareAcceleration: boolean;
    maxStreams: number;
    bufferSize: number;
    adaptiveQuality: boolean;
  };
  grid: {
    defaultLayout: GridLayout;
    tileSpacing: number;
    showLabels: boolean;
    showStats: boolean;
  };
  streams: {
    defaultVolume: number;
    autoReconnect: boolean;
    reconnectAttempts: number;
    reconnectDelay: number;
  };
}
```

#### `updateSettings(settings: Partial<AppSettings>): Promise<void>`

Updates application settings.

**Parameters:**
- `settings` (Partial<AppSettings>): Settings to update

#### `resetSettings(): Promise<void>`

Resets all settings to default values.

### Stream Library Management

#### `getStreamLibrary(): Promise<SavedStream[]>`

Retrieves saved streams from the library.

**Returns:**
```typescript
interface SavedStream {
  id: string;
  url: string;
  label: string;
  category?: string;
  description?: string;
  metadata?: StreamMetadata;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}
```

#### `saveStream(stream: Omit<SavedStream, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>`

Saves a stream to the library.

**Returns:** Promise resolving to the saved stream ID

#### `updateSavedStream(id: string, updates: Partial<SavedStream>): Promise<void>`

Updates a saved stream.

#### `deleteSavedStream(id: string): Promise<void>`

Removes a stream from the library.

#### `importStreams(streams: SavedStream[]): Promise<ImportResult>`

Imports streams from external source.

**Returns:**
```typescript
interface ImportResult {
  imported: number;
  failed: number;
  errors: string[];
}
```

#### `exportStreams(): Promise<SavedStream[]>`

Exports all saved streams.

### System Information

#### `getSystemInfo(): Promise<SystemInfo>`

Gets system information and capabilities.

**Returns:**
```typescript
interface SystemInfo {
  platform: string;
  arch: string;
  version: string;
  memory: {
    total: number;
    used: number;
    available: number;
  };
  cpu: {
    model: string;
    cores: number;
    usage: number;
  };
  gpu: {
    vendor: string;
    renderer: string;
    accelerationEnabled: boolean;
  };
}
```

#### `getPerformanceMetrics(): Promise<PerformanceMetrics>`

Gets real-time performance metrics.

**Returns:**
```typescript
interface PerformanceMetrics {
  cpu: number;
  memory: number;
  gpu: number;
  network: {
    totalBandwidth: number;
    streamBandwidth: Record<string, number>;
  };
  streams: {
    total: number;
    active: number;
    errors: number;
  };
}
```

### Events

#### Stream Events

Listen for stream-related events:

```typescript
window.electronAPI.onStreamStatusChanged((event, data) => {
  console.log(`Stream ${data.id} status changed to ${data.status}`);
});

window.electronAPI.onStreamError((event, data) => {
  console.error(`Stream ${data.id} error:`, data.error);
});

window.electronAPI.onStreamConnected((event, data) => {
  console.log(`Stream ${data.id} connected with metadata:`, data.metadata);
});
```

#### System Events

```typescript
window.electronAPI.onSettingsChanged((event, settings) => {
  console.log('Settings updated:', settings);
});

window.electronAPI.onPerformanceAlert((event, alert) => {
  console.warn('Performance alert:', alert);
});
```

## React Component API

### StreamGrid Component

```typescript
interface StreamGridProps {
  streams: Stream[];
  layout: GridLayout;
  onStreamSelect?: (streamId: string) => void;
  onStreamRemove?: (streamId: string) => void;
  className?: string;
}

<StreamGrid
  streams={streams}
  layout="2x2"
  onStreamSelect={handleStreamSelect}
  onStreamRemove={handleStreamRemove}
/>
```

### StreamTile Component

```typescript
interface StreamTileProps {
  stream: Stream;
  showControls?: boolean;
  showStats?: boolean;
  onVolumeChange?: (volume: number) => void;
  onMuteToggle?: (muted: boolean) => void;
  onRefresh?: () => void;
  onRemove?: () => void;
  className?: string;
}

<StreamTile
  stream={stream}
  showControls={true}
  showStats={false}
  onVolumeChange={handleVolumeChange}
  onMuteToggle={handleMuteToggle}
/>
```

### VideoPlayer Component

```typescript
interface VideoPlayerProps {
  src: string;
  muted?: boolean;
  volume?: number;
  autoPlay?: boolean;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: Error) => void;
  onProgress?: (stats: PlaybackStats) => void;
  className?: string;
}

<VideoPlayer
  src={stream.url}
  muted={stream.muted}
  volume={stream.volume}
  onError={handleStreamError}
  onProgress={handleStreamProgress}
/>
```

### AddStreamModal Component

```typescript
interface AddStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStream: (config: StreamConfig) => void;
  savedStreams?: SavedStream[];
}

<AddStreamModal
  isOpen={showAddModal}
  onClose={() => setShowAddModal(false)}
  onAddStream={handleAddStream}
  savedStreams={streamLibrary}
/>
```

## Database API

### Stream Library Schema

```sql
CREATE TABLE streams (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  label TEXT NOT NULL,
  category TEXT,
  description TEXT,
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  tags TEXT -- JSON array
);

CREATE INDEX idx_streams_category ON streams(category);
CREATE INDEX idx_streams_created ON streams(created_at);
```

### Settings Schema

```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL, -- JSON
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Statistics Schema

```sql
CREATE TABLE stream_statistics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stream_id TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  cpu_usage REAL,
  memory_usage REAL,
  bandwidth REAL,
  fps REAL,
  dropped_frames INTEGER,
  latency REAL
);

CREATE INDEX idx_stats_stream_time ON stream_statistics(stream_id, timestamp);
```

## Error Handling

### Error Types

```typescript
enum StreamErrorType {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  STREAM_UNAVAILABLE = 'STREAM_UNAVAILABLE',
  DECODE_ERROR = 'DECODE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR'
}

interface StreamError {
  type: StreamErrorType;
  message: string;
  code?: number;
  details?: Record<string, any>;
  timestamp: Date;
  streamId?: string;
}
```

### Error Recovery

```typescript
interface RecoveryStrategy {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  fallbackActions: FallbackAction[];
}

enum FallbackAction {
  RETRY_CONNECTION = 'RETRY_CONNECTION',
  REDUCE_QUALITY = 'REDUCE_QUALITY',
  SWITCH_DECODER = 'SWITCH_DECODER',
  NOTIFY_USER = 'NOTIFY_USER',
  MARK_OFFLINE = 'MARK_OFFLINE'
}
```

## Plugin API (Future)

### Plugin Interface

```typescript
interface StreamGRIDPlugin {
  name: string;
  version: string;
  description: string;
  author: string;
  
  activate(context: PluginContext): Promise<void>;
  deactivate(): Promise<void>;
  
  // Optional lifecycle methods
  onStreamAdded?(stream: Stream): Promise<void>;
  onStreamRemoved?(streamId: string): Promise<void>;
  onSettingsChanged?(settings: AppSettings): Promise<void>;
}

interface PluginContext {
  // Stream management
  registerStreamHandler(protocol: string, handler: StreamHandler): void;
  unregisterStreamHandler(protocol: string): void;
  
  // UI extension
  registerComponent(slot: string, component: ComponentType): void;
  registerMenuItem(menu: MenuDefinition): void;
  registerKeyboardShortcut(shortcut: KeyboardShortcut): void;
  
  // Data access
  getStreams(): Promise<Stream[]>;
  getSettings(): Promise<AppSettings>;
  
  // Events
  onEvent(event: string, handler: EventHandler): void;
  emitEvent(event: string, data: any): void;
  
  // Storage
  getPluginData(key: string): Promise<any>;
  setPluginData(key: string, value: any): Promise<void>;
}
```

### Stream Handler Interface

```typescript
interface StreamHandler {
  protocol: string;
  validate(url: string): Promise<ValidationResult>;
  connect(url: string, config: StreamConfig): Promise<StreamConnection>;
  getMetadata(url: string): Promise<StreamMetadata>;
}

interface StreamConnection {
  id: string;
  disconnect(): Promise<void>;
  getStatus(): Promise<StreamStatus>;
  updateConfig(config: Partial<StreamConfig>): Promise<void>;
}
```

## Rate Limiting

API calls are rate limited to prevent abuse:

- **Stream operations**: 10 requests per second
- **Settings updates**: 5 requests per second  
- **Database queries**: 50 requests per second
- **System metrics**: 1 request per second

## Authentication

Currently, StreamGRID uses local-only APIs. Future versions may include:

- **API Keys**: For external integrations
- **OAuth**: For cloud service connections
- **JWT Tokens**: For session management
- **RBAC**: Role-based access control

## Versioning

The API follows semantic versioning (semver):
- **Major**: Breaking changes
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, backward compatible

Current API version: `1.0.0`

Breaking changes will be documented in the changelog and migration guides will be provided.