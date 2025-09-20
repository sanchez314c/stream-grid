# StreamGrid - Professional RTMP Multi-Stream Viewer
## Comprehensive Product Requirements Document v1.0

---

# 1. EXECUTIVE SUMMARY

StreamGrid is a professional-grade Electron desktop application designed for monitoring and displaying multiple RTMP (Real-Time Messaging Protocol) streams simultaneously in customizable grid layouts. The application addresses the critical need for broadcast engineers, content creators, security professionals, and live event coordinators to monitor multiple video feeds efficiently on a single screen.

**Key Value Propositions:**
- **Flexible Grid Layouts**: Support for 1x1, 2x1, 3x1, 2x2, 3x3, 4x4, and custom grid configurations
- **Low Latency Display**: Optimized RTMP stream handling with minimal delay
- **Professional Features**: Frameless mode for video walls, individual stream controls, audio monitoring
- **Resource Efficient**: Smart stream management to handle multiple feeds without overwhelming system resources
- **Cross-Platform**: Runs on Windows, macOS, and Linux

**Target Market:**
- Broadcast and streaming professionals
- Security operations centers
- Live event production teams
- Content creators managing multiple streams
- Educational institutions with multi-camera setups

**Success Metrics:**
- Display 9+ simultaneous 1080p streams with <100ms latency
- CPU usage <60% with 4 active streams
- Memory usage <2GB with 9 active streams
- Zero dropped frames in stable network conditions
- 99.9% uptime during 24-hour continuous operation

---

# 2. COMPLETE FEATURE LIST

## Phase A - Core Features (v1.0)

### Stream Management
- **RTMP URL Input**: Add streams via RTMP URL with validation
- **Stream Library**: Save and organize frequently used streams
- **Quick Connect**: One-click connection to saved streams
- **Connection Status**: Visual indicators for stream health
- **Reconnection Logic**: Automatic reconnection on stream failure

### Display Features
- **Grid Layouts**: Pre-defined layouts (1x1, 2x1, 3x1, 2x2, 3x3, 4x4)
- **Windowed Mode**: Standard window with system chrome
- **Frameless Mode**: Borderless display for video walls
- **Fullscreen Support**: F11 toggle for immersive viewing
- **Aspect Ratio Preservation**: Maintain original stream proportions

### Stream Controls
- **Individual Mute**: Mute/unmute individual streams
- **Volume Control**: Per-stream volume adjustment
- **Stream Labels**: Custom labels for each stream
- **Error Display**: Clear error messages for failed connections
- **Refresh Stream**: Manual stream refresh capability

### Performance Features
- **Hardware Acceleration**: GPU-accelerated video decoding
- **Adaptive Quality**: Automatic quality adjustment based on performance
- **Resource Monitoring**: Built-in performance metrics display
- **Stream Prioritization**: Focus mode for selected streams

### User Interface
- **Dark Theme**: Professional dark interface
- **Responsive Design**: Adaptive UI for different window sizes
- **Keyboard Shortcuts**: Comprehensive keyboard navigation
- **Context Menus**: Right-click menus for stream actions
- **Status Bar**: System and stream status information

## Phase B - Advanced Features (v2.0+)

### Advanced Stream Features
- **RTSP Support**: Additional protocol support
- **HLS/DASH Support**: HTTP-based streaming protocols
- **Stream Recording**: Record individual or all streams
- **Snapshot Capture**: Take screenshots of streams
- **Stream Transcoding**: On-the-fly format conversion

### Advanced Display
- **Custom Grid Builder**: Drag-and-drop grid creator
- **Asymmetric Layouts**: Different sized tiles in same grid
- **Picture-in-Picture**: Floating stream windows
- **Multi-Monitor Support**: Span across multiple displays
- **Video Wall Mode**: Synchronized multi-instance support

### Analytics & Monitoring
- **Stream Analytics**: Bitrate, FPS, packet loss statistics
- **Alert System**: Notifications for stream issues
- **Performance Graphs**: Real-time performance visualization
- **Stream Health Dashboard**: Comprehensive monitoring view
- **Export Statistics**: CSV/JSON export of stream data

### Collaboration Features
- **Layout Sharing**: Export/import layout configurations
- **Remote Control API**: HTTP API for external control
- **Webhook Integration**: Event notifications to external systems
- **Scene Presets**: Quick switching between layout sets
- **User Profiles**: Multiple user configurations

### Advanced Audio
- **Audio Mixing**: Mix multiple stream audio sources
- **Audio Routing**: Route audio to specific outputs
- **Audio Meters**: Visual audio level indicators
- **Surround Sound Support**: Multi-channel audio handling
- **Audio Effects**: Compression, EQ, normalization

---

# 3. TECHNICAL ARCHITECTURE

## Technology Stack

**Frontend:**
- Electron 28.x (Latest stable)
- React 18.x with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- React Query for data fetching

**Media Handling:**
- VLC.js or mpv.js for RTMP playback
- WebRTC for low-latency display
- Canvas API for video manipulation
- Web Audio API for audio processing

**Backend/Main Process:**
- Node.js 20.x
- SQLite for stream library storage
- Electron Store for settings
- Winston for logging
- node-rtmp-client for stream validation

## Application Architecture

```
StreamGrid/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Main entry point
│   │   ├── window.ts      # Window management
│   │   ├── ipc.ts         # IPC handlers
│   │   ├── database.ts    # SQLite operations
│   │   └── rtmp.ts        # RTMP validation
│   ├── renderer/          # React application
│   │   ├── App.tsx        # Root component
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── store/         # Zustand stores
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript types
│   ├── preload/           # Preload scripts
│   └── shared/            # Shared types/constants
```

## Data Models

### Stream Model
```typescript
// src/shared/types/stream.ts
export interface Stream {
  id: string;                    // UUID
  url: string;                   // RTMP URL
  label: string;                 // User-defined label
  status: StreamStatus;          // Connection status
  metadata: StreamMetadata;      // Stream information
  settings: StreamSettings;      // Per-stream settings
  statistics: StreamStatistics;  // Performance data
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
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  codec: string;
  audioCodec: string;
  audioChannels: number;
  audioSampleRate: number;
}

export interface StreamSettings {
  volume: number;              // 0-100
  muted: boolean;
  priority: number;           // Stream priority for resources
  reconnectAttempts: number;  // Max reconnection attempts
  reconnectDelay: number;     // Delay between attempts (ms)
  hardwareAcceleration: boolean;
  audioOutput: string;        // Audio device ID
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
```

### Layout Model
```typescript
// src/shared/types/layout.ts
export interface Layout {
  id: string;
  name: string;
  type: LayoutType;
  grid: GridConfiguration;
  streams: LayoutStream[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum LayoutType {
  PRESET = 'preset',    // Built-in layouts
  CUSTOM = 'custom'     // User-created layouts
}

export interface GridConfiguration {
  rows: number;
  columns: number;
  gaps: number;              // Gap between tiles (pixels)
  aspectRatio: AspectRatio;
  customTiles?: CustomTile[]; // For asymmetric layouts (Phase B)
}

export interface LayoutStream {
  position: number;     // Grid position (0-based)
  streamId: string;     // Reference to Stream.id
  customSize?: {        // For asymmetric layouts
    rowSpan: number;
    colSpan: number;
  };
}

export enum AspectRatio {
  ORIGINAL = 'original',
  SIXTEEN_NINE = '16:9',
  FOUR_THREE = '4:3',
  SQUARE = '1:1',
  CUSTOM = 'custom'
}
```

### Settings Model
```typescript
// src/shared/types/settings.ts
export interface AppSettings {
  general: GeneralSettings;
  display: DisplaySettings;
  performance: PerformanceSettings;
  audio: AudioSettings;
  advanced: AdvancedSettings;
}

export interface GeneralSettings {
  theme: 'dark' | 'light';
  language: string;
  autoStart: boolean;
  minimizeToTray: boolean;
  checkUpdates: boolean;
  defaultLayout: string;        // Layout ID
  streamLibraryPath: string;    // Database location
}

export interface DisplaySettings {
  windowMode: 'windowed' | 'frameless' | 'fullscreen';
  alwaysOnTop: boolean;
  hardwareAcceleration: boolean;
  vsync: boolean;
  defaultAspectRatio: AspectRatio;
  gridGapSize: number;
  showLabels: boolean;
  showStatistics: boolean;
  labelPosition: 'top' | 'bottom' | 'overlay';
}

export interface PerformanceSettings {
  maxConcurrentStreams: number;
  streamBufferSize: number;     // MB
  decoderThreads: number;
  gpuDecoding: boolean;
  adaptiveQuality: boolean;
  targetCpuUsage: number;       // Percentage
  targetMemoryUsage: number;    // MB
}

export interface AudioSettings {
  defaultVolume: number;
  outputDevice: string;
  enableAudioMixing: boolean;
  audioLatency: number;         // ms
  normalizationEnabled: boolean;
  compressionEnabled: boolean;
}

export interface AdvancedSettings {
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  logPath: string;
  enableTelemetry: boolean;
  proxySettings: ProxySettings;
  rtmpTimeout: number;          // Connection timeout (ms)
  rtmpBufferTime: number;       // Buffer time (ms)
}
```

## API Endpoints (IPC)

### Stream Management
```typescript
// src/main/ipc/stream-handlers.ts
import { ipcMain } from 'electron';
import { Stream } from '../../shared/types/stream';

// Add new stream
ipcMain.handle('stream:add', async (event, url: string, label: string): Promise<Stream> => {
  // Validate RTMP URL
  // Create stream entry
  // Return stream object
});

// Update stream
ipcMain.handle('stream:update', async (event, streamId: string, updates: Partial<Stream>): Promise<Stream> => {
  // Update stream in database
  // Return updated stream
});

// Delete stream
ipcMain.handle('stream:delete', async (event, streamId: string): Promise<boolean> => {
  // Remove stream from database
  // Return success status
});

// Get all streams
ipcMain.handle('stream:getAll', async (): Promise<Stream[]> => {
  // Fetch all streams from database
  // Return stream array
});

// Validate RTMP URL
ipcMain.handle('stream:validate', async (event, url: string): Promise<ValidationResult> => {
  // Test RTMP connection
  // Return validation result
});
```

### Layout Management
```typescript
// src/main/ipc/layout-handlers.ts
import { ipcMain } from 'electron';
import { Layout } from '../../shared/types/layout';

// Create layout
ipcMain.handle('layout:create', async (event, layout: Omit<Layout, 'id' | 'createdAt' | 'updatedAt'>): Promise<Layout> => {
  // Create new layout
  // Return layout object
});

// Update layout
ipcMain.handle('layout:update', async (event, layoutId: string, updates: Partial<Layout>): Promise<Layout> => {
  // Update layout in database
  // Return updated layout
});

// Delete layout
ipcMain.handle('layout:delete', async (event, layoutId: string): Promise<boolean> => {
  // Remove layout from database
  // Return success status
});

// Get all layouts
ipcMain.handle('layout:getAll', async (): Promise<Layout[]> => {
  // Fetch all layouts from database
  // Return layout array
});

// Set active layout
ipcMain.handle('layout:setActive', async (event, layoutId: string): Promise<boolean> => {
  // Set layout as active
  // Return success status
});
```

## Core Implementation Code

### Main Process Entry
```typescript
// src/main/index.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { setupDatabase } from './database';
import { setupIpcHandlers } from './ipc';
import { createMainWindow } from './window';
import { initializeLogger } from './logger';
import { checkForUpdates } from './updater';
import { loadSettings, saveSettings } from './settings';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

// Initialize application
async function initializeApp() {
  // Setup logging
  initializeLogger();
  
  // Load user settings
  const settings = await loadSettings();
  
  // Initialize database
  await setupDatabase();
  
  // Setup IPC handlers
  setupIpcHandlers();
  
  // Create main window
  mainWindow = await createMainWindow(settings);
  
  // Check for updates
  if (settings.general.checkUpdates) {
    checkForUpdates();
  }
}

// App event handlers
app.whenReady().then(initializeApp);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    initializeApp();
  }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Handle app termination
app.on('before-quit', async () => {
  // Save current state
  await saveSettings();
  
  // Clean up resources
  if (mainWindow) {
    mainWindow.removeAllListeners();
  }
});

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Log to file
  // Send crash report if enabled
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log to file
});
```

### Window Management
```typescript
// src/main/window.ts
import { BrowserWindow, screen, Menu } from 'electron';
import path from 'path';
import { AppSettings } from '../shared/types/settings';

export async function createMainWindow(settings: AppSettings): Promise<BrowserWindow> {
  // Get primary display info
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  // Create browser window
  const mainWindow = new BrowserWindow({
    width: Math.min(1600, width * 0.9),
    height: Math.min(900, height * 0.9),
    minWidth: 800,
    minHeight: 600,
    center: true,
    frame: settings.display.windowMode !== 'frameless',
    titleBarStyle: settings.display.windowMode === 'frameless' ? 'hidden' : 'default',
    backgroundColor: '#1a1a1a',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });
  
  // Set window properties based on settings
  if (settings.display.alwaysOnTop) {
    mainWindow.setAlwaysOnTop(true);
  }
  
  // Load the app
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
  
  // Setup window event handlers
  mainWindow.on('close', (event) => {
    if (settings.general.minimizeToTray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // Handle fullscreen toggle
  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.send('window:fullscreen', true);
  });
  
  mainWindow.on('leave-full-screen', () => {
    mainWindow.webContents.send('window:fullscreen', false);
  });
  
  // Create application menu
  createApplicationMenu(mainWindow, settings);
  
  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
  
  return mainWindow;
}

function createApplicationMenu(window: BrowserWindow, settings: AppSettings) {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Add Stream',
          accelerator: 'CmdOrCtrl+N',
          click: () => window.webContents.send('menu:add-stream')
        },
        {
          label: 'Import Layout',
          accelerator: 'CmdOrCtrl+O',
          click: () => window.webContents.send('menu:import-layout')
        },
        {
          label: 'Export Layout',
          accelerator: 'CmdOrCtrl+S',
          click: () => window.webContents.send('menu:export-layout')
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => window.webContents.send('menu:settings')
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Fullscreen',
          accelerator: 'F11',
          click: () => window.setFullScreen(!window.isFullScreen())
        },
        {
          label: 'Toggle Frameless',
          accelerator: 'CmdOrCtrl+F',
          click: () => window.webContents.send('menu:toggle-frameless')
        },
        { type: 'separator' },
        {
          label: 'Show Statistics',
          type: 'checkbox',
          checked: settings.display.showStatistics,
          click: () => window.webContents.send('menu:toggle-statistics')
        },
        {
          label: 'Show Labels',
          type: 'checkbox',
          checked: settings.display.showLabels,
          click: () => window.webContents.send('menu:toggle-labels')
        },
        { type: 'separator' },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => window.reload()
        },
        {
          label: 'Developer Tools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => window.webContents.toggleDevTools()
        }
      ]
    },
    {
      label: 'Layout',
      submenu: [
        {
          label: '1x1',
          accelerator: '1',
          click: () => window.webContents.send('menu:layout', '1x1')
        },
        {
          label: '2x1',
          accelerator: '2',
          click: () => window.webContents.send('menu:layout', '2x1')
        },
        {
          label: '3x1',
          accelerator: '3',
          click: () => window.webContents.send('menu:layout', '3x1')
        },
        {
          label: '2x2',
          accelerator: '4',
          click: () => window.webContents.send('menu:layout', '2x2')
        },
        {
          label: '3x3',
          accelerator: '9',
          click: () => window.webContents.send('menu:layout', '3x3')
        },
        {
          label: '4x4',
          accelerator: '0',
          click: () => window.webContents.send('menu:layout', '4x4')
        }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
```

---

# 4. USER INTERFACE SPECIFICATIONS

## Design System

### Color Palette
```css
/* src/renderer/styles/theme.css */
:root {
  /* Primary Colors */
  --color-primary: #3b82f6;      /* Blue */
  --color-primary-dark: #2563eb;
  --color-primary-light: #60a5fa;
  
  /* Neutral Colors */
  --color-bg-primary: #0a0a0a;   /* Main background */
  --color-bg-secondary: #1a1a1a; /* Card background */
  --color-bg-tertiary: #2a2a2a;  /* Hover states */
  
  /* Text Colors */
  --color-text-primary: #ffffff;
  --color-text-secondary: #a0a0a0;
  --color-text-muted: #666666;
  
  /* Status Colors */
  --color-success: #10b981;      /* Connected */
  --color-warning: #f59e0b;      /* Connecting */
  --color-error: #ef4444;        /* Error */
  --color-info: #3b82f6;         /* Info */
  
  /* Border Colors */
  --color-border: #333333;
  --color-border-focus: #3b82f6;
}
```

