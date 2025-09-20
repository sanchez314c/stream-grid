# StreamGRID Architecture

## Overview

StreamGRID follows Electron's multi-process architecture, combining the flexibility of web technologies with native desktop performance for professional RTMP stream monitoring.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     StreamGRID Desktop App                  │
├─────────────────────────────────────────────────────────────┤
│  Main Process (Node.js)          │  Renderer Process (React) │
│  ┌─────────────────────────────┐  │  ┌───────────────────────┐ │
│  │ Application Lifecycle       │  │  │ React UI Components   │ │
│  │ Window Management          │  │  │ Stream Grid Display   │ │
│  │ IPC Handlers              │  │  │ Controls & Modals     │ │
│  │ Database Operations        │  │  │ Status Indicators     │ │
│  │ Settings Management        │  │  └───────────────────────┘ │
│  │ Stream Validation          │  │                           │
│  │ Logger Configuration       │  │  ┌───────────────────────┐ │
│  └─────────────────────────────┘  │  │ State Management      │ │
│                                   │  │ - Zustand Store      │ │
├─────────────────────────────────────────────────────────────┤  │ - React Query       │ │
│                 Preload Scripts                             │  │ - Immer Updates     │ │
│  ┌─────────────────────────────────────────────────────────┐  │  └───────────────────────┘ │
│  │ Context Bridge: Secure IPC between Main & Renderer     │  │                           │
│  └─────────────────────────────────────────────────────────┘  └───────────────────────────┘
└─────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                     External Systems                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │ RTMP Servers    │  │ Local SQLite DB │  │ File System  │  │
│  │ - Stream URLs   │  │ - Stream Library│  │ - Settings   │  │
│  │ - Authentication│  │ - User Prefs    │  │ - Logs       │  │
│  │ - Metadata      │  │ - Statistics    │  │ - Cache      │  │
│  └─────────────────┘  └─────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Process Architecture

### Main Process (`src/main/`)

**Responsibilities:**
- Application lifecycle management
- Window creation and management
- File system and database operations
- Settings persistence
- Inter-process communication (IPC)
- Native OS integration

**Key Components:**

#### Application Entry Point (`index.ts`)
```typescript
class StreamGRIDApp {
  private mainWindow: BrowserWindow | null = null;
  private settings: Settings;
  private database: Database;
  
  async initialize() {
    await this.setupDatabase();
    await this.loadSettings();
    this.setupIpcHandlers();
    this.createMainWindow();
  }
}
```

#### Window Management (`window.ts`)
- Creates and configures BrowserWindow instances
- Handles window state persistence
- Manages fullscreen and presentation modes
- Implements window event handling

#### Database Layer (`database/`)
- SQLite connection management
- Stream library operations
- Configuration storage
- Statistics tracking
- Migration handling

#### IPC Handlers (`ipc/`)
- Stream validation and management
- Settings read/write operations
- Database query interfaces
- File system operations

### Renderer Process (`src/renderer/`)

**Responsibilities:**
- User interface rendering
- User interaction handling
- Stream display coordination
- Client-side state management
- Real-time updates and notifications

**Component Hierarchy:**
```
App.tsx
├── HeaderBar.tsx
│   ├── LayoutSelector
│   ├── StreamControls
│   └── SettingsButton
├── StreamGrid.tsx
│   └── StreamTile.tsx[] (dynamic based on layout)
│       ├── VideoPlayer.tsx
│       └── StreamControls
├── StatusBar.tsx
└── Modals/
    ├── AddStreamModal.tsx
    └── SettingsModal.tsx
```

#### State Architecture

**Global State (Zustand)**
```typescript
interface AppState {
  streams: StreamState[];
  layout: GridLayout;
  settings: AppSettings;
  ui: UIState;
}

// Stream slice
interface StreamState {
  id: string;
  url: string;
  status: StreamStatus;
  metadata: StreamMetadata;
  statistics: StreamStatistics;
}

// UI slice  
interface UIState {
  activeModals: ModalType[];
  notifications: Notification[];
  loadingStates: Record<string, boolean>;
}
```

**Server State (React Query)**
- Stream validation queries
- Settings persistence
- Database operations
- Real-time stream health monitoring

### Preload Scripts (`src/preload/`)

**Context Bridge Implementation:**
```typescript
interface ElectronAPI {
  // Stream operations
  validateStream: (url: string) => Promise<ValidationResult>;
  addStream: (stream: StreamConfig) => Promise<void>;
  removeStream: (id: string) => Promise<void>;
  
  // Settings
  getSettings: () => Promise<Settings>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  
  // Database
  getStreamLibrary: () => Promise<SavedStream[]>;
  saveStream: (stream: SavedStream) => Promise<void>;
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
```

## Data Flow Architecture

### Stream Management Flow
```
1. User adds RTMP URL
   ↓
2. Renderer → Main: validateStream(url)
   ↓
3. Main validates URL and metadata
   ↓
4. Main → Renderer: ValidationResult
   ↓
5. If valid: Renderer adds to Zustand store
   ↓
6. StreamTile component receives stream config
   ↓
7. VideoPlayer (HLS.js) connects to stream
   ↓
8. Status updates flow back through state
```