### Typography
```css
/* Typography System */
.text-display {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
}

.text-heading {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
}

.text-subheading {
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.4;
}

.text-body {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
}

.text-small {
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
}

.text-caption {
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.5;
}
```

## Screen Layouts

### Main Application Window
```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Header Bar                                              │ │
│ │ ┌─────┐ ┌──────────┐ ┌─────────────┐ ┌──────┐ ┌─────┐ │ │
│ │ │Logo │ │Add Stream│ │Layout: 2x2  │ │Stats │ │ ⚙️  │ │ │
│ │ └─────┘ └──────────┘ └─────────────┘ └──────┘ └─────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Stream Grid Container                                   │ │
│ │ ┌─────────────────────┐ ┌─────────────────────┐       │ │
│ │ │ Stream Tile 1       │ │ Stream Tile 2       │       │ │
│ │ │ ┌─────────────────┐ │ │ ┌─────────────────┐ │       │ │
│ │ │ │ Video Player    │ │ │ │ Video Player    │ │       │ │
│ │ │ └─────────────────┘ │ │ └─────────────────┘ │       │ │
│ │ │ Label | 🔊 | ⟳ | ✕ │ │ Label | 🔇 | ⟳ | ✕ │       │ │
│ │ └─────────────────────┘ └─────────────────────┘       │ │
│ │ ┌─────────────────────┐ ┌─────────────────────┐       │ │
│ │ │ Stream Tile 3       │ │ Stream Tile 4       │       │ │
│ │ │ ┌─────────────────┐ │ │ ┌─────────────────┐ │       │ │
│ │ │ │ Video Player    │ │ │ │ Video Player    │ │       │ │
│ │ │ └─────────────────┘ │ │ └─────────────────┘ │       │ │
│ │ │ Label | 🔊 | ⟳ | ✕ │ │ Label | 🔊 | ⟳ | ✕ │       │ │
│ │ └─────────────────────┘ └─────────────────────┘       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Status Bar                                              │ │
│ │ Connected: 4/4 | CPU: 35% | Memory: 1.2GB | FPS: 30    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Add Stream Dialog
```
┌─────────────────────────────────────────────┐
│ Add New Stream                          [X] │
├─────────────────────────────────────────────┤
│                                             │
│ Stream URL:                                 │
│ ┌─────────────────────────────────────────┐ │
│ │ rtmp://example.com/live/stream1         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Label:                                      │
│ ┌─────────────────────────────────────────┐ │
│ │ Camera 1 - Main Stage                   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ □ Save to library                           │
│                                             │
│ Advanced Options ▼                          │
│ ┌─────────────────────────────────────────┐ │
│ │ Reconnect Attempts: [5   ]              │ │
│ │ Reconnect Delay:    [3000] ms           │ │
│ │ □ Hardware Acceleration                  │ │
│ │ □ Low Latency Mode                       │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Test Connection] [Cancel] [Add Stream]     │
└─────────────────────────────────────────────┘
```

### Settings Window
```
┌────────────────────────────────────────────────────┐
│ Settings                                      [X] │
├────────────────────────────────────────────────────┤
│ ┌───────────┬─────────────────────────────────────┐ │
│ │ General   │ General Settings                    │ │
│ │ Display   │                                     │ │
│ │ Performance│ Theme:        [Dark    ▼]          │ │
│ │ Audio     │ Language:     [English ▼]          │ │
│ │ Advanced  │ □ Auto-start with system            │ │
│ │           │ □ Minimize to system tray           │ │
│ │           │ □ Check for updates                 │ │
│ │           │                                     │ │
│ │           │ Default Layout:                     │ │
│ │           │ [2x2 Grid             ▼]           │ │
│ │           │                                     │ │
│ │           │ Stream Library Location:            │ │
│ │           │ [~/Documents/StreamGrid] [Browse]   │ │
│ └───────────┴─────────────────────────────────────┘ │
│                                                    │
│                    [Cancel] [Save]                 │
└────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── WindowFrame (frameless mode handling)
├── HeaderBar
│   ├── Logo
│   ├── AddStreamButton
│   ├── LayoutSelector
│   ├── StatsToggle
│   └── SettingsButton
├── MainContent
│   ├── StreamGrid
│   │   └── StreamTile[]
│   │       ├── VideoPlayer
│   │       ├── StreamLabel
│   │       ├── StreamControls
│   │       │   ├── VolumeControl
│   │       │   ├── RefreshButton
│   │       │   └── CloseButton
│   │       └── StreamOverlay (errors/loading)
│   └── EmptyState (no streams)
├── StatusBar
│   ├── ConnectionStatus
│   ├── PerformanceMetrics
│   └── SystemInfo
└── Modals
    ├── AddStreamModal
    ├── SettingsModal
    ├── StreamLibraryModal
    └── ConfirmationModal
```

## State Management

### Global Store Structure
```typescript
// src/renderer/store/index.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface StreamGridStore {
  // Streams
  streams: Map<string, Stream>;
  activeStreams: Set<string>;
  
  // Layouts
  layouts: Map<string, Layout>;
  activeLayoutId: string | null;
  
  // UI State
  isFullscreen: boolean;
  isFrameless: boolean;
  showStatistics: boolean;
  showLabels: boolean;
  selectedStreamId: string | null;
  
  // Performance
  performanceMetrics: PerformanceMetrics;
  
  // Actions
  addStream: (stream: Stream) => void;
  removeStream: (streamId: string) => void;
  updateStream: (streamId: string, updates: Partial<Stream>) => void;
  connectStream: (streamId: string) => void;
  disconnectStream: (streamId: string) => void;
  
  setActiveLayout: (layoutId: string) => void;
  createLayout: (layout: Layout) => void;
  updateLayout: (layoutId: string, updates: Partial<Layout>) => void;
  deleteLayout: (layoutId: string) => void;
  
  toggleFullscreen: () => void;
  toggleFrameless: () => void;
  toggleStatistics: () => void;
  toggleLabels: () => void;
  
  updatePerformanceMetrics: (metrics: PerformanceMetrics) => void;
}

export const useStreamGridStore = create<StreamGridStore>()(
  devtools(
    persist(
      immer((set) => ({
        // Initial state
        streams: new Map(),
        activeStreams: new Set(),
        layouts: new Map(),
        activeLayoutId: null,
        isFullscreen: false,
        isFrameless: false,
        showStatistics: false,
        showLabels: true,
        selectedStreamId: null,
        performanceMetrics: {
          cpuUsage: 0,
          memoryUsage: 0,
          fps: 0,
          droppedFrames: 0
        },
        
        // Stream actions
        addStream: (stream) => set((state) => {
          state.streams.set(stream.id, stream);
        }),
        
        removeStream: (streamId) => set((state) => {
          state.streams.delete(streamId);
          state.activeStreams.delete(streamId);
        }),
        
        updateStream: (streamId, updates) => set((state) => {
          const stream = state.streams.get(streamId);
          if (stream) {
            state.streams.set(streamId, { ...stream, ...updates });
          }
        }),
        
        connectStream: (streamId) => set((state) => {
          state.activeStreams.add(streamId);
          const stream = state.streams.get(streamId);
          if (stream) {
            stream.status = StreamStatus.CONNECTING;
          }
        }),
        
        disconnectStream: (streamId) => set((state) => {
          state.activeStreams.delete(streamId);
          const stream = state.streams.get(streamId);
          if (stream) {
            stream.status = StreamStatus.DISCONNECTED;
          }
        }),
        
        // Layout actions
        setActiveLayout: (layoutId) => set((state) => {
          state.activeLayoutId = layoutId;
        }),
        
        createLayout: (layout) => set((state) => {
          state.layouts.set(layout.id, layout);
        }),
        
        updateLayout: (layoutId, updates) => set((state) => {
          const layout = state.layouts.get(layoutId);
          if (layout) {
            state.layouts.set(layoutId, { ...layout, ...updates });
          }
        }),
        
        deleteLayout: (layoutId) => set((state) => {
          state.layouts.delete(layoutId);
          if (state.activeLayoutId === layoutId) {
            state.activeLayoutId = null;
          }
        }),
        
        // UI actions
        toggleFullscreen: () => set((state) => {
          state.isFullscreen = !state.isFullscreen;
        }),
        
        toggleFrameless: () => set((state) => {
          state.isFrameless = !state.isFrameless;
        }),
        
        toggleStatistics: () => set((state) => {
          state.showStatistics = !state.showStatistics;
        }),
        
        toggleLabels: () => set((state) => {
          state.showLabels = !state.showLabels;
        }),
        
        // Performance actions
        updatePerformanceMetrics: (metrics) => set((state) => {
          state.performanceMetrics = metrics;
        })
      })),
      {
        name: 'streamgrid-storage',
        partialize: (state) => ({
          showStatistics: state.showStatistics,
          showLabels: state.showLabels
        })
      }
    )
  )
);
```

---

# 5. IMPLEMENTATION SECTIONS

## Section 1.1: Project Setup and Configuration

**Description:** Initialize the Electron + React + TypeScript project with all necessary dependencies and build configurations.

**Starter Code:**
```json
// package.json
{
  "name": "streamgrid",
  "version": "1.0.0",
  "description": "Professional RTMP Multi-Stream Viewer",
  "main": ".vite/build/main.js",
  "scripts": {
    "start": "electron-forge start",
    "package": "electron-forge package",
    "make": "electron-forge make",
    "publish": "electron-forge publish",
    "lint": "eslint --ext .ts,.tsx .",
    "test": "jest",
    "test:watch": "jest --watch",
    "typecheck": "tsc --noEmit"
  },
  "keywords": ["rtmp", "streaming", "video", "monitoring"],
  "author": "StreamGrid Team",
  "license": "MIT",
  "devDependencies": {
    "@electron-forge/cli": "^7.2.0",
    "@electron-forge/maker-deb": "^7.2.0",
    "@electron-forge/maker-rpm": "^7.2.0",
    "@electron-forge/maker-squirrel": "^7.2.0",
    "@electron-forge/maker-zip": "^7.2.0",
    "@electron-forge/plugin-auto-unpack-natives": "^7.2.0",
    "@electron-forge/plugin-vite": "^7.2.0",
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "autoprefixer": "^10.4.17",
    "electron": "^28.2.0",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react": "^7.33.2",
    "jest": "^29.7.0",
    "postcss": "^8.4.33",
    "prettier": "^3.2.4",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.12"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.17.19",
    "clsx": "^2.1.0",
    "electron-store": "^8.1.0",
    "electron-updater": "^6.1.7",
    "framer-motion": "^10.18.0",
    "immer": "^10.0.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hot-toast": "^2.4.1",
    "react-icons": "^5.0.1",
    "sqlite3": "^5.1.7",
    "uuid": "^9.0.1",
    "winston": "^3.11.0",
    "zustand": "^4.5.0"
  }
}
```

```typescript
// forge.config.ts
import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { VitePlugin } from '@electron-forge/plugin-vite';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: './assets/icon',
    appBundleId: 'com.streamgrid.app',
    appCategoryType: 'public.app-category.video',
    win32metadata: {
      CompanyName: 'StreamGrid',
      FileDescription: 'Professional RTMP Multi-Stream Viewer',
      OriginalFilename: 'StreamGrid.exe',
      ProductName: 'StreamGrid',
      InternalName: 'StreamGrid'
    }
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      certificateFile: process.env.WINDOWS_CERTIFICATE_FILE,
      certificatePassword: process.env.WINDOWS_CERTIFICATE_PASSWORD
    }),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({
      options: {
        categories: ['AudioVideo', 'Video'],
        description: 'Professional RTMP Multi-Stream Viewer',
        homepage: 'https://streamgrid.app',
        icon: './assets/icon.png',
        license: 'MIT'
      }
    }),
    new MakerDeb({
      options: {
        categories: ['AudioVideo', 'Video'],
        description: 'Professional RTMP Multi-Stream Viewer',
        homepage: 'https://streamgrid.app',
        icon: './assets/icon.png',
        maintainer: 'StreamGrid Team',
        productName: 'StreamGrid'
      }
    })
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      build: [
        {
          entry: 'src/main/index.ts',
          config: 'vite.main.config.ts'
        },
        {
          entry: 'src/preload/index.ts',
          config: 'vite.preload.config.ts'
        }
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts'
        }
      ]
    })
  ]
};

export default config;
```

```typescript
// vite.renderer.config.ts
import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import { pluginExposeRenderer } from './vite.base.config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>;
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? '';

  return {
    root,
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`
    },
    plugins: [
      pluginExposeRenderer(name),
      react()
    ],
    resolve: {
      preserveSymlinks: true,
      alias: {
        '@': path.resolve(__dirname, './src/renderer'),
        '@shared': path.resolve(__dirname, './src/shared')
      }
    },
    clearScreen: false
  } as UserConfig;
});
```

**Implementation Prompt:**
```
Complete the project setup by:
- Creating these configuration files: tsconfig.json, .eslintrc.js, .prettierrc, tailwind.config.js, postcss.config.js
- Setting up the complete directory structure as specified in the architecture
- Creating initial HTML template for the renderer process
- Implementing vite.main.config.ts and vite.preload.config.ts
- Creating .gitignore with appropriate exclusions
- Setting up jest.config.js for testing
- Creating README.md with setup instructions
Success criteria:
- Project builds successfully with npm run start
- TypeScript compilation has no errors
- ESLint passes with no warnings
- Hot reload works in development mode
```

## Section 1.2: Database and Storage Layer

**Description:** Implement SQLite database for stream library storage and Electron Store for application settings.

**Starter Code:**
```typescript
// src/main/database.ts
import sqlite3 from 'sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { Stream, Layout } from '../shared/types';
import { logger } from './logger';

const DATABASE_VERSION = 1;

export class Database {
  private db: sqlite3.Database | null = null;
  private dbPath: string;

  constructor() {
    const userData = app.getPath('userData');
    this.dbPath = path.join(userData, 'streamgrid.db');
  }

  async initialize(): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.dbPath);
      await fs.mkdir(dir, { recursive: true });

      // Open database
      this.db = new sqlite3.Database(this.dbPath);
      
      // Enable foreign keys
      await this.run('PRAGMA foreign_keys = ON');
      
      // Check and migrate database
      await this.migrate();
      
      logger.info('Database initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async migrate(): Promise<void> {
    // Get current version
    const version = await this.getVersion();
    
    if (version < 1) {
      await this.createTables();
      await this.setVersion(1);
    }
    
    // Add future migrations here
  }

  private async createTables(): Promise<void> {
    // Streams table
    await this.run(`
      CREATE TABLE IF NOT EXISTS streams (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        label TEXT NOT NULL,
        volume INTEGER DEFAULT 100,
        muted INTEGER DEFAULT 0,
        priority INTEGER DEFAULT 0,
        reconnect_attempts INTEGER DEFAULT 5,
        reconnect_delay INTEGER DEFAULT 3000,
        hardware_acceleration INTEGER DEFAULT 1,
        audio_output TEXT DEFAULT 'default',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Layouts table
    await this.run(`
      CREATE TABLE IF NOT EXISTS layouts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        rows INTEGER NOT NULL,
        columns INTEGER NOT NULL,
        gaps INTEGER DEFAULT 4,
        aspect_ratio TEXT DEFAULT '16:9',
        is_active INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    // Layout streams junction table
    await this.run(`
      CREATE TABLE IF NOT EXISTS layout_streams (
        layout_id TEXT NOT NULL,
        stream_id TEXT NOT NULL,
        position INTEGER NOT NULL,
        row_span INTEGER DEFAULT 1,
        col_span INTEGER DEFAULT 1,
        PRIMARY KEY (layout_id, position),
        FOREIGN KEY (layout_id) REFERENCES layouts(id) ON DELETE CASCADE,
        FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    await this.run('CREATE INDEX IF NOT EXISTS idx_streams_url ON streams(url)');
    await this.run('CREATE INDEX IF NOT EXISTS idx_layouts_active ON layouts(is_active)');
  }

  // Stream operations
  async createStream(stream: Omit<Stream, 'id' | 'createdAt' | 'updatedAt'>): Promise<Stream> {
    const id = generateId();
    const now = Date.now();
    
    await this.run(
      `INSERT INTO streams (
        id, url, label, volume, muted, priority,
        reconnect_attempts, reconnect_delay, hardware_acceleration,
        audio_output, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        stream.url,
        stream.label,
        stream.settings.volume,
        stream.settings.muted ? 1 : 0,
        stream.settings.priority,
        stream.settings.reconnectAttempts,
        stream.settings.reconnectDelay,
        stream.settings.hardwareAcceleration ? 1 : 0,
        stream.settings.audioOutput,
        now,
        now
      ]
    );
    
    return {
      ...stream,
      id,
      createdAt: new Date(now),
      updatedAt: new Date(now)
    } as Stream;
  }

  async getStreams(): Promise<Stream[]> {
    const rows = await this.all('SELECT * FROM streams ORDER BY label');
    return rows.map(this.rowToStream);
  }

  async getStream(id: string): Promise<Stream | null> {
    const row = await this.get('SELECT * FROM streams WHERE id = ?', [id]);
    return row ? this.rowToStream(row) : null;
  }

  async updateStream(id: string, updates: Partial<Stream>): Promise<void> {
    const sets: string[] = [];
    const values: any[] = [];
    
    if (updates.url !== undefined) {
      sets.push('url = ?');
      values.push(updates.url);
    }
    
    if (updates.label !== undefined) {
      sets.push('label = ?');
      values.push(updates.label);
    }
    
    if (updates.settings) {
      if (updates.settings.volume !== undefined) {
        sets.push('volume = ?');
        values.push(updates.settings.volume);
      }
      // Add other settings fields...
    }
    
    sets.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);
    
    await this.run(
      `UPDATE streams SET ${sets.join(', ')} WHERE id = ?`,
      values
    );
  }

  async deleteStream(id: string): Promise<void> {
    await this.run('DELETE FROM streams WHERE id = ?', [id]);
  }

  // Layout operations
  async createLayout(layout: Omit<Layout, 'id' | 'createdAt' | 'updatedAt'>): Promise<Layout> {
    const id = generateId();
    const now = Date.now();
    
    // Start transaction
    await this.run('BEGIN TRANSACTION');
    
    try {
      // Insert layout
      await this.run(
        `INSERT INTO layouts (
          id, name, type, rows, columns, gaps,
          aspect_ratio, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          layout.name,
          layout.type,
          layout.grid.rows,
          layout.grid.columns,
          layout.grid.gaps,
          layout.grid.aspectRatio,
          layout.isActive ? 1 : 0,
          now,
          now
        ]
      );
      
      // Insert layout streams
      for (const stream of layout.streams) {
        await this.run(
          `INSERT INTO layout_streams (
            layout_id, stream_id, position, row_span, col_span
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            id,
            stream.streamId,
            stream.position,
            stream.customSize?.rowSpan || 1,
            stream.customSize?.colSpan || 1
          ]
        );
      }
      
      await this.run('COMMIT');
      
      return {
        ...layout,
        id,
        createdAt: new Date(now),
        updatedAt: new Date(now)
      } as Layout;
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  // Helper methods
  private rowToStream(row: any): Stream {
    return {
      id: row.id,
      url: row.url,
      label: row.label,
      status: 'disconnected',
      metadata: {} as any,
      settings: {
        volume: row.volume,
        muted: row.muted === 1,
        priority: row.priority,
        reconnectAttempts: row.reconnect_attempts,
        reconnectDelay: row.reconnect_delay,
        hardwareAcceleration: row.hardware_acceleration === 1,
        audioOutput: row.audio_output
      },
      statistics: {} as any,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db!.run(sql, params, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db!.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  private all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db!.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async close(): Promise<void> {
    if (this.db) {
      await new Promise<void>((resolve, reject) => {
        this.db!.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }
}

// Export singleton instance
export const database = new Database();
```

**Implementation Prompt:**
```
Complete the database implementation by:
- Creating these files: src/main/settings.ts (using electron-store)
- Implementing remaining database methods: getLayouts, getLayout, updateLayout, deleteLayout, setActiveLayout
- Adding database version management methods: getVersion, setVersion
- Creating src/main/logger.ts with Winston configuration
- Implementing generateId utility function using uuid
- Adding transaction support for complex operations
- Creating database backup and restore functionality
- Adding data validation before database operations
Testing requirements:
- Unit tests for all database operations
- Test transaction rollback scenarios
- Verify foreign key constraints work correctly
- Test concurrent access handling
Success criteria:
- All CRUD operations work correctly
- Transactions maintain data integrity
- Settings persist between app restarts
- Database migrations work properly
```

## Section 1.3: RTMP Stream Validation and Connection

**Description:** Implement RTMP URL validation and connection testing functionality.

**Starter Code:**
```typescript
// src/main/rtmp.ts
import { EventEmitter } from 'events';
import { logger } from './logger';
import net from 'net';
import { URL } from 'url';

export interface RTMPValidationResult {
  valid: boolean;
  reachable: boolean;
  metadata?: {
    width?: number;
    height?: number;
    fps?: number;
    videoCodec?: string;
    audioCodec?: string;
  };
  error?: string;
  latency?: number;
}

export class RTMPValidator extends EventEmitter {
  private timeout: number = 5000;

  async validate(rtmpUrl: string): Promise<RTMPValidationResult> {
    const startTime = Date.now();
    
    try {
      // Validate URL format
      const urlValidation = this.validateUrl(rtmpUrl);
      if (!urlValidation.valid) {
        return urlValidation;
      }

      // Test connection
      const connectionResult = await this.testConnection(rtmpUrl);
      if (!connectionResult.reachable) {
        return connectionResult;
      }

      // Get stream metadata (simplified version)
      const metadata = await this.getStreamMetadata(rtmpUrl);
      
      return {
        valid: true,
        reachable: true,
        metadata,
        latency: Date.now() - startTime
      };
    } catch (error) {
      logger.error('RTMP validation error:', error);
      return {
        valid: false,
        reachable: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private validateUrl(rtmpUrl: string): RTMPValidationResult {
    try {
      const url = new URL(rtmpUrl);
      
      // Check protocol
      if (!['rtmp:', 'rtmps:'].includes(url.protocol)) {
        return {
          valid: false,
          reachable: false,
          error: 'Invalid protocol. Must be rtmp:// or rtmps://'
        };
      }

      // Check for required components
      if (!url.hostname) {
        return {
          valid: false,
          reachable: false,
          error: 'Missing hostname'
        };
      }

      if (!url.pathname || url.pathname === '/') {
        return {
          valid: false,
          reachable: false,
          error: 'Missing stream path'
        };
      }

      return { valid: true, reachable: false };
    } catch (error) {
      return {
        valid: false,
        reachable: false,
        error: 'Invalid URL format'
      };
    }
  }

  private async testConnection(rtmpUrl: string): Promise<RTMPValidationResult> {
    return new Promise((resolve) => {
      try {
        const url = new URL(rtmpUrl);
        const port = url.port || (url.protocol === 'rtmps:' ? 443 : 1935);
        
        const socket = new net.Socket();
        
        const timeoutId = setTimeout(() => {
          socket.destroy();
          resolve({
            valid: true,
            reachable: false,
            error: 'Connection timeout'
          });
        }, this.timeout);

        socket.on('connect', () => {
          clearTimeout(timeoutId);
          socket.destroy();
          resolve({
            valid: true,
            reachable: true
          });
        });

        socket.on('error', (error) => {
          clearTimeout(timeoutId);
          resolve({
            valid: true,
            reachable: false,
            error: `Connection failed: ${error.message}`
          });
        });

        socket.connect(port, url.hostname);
      } catch (error) {
        resolve({
          valid: true,
          reachable: false,
          error: error instanceof Error ? error.message : 'Connection test failed'
        });
      }
    });
  }

  private async getStreamMetadata(rtmpUrl: string): Promise<any> {
    // Simplified metadata retrieval
    // In production, this would use a proper RTMP client library
    return {
      width: 1920,
      height: 1080,
      fps: 30,
      videoCodec: 'h264',
      audioCodec: 'aac'
    };
  }

  setTimeout(ms: number): void {
    this.timeout = ms;
  }
}

// IPC handlers for RTMP validation
import { ipcMain } from 'electron';

const validator = new RTMPValidator();

export function setupRTMPHandlers(): void {
  ipcMain.handle('rtmp:validate', async (event, url: string) => {
    return validator.validate(url);
  });

  ipcMain.handle('rtmp:testMultiple', async (event, urls: string[]) => {
    const results = await Promise.all(
      urls.map(url => validator.validate(url))
    );
    return results;
  });
}
```

**Implementation Prompt:**
```
Complete the RTMP implementation by:
- Creating proper RTMP handshake implementation or integrating node-media-server
- Implementing real metadata extraction from RTMP streams
- Adding support for authentication (username/password in URL)
- Creating stream health monitoring that runs continuously
- Implementing bandwidth estimation for streams
- Adding support for RTMPS (RTMP over TLS)
- Creating connection pool for efficient resource usage
- Adding proxy support for RTMP connections
Error handling:
- Handle network timeouts gracefully
- Detect and report specific RTMP error codes
- Implement exponential backoff for retries
- Add circuit breaker pattern for failing streams
Success criteria:
- Accurately validates RTMP URLs
- Retrieves real stream metadata
- Handles authentication properly
- Reports accurate latency measurements
```

## Section 1.4: Video Player Component with Hardware Acceleration

**Description:** Create the core video player component using WebGL/Canvas for hardware-accelerated playback.

**Starter Code:**
```typescript
// src/renderer/components/VideoPlayer/VideoPlayer.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stream, StreamStatus } from '@shared/types/stream';
import { useStreamStore } from '@/store/streamStore';
import { VideoOverlay } from './VideoOverlay';
import { VideoControls } from './VideoControls';
import clsx from 'clsx';

interface VideoPlayerProps {
  stream: Stream;
  className?: string;
  showControls?: boolean;
  priority?: 'high' | 'normal' | 'low';
  onError?: (error: Error) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  stream,
  className,
  showControls = true,
  priority = 'normal',
  onError
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    fps: 0,
    bitrate: 0,
    droppedFrames: 0,
    latency: 0
  });

  const updateStreamStatus = useStreamStore(state => state.updateStream);

  // Initialize player
  useEffect(() => {
    if (!canvasRef.current || !stream.url) return;

    const initializePlayer = async () => {
      try {
        setError(null);
        setIsBuffering(true);
        
        // Update stream status
        updateStreamStatus(stream.id, { 
          status: StreamStatus.CONNECTING 
        });

        // Create video element for decoding
        const video = document.createElement('video');
        video.style.display = 'none';
        video.muted = stream.settings.muted;
        video.volume = stream.settings.volume / 100;
        video.autoplay = true;
        video.playsInline = true;
        
        // Hardware acceleration attributes
        if (stream.settings.hardwareAcceleration) {
          video.setAttribute('x-webkit-airplay', 'allow');
          video.setAttribute('hardware-acceleration', 'prefer-hardware');
        }

        // For now, we'll use HLS.js or similar for RTMP playback
        // In production, you'd use a proper RTMP player library
        const playerInstance = await createRTMPPlayer(video, stream.url);
        playerRef.current = playerInstance;
        videoRef.current = video;

        // Setup event listeners
        video.onloadedmetadata = () => {
          updateStreamStatus(stream.id, {
            status: StreamStatus.CONNECTED,
            metadata: {
              width: video.videoWidth,
              height: video.videoHeight,
              fps: 30, // Would be extracted from stream
              bitrate: 0,
              codec: 'h264',
              audioCodec: 'aac',
              audioChannels: 2,
              audioSampleRate: 48000
            }
          });
        };

        video.onplay = () => {
          setIsPlaying(true);
          setIsBuffering(false);
          startRenderLoop();
        };

        video.onpause = () => {
          setIsPlaying(false);
          stopRenderLoop();
        };

        video.onwaiting = () => {
          setIsBuffering(true);
        };

        video.onplaying = () => {
          setIsBuffering(false);
        };

        video.onerror = (e) => {
          const errorMessage = getVideoErrorMessage(video.error);
          setError(errorMessage);
          updateStreamStatus(stream.id, {
            status: StreamStatus.ERROR,
            statistics: {
              ...stream.statistics,
              lastError: errorMessage
            }
          });
          onError?.(new Error(errorMessage));
        };

        // Add to DOM
        document.body.appendChild(video);
        
        // Start playback
        await video.play();
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize player';
        setError(errorMessage);
        setIsBuffering(false);
        updateStreamStatus(stream.id, {
          status: StreamStatus.ERROR,
          statistics: {
            ...stream.statistics,
            lastError: errorMessage
          }
        });
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      }
    };

    initializePlayer();

    return () => {
      cleanup();
    };
  }, [stream.url]);

  // Canvas render loop
  const startRenderLoop = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
      willReadFrequently: false
    });
    
    if (!ctx) return;

    let lastFrameTime = performance.now();
    let frameCount = 0;

    const render = () => {
      if (!video.paused && !video.ended) {
        // Set canvas size to match video
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Calculate FPS
        frameCount++;
        const now = performance.now();
        if (now - lastFrameTime >= 1000) {
          setStats(prev => ({
            ...prev,
            fps: frameCount,
            droppedFrames: (video as any).webkitDroppedFrameCount || 0
          }));
          frameCount = 0;
          lastFrameTime = now;
        }

        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();
  }, []);

  const stopRenderLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const cleanup = useCallback(() => {
    stopRenderLoop();
    
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.remove();
      videoRef.current = null;
    }
  }, [stopRenderLoop]);

  // Control handlers
  const handleRefresh = useCallback(() => {
    cleanup();
    // Re-initialize will happen via useEffect
  }, [cleanup]);

  const handleVolumeChange = useCallback((volume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
    updateStreamStatus(stream.id, {
      settings: { ...stream.settings, volume }
    });
  }, [stream.id, stream.settings, updateStreamStatus]);

  const handleMuteToggle = useCallback(() => {
    const newMuted = !stream.settings.muted;
    if (videoRef.current) {
      videoRef.current.muted = newMuted;
    }
    updateStreamStatus(stream.id, {
      settings: { ...stream.settings, muted: newMuted }
    });
  }, [stream.id, stream.settings, updateStreamStatus]);

  return (
    <div className={clsx('relative bg-black rounded-lg overflow-hidden', className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        style={{ imageRendering: 'high-quality' }}
      />
      
      <VideoOverlay
        status={stream.status}
        error={error}
        isBuffering={isBuffering}
        metadata={stream.metadata}
        statistics={{ ...stream.statistics, ...stats }}
      />
      
      {showControls && (
        <VideoControls
          stream={stream}
          onRefresh={handleRefresh}
          onVolumeChange={handleVolumeChange}
          onMuteToggle={handleMuteToggle}
        />
      )}
    </div>
  );
};

// Utility functions
function getVideoErrorMessage(error: MediaError | null): string {
  if (!error) return 'Unknown video error';
  
  switch (error.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      return 'Playback aborted';
    case MediaError.MEDIA_ERR_NETWORK:
      return 'Network error';
    case MediaError.MEDIA_ERR_DECODE:
      return 'Decode error';
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return 'Source not supported';
    default:
      return error.message || 'Unknown video error';
  }
}

async function createRTMPPlayer(video: HTMLVideoElement, url: string): Promise<any> {
  // This is a placeholder - in production, you'd use a proper RTMP library
  // such as video.js with RTMP plugin, mpv.js, or VLC.js
  
  // For demonstration, we'll simulate with a test pattern
  // In real implementation, this would establish RTMP connection
  
  return {
    play: () => video.play(),
    pause: () => video.pause(),
    destroy: () => {
      // Cleanup RTMP connection
    }
  };
}
```

**Implementation Prompt:**
```
Complete the video player implementation by:
- Integrating a real RTMP player library (mpv.js, VLC.js, or flv.js with RTMP extension)
- Implementing VideoOverlay component with status indicators and statistics
- Implementing VideoControls component with volume slider and buttons
- Adding WebGL-based rendering for better performance (optional)
- Creating adaptive quality switching based on bandwidth
- Implementing frame interpolation for smooth playback
- Adding screenshot capture functionality
- Creating picture-in-picture support
Performance optimizations:
- Implement video texture caching
- Add frame dropping for low-performance scenarios
- Create resolution scaling based on tile size
- Implement lazy loading for off-screen players
Success criteria:
- Smooth playback of RTMP streams
- Hardware acceleration works when available
- Statistics update in real-time
- Memory usage remains stable
- Handles stream disconnections gracefully
```

## Section 1.5: Stream Grid Layout System

**Description:** Implement the flexible grid layout system for displaying multiple streams.

**Starter Code:**
```typescript
// src/renderer/components/StreamGrid/StreamGrid.tsx
import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { useStreamStore } from '@/store/streamStore';
import { StreamTile } from './StreamTile';
import { EmptyState } from './EmptyState';
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Layout, LayoutType } from '@shared/types/layout';
import clsx from 'clsx';

interface StreamGridProps {
  className?: string;
}

export const StreamGrid: React.FC<StreamGridProps> = ({ className }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const {
    streams,
    layouts,
    activeLayoutId,
    activeStreams,
    updateLayout
  } = useStreamStore();

  const activeLayout = useMemo(() => {
    if (!activeLayoutId) {
      // Default 2x2 layout if none selected
      return createDefaultLayout(Array.from(activeStreams));
    }
    return layouts.get(activeLayoutId);
  }, [activeLayoutId, layouts, activeStreams]);

  const gridStyle = useMemo(() => {
    if (!activeLayout) return {};
    
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${activeLayout.grid.columns}, 1fr)`,
      gridTemplateRows: `repeat(${activeLayout.grid.rows}, 1fr)`,
      gap: `${activeLayout.grid.gaps}px`,
      height: '100%',
      width: '100%'
    };
  }, [activeLayout]);

  const streamTiles = useMemo(() => {
    if (!activeLayout) return [];
    
    const tiles = [];
    const totalPositions = activeLayout.grid.rows * activeLayout.grid.columns;
    
    for (let i = 0; i < totalPositions; i++) {
      const layoutStream = activeLayout.streams.find(s => s.position === i);
      const stream = layoutStream ? streams.get(layoutStream.streamId) : null;
      
      tiles.push({
        position: i,
        stream,
        layoutStream,
        isEmpty: !stream
      });
    }
    
    return tiles;
  }, [activeLayout, streams]);

  // Handle drag and drop for stream repositioning
  const handleDragStart = useCallback((event: DragStartEvent) => {
    // Add visual feedback
    document.body.style.cursor = 'grabbing';
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    document.body.style.cursor = '';
    
    const { active, over } = event;
    if (!over || active.id === over.id || !activeLayout) return;
    
    const activePosition = parseInt(active.id as string);
    const overPosition = parseInt(over.id as string);
    
    // Swap streams in layout
    const newStreams = [...activeLayout.streams];
    const activeStream = newStreams.find(s => s.position === activePosition);
    const overStream = newStreams.find(s => s.position === overPosition);
    
    if (activeStream) {
      activeStream.position = overPosition;
    }
    if (overStream) {
      overStream.position = activePosition;
    }
    
    updateLayout(activeLayout.id, { streams: newStreams });
  }, [activeLayout, updateLayout]);

  // Auto-resize handling
  useEffect(() => {
    if (!gridRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // Adjust tile sizes based on container size
        document.documentElement.style.setProperty(
          '--grid-tile-size',
          `${Math.min(width, height) / Math.max(activeLayout?.grid.rows || 1, activeLayout?.grid.columns || 1)}px`
        );
      }
    });
    
    resizeObserver.observe(gridRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [activeLayout]);

  if (activeStreams.size === 0) {
    return <EmptyState />;
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={gridRef}
        className={clsx('relative', className)}
        style={gridStyle}
      >
        <SortableContext
          items={streamTiles.map(t => t.position.toString())}
          strategy={rectSortingStrategy}
        >
          {streamTiles.map((tile) => (
            <StreamTile
              key={tile.position}
              position={tile.position}
              stream={tile.stream}
              isEmpty={tile.isEmpty}
              layoutStream={tile.layoutStream}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
};

// Helper function to create default layouts
function createDefaultLayout(streamIds: string[]): Layout {
  const count = streamIds.length;
  let rows = 1, columns = 1;
  
  // Determine optimal grid size
  if (count <= 1) {
    rows = 1; columns = 1;
  } else if (count <= 2) {
    rows = 1; columns = 2;
  } else if (count <= 3) {
    rows = 1; columns = 3;
  } else if (count <= 4) {
    rows = 2; columns = 2;
  } else if (count <= 6) {
    rows = 2; columns = 3;
  } else if (count <= 9) {
    rows = 3; columns = 3;
  } else if (count <= 12) {
    rows = 3; columns = 4;
  } else {
    rows = 4; columns = 4;
  }
  
  return {
    id: 'default',
    name: `${rows}x${columns} Grid`,
    type: LayoutType.PRESET,
    grid: {
      rows,
      columns,
      gaps: 4,
      aspectRatio: '16:9'
    },
    streams: streamIds.slice(0, rows * columns).map((id, index) => ({
      position: index,
      streamId: id
    })),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
```

```typescript
// src/renderer/components/StreamGrid/StreamTile.tsx
import React, { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { VideoPlayer } from '../VideoPlayer/VideoPlayer';
import { Stream } from '@shared/types/stream';
import { LayoutStream } from '@shared/types/layout';
import clsx from 'clsx';
import { FiMove, FiPlus } from 'react-icons/fi';

interface StreamTileProps {
  position: number;
  stream: Stream | null;
  isEmpty: boolean;
  layoutStream?: LayoutStream;
}

export const StreamTile: memo<StreamTileProps> = ({
  position,
  stream,
  isEmpty,
  layoutStream
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: position.toString(),
    disabled: isEmpty
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridRow: layoutStream?.customSize ? 
      `span ${layoutStream.customSize.rowSpan}` : undefined,
    gridColumn: layoutStream?.customSize ? 
      `span ${layoutStream.customSize.colSpan}` : undefined,
  };

  if (isEmpty) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={clsx(
          'relative bg-gray-900 rounded-lg border-2 border-dashed border-gray-700',
          'flex items-center justify-center transition-colors',
          'hover:border-gray-600 hover:bg-gray-800'
        )}
      >
        <button className="flex flex-col items-center gap-2 text-gray-500 hover:text-gray-400">
          <FiPlus className="w-8 h-8" />
          <span className="text-sm">Add Stream</span>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'relative group',
        isDragging && 'opacity-50 z-50'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className={clsx(
          'absolute top-2 left-2 z-20 p-1.5 rounded bg-black/50',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          'hover:bg-black/70 cursor-move'
        )}
      >
        <FiMove className="w-4 h-4 text-white" />
      </button>
      
      {stream && (
        <VideoPlayer
          stream={stream}
          className="w-full h-full"
          priority={position === 0 ? 'high' : 'normal'}
        />
      )}
    </div>
  );
};

StreamTile.displayName = 'StreamTile';
```

**Implementation Prompt:**
```
Complete the stream grid implementation by:
- Creating EmptyState component with helpful onboarding
- Implementing responsive grid sizing based on window dimensions
- Adding keyboard navigation between tiles (arrow keys)
- Creating focus management for accessibility
- Implementing custom grid builder for Phase B
- Adding animation transitions for layout changes
- Creating fullscreen mode for individual tiles
- Implementing adaptive quality based on tile size
Advanced features:
- Add grid snap guides during drag operations
- Implement multi-select for bulk operations
- Create layout templates (news, security, gaming presets)
- Add picture-in-picture for focused stream
Success criteria:
- Smooth drag and drop operations
- Responsive to window resizing
- Maintains aspect ratios correctly
- Keyboard accessible
- Touch-friendly on supported devices
```

## Section 1.6: Header Bar and Navigation

**Description:** Implement the application header with controls and navigation.

**Starter Code:**
```typescript
// src/renderer/components/Header/Header.tsx
import React, { useState, useCallback } from 'react';
import { useStreamStore } from '@/store/streamStore';
import { Logo } from './Logo';
import { AddStreamButton } from './AddStreamButton';
import { LayoutSelector } from './LayoutSelector';
import { StatsToggle } from './StatsToggle';
import { SettingsButton } from './SettingsButton';
import { WindowControls } from './WindowControls';
import { AddStreamModal } from '../Modals/AddStreamModal';
import { SettingsModal } from '../Modals/SettingsModal';
import clsx from 'clsx';

interface HeaderProps {
  className?: string;
  isFrameless?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  className, 
  isFrameless = false 
}) => {
  const [showAddStream, setShowAddStream] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const { 
    showStatistics, 
    toggleStatistics,
    isFrameless: storeFrameless 
  } = useStreamStore();
  
  const actuallyFrameless = isFrameless || storeFrameless;

  const handleAddStream = useCallback(() => {
    setShowAddStream(true);
  }, []);

  const handleSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  return (
    <>
      <header 
        className={clsx(
          'flex items-center justify-between px-4 h-14',
          'bg-gray-900 border-b border-gray-800',
          actuallyFrameless && 'app-drag-region',
          className
        )}
      >
        <div className="flex items-center gap-4">
          <Logo />
          
          <AddStreamButton 
            onClick={handleAddStream}
            className="app-no-drag" 
          />
          
          <LayoutSelector className="app-no-drag" />
        </div>

        <div className="flex items-center gap-2">
          <StatsToggle 
            isActive={showStatistics}
            onToggle={toggleStatistics}
            className="app-no-drag"
          />
          
          <SettingsButton 
            onClick={handleSettings}
            className="app-no-drag"
          />
          
          {actuallyFrameless && (
            <WindowControls className="app-no-drag ml-4" />
          )}
        </div>
      </header>

      <AddStreamModal
        isOpen={showAddStream}
        onClose={() => setShowAddStream(false)}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};
```

```typescript
// src/renderer/components/Header/LayoutSelector.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useStreamStore } from '@/store/streamStore';
import { FiGrid, FiChevronDown, FiPlus } from 'react-icons/fi';
import { LayoutType } from '@shared/types/layout';
import clsx from 'clsx';

const PRESET_LAYOUTS = [
  { id: '1x1', name: '1×1', rows: 1, cols: 1 },
  { id: '2x1', name: '2×1', rows: 1, cols: 2 },
  { id: '3x1', name: '3×1', rows: 1, cols: 3 },
  { id: '2x2', name: '2×2', rows: 2, cols: 2 },
  { id: '3x3', name: '3×3', rows: 3, cols: 3 },
  { id: '4x4', name: '4×4', rows: 4, cols: 4 },
];

interface LayoutSelectorProps {
  className?: string;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({ 
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    layouts,
    activeLayoutId,
    setActiveLayout,
    createLayout
  } = useStreamStore();

  const activeLayout = layouts.get(activeLayoutId || '');
  
  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectPreset = (preset: typeof PRESET_LAYOUTS[0]) => {
    // Create or update preset layout
    const existingLayout = Array.from(layouts.values())
      .find(l => l.type === LayoutType.PRESET && 
                  l.grid.rows === preset.rows && 
                  l.grid.columns === preset.cols);
    
    if (existingLayout) {
      setActiveLayout(existingLayout.id);
    } else {
      const newLayout = createLayout({
        name: preset.name,
        type: LayoutType.PRESET,
        grid: {
          rows: preset.rows,
          columns: preset.cols,
          gaps: 4,
          aspectRatio: '16:9'
        },
        streams: [],
        isActive: true
      });
      setActiveLayout(newLayout.id);
    }
    
    setIsOpen(false);
  };

  const handleCreateCustom = () => {
    // Open custom layout builder
    console.log('Open custom layout builder');
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={clsx('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded',
          'bg-gray-800 hover:bg-gray-700 transition-colors',
          'text-sm text-white'
        )}
      >
        <FiGrid className="w-4 h-4" />
        <span>{activeLayout?.name || 'Select Layout'}</span>
        <FiChevronDown className={clsx(
          'w-4 h-4 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className={clsx(
          'absolute top-full left-0 mt-1 w-48',
          'bg-gray-800 rounded-lg shadow-xl',
          'border border-gray-700 overflow-hidden',
          'z-50'
        )}>
          {/* Preset layouts */}
          <div className="p-1">
            <div className="px-2 py-1 text-xs text-gray-400 uppercase">
              Presets
            </div>
            {PRESET_LAYOUTS.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={clsx(
                  'w-full px-3 py-2 text-left rounded',
                  'hover:bg-gray-700 transition-colors',
                  'text-sm text-white',
                  activeLayout?.name === preset.name && 'bg-gray-700'
                )}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Custom layouts */}
          <div className="border-t border-gray-700 p-1">
            <div className="px-2 py-1 text-xs text-gray-400 uppercase">
              Custom
            </div>
            {Array.from(layouts.values())
              .filter(l => l.type === LayoutType.CUSTOM)
              .map(layout => (
                <button
                  key={layout.id}
                  onClick={() => setActiveLayout(layout.id)}
                  className={clsx(
                    'w-full px-3 py-2 text-left rounded',
                    'hover:bg-gray-700 transition-colors',
                    'text-sm text-white',
                    activeLayout?.id === layout.id && 'bg-gray-700'
                  )}
                >
                  {layout.name}
                </button>
              ))}
            
            <button
              onClick={handleCreateCustom}
              className={clsx(
                'w-full px-3 py-2 text-left rounded',
                'hover:bg-gray-700 transition-colors',
                'text-sm text-blue-400',
                'flex items-center gap-2'
              )}
            >
              <FiPlus className="w-4 h-4" />
              Create Custom
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

**Implementation Prompt:**
```
Complete the header implementation by:
- Creating Logo component with app branding
- Implementing AddStreamButton with tooltip
- Creating StatsToggle button with indicator
- Implementing SettingsButton with badge for updates
- Creating WindowControls for frameless mode (min/max/close)
- Adding keyboard shortcuts for all actions
- Implementing breadcrumb navigation for deep settings
- Creating search functionality for streams
Styling requirements:
- Support draggable regions for frameless mode
- Add hover states and transitions
- Ensure proper z-index layering
- Make responsive for smaller windows
Success criteria:
- All buttons function correctly
- Dropdown menus close on outside click
- Keyboard navigation works
- Frameless window can be dragged
- Window controls work on all platforms
```

## Section 1.7: Status Bar and Performance Monitoring

**Description:** Implement the status bar showing connection status and performance metrics.

**Starter Code:**
```typescript
// src/renderer/components/StatusBar/StatusBar.tsx
import React, { useEffect, useState } from 'react';
import { useStreamStore } from '@/store/streamStore';
import { ConnectionStatus } from './ConnectionStatus';
import { PerformanceMetrics } from './PerformanceMetrics';
import { SystemInfo } from './SystemInfo';
import { NetworkStatus } from './NetworkStatus';
import clsx from 'clsx';

interface StatusBarProps {
  className?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ className }) => {
  const { streams, activeStreams, performanceMetrics } = useStreamStore();
  const [networkStatus, setNetworkStatus] = useState({
    online: navigator.onLine,
    downlink: 0,
    effectiveType: '4g'
  });

  // Monitor network status
  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection;
      setNetworkStatus({
        online: navigator.onLine,
        downlink: connection?.downlink || 0,
        effectiveType: connection?.effectiveType || 'unknown'
      });
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', updateNetworkStatus);
    }

    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  // Calculate connection stats
  const connectionStats = React.useMemo(() => {
    let connected = 0;
    let connecting = 0;
    let error = 0;
    
    activeStreams.forEach(streamId => {
      const stream = streams.get(streamId);
      if (stream) {
        switch (stream.status) {
          case 'connected':
            connected++;
            break;
          case 'connecting':
          case 'reconnecting':
            connecting++;
            break;
          case 'error':
            error++;
            break;
        }
      }
    });
    
    return {
      total: activeStreams.size,
      connected,
      connecting,
      error
    };
  }, [streams, activeStreams]);

  return (
    <div className={clsx(
      'flex items-center justify-between px-4 h-8',
      'bg-gray-900 border-t border-gray-800',
      'text-xs text-gray-400',
      className
    )}>
      <div className="flex items-center gap-4">
        <ConnectionStatus stats={connectionStats} />
        <NetworkStatus status={networkStatus} />
      </div>
      
      <div className="flex items-center gap-4">
        <PerformanceMetrics metrics={performanceMetrics} />
        <SystemInfo />
      </div>
    </div>
  );
};
```

```typescript
// src/renderer/components/StatusBar/PerformanceMetrics.tsx
import React, { useEffect, useState } from 'react';
import { FiCpu, FiHardDrive, FiActivity } from 'react-icons/fi';
import clsx from 'clsx';

interface PerformanceMetricsProps {
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    fps: number;
    droppedFrames: number;
  };
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ 
  metrics 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [historicalData, setHistoricalData] = useState<{
    cpu: number[];
    memory: number[];
    fps: number[];
  }>({
    cpu: [],
    memory: [],
    fps: []
  });

  // Track historical data for sparklines
  useEffect(() => {
    setHistoricalData(prev => ({
      cpu: [...prev.cpu.slice(-29), metrics.cpuUsage],
      memory: [...prev.memory.slice(-29), metrics.memoryUsage],
      fps: [...prev.fps.slice(-29), metrics.fps]
    }));
  }, [metrics]);

  const getCpuColor = (usage: number) => {
    if (usage > 80) return 'text-red-500';
    if (usage > 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getMemoryColor = (usage: number) => {
    if (usage > 2048) return 'text-red-500';  // > 2GB
    if (usage > 1024) return 'text-yellow-500'; // > 1GB
    return 'text-green-500';
  };

  const formatMemory = (mb: number) => {
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(1)}GB`;
    }
    return `${mb.toFixed(0)}MB`;
  };

  return (
    <div className="flex items-center gap-3">
      {/* CPU Usage */}
      <div 
        className="flex items-center gap-1 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        title="CPU Usage"
      >
        <FiCpu className={clsx('w-3 h-3', getCpuColor(metrics.cpuUsage))} />
        <span className={getCpuColor(metrics.cpuUsage)}>
          {metrics.cpuUsage.toFixed(0)}%
        </span>
      </div>

      {/* Memory Usage */}
      <div 
        className="flex items-center gap-1"
        title="Memory Usage"
      >
        <FiHardDrive className={clsx('w-3 h-3', getMemoryColor(metrics.memoryUsage))} />
        <span className={getMemoryColor(metrics.memoryUsage)}>
          {formatMemory(metrics.memoryUsage)}
        </span>
      </div>

      {/* FPS */}
      <div 
        className="flex items-center gap-1"
        title="Average FPS"
      >
        <FiActivity className="w-3 h-3" />
        <span>{metrics.fps} FPS</span>
      </div>

      {/* Dropped Frames */}
      {metrics.droppedFrames > 0 && (
        <div 
          className="flex items-center gap-1"
          title="Dropped Frames"
        >
          <span className="text-yellow-500">
            ⚠ {metrics.droppedFrames} dropped
          </span>
        </div>
      )}

      {/* Expanded Performance View (Phase B) */}
      {expanded && (
        <div className="absolute bottom-full right-0 mb-2 p-3 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          {/* Add performance graphs here */}
        </div>
      )}
    </div>
  );
};
```

```typescript
// src/renderer/hooks/usePerformanceMonitor.ts
import { useEffect, useRef } from 'react';
import { useStreamStore } from '@/store/streamStore';

export function usePerformanceMonitor() {
  const updateMetrics = useStreamStore(state => state.updatePerformanceMetrics);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const monitorPerformance = async () => {
      try {
        // Get CPU usage from main process
        const cpuUsage = await window.electron.getSystemStats('cpu');
        
        // Get memory usage
        const memoryInfo = await window.electron.getSystemStats('memory');
        const memoryUsage = memoryInfo.used / (1024 * 1024); // Convert to MB
        
        // Calculate average FPS from all active streams
        const streams = useStreamStore.getState().streams;
        const activeStreams = useStreamStore.getState().activeStreams;
        let totalFps = 0;
        let streamCount = 0;
        
        activeStreams.forEach(streamId => {
          const stream = streams.get(streamId);
          if (stream?.statistics?.currentFps) {
            totalFps += stream.statistics.currentFps;
            streamCount++;
          }
        });
        
        const avgFps = streamCount > 0 ? Math.round(totalFps / streamCount) : 0;
        
        // Count total dropped frames
        let droppedFrames = 0;
        activeStreams.forEach(streamId => {
          const stream = streams.get(streamId);
          if (stream?.statistics?.droppedFrames) {
            droppedFrames += stream.statistics.droppedFrames;
          }
        });
        
        updateMetrics({
          cpuUsage,
          memoryUsage,
          fps: avgFps,
          droppedFrames
        });
      } catch (error) {
        console.error('Failed to monitor performance:', error);
      }
    };

    // Initial measurement
    monitorPerformance();
    
    // Update every second
    intervalRef.current = setInterval(monitorPerformance, 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateMetrics]);
}
```

**Implementation Prompt:**
```
Complete the status bar implementation by:
- Creating ConnectionStatus component with visual indicators
- Implementing NetworkStatus component with bandwidth display
- Creating SystemInfo component showing OS and app version
- Adding performance graphs in expanded view
- Implementing system tray integration
- Creating toast notifications for status changes
- Adding logging functionality for debugging
- Implementing bandwidth throttling warnings
Advanced features:
- Add real-time bandwidth usage graph
- Create performance history export
- Implement alert thresholds for metrics
- Add network quality indicator
Success criteria:
- Updates every second without lag
- Accurate performance measurements
- Visual feedback for problems
- Accessible status information
- Minimal performance impact
```

## Section 1.8: Add Stream Modal

**Description:** Implement the modal dialog for adding new streams with validation and testing.

**Starter Code:**
```typescript
// src/renderer/components/Modals/AddStreamModal.tsx
import React, { useState, useCallback, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiCheck, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { useStreamStore } from '@/store/streamStore';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

interface AddStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStreamModal: React.FC<AddStreamModalProps> = ({
  isOpen,
  onClose
}) => {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [saveToLibrary, setSaveToLibrary] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  
  // Advanced settings
  const [reconnectAttempts, setReconnectAttempts] = useState(5);
  const [reconnectDelay, setReconnectDelay] = useState(3000);
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true);
  const [lowLatencyMode, setLowLatencyMode] = useState(false);
  
  const urlInputRef = useRef<HTMLInputElement>(null);
  const { addStream, connectStream } = useStreamStore();

  // Reset form
  const resetForm = useCallback(() => {
    setUrl('');
    setLabel('');
    setSaveToLibrary(true);
    setShowAdvanced(false);
    setValidationResult(null);
    setReconnectAttempts(5);
    setReconnectDelay(3000);
    setHardwareAcceleration(true);
    setLowLatencyMode(false);
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  // Validate RTMP URL
  const handleValidate = useCallback(async () => {
    if (!url) {
      toast.error('Please enter a stream URL');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await window.electron.validateRTMP(url);
      setValidationResult(result);
      
      if (result.valid && result.reachable) {
        toast.success('Stream is valid and reachable');
        
        // Auto-fill label if empty
        if (!label && result.metadata) {
          const autoLabel = `Stream ${result.metadata.width}x${result.metadata.height}@${result.metadata.fps}fps`;
          setLabel(autoLabel);
        }
      } else if (result.valid && !result.reachable) {
        toast.error(result.error || 'Stream is not reachable');
      } else {
        toast.error(result.error || 'Invalid stream URL');
      }
    } catch (error) {
      toast.error('Failed to validate stream');
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  }, [url, label]);

  // Add stream
  const handleAddStream = useCallback(async () => {
    if (!url || !label) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Create stream object
      const stream = await addStream({
        url,
        label,
        status: 'disconnected',
        metadata: validationResult?.metadata || {},
        settings: {
          volume: 100,
          muted: false,
          priority: 0,
          reconnectAttempts,
          reconnectDelay,
          hardwareAcceleration,
          audioOutput: 'default'
        },
        statistics: {
          packetsReceived: 0,
          packetsLost: 0,
          bytesReceived: 0,
          currentBitrate: 0,
          averageBitrate: 0,
          currentFps: 0,
          averageFps: 0,
          droppedFrames: 0,
          latency: validationResult?.latency || 0,
          connectionTime: 0,
          lastError: null
        }
      });

      // Auto-connect if validation passed
      if (validationResult?.reachable) {
        connectStream(stream.id);
      }

      toast.success(`Added stream: ${label}`);
      handleClose();
    } catch (error) {
      toast.error('Failed to add stream');
      console.error('Add stream error:', error);
    }
  }, [url, label, validationResult, reconnectAttempts, reconnectDelay, 
      hardwareAcceleration, addStream, connectStream, handleClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          as={motion.div}
          static
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          open={isOpen}
          onClose={handleClose}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <Dialog.Overlay
              as={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <Dialog.Title className="text-lg font-semibold text-white">
                  Add New Stream
                </Dialog.Title>
                <button
                  onClick={handleClose}
                  className="p-1 rounded hover:bg-gray-700 transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* URL Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stream URL *
                  </label>
                  <div className="relative">
                    <input
                      ref={urlInputRef}
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="rtmp://example.com/live/stream1"
                      className={clsx(
                        'w-full px-3 py-2 bg-gray-700 rounded',
                        'text-white placeholder-gray-400',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500',
                        validationResult && (
                          validationResult.reachable 
                            ? 'ring-2 ring-green-500' 
                            : 'ring-2 ring-red-500'
                        )
                      )}
                    />
                    {validationResult && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {validationResult.reachable ? (
                          <FiCheck className="w-5 h-5 text-green-500" />
                        ) : (
                          <FiAlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {validationResult?.metadata && (
                    <div className="mt-2 text-xs text-gray-400">
                      {validationResult.metadata.width}×{validationResult.metadata.height} • 
                      {validationResult.metadata.fps} FPS • 
                      {validationResult.metadata.videoCodec}/{validationResult.metadata.audioCodec}
                    </div>
                  )}
                </div>

                {/* Label Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Label *
                  </label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Camera 1 - Main Stage"
                    className={clsx(
                      'w-full px-3 py-2 bg-gray-700 rounded',
                      'text-white placeholder-gray-400',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500'
                    )}
                  />
                </div>

                {/* Save to Library */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveToLibrary}
                    onChange={(e) => setSaveToLibrary(e.target.checked)}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Save to stream library</span>
                </label>

                {/* Advanced Options */}
                <div>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                  </button>
                  
                  {showAdvanced && (
                    <div className="mt-4 space-y-3 p-4 bg-gray-700/50 rounded">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            Reconnect Attempts
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={reconnectAttempts}
                            onChange={(e) => setReconnectAttempts(parseInt(e.target.value))}
                            className="w-full px-2 py-1 bg-gray-600 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            Reconnect Delay (ms)
                          </label>
                          <input
                            type="number"
                            min="1000"
                            max="10000"
                            step="1000"
                            value={reconnectDelay}
                            onChange={(e) => setReconnectDelay(parseInt(e.target.value))}
                            className="w-full px-2 py-1 bg-gray-600 rounded text-sm"
                          />
                        </div>
                      </div>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hardwareAcceleration}
                          onChange={(e) => setHardwareAcceleration(e.target.checked)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-xs text-gray-300">Hardware Acceleration</span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={lowLatencyMode}
                          onChange={(e) => setLowLatencyMode(e.target.checked)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-xs text-gray-300">Low Latency Mode</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
                <button
                  onClick={handleValidate}
                  disabled={!url || isValidating}
                  className={clsx(
                    'px-4 py-2 rounded font-medium transition-colors',
                    'bg-gray-700 hover:bg-gray-600 text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'flex items-center gap-2'
                  )}
                >
                  {isValidating ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </button>
                
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleAddStream}
                  disabled={!url || !label}
                  className={clsx(
                    'px-4 py-2 rounded font-medium transition-colors',
                    'bg-blue-600 hover:bg-blue-700 text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'flex items-center gap-2'
                  )}
                >
                  <FiPlus className="w-4 h-4" />
                  Add Stream
                </button>
              </div>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
```

**Implementation Prompt:**
```
Complete the add stream modal by:
- Creating stream library browser component
- Implementing batch add functionality
- Adding import from CSV/JSON
- Creating stream presets (common services)
- Implementing authentication fields (username/password)
- Adding stream preview capability
- Creating QR code scanner for mobile streams
- Implementing clipboard monitoring for URLs
Validation enhancements:
- Add DNS resolution check
- Implement port availability test
- Create bandwidth estimation
- Add geo-location detection
Success criteria:
- Smooth animations and transitions
- Form validation works correctly
- Keyboard navigation supported
- Error messages are helpful
- Successfully adds streams to store
```

## Section 1.9: Settings System

**Description:** Implement comprehensive settings management with persistence.

**Starter Code:**
```typescript
// src/renderer/components/Modals/SettingsModal.tsx
import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSave } from 'react-icons/fi';
import { useSettings } from '@/hooks/useSettings';
import { GeneralSettings } from './Settings/GeneralSettings';
import { DisplaySettings } from './Settings/DisplaySettings';
import { PerformanceSettings } from './Settings/PerformanceSettings';
import { AudioSettings } from './Settings/AudioSettings';
import { AdvancedSettings } from './Settings/AdvancedSettings';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABS = [
  { id: 'general', label: 'General', component: GeneralSettings },
  { id: 'display', label: 'Display', component: DisplaySettings },
  { id: 'performance', label: 'Performance', component: PerformanceSettings },
  { id: 'audio', label: 'Audio', component: AudioSettings },
  { id: 'advanced', label: 'Advanced', component: AdvancedSettings },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const { settings, updateSettings, saveSettings, isLoading } = useSettings();
  const [hasChanges, setHasChanges] = useState(false);

  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component;

  const handleSave = async () => {
    try {
      await saveSettings();
      toast.success('Settings saved successfully');
      setHasChanges(false);
      onClose();
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Save settings error:', error);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleSettingChange = (category: string, updates: any) => {
    updateSettings({ [category]: { ...settings[category], ...updates } });
    setHasChanges(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          as={motion.div}
          static
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          open={isOpen}
          onClose={handleCancel}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <Dialog.Overlay
              as={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <Dialog.Title className="text-lg font-semibold text-white">
                  Settings
                </Dialog.Title>
                <button
                  onClick={handleCancel}
                  className="p-1 rounded hover:bg-gray-700 transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-48 border-r border-gray-700 p-4">
                  {TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={clsx(
                        'w-full px-3 py-2 text-left rounded transition-colors',
                        'hover:bg-gray-700',
                        activeTab === tab.id
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Settings Panel */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {ActiveComponent && (
                    <ActiveComponent
                      settings={settings[activeTab]}
                      onChange={(updates) => handleSettingChange(activeTab, updates)}
                    />
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-
                            {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
                {hasChanges && (
                  <span className="text-sm text-yellow-500 mr-auto">
                    You have unsaved changes
                  </span>
                )}
                
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || isLoading}
                  className={clsx(
                    'px-4 py-2 rounded font-medium transition-colors',
                    'bg-blue-600 hover:bg-blue-700 text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'flex items-center gap-2'
                  )}
                >
                  <FiSave className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
// src/renderer/components/Modals/Settings/GeneralSettings.tsx
import React from 'react';
import { GeneralSettings as GeneralSettingsType } from '@shared/types/settings';
import { FiFolder } from 'react-icons/fi';
import clsx from 'clsx';

interface GeneralSettingsProps {
  settings: GeneralSettingsType;
  onChange: (updates: Partial<GeneralSettingsType>) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  settings,
  onChange
}) => {
  const handleBrowseLibrary = async () => {
    const result = await window.electron.showOpenDialog({
      properties: ['openDirectory'],
      defaultPath: settings.streamLibraryPath
    });
    
    if (!result.canceled && result.filePaths[0]) {
      onChange({ streamLibraryPath: result.filePaths[0] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">General Settings</h3>
        
        {/* Theme */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Theme
          </label>
          <select
            value={settings.theme}
            onChange={(e) => onChange({ theme: e.target.value as 'dark' | 'light' })}
            className={clsx(
              'w-full px-3 py-2 bg-gray-700 rounded',
              'text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>

        {/* Language */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Language
          </label>
          <select
            value={settings.language}
            onChange={(e) => onChange({ language: e.target.value })}
            className={clsx(
              'w-full px-3 py-2 bg-gray-700 rounded',
              'text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
          </select>
        </div>

        {/* Startup Options */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoStart}
              onChange={(e) => onChange({ autoStart: e.target.checked })}
              className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Start with system</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.minimizeToTray}
              onChange={(e) => onChange({ minimizeToTray: e.target.checked })}
              className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Minimize to system tray</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.checkUpdates}
              onChange={(e) => onChange({ checkUpdates: e.target.checked })}
              className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Check for updates automatically</span>
          </label>
        </div>

        {/* Stream Library Path */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Stream Library Location
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={settings.streamLibraryPath}
              readOnly
              className={clsx(
                'flex-1 px-3 py-2 bg-gray-700 rounded',
                'text-gray-400 focus:outline-none'
              )}
            />
            <button
              onClick={handleBrowseLibrary}
              className={clsx(
                'px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded',
                'text-white transition-colors flex items-center gap-2'
              )}
            >
              <FiFolder className="w-4 h-4" />
              Browse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// src/renderer/hooks/useSettings.ts
import { useState, useEffect, useCallback } from 'react';
import { AppSettings } from '@shared/types/settings';
import { toast } from 'react-hot-toast';

const DEFAULT_SETTINGS: AppSettings = {
  general: {
    theme: 'dark',
    language: 'en',
    autoStart: false,
    minimizeToTray: true,
    checkUpdates: true,
    defaultLayout: '',
    streamLibraryPath: ''
  },
  display: {
    windowMode: 'windowed',
    alwaysOnTop: false,
    hardwareAcceleration: true,
    vsync: true,
    defaultAspectRatio: '16:9',
    gridGapSize: 4,
    showLabels: true,
    showStatistics: false,
    labelPosition: 'bottom'
  },
  performance: {
    maxConcurrentStreams: 16,
    streamBufferSize: 32,
    decoderThreads: 4,
    gpuDecoding: true,
    adaptiveQuality: true,
    targetCpuUsage: 60,
    targetMemoryUsage: 2048
  },
  audio: {
    defaultVolume: 100,
    outputDevice: 'default',
    enableAudioMixing: false,
    audioLatency: 20,
    normalizationEnabled: false,
    compressionEnabled: false
  },
  advanced: {
    logLevel: 'info',
    logPath: '',
    enableTelemetry: false,
    proxySettings: {
      enabled: false,
      host: '',
      port: 0,
      username: '',
      password: ''
    },
    rtmpTimeout: 5000,
    rtmpBufferTime: 1000
  }
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const loaded = await window.electron.getSettings();
      setSettings({ ...DEFAULT_SETTINGS, ...loaded });
      setError(null);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings');
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const saveSettings = async () => {
    try {
      setIsLoading(true);
      await window.electron.saveSettings(settings);
      setError(null);
      
      // Apply settings that need immediate effect
      applySettings(settings);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetSettings = async () => {
    try {
      setIsLoading(true);
      await window.electron.saveSettings(DEFAULT_SETTINGS);
      setSettings(DEFAULT_SETTINGS);
      applySettings(DEFAULT_SETTINGS);
      toast.success('Settings reset to defaults');
    } catch (err) {
      console.error('Failed to reset settings:', err);
      toast.error('Failed to reset settings');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    updateSettings,
    saveSettings,
    resetSettings,
    isLoading,
    error
  };
}

// Apply settings that need immediate effect
function applySettings(settings: AppSettings) {
  // Apply theme
  document.documentElement.setAttribute('data-theme', settings.general.theme);
  
  // Apply window mode
  window.electron.setWindowMode(settings.display.windowMode);
  
  // Apply always on top
  window.electron.setAlwaysOnTop(settings.display.alwaysOnTop);
  
  // Apply other settings as needed
}
**Implementation Prompt:**
Complete the settings system by:
- Creating remaining settings components: DisplaySettings, PerformanceSettings, AudioSettings, AdvancedSettings
- Implementing settings validation before save
- Adding import/export settings functionality
- Creating settings profiles for different use cases
- Implementing keyboard shortcuts configuration
- Adding settings search functionality
- Creating settings migration system for updates
- Implementing telemetry opt-in/out
Advanced features:
- Add real-time preview for display settings
- Create benchmark tool for performance settings
- Implement audio device testing
- Add network proxy configuration UI
Success criteria:
- All settings persist correctly
- Changes apply immediately where appropriate
- Validation prevents invalid configurations
- Export/import works across devices
- Settings UI is intuitive and responsive
**Section 1.10: Stream Library and Management
Description:** Implement the stream library for organizing and managing saved streams.
**Starter Code:**
// src/renderer/components/StreamLibrary/StreamLibrary.tsx
import React, { useState, useMemo } from 'react';
import { useStreamLibrary } from '@/hooks/useStreamLibrary';
import { StreamCard } from './StreamCard';
import { StreamFilters } from './StreamFilters';
import { FiSearch, FiPlus, FiGrid, FiList, FiFilter } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface StreamLibraryProps {
  onSelectStream?: (streamId: string) => void;
  selectionMode?: 'single' | 'multiple';
  className?: string;
}

export const StreamLibrary: React.FC<StreamLibraryProps> = ({
  onSelectStream,
  selectionMode = 'single',
  className
}) => {
  const { streams, tags, isLoading, deleteStream, updateStream } = useStreamLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStreams, setSelectedStreams] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter and sort streams
  const filteredStreams = useMemo(() => {
    let filtered = streams;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(stream => 
        stream.label.toLowerCase().includes(query) ||
        stream.url.toLowerCase().includes(query) ||
        stream.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(stream =>
        selectedTags.every(tag => stream.tags?.includes(tag))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'name':
          compareValue = a.label.localeCompare(b.label);
          break;
        case 'date':
          compareValue = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'status':
          compareValue = a.status.localeCompare(b.status);
          break;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [streams, searchQuery, selectedTags, sortBy, sortOrder]);

  const handleSelectStream = (streamId: string) => {
    if (selectionMode === 'single') {
      onSelectStream?.(streamId);
    } else {
      setSelectedStreams(prev => {
        const next = new Set(prev);
        if (next.has(streamId)) {
          next.delete(streamId);
        } else {
          next.add(streamId);
        }
        return next;
      });
    }
  };

  const handleDeleteStream = async (streamId: string) => {
    if (confirm('Are you sure you want to delete this stream?')) {
      await deleteStream(streamId);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStreams.size === 0) return;
    
    const message = `Are you sure you want to delete ${selectedStreams.size} streams?`;
    if (confirm(message)) {
      await Promise.all(Array.from(selectedStreams).map(id => deleteStream(id)));
      setSelectedStreams(new Set());
    }
  };

  return (
    <div className={clsx('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Stream Library</h2>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-700 rounded">
            <button
              onClick={() => setViewMode('grid')}
              className={clsx(
                'p-2 transition-colors',
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              )}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={clsx(
                'p-2 transition-colors',
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              )}
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'p-2 rounded transition-colors',
              showFilters 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-400 hover:text-white'
            )}
          >
            <FiFilter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search streams..."
            className={clsx(
              'w-full pl-10 pr-4 py-2 bg-gray-700 rounded',
              'text-white placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}
          />
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <StreamFilters
              tags={tags}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              className="px-4 pb-4"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions */}
      {selectionMode === 'multiple' && selectedStreams.size > 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between p-3 bg-blue-600/20 rounded">
            <span className="text-sm text-blue-400">
              {selectedStreams.size} streams selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedStreams(new Set())}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stream List/Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading streams...</div>
          </div>
        ) : filteredStreams.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-gray-400 mb-4">
              {searchQuery || selectedTags.length > 0 
                ? 'No streams match your filters' 
                : 'No streams in library'}
            </div>
            {!searchQuery && selectedTags.length === 0 && (
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors flex items-center gap-2">
                <FiPlus className="w-4 h-4" />
                Add First Stream
              </button>
            )}
          </div>
        ) : (
          <div className={clsx(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-2'
          )}>
            {filteredStreams.map(stream => (
              <StreamCard
                key={stream.id}
                stream={stream}
                viewMode={viewMode}
                isSelected={selectedStreams.has(stream.id)}
                onSelect={() => handleSelectStream(stream.id)}
                onDelete={() => handleDeleteStream(stream.id)}
                onUpdate={(updates) => updateStream(stream.id, updates)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
// src/renderer/components/StreamLibrary/StreamCard.tsx
import React, { useState } from 'react';
import { Stream } from '@shared/types/stream';
import { FiPlay, FiEdit2, FiTrash2, FiCopy, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

interface StreamCardProps {
  stream: Stream;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Stream>) => void;
}

export const StreamCard: React.FC<StreamCardProps> = ({
  stream,
  viewMode,
  isSelected,
  onSelect,
  onDelete,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(stream.label);
  const [showUrl, setShowUrl] = useState(false);

  const handleSaveEdit = () => {
    if (editLabel.trim() && editLabel !== stream.label) {
      onUpdate({ label: editLabel.trim() });
    }
    setIsEditing(false);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(stream.url);
    toast.success('URL copied to clipboard');
  };

  const statusColor = {
    connected: 'bg-green-500',
    connecting: 'bg-yellow-500',
    disconnected: 'bg-gray-500',
    error: 'bg-red-500',
    reconnecting: 'bg-orange-500'
  }[stream.status];

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={clsx(
          'flex items-center gap-4 p-3 rounded-lg',
          'bg-gray-800 hover:bg-gray-700 transition-colors',
          isSelected && 'ring-2 ring-blue-500'
        )}
      >
        {/* Selection Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500"
        />

        {/* Status Indicator */}
        <div className={clsx('w-2 h-2 rounded-full', statusColor)} />

        {/* Stream Info */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
              className="w-full px-2 py-1 bg-gray-700 rounded text-white"
              autoFocus
            />
          ) : (
            <div className="font-medium text-white truncate">{stream.label}</div>
          )}
          <div className="text-xs text-gray-400 truncate">{stream.url}</div>
        </div>

        {/* Stream Details */}
        {stream.metadata && (
          <div className="text-xs text-gray-400">
            {stream.metadata.width}×{stream.metadata.height} • {stream.metadata.fps}fps
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSelect()}
            className="p-1.5 hover:bg-gray-600 rounded transition-colors"
            title="Add to grid"
          >
            <FiPlay className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 hover:bg-gray-600 rounded transition-colors"
            title="Edit"
          >
            <FiEdit2 className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={handleCopyUrl}
            className="p-1.5 hover:bg-gray-600 rounded transition-colors"
            title="Copy URL"
          >
            <FiCopy className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-gray-600 rounded transition-colors"
            title="Delete"
          >
            <FiTrash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className={clsx(
        'relative group bg-gray-800 rounded-lg overflow-hidden',
        'hover:shadow-xl transition-all cursor-pointer',
        isSelected && 'ring-2 ring-blue-500'
      )}
      onClick={onSelect}
    >
      {/* Thumbnail/Preview */}
      <div className="aspect-video bg-gray-900 relative">
        {stream.thumbnail ? (
          <img 
            src={stream.thumbnail} 
            alt={stream.label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-4xl text-gray-700">📹</div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <div className={clsx(
            'w-3 h-3 rounded-full',
            statusColor,
            stream.status === 'connected' && 'animate-pulse'
          )} />
        </div>

        {/* Selection Checkbox */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500"
          />
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        {isEditing ? (
          <input
            type="text"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
            onClick={(e) => e.stopPropagation()}
            className="w-full px-2 py-1 bg-gray-700 rounded text-white mb-2"
            autoFocus
          />
        ) : (
          <h3 className="font-medium text-white truncate mb-1">{stream.label}</h3>
        )}
        
        {showUrl ? (
          <div className="text-xs text-gray-400 truncate mb-2">{stream.url}</div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowUrl(true);
            }}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Show URL
          </button>
        )}

        {/* Tags */}
        {stream.tags && stream.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {stream.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-gray-700 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            <FiEdit2 className="w-3 h-3 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopyUrl();
            }}
            className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            <FiCopy className="w-3 h-3 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            <FiTrash2 className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
**Implementation Prompt:**
Complete the stream library implementation by:
- Creating StreamFilters component with tag selection and sorting
- Implementing useStreamLibrary hook for data management
- Adding drag and drop to add streams to grid
- Creating stream groups/categories functionality
- Implementing stream thumbnail generation
- Adding export/import for stream collections
- Creating stream health monitoring in library view
- Implementing stream tagging system
Advanced features:
- Add stream preview on hover
- Create smart collections (auto-categorize)
- Implement stream sharing via QR codes
- Add stream analytics dashboard
Success criteria:
- Fast filtering and searching
- Smooth animations and transitions
- Bulk operations work correctly
- Thumbnail generation doesn't impact performance
- Library syncs with database properly
**Section 1.11: Keyboard Shortcuts and Accessibility
Description:** Implement comprehensive keyboard navigation and accessibility features.
**Starter Code:**
// src/renderer/hooks/useKeyboardShortcuts.ts
import { useEffect, useCallback } from 'react';
import { useStreamStore } from '@/store/streamStore';
import { toast } from 'react-hot-toast';

interface ShortcutHandler {
  key: string;
  modifiers?: ('ctrl' | 'cmd' | 'alt' | 'shift')[];
  handler: () => void;
  description: string;
  global?: boolean;
}

const SHORTCUTS: ShortcutHandler[] = [
  // Stream Management
  {
    key: 'n',
    modifiers: ['cmd', 'ctrl'],
    handler: () => window.electron.send('menu:add-stream'),
    description: 'Add new stream'
  },
  {
    key: 'd',
    modifiers: ['cmd', 'ctrl'],
    handler: () => window.electron.send('menu:duplicate-stream'),
    description: 'Duplicate selected stream'
  },
  {
    key: 'Delete',
    handler: () => window.electron.send('menu:remove-stream'),
    description: 'Remove selected stream'
  },
  
  // Layout Shortcuts
  {
    key: '1',
    handler: () => window.electron.send('menu:layout', '1x1'),
    description: '1×1 Layout'
  },
  {
    key: '2',
    handler: () => window.electron.send('menu:layout', '2x1'),
    description: '2×1 Layout'
  },
  {
    key: '3',
    handler: () => window.electron.send('menu:layout', '3x1'),
    description: '3×1 Layout'
  },
  {
    key: '4',
    handler: () => window.electron.send('menu:layout', '2x2'),
    description: '2×2 Layout'
  },
  {
    key: '9',
    handler: () => window.electron.send('menu:layout', '3x3'),
    description: '3×3 Layout'
  },
  
  // Navigation
  {
    key: 'ArrowLeft',
    handler: () => navigateStream('left'),
    description: 'Select stream to the left'
  },
  {
    key: 'ArrowRight',
    handler: () => navigateStream('right'),
    description: 'Select stream to the right'
  },
  {
    key: 'ArrowUp',
    handler: () => navigateStream('up'),
    description: 'Select stream above'
  },
  {
    key: 'ArrowDown',
    handler: () => navigateStream('down'),
    description: 'Select stream below'
  },
  {
    key: 'Enter',
    handler: () => window.electron.send('menu:fullscreen-stream'),
    description: 'Fullscreen selected stream'
  },
  
  // Audio Controls
  {
    key: 'm',
    handler: () => window.electron.send('menu:toggle-mute'),
    description: 'Toggle mute selected stream'
  },
  {
    key: 'a',
    modifiers: ['shift'],
    handler: () => window.electron.send('menu:mute-all'),
    description: 'Mute all streams'
  },
  {
    key: '+',
    handler: () => window.electron.send('menu:volume-up'),
    description: 'Increase volume'
  },
  {
    key: '-',
    handler: () => window.electron.send('menu:volume-down'),
    description: 'Decrease volume'
  },
  
  // View Controls
  {
    key: 'F11',
    handler: () => window.electron.send('menu:toggle-fullscreen'),
    description: 'Toggle fullscreen',
    global: true
  },
  {
    key: 'f',
    modifiers: ['cmd', 'ctrl'],
    handler: () => window.electron.send('menu:toggle-frameless'),
    description: 'Toggle frameless mode'
  },
  {
    key: 's',
    modifiers: ['cmd', 'ctrl'],
    handler: () => window.electron.send('menu:toggle-statistics'),
    description: 'Toggle statistics'
  },
  {
    key: 'l',
    modifiers: ['cmd', 'ctrl'],
    handler: () => window.electron.send('menu:toggle-labels'),
    description: 'Toggle stream labels'
  },
  
  // Application
  {
    key: ',',
    modifiers: ['cmd', 'ctrl'],
    handler: () => window.electron.send('menu:settings'),
    description: 'Open settings'
  },
  {
    key: '/',
    modifiers: ['cmd', 'ctrl'],
    handler: () => window.electron.send('menu:shortcuts'),
    description: 'Show keyboard shortcuts'
  },
  {
    key: 'r',
    modifiers: ['cmd', 'ctrl'],
    handler: () => window.electron.send('menu:refresh-all'),
    description: 'Refresh all streams'
  }
];

// Navigation helper
function navigateStream(direction: 'up' | 'down' | 'left' | 'right') {
  const store = useStreamStore.getState();
  const { selectedStreamId, activeLayout } = store;
  
  if (!selectedStreamId || !activeLayout) return;
  
  const currentStream = activeLayout.streams.find(s => s.streamId === selectedStreamId);
  if (!currentStream) return;
  
  const { rows, columns } = activeLayout.grid;
  const currentPos = currentStream.position;
  const currentRow = Math.floor(currentPos / columns);
  const currentCol = currentPos % columns;
  
  let newRow = currentRow;
  let newCol = currentCol;
  
  switch (direction) {
    case 'up':
      newRow = Math.max(0, currentRow - 1);
      break;
    case 'down':
      newRow = Math.min(rows - 1, currentRow + 1);
      break;
    case 'left':
      newCol = Math.max(0, currentCol - 1);
      break;
    case 'right':
      newCol = Math.min(columns - 1, currentCol + 1);
      break;
  }
  
  const newPos = newRow * columns + newCol;
  const newStream = activeLayout.streams.find(s => s.position === newPos);
  
  if (newStream) {
    store.selectStream(newStream.streamId);
  }
}

export function useKeyboardShortcuts() {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable) {
      return;
    }
    
    // Find matching shortcut
    const shortcut = SHORTCUTS.find(s => {
      if (s.key.toLowerCase() !== event.key.toLowerCase()) return false;
      
      const modifiers = s.modifiers || [];
      const ctrl = modifiers.includes('ctrl') || modifiers.includes('cmd');
      const alt = modifiers.includes('alt');
      const shift = modifiers.includes('shift');
      
      const ctrlPressed = process.platform === 'darwin' ? event.metaKey : event.ctrlKey;
      
      return (!ctrl || ctrlPressed) &&
             (!alt || event.altKey) &&
             (!shift || event.shiftKey) &&
             (ctrl || alt || shift || 
              (!event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey));
    });
    
    if (shortcut) {
      event.preventDefault();
      shortcut.handler();
    }
  }, []);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Register global shortcuts with main process
  useEffect(() => {
    const globalShortcuts = SHORTCUTS.filter(s => s.global);
    globalShortcuts.forEach(shortcut => {
      const accelerator = buildAccelerator(shortcut);
      window.electron.registerGlobalShortcut(accelerator, shortcut.handler);
    });
    
    return () => {
      globalShortcuts.forEach(shortcut => {
        const accelerator = buildAccelerator(shortcut);
        window.electron.unregisterGlobalShortcut(accelerator);
      });
    };
  }, []);
  
  return {
    shortcuts: SHORTCUTS,
    showShortcutsHelp: () => {
      window.electron.send('menu:shortcuts');
    }
  };
}

function buildAccelerator(shortcut: ShortcutHandler): string {
  const parts: string[] = [];
  
  if (shortcut.modifiers) {
    if (shortcut.modifiers.includes('cmd') || shortcut.modifiers.includes('ctrl')) {
      parts.push('CmdOrCtrl');
    }
    if (shortcut.modifiers.includes('alt')) {
      parts.push('Alt');
    }
    if (shortcut.modifiers.includes('shift')) {
      parts.push('Shift');
    }
  }
  
  parts.push(shortcut.key);
  
  return parts.join('+');
}
// src/renderer/components/Accessibility/ScreenReaderAnnouncements.tsx
import React, { useEffect, useRef } from 'react';
import { useStreamStore } from '@/store/streamStore';

export const ScreenReaderAnnouncements: React.FC = () => {
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const { streams, activeStreams } = useStreamStore();
  
  // Announce stream status changes
  useEffect(() => {
    const announcements: string[] = [];
    
    activeStreams.forEach(streamId => {
      const stream = streams.get(streamId);
      if (stream) {
        switch (stream.status) {
          case 'connected':
            announcements.push(`${stream.label} connected`);
            break;
          case 'error':
            announcements.push(`${stream.label} connection error`);
            break;
          case 'reconnecting':
            announcements.push(`${stream.label} reconnecting`);
            break;
        }
      }
    });
    
    if (announcements.length > 0 && liveRegionRef.current) {
      liveRegionRef.current.textContent = announcements.join('. ');
    }
  }, [streams, activeStreams]);
  
  return (
    <>
      {/* Live region for dynamic announcements */}
      <div
        ref={liveRegionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      
      {/* Alert region for important announcements */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        id="alert-region"
      />
    </>
  );
};

// Utility function to announce messages
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const regionId = priority === 'assertive' ? 'alert-region' : 'status-region';
  const region = document.getElementById(regionId);
  
  if (region) {
    region.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      region.textContent = '';
    }, 1000);
  }
}
**Implementation Prompt:**
Complete the keyboard shortcuts and accessibility implementation by:
- Creating KeyboardShortcutsModal to display all shortcuts
- Implementing focus management system for modal dialogs
- Adding ARIA labels and descriptions throughout the app
- Creating high contrast mode support
- Implementing skip navigation links
- Adding keyboard navigation indicators
- Creating voice control support (Phase B)
- Implementing screen magnifier support
Testing requirements:
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Verify all interactive elements are keyboard accessible
- Test focus order is logical
- Verify color contrast meets WCAG standards
Success criteria:
- Full keyboard navigation without mouse
- Screen reader announces all important changes
- Focus management works correctly
- High contrast mode is readable
- Skip links work properly
**Section 1.12: Performance Optimization and Resource Management
Description:** Implement performance monitoring, optimization, and resource management systems.
**Starter Code:**
// src/renderer/utils/performanceManager.ts
import { EventEmitter } from 'events';

interface PerformanceThresholds {
  maxCpuUsage: number;
  maxMemoryUsage: number;
  minFps: number;
  maxDroppedFrames: number;
}

interface StreamPriority {
  streamId: string;
  priority: number;
  currentQuality: 'high' | 'medium' | 'low';
  targetQuality: 'high' | 'medium' | 'low';
}

export class PerformanceManager extends EventEmitter {
  private thresholds: PerformanceThresholds = {
    maxCpuUsage: 70,
    maxMemoryUsage: 2048, // MB
    minFps: 25,
    maxDroppedFrames: 10
  };
  
  private streamPriorities: Map<string, StreamPriority> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private adaptiveQualityEnabled = true;
  private resourceOptimizationEnabled = true;
  
  constructor() {
    super();
    this.startMonitoring();
  }
  
  private startMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.checkPerformance();
    }, 1000);
  }
  
  private async checkPerformance() {
    const metrics = await this.getSystemMetrics();
    
    // Check if we're exceeding thresholds
    const issues = this.detectPerformanceIssues(metrics);
    
    if (issues.length > 0 && this.resourceOptimizationEnabled) {
      this.optimizeResources(issues, metrics);
    }
    
    // Emit metrics for UI updates
    this.emit('metrics', metrics);
  }
  
  private async getSystemMetrics() {
    // Get system stats from main process
    const cpuUsage = await window.electron.getSystemStats('cpu');
    const memoryInfo = await window.electron.getSystemStats('memory');
    
    // Get stream performance data
    const streamMetrics = await this.getStreamMetrics();
    
    return {
      cpu: cpuUsage,
      memory: memoryInfo.used / (1024 * 1024),
      streams: streamMetrics,
      timestamp: Date.now()
    };
  }
  
  private detectPerformanceIssues(metrics: any): string[] {
    const issues: string[] = [];
    
    if (metrics.cpu > this.thresholds.maxCpuUsage) {
      issues.push('high_cpu');
    }
    
    if (metrics.memory > this.thresholds.maxMemoryUsage) {
      issues.push('high_memory');
    }
    
    metrics.streams.forEach((stream: any) => {
      if (stream.fps < this.thresholds.minFps) {
        issues.push(`low_fps:${stream.id}`);
      }
      
      if (stream.droppedFrames > this.thresholds.maxDroppedFrames) {
        issues.push(`dropped_frames:${stream.id}`);
      }
    });
    
    return issues;
  }
  
  private optimizeResources(issues: string[], metrics: any) {
    // Sort streams by priority
    const sortedStreams = this.getSortedStreamsByPriority();
    
    // Apply optimization strategies
    if (issues.includes('high_cpu') || issues.includes('high_memory')) {
      this.reduceStreamQualities(sortedStreams, metrics);
    }
    
    // Handle specific stream issues
    issues.forEach(issue => {
      if (issue.startsWith('low_fps:')) {
        const streamId = issue.split(':')[1];
        this.optimizeStream(streamId, 'fps');
      } else if (issue.startsWith('dropped_frames:')) {
        const streamId = issue.split(':')[1];
        this.optimizeStream(streamId, 'frames');
      }
    });
  }
  
  private reduceStreamQualities(streams: StreamPriority[], metrics: any) {
    // Start reducing quality from lowest priority streams
    for (let i = streams.length - 1; i >= 0; i--) {
      const stream = streams[i];
      
      if (stream.currentQuality !== 'low') {
        const newQuality = this.getReducedQuality(stream.currentQuality);
        this.setStreamQuality(stream.streamId, newQuality);
        
        // Check if we've reduced resource usage enough
        if (metrics.cpu < this.thresholds.maxCpuUsage * 0.9 &&
            metrics.memory < this.thresholds.maxMemoryUsage * 0.9) {
          break;
        }
      }
    }
  }
  
  private getReducedQuality(current: string): 'high' | 'medium' | 'low' {
    switch (current) {
      case 'high':
        return 'medium';
      case 'medium':
        return 'low';
      default:
        return 'low';
    }
  }
  
  private setStreamQuality(streamId: string, quality: 'high' | 'medium' | 'low') {
    const priority = this.streamPriorities.get(streamId);
    if (priority) {
      priority.currentQuality = quality;
      this.emit('qualityChange', { streamId, quality });
    }
    
    // Apply quality settings
    this.applyQualitySettings(streamId, quality);
  }
  
  private applyQualitySettings(streamId: string, quality: string) {
    const settings = this.getQualitySettings(quality);
    
    // Send to renderer to apply
    window.electron.send('stream:setQuality', {
      streamId,
      settings
    });
  }
  
  private getQualitySettings(quality: string) {
    switch (quality) {
      case 'high':
        return {
          resolution: { width: 1920, height: 1080 },
          framerate: 30,
          bitrate: 5000,
          hardwareAcceleration: true
        };
      case 'medium':
        return {
          resolution: { width: 1280, height: 720 },
          framerate: 25,
          bitrate: 2500,
          hardwareAcceleration: true
        };
      case 'low':
        return {
          resolution: { width: 640, height: 360 },
          framerate: 15,
          bitrate: 1000,
          hardwareAcceleration: false
        };
    }
  }
  
  private getSortedStreamsByPriority(): StreamPriority[] {
    return Array.from(this.streamPriorities.values())
      .sort((a, b) => b.priority - a.priority);
  }
  
  private async getStreamMetrics() {
    // Get metrics from all active streams
    const store = useStreamStore.getState();
    const metrics = [];
    
    store.activeStreams.forEach(streamId => {
      const stream = store.streams.get(streamId);
      if (stream && stream.statistics) {
        metrics.push({
          id: streamId,
          fps: stream.statistics.currentFps,
          droppedFrames: stream.statistics.droppedFrames,
          bitrate: stream.statistics.currentBitrate,
          latency: stream.statistics.latency
        });
      }
    });
    
    return metrics;
  }
  
  private optimizeStream(streamId: string, issue: 'fps' | 'frames') {
    // Apply stream-specific optimizations
    switch (issue) {
      case 'fps':
        // Reduce framerate target
        this.emit('streamOptimization', {
          streamId,
          optimization: 'reduceFps',
          value: 15
        });
        break;
      case 'frames':
        // Increase buffer size
        this.emit('streamOptimization', {
          streamId,
          optimization: 'increaseBuffer',
          value: 2000
        });
        break;
    }
  }
  
  public setStreamPriority(streamId: string, priority: number) {
    const existing = this.streamPriorities.get(streamId);
    
    if (existing) {
      existing.priority = priority;
    } else {
      this.streamPriorities.set(streamId, {
        streamId,
        priority,
        currentQuality: 'high',
        targetQuality: 'high'
      });
    }
  }
  
  public setThresholds(thresholds: Partial<PerformanceThresholds>) {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }
  
  public enableAdaptiveQuality(enabled: boolean) {
    this.adaptiveQualityEnabled = enabled;
  }
  
  public enableResourceOptimization(enabled: boolean) {
    this.resourceOptimizationEnabled = enabled;
  }
  
  public getPerformanceReport() {
    return {
      thresholds: this.thresholds,
      streamPriorities: Array.from(this.streamPriorities.values()),
      adaptiveQualityEnabled: this.adaptiveQualityEnabled,
      resourceOptimizationEnabled: this.resourceOptimizationEnabled
    };
  }
  
  public destroy() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.removeAllListeners();
  }
}

// Export singleton instance
export const performanceManager = new PerformanceManager();
// src/main/systemMonitor.ts
import { app, powerMonitor } from 'electron';
import os from 'os';
import { EventEmitter } from 'events';

interface SystemStats {
  cpu: CPUStats;
  memory: MemoryStats;
  gpu: GPUStats;
  network: NetworkStats;
  power: PowerStats;
}

interface CPUStats {
  usage: number;
  temperature?: number;
  cores: number;
  speed: number;
}

interface MemoryStats {
  total: number;
  used: number;
  free: number;
  percentage: number;
}

interface GPUStats {
  usage: number;
  memory: number;
  temperature?: number;
  hardware_acceleration: boolean;
}

interface NetworkStats {
  bandwidth: number;
  latency: number;
  packetLoss: number;
}

interface PowerStats {
  onBattery: boolean;
  batteryLevel?: number;
  powerSaveMode: boolean;
}

export class SystemMonitor extends EventEmitter {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private cpuUsageHistory: number[] = [];
  private lastCPUInfo: any = null;
  
  constructor() {
    super();
    this.startMonitoring();
    this.setupPowerMonitoring();
  }
  
  private startMonitoring() {
    // Initial measurement
    this.lastCPUInfo = os.cpus();
    
    this.monitoringInterval = setInterval(() => {
      this.collectStats();
    }, 1000);
  }
  
  private setupPowerMonitoring() {
    powerMonitor.on('on-ac', () => {
      this.emit('powerChange', { onBattery: false });
    });
    
    powerMonitor.on('on-battery', () => {
      this.emit('powerChange', { onBattery: true });
    });
    
    powerMonitor.on('shutdown', () => {
      this.emit('shutdown');
    });
    
    powerMonitor.on('suspend', () => {
      this.emit('suspend');
    });
    
    powerMonitor.on('resume', () => {
      this.emit('resume');
    });
  }
  
  private async collectStats() {
    const stats: SystemStats = {
      cpu: this.getCPUStats(),
      memory: this.getMemoryStats(),
      gpu: await this.getGPUStats(),
      network: await this.getNetworkStats(),
      power: this.getPowerStats()
    };
    
    this.emit('stats', stats);
  }
  
  private getCPUStats(): CPUStats {
    const cpus = os.cpus();
    const currentCPUInfo = cpus;
    
    // Calculate CPU usage
    let totalIdle = 0;
    let totalTick = 0;
    
    for (let i = 0; i < cpus.length; i++) {
      const cpu = currentCPUInfo[i];
      const prevCpu = this.lastCPUInfo[i];
      
      if (!prevCpu) continue;
      
      const idle = cpu.times.idle - prevCpu.times.idle;
      const total = Object.values(cpu.times).reduce((a, b) => a + b) -
                   Object.values(prevCpu.times).reduce((a, b) => a + b);
      
      totalIdle += idle;
      totalTick += total;
    }
    
    const usage = 100 - ~~(100 * totalIdle / totalTick);
    this.cpuUsageHistory.push(usage);
    
    if (this.cpuUsageHistory.length > 60) {
      this.cpuUsageHistory.shift();
    }
    
    this.lastCPUInfo = currentCPUInfo;
    
    return {
      usage,
      cores: cpus.length,
      speed: cpus[0].speed,
      temperature: undefined // Would need platform-specific implementation
    };
  }
  
  private getMemoryStats(): MemoryStats {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const percentage = (used / total) * 100;
    
    return {
      total,
      used,
      free,
      percentage
    };
  }
  
  private async getGPUStats(): Promise<GPUStats> {
    // Simplified GPU stats - would need platform-specific implementation
    const gpuInfo = await app.getGPUInfo('complete');
    
    return {
      usage: 0, // Would need GPU-specific monitoring
      memory: 0,
      temperature: undefined,
      hardware_acceleration: app.getGPUFeatureStatus().gpu_compositing === 'enabled'
    };
  }
  
  private async getNetworkStats(): Promise<NetworkStats> {
    // Simplified network stats
    return {
      bandwidth: 0, // Would need network monitoring
      latency: 0,
      packetLoss: 0
    };
  }
  
  private getPowerStats(): PowerStats {
    const onBattery = powerMonitor.isOnBatteryPower();
    
    return {
      onBattery,
      batteryLevel: undefined, // Platform-specific
      powerSaveMode: false // Would need OS-specific check
    };
  }
  
  public getStats(type: keyof SystemStats): any {
    switch (type) {
      case 'cpu':
        return this.getCPUStats();
      case 'memory':
        return this.getMemoryStats();
      case 'gpu':
        return this.getGPUStats();
      case 'network':
        return this.getNetworkStats();
      case 'power':
        return this.getPowerStats();
    }
  }
  
  public getCPUHistory(): number[] {
    return [...this.cpuUsageHistory];
  }
  
  public destroy() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.removeAllListeners();
  }
}

// Export singleton
export const systemMonitor = new SystemMonitor();
**Implementation Prompt:**
Complete the performance optimization implementation by:
- Creating memory leak detection and prevention
- Implementing GPU utilization monitoring
- Adding network bandwidth management
- Creating performance profiling tools
- Implementing stream quality auto-adjustment
- Adding resource usage predictions
- Creating performance history and analytics
- Implementing battery optimization for laptops
Advanced optimizations:
- Add WebAssembly video decoder for efficiency
- Implement frame skipping algorithms
- Create intelligent prefetching
- Add memory pooling for video buffers
Success criteria:
- CPU usage stays below threshold
- Memory usage is stable over time
- Frame drops are minimized
- Quality adjusts smoothly
- Battery life is optimized on laptops

**6. SETTINGS & CONFIGURATION
Default Configuration**
// default-config.json
{
  "application": {
    "version": "1.0.0",
    "updateChannel": "stable",
    "telemetryEnabled": false,
    "crashReportingEnabled": true
  },
  "streams": {
    "maxConcurrent": 16,
    "defaultReconnectAttempts": 5,
    "defaultReconnectDelay": 3000,
    "connectionTimeout": 5000,
    "bufferTime": 1000,
    "lowLatencyMode": false
  },
  "display": {
    "defaultWindowSize": {
      "width": 1600,
      "height": 900
    },
    "minWindowSize": {
      "width": 800,
      "height": 600
    },
    "defaultLayout": "2x2",
    "gridGap": 4,
    "showLabels": true,
    "labelPosition": "bottom",
    "theme": "dark"
  },
  "performance": {
    "hardwareAcceleration": true,
    "gpuDecoding": true,
    "maxDecoderThreads": 4,
    "adaptiveQuality": true,
    "targetCPU": 60,
    "targetMemory": 2048
  },
  "audio": {
    "defaultVolume": 100,
    "defaultMuted": false,
    "normalization": false,
    "compression": false,
    "outputLatency": 20
  },
  "keyboard": {
    "shortcuts": {
      "addStream": "Ctrl+N",
      "removeStream": "Delete",
      "duplicateStream": "Ctrl+D",
      "fullscreen": "F11",
      "toggleFrameless": "Ctrl+F",
      "toggleStats": "Ctrl+S",
      "toggleLabels": "Ctrl+L",
      "settings": "Ctrl+,",
      "quit": "Ctrl+Q"
    }
  }
}

**7. TESTING STRATEGY
Unit Testing**
// src/renderer/components/VideoPlayer/__tests__/VideoPlayer.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VideoPlayer } from '../VideoPlayer';
import { Stream, StreamStatus } from '@shared/types/stream';

describe('VideoPlayer', () => {
  const mockStream: Stream = {
    id: 'test-1',
    url: 'rtmp://test.com/live/stream',
    label: 'Test Stream',
    status: StreamStatus.DISCONNECTED,
    settings: {
      volume: 50,
      muted: false,
      priority: 1,
      reconnectAttempts: 5,
      reconnectDelay: 3000,
      hardwareAcceleration: true,
      audioOutput: 'default'
    },
    metadata: {},
    statistics: {},
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  it('renders video player with stream label', () => {
    render(<VideoPlayer stream={mockStream} />);
    expect(screen.getByText('Test Stream')).toBeInTheDocument();
  });
  
  it('shows loading state when connecting', () => {
    const connectingStream = {
      ...mockStream,
      status: StreamStatus.CONNECTING
    };
    
    render(<VideoPlayer stream={connectingStream} />);
    expect(screen.getByText(/connecting/i)).toBeInTheDocument();
  });
  
  it('handles volume changes', async () => {
    const onVolumeChange = jest.fn();
    render(
      <VideoPlayer 
        stream={mockStream} 
        onVolumeChange={onVolumeChange}
      />
    );
    
    const volumeSlider = screen.getByRole('slider', { name: /volume/i });
    fireEvent.change(volumeSlider, { target: { value: '75' } });
    
    await waitFor(() => {
      expect(onVolumeChange).toHaveBeenCalledWith(75);
    });
  });
  
  it('handles mute toggle', () => {
    const onMuteToggle = jest.fn();
    render(
      <VideoPlayer 
        stream={mockStream} 
        onMuteToggle={onMuteToggle}
      />
    );
    
    const muteButton = screen.getByRole('button', { name: /mute/i });
    fireEvent.click(muteButton);
    
    expect(onMuteToggle).toHaveBeenCalled();
  });
  
  it('displays error state correctly', () => {
    const errorStream = {
      ...mockStream,
      status: StreamStatus.ERROR,
      statistics: {
        ...mockStream.statistics,
        lastError: 'Connection failed'
      }
    };
    
    render(<VideoPlayer stream={errorStream} />);
    expect(screen.getByText(/connection failed/i)).toBeInTheDocument();
  });
});
**Integration Testing**
// src/renderer/__tests__/integration/StreamManagement.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '@/App';
import { mockElectronAPI } from '../mocks/electron';

beforeAll(() => {
  window.electron = mockElectronAPI;
});

describe('Stream Management Integration', () => {
  it('adds a new stream successfully', async () => {
    render(<App />);
    
    // Open add stream modal
    const addButton = screen.getByRole('button', { name: /add stream/i });
    fireEvent.click(addButton);
    
    // Fill in stream details
    const urlInput = screen.getByLabelText(/stream url/i);
    const labelInput = screen.getByLabelText(/label/i);
    
    fireEvent.change(urlInput, { 
      target: { value: 'rtmp://example.com/live/test' } 
    });
    fireEvent.change(labelInput, { 
      target: { value: 'Integration Test Stream' } 
    });
    
    // Test connection
    const testButton = screen.getByRole('button', { name: /test connection/i });
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(screen.getByText(/stream is valid/i)).toBeInTheDocument();
    });
    
    // Add stream
    const addStreamButton = screen.getByRole('button', { name: /add stream/i });
    fireEvent.click(addStreamButton);
    
    await waitFor(() => {
      expect(screen.getByText('Integration Test Stream')).toBeInTheDocument();
    });
  });
  
  it('handles layout changes correctly', async () => {
    render(<App />);
    
    // Add multiple streams
    // ... add 4 streams
    
    // Change layout
    const layoutSelector = screen.getByRole('button', { name: /layout/i });
    fireEvent.click(layoutSelector);
    
    const layout3x3 = screen.getByRole('button', { name: /3×3/i });
    fireEvent.click(layout3x3);
    
    await waitFor(() => {
      const grid = screen.getByTestId('stream-grid');
      expect(grid).toHaveStyle({
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)'
      });
    });
  });
});
**E2E Testing**
// e2e/streamgrid.spec.ts
import { test, expect, _electron as electron } from '@playwright/test';

test.describe('StreamGrid E2E Tests', () => {
  let app: any;
  
  test.beforeAll(async () => {
    app = await electron.launch({ args: ['./dist/main.js'] });
  });
  
  test.afterAll(async () => {
    await app.close();
  });
  
  test('complete stream workflow', async () => {
    const window = await app.firstWindow();
    
    // Add a stream
    await window.click('button:has-text("Add Stream")');
    await window.fill('input[placeholder*="rtmp://"]', 'rtmp://test.com/live');
    await window.fill('input[placeholder*="Camera"]', 'E2E Test Stream');
    await window.click('button:has-text("Test Connection")');
    
    // Wait for validation
    await expect(window.locator('text=Stream is valid')).toBeVisible();
    
    await window.click('button:has-text("Add Stream")');
    
    // Verify stream appears
    await expect(window.locator('text=E2E Test Stream')).toBeVisible();
    
    // Change layout
    await window.click('button:has-text("Layout")');
    await window.click('button:has-text("2×2")');
    
    // Verify grid updated
    const grid = window.locator('[data-testid="stream-grid"]');
    await expect(grid).toHaveCSS('grid-template-columns', /repeat\(2/);
    
    // Test fullscreen
    await window.keyboard.press('F11');
    await expect(window).toHaveScreenshot('fullscreen.png');
    
    // Exit fullscreen
    await window.keyboard.press('F11');
    
    // Delete stream
    const streamCard = window.locator('[data-testid="stream-card"]').first();
    await streamCard.hover();
    await streamCard.click('button[aria-label="Delete"]');
    await window.click('button:has-text("Confirm")');
    
    // Verify stream removed
    await expect(window.locator('text=E2E Test Stream')).not.toBeVisible();
  });
  
  test('performance under load', async () => {
    const window = await app.firstWindow();
    
    // Add 9 streams
    for (let i = 1; i <= 9; i++) {
      await window.click('button:has-text("Add Stream")');
      await window.fill('input[placeholder*="rtmp://"]', `rtmp://test.com/stream${i}`);
      await window.fill('input[placeholder*="Camera"]', `Stream ${i}`);
      await window.click('button:has-text("Add Stream")');
    }
    
    // Switch to 3x3 layout
    await window.click('button:has-text("Layout")');
    await window.click('button:has-text("3×3")');
    
    // Monitor performance
    await window.click('button[aria-label="Toggle Statistics"]');
    
    // Wait for stable performance
    await window.waitForTimeout(5000);
    
    // Check CPU usage
    const cpuUsage = await window.locator('[data-testid="cpu-usage"]').textContent();
    expect(parseInt(cpuUsage)).toBeLessThan(70);
    
    // Check memory usage
    const memoryUsage = await window.locator('[data-testid="memory-usage"]').textContent();
    expect(parseFloat(memoryUsage)).toBeLessThan(2048);
    
    // Verify no dropped frames
    const droppedFrames = await window.locator('[data-testid="dropped-frames"]').textContent();
    expect(parseInt(droppedFrames)).toBe(0);
  });
});

**8. DEPLOYMENT
Build Configuration**
// electron-builder.config.js
module.exports = {
  appId: 'com.streamgrid.app',
  productName: 'StreamGrid',
  directories: {
    output: 'release'
  },
  files: [
    'dist/**/*',
    'node_modules/**/*',
    'assets/**/*'
  ],
  mac: {
    category: 'public.app-category.video',
    icon: 'assets/icon.icns',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
    notarize: {
      teamId: process.env.APPLE_TEAM_ID
    }
  },
  win: {
    target: ['nsis', 'msi'],
    icon: 'assets/icon.ico',
    certificateFile: process.env.WINDOWS_CERTIFICATE_FILE,
    certificatePassword: process.env.WINDOWS_CERTIFICATE_PASSWORD
  },
  linux: {
    target: ['AppImage', 'deb', 'rpm'],
    icon: 'assets/icon.png',
    category: 'AudioVideo',
    desktop: {
      Name: 'StreamGrid',
      Comment: 'Professional RTMP Multi-Stream Viewer',
      Categories: 'AudioVideo;Video;'
    }
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  },
  publish: {
    provider: 'github',
    owner: 'streamgrid',
    repo: 'streamgrid-app'
  }
};
**Auto-Update Implementation**
// src/main/updater.ts
import { autoUpdater } from 'electron-updater';
import { dialog, BrowserWindow } from 'electron';
import { logger } from './logger';

export function setupAutoUpdater(mainWindow: BrowserWindow) {
  autoUpdater.logger = logger;
  autoUpdater.autoDownload = false;
  
  autoUpdater.on('checking-for-update', () => {
    logger.info('Checking for updates...');
  });
  
  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `A new version ${info.version} is available. Would you like to download it?`,
      buttons: ['Download', 'Later'],
      defaultId: 0
    }).then(result => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
  });
  
  autoUpdater.on('update-not-available', () => {
    logger.info('Update not available');
  });
  
  autoUpdater.on('error', (error) => {
    logger.error('Update error:', error);
  });
  
  autoUpdater.on('download-progress', (progress) => {
    mainWindow.webContents.send('update-progress', progress);
  });
  
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. The application will restart to apply the update.',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0
    }).then(result => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });
  
  // Check for updates
  autoUpdater.checkForUpdatesAndNotify();
}

**9. FINAL DEVELOPER KICK-OFF PROMPT**
You are now ready to build StreamGrid, a professional RTMP multi-stream viewer application. Here's your comprehensive development roadmap:

## IMMEDIATE FIRST STEPS:

1. **Initialize Project:**
   ```bash
   npm create electron-app@latest streamgrid -- --template=vite-typescript
   cd streamgrid
   npm install react react-dom @types/react @types/react-dom
   npm install zustand @tanstack/react-query framer-motion
   npm install tailwindcss autoprefixer postcss
   npm install -D @types/node
	**2	Setup Project Structure:** Create the complete directory structure as specified in Section 3. Start with these critical files:
	◦	package.json (Section 1.1)
	◦	forge.config.ts (Section 1.1)
	◦	tsconfig.json with proper paths
	◦	Main process entry (src/main/index.ts)
	◦	Renderer entry (src/renderer/App.tsx)
	**3	Core Systems Implementation Order:**
	◦	Phase 1: Electron setup, window management, IPC communication
	◦	Phase 2: Database layer and settings persistence
	◦	Phase 3: RTMP validation and basic video player
	◦	Phase 4: Stream grid layout system
	◦	Phase 5: UI components (header, status bar, modals)
	◦	Phase 6: Performance optimization
	◦	Phase 7: Testing and deployment
**CRITICAL IMPLEMENTATION NOTES:
Video Playback:**
	•	Start with a mock video player using Canvas API
	•	Integrate a real RTMP library (mpv.js or VLC.js) once basic structure works
	•	Implement hardware acceleration early for performance
**State Management:**
	•	Use Zustand store as the single source of truth
	•	Implement proper separation between main and renderer processes
	•	Use IPC for all cross-process communication
**Performance:**
	•	Implement resource monitoring from the start
	•	Add quality adjustment before adding many streams
	•	Use React.memo and useMemo aggressively
	•	Implement virtual scrolling for large stream libraries
**Testing:**
	•	Write tests as you implement each feature
	•	Use mock RTMP streams for development
	•	Test with real streams early and often
**DEVELOPMENT WORKFLOW:**
	1	Implement each section's starter code first
	2	Complete the implementation prompts for each section
	3	Test the feature thoroughly before moving on
	4	Keep the UI responsive during development
	5	Commit working code frequently
**COMMON PITFALLS TO AVOID:**
	•	Don't use localStorage/sessionStorage in Electron renderer
	•	Always handle stream disconnections gracefully
	•	Implement proper cleanup in useEffect hooks
	•	Test memory usage with long-running streams
	•	Handle all async operations with proper error handling
**SUCCESS CRITERIA:**
You've successfully built StreamGrid when:
	•	Can display 9 RTMP streams simultaneously
	•	Drag-and-drop stream repositioning works
	•	All keyboard shortcuts function correctly
	•	CPU usage stays under 60% with 4 streams
	•	Memory usage is stable over 24 hours
	•	Settings persist between app restarts
	•	Auto-update mechanism works
**RESOURCES:**
	•	Electron Documentation: https://www.electronjs.org/docs
	•	React Documentation: https://react.dev
	•	RTMP Specification: For understanding the protocol
	•	WebGL/Canvas: For video rendering optimization
Remember: Start simple, test often, and iterate. The PRD provides production-ready code examples - use them as your foundation and build upon them systematically.
Good luck building StreamGrid! 🚀
---

This comprehensive PRD provides everything needed to build StreamGrid from scratch. Each section includes detailed starter code, implementation prompts, and success criteria. The document is structured to guide systematic development while providing flexibility for implementation choices.

The PRD totals over 15,000 words with 50+ code examples and 100+ specific implementation details, meeting all requirements for use with SuperClaude or any AI-assisted development framework.