### Settings Persistence Flow
```
1. User modifies settings in UI
   ↓
2. Zustand state updated immediately
   ↓
3. React Query mutation triggered
   ↓
4. Renderer → Main: updateSettings()
   ↓
5. Main persists to electron-store
   ↓
6. Main → Renderer: confirmation
   ↓
7. UI reflects saved state
```

### Database Operations Flow
```
1. User saves stream to library
   ↓
2. Renderer → Main: saveStream(config)
   ↓
3. Main validates and sanitizes data
   ↓
4. SQLite INSERT/UPDATE operation
   ↓
5. Main → Renderer: operation result
   ↓
6. React Query invalidates cache
   ↓
7. UI updates with fresh data
```

## Security Architecture

### Process Isolation
- **Main Process**: Full Node.js API access
- **Renderer Process**: Sandboxed browser environment
- **Context Bridge**: Limited, type-safe API exposure

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-eval'; 
               connect-src 'self' rtmp: ws: wss:; 
               media-src 'self' rtmp: http: https:;">
```

### Data Validation
- All IPC inputs validated and sanitized
- Stream URL validation prevents code injection
- Database queries use parameterized statements
- Settings validation prevents malicious configurations

## Performance Architecture

### Resource Management Strategy
```
┌─────────────────────────────────────────┐
│           Performance Layers            │
├─────────────────────────────────────────┤
│ React Optimization                      │
│ ├─ React.memo for expensive components  │
│ ├─ useMemo for heavy calculations       │
│ ├─ useCallback for stable references    │
│ └─ Component lazy loading               │
├─────────────────────────────────────────┤
│ State Management                        │
│ ├─ Normalized store structure           │
│ ├─ Selective subscriptions              │
│ ├─ Computed values with selectors       │
│ └─ Debounced updates                    │
├─────────────────────────────────────────┤
│ Video Processing                        │
│ ├─ Hardware acceleration detection      │
│ ├─ Adaptive quality adjustment          │
│ ├─ Memory pool management               │
│ └─ Frame dropping under load            │
├─────────────────────────────────────────┤
│ System Resources                        │
│ ├─ CPU usage monitoring                 │
│ ├─ Memory leak prevention               │
│ ├─ Network bandwidth management         │
│ └─ Background process optimization      │
└─────────────────────────────────────────┘
```

### Video Rendering Pipeline
```
RTMP Stream → HLS.js Decoder → Canvas/Video Element → GPU Composite → Display
     ↓              ↓                    ↓                ↓
Network Buffer → Decode Buffer → Render Buffer → Frame Buffer
```

### Memory Management
- **Stream Buffers**: Automatic cleanup after disconnection
- **Component Cleanup**: useEffect cleanup functions
- **Event Listeners**: Proper removal on unmount
- **Large Objects**: WeakMap references where applicable

## Error Handling Architecture

### Error Boundaries and Recovery
```typescript
// Stream Error Boundary
class StreamErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to main process
    window.electronAPI.logError({
      error: error.message,
      stack: error.stack,
      context: 'stream-rendering',
      metadata: errorInfo
    });
    
    // Attempt stream recovery
    this.attemptStreamRecovery();
  }
}

// Network Error Handling
const handleStreamError = (streamId: string, error: StreamError) => {
  switch (error.type) {
    case 'CONNECTION_FAILED':
      scheduleReconnect(streamId);
      break;
    case 'STREAM_UNAVAILABLE':
      markStreamOffline(streamId);
      break;
    case 'DECODE_ERROR':
      fallbackToSoftwareDecoder(streamId);
      break;
  }
};
```

### Logging Strategy
```typescript
interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  category: 'stream' | 'ui' | 'system' | 'performance';
  message: string;
  metadata?: Record<string, any>;
  streamId?: string;
}

class Logger {
  log(entry: LogEntry) {
    // Console output in development
    if (isDevelopment) console.log(entry);
    
    // File logging in production
    this.writeToFile(entry);
    
    // Critical errors to main process
    if (entry.level === 'critical') {
      window.electronAPI.reportCriticalError(entry);
    }
  }
}
```

## Extensibility Architecture

### Plugin Interface (Future)
```typescript
interface StreamGRIDPlugin {
  name: string;
  version: string;
  activate(context: PluginContext): void;
  deactivate(): void;
}

interface PluginContext {
  registerStreamHandler(protocol: string, handler: StreamHandler): void;
  registerUIComponent(slot: string, component: ComponentType): void;
  addMenuItem(menu: MenuDefinition): void;
  subscribeToEvents(events: EventSubscription[]): void;
}
```

### Configuration System
```typescript
interface ConfigurationSchema {
  performance: PerformanceConfig;
  ui: UIConfig;
  streams: StreamConfig;
  plugins: PluginConfig;
}

class ConfigManager {
  private schema: ConfigurationSchema;
  private validators: Record<string, ConfigValidator>;
  
  validate(config: Partial<ConfigurationSchema>): ValidationResult;
  migrate(oldVersion: string, newVersion: string): MigrationResult;
  export(): ConfigExport;
  import(config: ConfigExport): ImportResult;
}
```

This architecture provides a solid foundation for professional-grade multi-stream monitoring while maintaining flexibility for future enhancements and ensuring reliable performance under demanding conditions.